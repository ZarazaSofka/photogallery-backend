const { gfs } = require("../utils/connectDB");
const { Photo } = require("../models/photo");
const sharp = require("sharp");

export class PhotoService {
  static async readUserPhotos(userId) {
    return await Photo.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("id user score likes createdAt")
      .populate("user", "-password");
  }

  static async readPopularPhotos() {
    return await Photo.find()
      .sort({ score: -1 })
      .limit(10)
      .select("id user score likes createdAt")
      .populate("user", "-password");
  }

  static async readLatestPhotos() {
    return await Photo.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("id user score likes createdAt")
      .populate("user", "-password");
  }

  static async readPhotos(last = null) {
    const limit = parseInt(config.MAX_DOWNLOAD_PHOTOS_VALUE);
    const query = last ? { _id: { $lt: last } } : {};
    const photos = await Photo.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $project: {
          id: 1,
          user: 1,
          score: 1,
          likes: 1,
          createdAt: 1,
        },
      },
    ]);
    return await Photo.populate(photos, { path: "user", select: "-password" });
  }

  static async readPhoto(id) {
    const photo = await Photo.findById(id);
    if (!photo) return null;
    const file = await gfs.findOne({ _id: photo.file });
    if (!file) return null;
    return file.read();
  }

  static async readCompressedPhoto(id) {
    const photo = await Photo.findById(id);
    if (!photo) return null;
    const file = await gfs.findOne({ _id: photo.compressed });
    if (!file) return null;
    return file.read();
  }

  static async createPhoto(userId, fileId, description = null) {
    const compressedPhotoId = createCompressedPhoto(fileId);
    const newPhoto = new Photo({
      file: fileId,
      compressed: compressedPhotoId,
      user: userId,
      score: 0,
      likes: [],
    });
    if (description) newPhoto.description = description;
    return await newPhoto.save();
  }

  static async deletePhoto(user, id) {
    const photo = await Photo.findById(id);
    if (!photo) return null;
    if (!user.rights.includes("ROLE_ADMIN") && user.id !== photo.user)
      return null;
    await Promise.all([
      gfs.remove({ _id: photo.file }),
      gfs.remove({ _id: photo.compressed }),
    ]);
    return Photo.findByIdAndDelete(id)
      .populate("user", "-password")
      .select("id user score likes createdAt");
  }
}

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
