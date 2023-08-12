const express = require("express"); /* Import d'Express */
const path = require("path"); /* Import du module path qui permettra de travailler avec les chemins de fichiers et de répertoires. */
const app =
  express(); /*On appelle la méthode express pour créer une appli Express*/

const { User, Book } = require("./db/mongo");

const { cors } = require("./middleware/cors");
const auth = require("./middleware/auth");
const multer = require("./middleware/multer");
const rating = require("./middleware/rating");
const optimizeImage = require("./middleware/sharp");

const bcrypt = require("bcrypt"); /* hachage sécurisé des mots de passe */
const {
  getToken,
} = require("./lib/jwt"); /* génération et vérification des tokens */
const {
  calcAverageRating,
} = require("./lib/rating"); /* fonction utilisée pour calculer la note moyenne des évaluations */

app.use(express.json());
app.use(cors);

app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", login);

app.get("/api/books", getAllBooks);
app.get("/api/books/bestrating", getBestRatingBooks);
app.get("/api/books/:id", getOneBook);

/** on configure multer pour intercepter le champ image (une seule image) */
app.post("/api/books", auth, multer.single("image"), optimizeImage, createBook);
app.put(
  "/api/books/:id",
  auth,
  multer.single("image"),
  optimizeImage,
  updateBook
);
app.delete("/api/books/:id", auth, deleteBook);
app.post("/api/books/:id/rating", auth, rating, rateBook);

/** on déclare le dossier images comme étant accessible */
app.use("/images", express.static(path.join(__dirname, "images")));

async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: hashed,
  };
  try {
    await User.create(user);
    res.send({ message: "Sign up" });
  } catch (e) {
    if (e.errors?.email?.kind === "unique") {
      res.status(409).send({ message: "Adresse email déjà utilisée" });
      return;
    }
    console.error(e);
    res
      .status(500)
      .send({ message: "Quelque chose ne s'est pas passé comme prévu" });
    return;
  }
}

async function login(req, res) {
  const body = req.body;

  const userInDb = await User.findOne({ email: body.email }).exec();
  if (userInDb == null) {
    res.status(401).send({ message: "Mauvaise adresse e-mail" });
    return;
  }
  const passwordInDb = userInDb.password;
  const isValid = await bcrypt.compare(body.password, passwordInDb);
  if (!isValid) {
    res.status(401).send({ message: "Mot de passe incorrect" });
    return;
  }
  const token = getToken(userInDb);
  res.send({ token });
  return;
}

// Cette fonction est utilisée pour récupérer tous les livres de la base de données

async function getAllBooks(req, res) {
  const books = await Book.find({});
  res.send(books);
}

// Cette fonction est utilisée pour récupérer un seul livre à partir de l'identifiant fourni

async function getOneBook(req, res) {
  try {
    const { id } =
      req.params; /* Cette ligne extrait l'identifiant du livre à partir des paramètres de la requête, cette fonction attend un paramètre nommé "id" dans l'URL. */

    const book = await Book.findOne({
      _id: id,
    }); /* Cette ligne exécute une requête à la base de données pour rechercher un livre avec l'identifiant spécifié. La fonction findOne() renvoie le premier livre correspondant trouvé */

    res.send(
      book
    ); /* Si un livre correspondant est trouvé, il est stocké dans la variable book, puis res.send(book) envoie une réponse HTTP contenant le livre en tant que corps de réponse. */
  } catch (err) {
    res.status(404).send({ message: "Livre non trouvé" });
  }
}

/* Cette fonction est utilisée pour récupérer les trois livres ayant les meilleures évaluations (notes moyennes) de la base de données */

async function getBestRatingBooks(req, res) {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 })
      .limit(
        3
      ); /* Recherche tous les livres dans la collection "Book" et les trie en fonction de la note moyenne (averageRating) */
    res
      .status(200)
      .json(
        books
      ); /* Si la recherche et le tri se déroulent avec succès, cette ligne envoie une réponse HTTP avec le statut 200 (OK) et les livres récupérés sont renvoyés en tant que corps de réponse au format JSON. */
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function createBook(req, res) {
  try {
    const { book } =
      req.body; /* Cette ligne extrait l'objet "book" du corps de la requête. */

    // bookData.rate

    const bookData =
      JSON.parse(
        book
      ); /* Ici, l'objet "book" extrait du corps de la requête est analysé en tant que JSON pour le transformer en un objet JavaScript utilisable. */

    const bookDbo = new Book({
      ...bookData,
      userId: req.auth.userId,
      averageRating: 0 /* L'évaluation moyenne est initialement définie à 0. */,
      ratings: [],
      /* Une URL d'image est construite en utilisant les informations de la requête pour former le chemin vers l'image. */
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename.split(".")[0]
      }optimize.webp`,
    });
    await bookDbo.save();
    res.status(201).json({ message: "Livre créé" });
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
}

async function updateBook(req, res) {
  try {
    const { id } =
      req.params; /* Cette ligne extrait l'identifiant du livre à partir des paramètres de la requête. L'identifiant est généralement attendu dans l'URL */
    const bookData = req.file ? JSON.parse(req.body.book) : req.body;

    const book = await Book.findOne({
      _id: id,
    }); /* Une requête est effectuée pour trouver le livre dans la base de données en utilisant son identifiant. Si le livre existe, il sera stocké dans la variable book. */
    if (!book) {
      res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.auth.userId) {
      res.status(403).json({ message: "Non autorisé" });
      return;
    }

    if (req.file) {
      bookData.imageUrl = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename.split(
          "."
        )[0] /*  Cette méthode divise le nom de fichier en utilisant le point comme séparateur, puis sélectionne le premier élément (avant le premier point). Cela est fait pour enlever l'extension du nom de fichier. */
      }optimize.webp`; /* Cela ajoute l'extension ".optimize.webp" au nom de fichier */
    }

    await Book.updateOne({ _id: id }, bookData);
    res.status(200).json({ message: "Livre enregistré" });

    return;
  } catch (error) {
    res.status(400).json({ error });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id });
    if (!book) {
      res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.auth.userId) {
      res.status(403).json({ message: "Non autorisé" });
      return;
    }

    await Book.deleteOne({ _id: id });
    res.status(200).json({ message: "Livre supprimé" });
  } catch (error) {
    res.status(400).json({ error });
  }
}

async function rateBook(req, res) {
  try {
    const { id } = req.params;
    const { userId, rating } = req.body;

    const book = await Book.findOne({ _id: id });
    if (!book) {
      res.status(404).json({ message: "Livre non trouvé" });
      return;
    }
    if (book.ratings.find((rating) => rating.userId === userId)) {
      res.status(409).json({ message: "Déjà noté" });
      return;
    }
    const newRating = {
      userId,
      grade: Number(rating),
    };
    const updatedRatings = [...(book.ratings ?? []), newRating];
    const updateAverageRating = calcAverageRating(updatedRatings);
    const updatedBook = await Book.findOneAndUpdate(
      { _id: id },
      {
        $push: { ratings: newRating },
        averageRating: updateAverageRating,
      },
      { new: true }
    );
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ error });
  }
}

module.exports = app;
