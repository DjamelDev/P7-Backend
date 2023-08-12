const jwt = require("jsonwebtoken");

const SECRET = "djamel-secret"; 

const verify = (token) => jwt.verify(token, SECRET);

const getToken = (user) =>
  jwt.sign({ userId: user._id }, SECRET, {
    expiresIn: "1d",
  });

module.exports = {
  verify,
  getToken,
};
