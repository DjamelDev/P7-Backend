module.exports = (req, res, next) => {
  try {
    const { rating } = req.body;
    if (!rating) {
      res.status(400).json({ message: "rating est obligatoire" });
      return;
    }
    if (isNaN(Number(rating))) {
      res.status(400).json({ message: "rating doit être un nombre" });
      return;
    }
    if (Number(rating) < 0 || Number(rating) > 5) {
      res
        .status(400)
        .json({ message: "rating doit être compris entre 0 et 5" });
      return;
    }
    next();
  } catch (error) {
    res.status(403).json({ error });
  }
};
