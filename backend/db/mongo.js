const mongoose = require("mongoose");

const PASSWORD = "HbufEhdEXe8ofBdE";
const USER = "djamel";
const DB_URL = `mongodb+srv://${USER}:${PASSWORD}@cluster0.rc7q0m2.mongodb.net/?retryWrites=true&w=majority`;
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
  email: String,
  password: String,
});

const User = mongoose.model("User", UserSchema);


module.exports = { User }; 
