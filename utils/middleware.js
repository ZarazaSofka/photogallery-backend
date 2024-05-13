const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      message: "Недостаточно прав для выполнения данного действия",
    });
  }
  next();
};

module.exports = authMiddleware;
