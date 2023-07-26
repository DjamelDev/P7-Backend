const express = require("express");
const app = express();
const { User } = require("./db/mongo");
const cors = require("cors");

const PORT = 4000;

app.use(cors());
app.use(express.json());

function sayHi(req, res) {
  res.send("Hello world!");
}

app.get("/", sayHi);
app.post("/api/auth/signup", signUp)
app.post("/api/auth/login", login)

const users = [];

function signUp(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const userInDb = user.find((user) => user.email === email);
  if (userInDb != null) {
    res.status(400).send("Adresse e-mail déjà existante");
    return;
  }
  const user = {
    email: email,
    password: password,
  };
  users.push(user);
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
