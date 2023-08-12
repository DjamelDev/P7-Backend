const mongoose = require("mongoose"); /*  Importe le module Mongoose, qui est une bibliothèque JavaScript pour la gestion des BDD MongoDB. */
const uniqueValidator = require("mongoose-unique-validator"); /*  Importe le module qui permet de valider les champs uniques dans les schémas Mongoose. */

require("dotenv").config();
const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rc7q0m2.mongodb.net/?retryWrites=true&w=majority`;
console.log("DB_URL: ", DB_URL);

async function connect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connexion à la BDD établie");
  } catch (e) {
    console.error(e);
  }
}
connect();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
UserSchema.plugin(uniqueValidator);

const User = mongoose.model("User", UserSchema);

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, required: true },
});

bookSchema.plugin(uniqueValidator);

const Book = mongoose.model("Book", bookSchema);

module.exports = { User, Book };
