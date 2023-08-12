const Book = require("../models/book")
const fs = require("fs")
const {
  NOT_FOUND,
  FORBIDDEN,
  BOOK_CREATED,
  BOOK_UPDATED,
  BOOK_DELETED,
  BOOK_ALREADY_RATED,
} = require("../constants/messages")
const { getOptimizedUrl } = require("../lib/images")
const { calcAverageRating } = require("../lib/rating")

exports.createBook = async (req, res) => {
  try {
    const { book: data } = req.body
    const book = new Book({
      ...data,
      userId: req.auth.userId,
      imageUrl: getOptimizedUrl(req.file),
      averageRating: data.ratings[0].grade,
    })
    await book.save()
    res.status(201).json({ message: BOOK_CREATED })
    return
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params
    const { book: data } = req.body

    const book = await Book.findOne({ _id: id })
    if (!book) {
      res.status(404).json({ error: new Error(NOT_FOUND) })
    }

    if (book.userId !== req.auth.userId) {
      res.status(403).json({ message: FORBIDDEN })
      return
    }

    if (req.file) {
      const filename = book.imageUrl.split("/images")[1]
      fs.unlink(`images/${filename}`, () => {})

      data.imageUrl = getOptimizedUrl(req.file)
    }

    await Book.updateOne({ _id: id }, data)
    res.status(200).json({ message: BOOK_UPDATED })
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params
    const book = await Book.findOne({ _id: id })
    if (!book) {
      res.status(404).json({ error: new Error(NOT_FOUND) })
    }

    if (book.userId !== req.auth.userId) {
      res.status(403).json({ message: FORBIDDEN })
      return
    }

    if (book.imageUrl) {
      const filename = book.imageUrl.split("/images/")[1]
      fs.unlink(`images/${filename}`, () => {})
    }

    await Book.deleteOne({ _id: id })
    res.status(200).json({ message: BOOK_DELETED })
    return
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.getBestBook = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)
    res.status(200).json(books)
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id })
    res.status(200).json(book)
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({})
    res.status(200).json(books)
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.rateBook = async (req, res) => {
  try {
    const { userId } = req.auth
    const book = await Book.findOne({ _id: req.params.id })
    if (book.userId === userId) {
      res.status(403).json({ message: FORBIDDEN })
      return
    }
    if (book.ratings.find((rating) => rating.userId === userId)) {
      res.status(409).json({ message: BOOK_ALREADY_RATED })
      return
    }
    const newRating = {
      userId: user,
      grade: req.body.rating,
      _id: req.body._id,
    }
    const updatedRatings = [...book.ratings, newRating]
    const updateAverageRating = calcAverageRating(updatedRatings)
    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id, "ratings.userId": { $ne: user } },
      {
        $push: { ratings: newRating },
        averageRating: updateAverageRating,
      },
      { new: true }
    )
    res.status(200).json(updatedBook)
  } catch (error) {
    res.status(500).json({ error })
  }
}