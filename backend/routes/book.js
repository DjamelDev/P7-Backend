const express = require("express"); /* Import d'Express */
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer");
const rating = require("../middleware/rating");
const optimizeImage = require("../middleware/sharp");

const bookCtrl = require("../controllers/book");

router.get("/books", bookCtrl.getAllBooks);
router.get("/books/bestrating", bookCtrl.getBestRatingBooks);
router.get("/books/:id", bookCtrl.getOneBook);

/** on configure multer pour intercepter le champ image (une seule image) */
router.post(
  "/books",
  auth,
  multer.single("image"),
  optimizeImage,
  bookCtrl.createBook
);
router.put(
  "/books/:id",
  auth,
  multer.single("image"),
  optimizeImage,
  bookCtrl.updateBook
);
router.delete("/books/:id", auth, bookCtrl.deleteBook);
router.post("/books/:id/rating", auth, rating, bookCtrl.rateBook);

module.exports = router;
