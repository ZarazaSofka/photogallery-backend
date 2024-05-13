const { gfs } = require("../utils/connectDB");
const Photo = require("../models/photo");
const sharp = require("sharp");
const config = require("../config");

module.exports = class PhotoService {
  static async readUserPhotos(userId) {
    console.log(`Reading user photos for user ${userId}`);
    return await Photo.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user");
  }

  static async readPopularPhotos() {
    console.log("Reading popular photos");
    return await Photo.find().sort({ score: -1 }).limit(10).populate("user");
  }

  static async readLatestPhotos() {
    console.log("Reading latest photos");
    return await Photo.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user");
  }

  static async readPhotos(last = null) {
    const limit = parseInt(config.MAX_DOWNLOAD_PHOTOS_VALUE);
    const query = last ? { _id: { $lt: last } } : {};
    console.log(`Reading photos up to ${last} with limit ${limit}`);
    const photos = await Photo.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
      { $limit: limit },
    ]);
    return await Photo.populate(photos, { path: "user" });
  }

  static async readPhoto(id) {
    console.log(`Reading photo ${id}`);
    const photo = await Photo.findById(id);
    if (!photo) return null;
    return await createBlob(photo.file);
  }

  static async readCompressedPhoto(id) {
    console.log(`Reading compressed photo ${id}`);
    const photo = await Photo.findById(id);
    if (!photo) return null;
    return await createBlob(photo.compressed);
  }

  static async createPhoto(userId, fileId, description = null) {
    console.log(`Creating photo for user ${userId} with file ${fileId}`);
    const compressedPhotoId = createCompressedPhoto(fileId);
    const newPhoto = new Photo({
      file: fileId,
      compressed: compressedPhotoId,
      user: userId,
      score: 0,
      likes: [],
    });
    if (description) newPhoto.description = description;
    return await newPhoto.save().populate("user");
  }

  static async deletePhoto(id) {
    console.log(`Deleting photo ${id}`);
    const photo = await Photo.findById(id);
    await Promise.all([
      gfs.remove({ _id: photo.file }),
      gfs.remove({ _id: photo.compressed }),
    ]);
    return Photo.findByIdAndDelete(id).populate("user");
  }
  static async getPhotoUser(id) {
    return await Photo.findById(id, "user").exec();
  }
};

function createCompressedPhoto(fileId) {
  const readStream = gfs.createReadStream({ _id: fileId });

  const compressedImage = sharp()
    .resize(
      config.COMPRESSES_RESOLUTION.width,
      config.COMPRESSES_RESOLUTION.height
    )
    .on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });

  const writeStream = gfs.createWriteStream({
    filename: `${req.file.filename}_compressed`,
    metadata: {
      originalFileId: fileId,
    },
  });

  readStream.pipe(compressedImage).pipe(writeStream);
  writeStream.on("close", async (file) => {
    return file._id;
  });
}

async function createBlob(fileId) {
  gfs.files.findOne({ _id: fileId }, (err, file) => {
    if (err) {
      console.error(err);
      return;
    }
    if (!file) {
      console.error("Файл не найден");
      return;
    }

    const readstream = gfs.createReadStream({ _id: fileId });
    let data = [];
    readstream.on("data", (chunk) => {
      data.push(chunk);
    });
    readstream.on("end", () => {
      return new Blob(data, { type: file.contentType });
    });
  });
}
