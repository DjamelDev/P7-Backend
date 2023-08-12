const bcrypt = require("bcrypt"); /* hachage sécurisé des mots de passe */
const {
  getToken,
} = require("../lib/jwt"); /* génération et vérification des tokens */

const { User } = require("../db/mongo");

exports.signUp = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
  const userId = userInDb?._id;
  res.send({ token, userId });
  return;
};
