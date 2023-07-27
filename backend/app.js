const express = require("express");
const app = express();
const { User } = require("./db/mongo");
const { cors } = require("./middleware/cors");

app.use(express.json());
app.use(cors);

function sayHi(req, res) {
  res.send("Hello world!");
}

app.get("/", sayHi);
app.post("/api/auth/signup", signUp);
app.post("/api/auth/login", login);

async function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // const userInDb = users.find((user) => user.email === email);
  // if (userInDb != null) {
  //   res.status(400).send("Adresse e-mail déjà existante");
  //   return;
  // }

  const user = {
    email: email,
    password: password,
  };
  try {
    await User.create(user);
  } catch (e) {
    console.error(e);
    res.status(500).send("Quelque chose ne s'est pas passé comme prévu");
    return;
  }
  res.send("Sign up");
}

function login(req, res) {
  const body = req.body;

  const userInDb = users.find((user) => user.email === body.email);
  if (userInDb == null) {
    res.status(401).send("Mauvaise adresse e-mail");
    return;
  }
  const passwordInDb = userInDb.password;
  if (passwordInDb != body.password) {
    res.status(401).send("Mot de passe incorrect");
    return;
  }
}

module.exports = app;
