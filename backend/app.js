const express = require("express"); /* Import d'Express */
const path = require("path"); /* Import du module path qui permettra de travailler avec les chemins de fichiers et de répertoires. */
const app =
  express(); /*On appelle la méthode express pour créer une appli Express*/

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");

const { cors } = require("./middleware/cors");

app.use(express.json());
app.use(cors);

app.use("/api/auth", userRoutes);
app.use("/api/", bookRoutes);


/** on déclare le dossier images comme étant accessible */
app.use("/images", express.static(path.join(__dirname, "images")));


module.exports = app;
