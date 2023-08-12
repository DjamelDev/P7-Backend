const { verify } = require("../lib/jwt");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; /* On récupère le token */
    const decodedToken = verify(token, process.env.TOKEN); /* On décode le token grâce au token récupéré */
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(403).json({ error });
  }
};
