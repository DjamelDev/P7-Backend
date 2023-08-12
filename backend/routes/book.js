const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const optimizedImg = require("../middleware/sharp");

const {
  getAllBooks,
  getBestBook,
  getOneBook,
  rateBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/book");

// Public routes

router.get("/", getAllBooks);
router.get("/bestrating", getBestBook);
router.get("/:id", getOneBook);

// Protected routes

router.post("/:id/rating", auth, rateBook);
router.post("/", auth, multer, optimizedImg, createBook);
router.put("/:id", auth, multer, optimizedImg, updateBook);
router.delete("/:id", auth, deleteBook);

module.exports = router;
