const User = require("../models/user")
const { USER_CREATED, LOGIN_FAILED } = require("../constants/messages")
const { hashPassword, verifyPassword, getToken } = require("../lib/auth")

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body
    const hash = await hashPassword(password, 10)
    const user = new User({
      email: email.toLowerCase(),
      password: hash,
    })
    try {
      await user.save()
      res.status(201).json({ message: USER_CREATED })
    } catch (error) {
      res.status(400).json({ error })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json({ message: LOGIN_FAILED })
      return
    }
    const isLogged = await verifyPassword(password, user.password)
    if (!isLogged) {
      res.status(401).json({ message: LOGIN_FAILED })
      return
    }
    res.status(200).json({
      userId: user._id,
      token: getToken(user),
    })
  } catch (error) {
    res.status(500).json({ error })
  }
}