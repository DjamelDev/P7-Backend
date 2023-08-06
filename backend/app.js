const express = require("express"); /* Import d'Express */
const app =
  express(); /*On appelle la méthode express pour créer une appli Express*/

const { User, Book } = require("./db/mongo");
const { cors } = require("./middleware/cors");
const auth = require("./middleware/auth");
const bcrypt = require("bcrypt");
const { getToken } = require("./lib/jwt");

app.use(express.json());
app.use(cors);

app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", login);

app.get("/api/books", getAllBooks);
app.get("/api/books/bestrating", getBestRatingBooks);
app.get("/api/books/:id", getOneBook);

app.post("/api/books", auth, createBook);

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
  } catch (e) {
    if (e.errors?.email?.kind === "unique") {
      res.status(409).send("Adresse email déjà utilisée");
      return;
    }
    console.error(e);
    res.status(500).send("Quelque chose ne s'est pas passé comme prévu");
    return;
  }
  res.send("Sign up");
}

async function login(req, res) {
  const body = req.body;

  const userInDb = await User.findOne({ email: body.email }).exec();
  if (userInDb == null) {
    res.status(401).send("Mauvaise adresse e-mail");
    return;
  }
  const passwordInDb = userInDb.password;
  const isValid = await bcrypt.compare(body.password, passwordInDb);
  if (!isValid) {
    res.status(401).send("Mot de passe incorrect");
    return;
  }
  const token = getToken(userInDb);
  res.send({ token });
  return;
}

async function getAllBooks(req, res) {
  const books = await Book.find({});
  res.send(books);
}

async function getOneBook(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id });
    res.send(book);
  } catch (err) {
    res.status(404).send("Livre non trouvé");
  }
}

async function getBestRatingBooks(req, res) {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function createBook(req, res) {
  try {
    const { book, image } = req.body;
    const bookData = JSON.parse(book);
    const bookDbo = new Book({
      ...bookData,
      userId: req.auth.userId,
      averageRating: 0,
      ratings: [],
      imageUrl: "fake",
    });
    await bookDbo.save();
    res.status(201).json("Livre créé");
    return;
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
}

module.exports = app;
