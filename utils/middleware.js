const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      message: "Недостаточно прав для выполнения данного действия",
    });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.rights.includes("ROLE_ADMIN")) {
    next(); // Продолжаем выполнение следующих обработчиков маршрута
  } else {
    console.log(`Недостаточно прав для выполнения действия`);
    res
      .status(403)
      .json({ message: "Недостаточно прав для выполнения данного действия" });
  }
};

const isMeOrAdmin = async (req, res, next) => {
  const userId = req.params.userId;
  if (
    req.user &&
    (req.user.rights.includes("ROLE_ADMIN") ||
      req.user._id.toString() === userId)
  ) {
    next(); // Продолжаем выполнение следующих обработчиков маршрута
  } else {
    console.log(
      `Недостаточно прав для выполнения действия с пользователем ${userId}`
    );
    res
      .status(403)
      .json({ message: "Недостаточно прав для выполнения данного действия" });
  }
};

const setService = require("../services/set");

const isSetOwnerOrAdmin = async (req, res, next) => {
  const userId = await setService.getSetUser(req.params.setId);
  console.log(
    `Checking access to set ${req.params.setId} by user ${req.user.id}`
  );
  if (
    req.user &&
    (req.user.rights.includes("ROLE_ADMIN") ||
      req.user._id.toString() === userId.toString())
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Недостаточно прав для выполнения данного действия" });
  }
};

const photoService = require("../services/photo");

const isPhotoOwnerOrAdmin = async (req, res, next) => {
  try {
    const userId = await photoService.getPhotoUser(req.params.id);
    console.log(req.user);
    console.log(userId);
    if (
      req.user &&
      (req.user.rights.includes("ROLE_ADMIN") ||
        req.user._id.toString() === userId.toString())
    ) {
      next();
    } else {
      throw new Error("Недостаточно прав для выполнения данного действия");
    }
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

module.exports = {
  authMiddleware,
  isAdmin,
  isMeOrAdmin,
  isSetOwnerOrAdmin,
  isPhotoOwnerOrAdmin,
};
