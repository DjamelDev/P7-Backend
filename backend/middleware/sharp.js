const sharp = require("sharp");
sharp.cache(false);

const fs = require("fs");

const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    /** si pas d'image, on ignore */
    return next();
  }
  try {
    /** on réduit la taille et la qualite */
    const res = await sharp(req.file.path)
      .resize({
        width: 500,
      })
      .webp({ quality: 80 })
      .toFile(`${req.file.path.split(".")[0]}optimize.webp`);

    /** on supprime le fichier original */
    fs.unlink(req.file.path, (error) => {
      /** on met à jour le chemin vers le fichier */
      req.file.path = `${req.file.path.split(".")[0]}optimize.webp`;
      if (error) {
        console.log(error);
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "Impossible d'optimiser l'image" });
  }
};

module.exports = optimizeImage;
