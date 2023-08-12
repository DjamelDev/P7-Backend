const express = require("express"); /* Import d'Express */
const router = express.Router();

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signUp);
router.post("/login", userCtrl.login);

module.exports = router;
