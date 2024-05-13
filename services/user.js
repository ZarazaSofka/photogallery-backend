const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = class UserService {
  static async readUser(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new Error("Ошибка чтения данных пользователя");
    }
  }

  static async register(userData) {
    try {
      return await User.register(userData, userData.password);
    } catch (error) {
      throw new Error("Ошибка регистрации");
    }
  }

  static async updateUser(userId, userData) {
    try {
      const updateData = {};
      if (userData.login) updateData.login = userData.login;
      if (userData.email) updateData.email = userData.email;
      return User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
    } catch (error) {
      throw new Error("Ошибка обновления пользователя");
    }
  }

  static async deleteUser(userId) {
    try {
      return User.findByIdAndDelete(userId).then(
        (deletedUser) => !!deletedUser
      );
    } catch (error) {
      throw new Error("Ошибка удаления пользователя");
    }
  }
};
