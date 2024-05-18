const Photo = require("../models/photo");
const sharp = require("sharp");
const config = require("../config");
class PhotoService {
  async readUserPhotos(userId) {
    console.log(`Reading user photos for user ${userId}`);
    const photos = await Photo.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user");
    return photos.map((photo) => photo._id);
  }

  async readPopularPhotos() {
    console.log("Reading popular photos");
    const photos = await Photo.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("user");
    return photos.map((photo) => photo._id);
  }

  async readLatestPhotos() {
    console.log("Reading latest photos");
    return (
      await Photo.find().sort({ createdAt: -1 }).limit(10).populate("user")
    ).map((photo) => photo._id);
  }

  async readPhotos(last = null) {
    const limit = parseInt(config.MAX_DOWNLOAD_PHOTOS_VALUE);
    let query = {};

    if (last) {
      const lastPhoto = await Photo.findById(last).select("createdAt");
      if (lastPhoto) {
        query = { createdAt: { $lt: lastPhoto.createdAt } };
      }
    }

    console.log(`Reading photos up to ${last} with limit ${limit}`);
    const photos = await Photo.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("_id");

    return photos.map((photo) => photo._id);
  }

  async readPhoto(id) {
    console.log(`Reading photo data ${id}`);
    try {
      return await Photo.findById(id).populate("user");
    } catch (error) {
      console.error("Ошибка получения данных фотографии:", error);
    }
  }

  async createPhoto(userId, file, description = null) {
    console.log(
      `Creating photo for user ${userId} with file ${file?.originalname}`
    );
    if (file.size > config.MAX_UPLOAD_SIZE) {
      const error = new Error("File is too large");
      error.code = 413;
      throw error;
    }
    const newPhoto = new Photo({
      buffer: file.buffer,
      contentType: file.mimetype,
      user: userId,
      score: 0,
      likes: [],
    });
    if (description) newPhoto.description = description;
    await newPhoto.save();

    return { id: newPhoto._id };
  }

  async deletePhoto(id) {
    console.log(`Deleting photo ${id}`);
    return Photo.findByIdAndDelete(id).then((photo) => !!photo);
  }
  async getPhotoUser(id) {
    return (await Photo.findById(id, "user").exec()).user;
  }

  async likePhoto(userId, id) {
    try {
      console.log(`Updating photo ${id} like`);
      const photo = await Photo.findById(id);
      if (!photo) throw new Error("Фотография не найдена");
      if (photo.likes.includes(userId)) {
        photo.likes = photo.likes.filter((like) => like.toString() !== userId);
        photo.score--;
      } else {
        photo.likes.push(userId);
        photo.score++;
      }

      await photo.save();
    } catch (error) {
      console.error("Ошибка лайка фотографии:", error);
      throw error;
    }
  }
}

const photoService = new PhotoService();
module.exports = photoService;
