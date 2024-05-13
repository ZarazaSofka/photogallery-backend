const express = require("express");
const router = express.Router();
const UserService = require("../services/user");

const isOwnerOrAdmin = async (req, res, next) => {
  const userId = req.params.userId;
  if (
    req.user &&
    (req.user.rights.includes("ROLE_ADMIN") || req.user.id === userId)
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

// Маршрут для чтения пользователя
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await UserService.readUser(userId);
    res.json(user);
  } catch (error) {
    console.log(`Ошибка чтения пользователя ${userId}`);
    res.status(500).json({ error: error.message });
  }
});

router.post("/auth", passport.authenticate("local"), async (req, res) => {
  try {
    res.status(200).json({ message: "Успешная авторизация", user: req.user });
  } catch (error) {
    console.log(`Ошибка аутентификации: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
});

// Маршрут для регистрации пользователя
router.post("/register", async (req, res) => {
  try {
    const user = await UserService.register(req.body);
    res.json(user);
  } catch (error) {
    console.log(`Ошибка регистрации нового пользователя`);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для обновления пользователя
router.put("/:userId", isOwnerOrAdmin, async (req, res) => {
  const userId = req.params.userId;
  try {
    const updatedUser = await UserService.updateUser(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.log(`Ошибка обновления пользователя ${userId}`);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для удаления пользователя
router.delete("/:userId", isOwnerOrAdmin, async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await UserService.deleteUser(userId);
    res.json(result);
  } catch (error) {
    console.log(`Ошибка удаления пользователя ${userId}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
