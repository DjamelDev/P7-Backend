const express = require("express"); /* Import d'Express */
const app = express(); /*On appelle la méthode express pour créer une appli Express*/
const { User } = require("./db/mongo");
const { cors } = require("./middleware/cors");
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors);


app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", login);

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
    if(e.errors?.email?.kind === 'unique'){
      res.status(409).send("Adresse email déjà utilisée")
      return
    }
    console.error(e);
    res.status(500).send("Quelque chose ne s'est pas passé comme prévu");
    return;
  }
  res.send("Sign up");
}

async function login(req, res) {
  const body = req.body;

  const userInDb = await User.findOne({email: body.email}).exec();
  if (userInDb == null) {
    res.status(401).send("Mauvaise adresse e-mail");
    return;
  }
  const passwordInDb = userInDb.password;
  const isValid = await bcrypt.compare(body.password, passwordInDb)
  if (!isValid) {
    res.status(401).send("Mot de passe incorrect");
    return;
  }
  res.send({token: 'test'})
  return;
}

module.exports = app;
