const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/user");
const validEmail = require("../middleware/email-validator");
const validPassword = require("../middleware/password-validator");

router.post("/signup", validEmail, validPassword, signup);

router.post("/login", login);

module.exports = router;
