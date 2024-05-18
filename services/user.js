const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

class UserService {
  async readUsers() {
    try {
      return await User.find();
    } catch (error) {
      throw new Error("Ошибка чтения данных пользователя");
    }
  }

  async readUser(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      throw new Error("Ошибка чтения данных пользователя");
    }
  }

  async register(userData) {
    try {
      userData.profilePhoto = await createProfilePhotoBuffer();
      return await User.register(userData, userData.password);
    } catch (error) {
      throw new Error("Ошибка регистрации");
    }
  }

  async updateUser(userId, userData) {
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

  async readProfilePhoto(userId) {
    try {
      const user = await User.findById(userId).select("profilePhoto");
      return user.profilePhoto;
    } catch (error) {
      throw new Error("Ошибка чтения фотографии пользователя");
    }
  }

  async changeProfilePhoto(userId, file) {
    try {
      const profilePhoto = await createProfilePhotoBuffer(file);
      return User.findByIdAndUpdate(
        userId,
        {
          profilePhoto,
        },
        {
          new: true,
        }
      ).then((updatedUser) => !!updatedUser);
    } catch (error) {
      throw new Error("Ошибка обновления фотографии пользователя");
    }
  }

  async deleteUser(userId) {
    try {
      console.log(`Удаляю пользователя ${userId}`);
      return User.findByIdAndDelete(userId).then(
        (deletedUser) => !!deletedUser
      );
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      throw new Error("Ошибка удаления пользователя");
    }
  }
}

const config = require("../config");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const createProfilePhotoBuffer = async (file = null) => {
  try {
    let buffer;
    let contentType;

    if (file) {
      buffer = file.buffer;
      contentType = file.mimetype;
    } else {
      const defaultImagePath = path.resolve(
        __dirname,
        "../images/defaultProfilePhoto.jpg"
      );
      buffer = await fs.readFile(defaultImagePath);
      contentType = "image/jpeg";
    }

    const resizedImageBuffer = await sharp(buffer)
      .resize(
        config.PROFILE_PHOTO_RESOLUTION,
        config.PROFILE_PHOTO_RESOLUTION,
        {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        }
      )
      .toBuffer();

    return { buffer: resizedImageBuffer, contentType };
  } catch (error) {
    console.error("Ошибка при сжатии фотографии:", error);
    throw error;
  }
};

userService = new UserService();
module.exports = userService;
