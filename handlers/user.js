const userService = require("../services/user");
const { isMeOrAdmin } = require("../utils/middleware");
const express = require("express");
const passport = require("passport");
const multer = require("multer");

class UserHandler {
  constructor() {
    this.router = express.Router();
    this.userService = userService;
    this.upload = multer();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/:userId", this.readUser.bind(this));
    this.router.get("/:userId/photo", this.readProfilePhoto.bind(this));
    this.router.post(
      "/auth",
      passport.authenticate("local"),
      this.authenticateUser.bind(this)
    );
    this.router.post("/register", this.registerUser.bind(this));
    this.router.put("/:userId", isMeOrAdmin, this.updateUser.bind(this));
    this.router.put(
      "/:userId/photo",
      isMeOrAdmin,
      this.upload.single("file"),
      this.changeProfilePhoto.bind(this)
    );
    this.router.delete("/:userId", isMeOrAdmin, this.deleteUser.bind(this));
    this.router.post("/logout", this.logout.bind(this));
  }

  async logout(req, res, next) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Вы вышли" });
    });
  }

  async readUser(req, res) {
    const userId = req.params.userId;
    try {
      const user = await this.userService.readUser(userId);
      res.json(user);
    } catch (error) {
      console.log(`Ошибка чтения пользователя ${userId}`);
      res.status(500).json({ error: error.message });
    }
  }

  async authenticateUser(req, res) {
    try {
      res.status(200).json({ message: "Успешная авторизация", user: req.user });
    } catch (error) {
      console.log(`Ошибка авторизации: ${error.message}`);
      res.status(401).json({ message: error.message });
    }
  }

  async registerUser(req, res) {
    try {
      const user = await this.userService.register(req.body);

      req.login(user, (err) => {
        if (err) {
          console.log(`Ошибка автоматической аутентификации: ${err.message}`);
          res.status(500).json({ message: err.message });
        } else {
          res.status(200).json({ message: "Успешная регистрация", user });
        }
      });
    } catch (error) {
      console.log(`Ошибка регистрации нового пользователя`);
      res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    const userId = req.params.userId;
    try {
      const updatedUser = await this.userService.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.log(`Ошибка обновления пользователя ${userId}`);
      res.status(500).json({ error: error.message });
    }
  }

  async readProfilePhoto(req, res) {
    const userId = req.params.userId;
    try {
      const profilePhoto = await this.userService.readProfilePhoto(userId);
      if (profilePhoto) {
        res.set("Content-Type", profilePhoto.contentType);
        res.send(profilePhoto.buffer);
      } else res.sendStatus(404);
    } catch (error) {
      console.log(`Ошибка чтения фотографии пользователя ${userId}`);
      res.status(500).json({ error: error.message });
    }
  }

  async changeProfilePhoto(req, res) {
    if (!req.file) return res.sendStatus(400);
    const userId = req.params.userId;
    try {
      const profilePhoto = await this.userService.changeProfilePhoto(
        userId,
        req.file
      );
      res.json(profilePhoto);
    } catch (error) {
      console.log(`Ошибка обновления фотографии пользователя ${userId}`);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    const userId = req.params.userId;
    const { user } = req;

    try {
      if (userId === user?._id.toString() && req.session) {
        req.logout((err) => {
          if (err) {
            return next(err);
          }
        });
      }

      const result = await this.userService.deleteUser(userId);
      res.json(result);
    } catch (error) {
      console.log(`Ошибка удаления пользователя ${userId}`);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserHandler();
