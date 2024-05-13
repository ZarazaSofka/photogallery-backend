const { Router } = require("express");
const { upload } = require("../utils/connectDB");
const PhotoService = require("../services/photo");
const router = Router();
const authMiddleware = require("../utils/middleware");

const isPhotoOwnerOrAdmin = async (req, res, next) => {
  try {
    const userId = await PhotoService.getPhotoUser(req.params.id);
    if (
      req.user &&
      (req.user.rights.includes("ROLE_ADMIN") || req.user.id === userId)
    ) {
      next();
    } else {
      throw new Error("Недостаточно прав для выполнения данного действия");
    }
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

router.get("/user/:userId", async (req, res) => {
  console.log(`GET /photo/user/${req.params.userId}`);
  const photos = await PhotoService.readUserPhotos(req.params.userId);
  res.json(photos);
});

router.get("/popular", async (req, res) => {
  console.log("GET /photo/popular");
  const photos = await PhotoService.readPopularPhotos();
  res.json(photos);
});

router.get("/latest", async (req, res) => {
  console.log("GET /photo/latest");
  const photos = await PhotoService.readLatestPhotos();
  res.json(photos);
});

router.get("/", async (req, res) => {
  console.log("GET /photo/");
  const { last } = req.query;
  const photos = await PhotoService.readPhotos(last);
  res.json(photos);
});

router.get("/:id", async (req, res) => {
  console.log(`GET /photo/${req.params.id}`);
  const photo = await PhotoService.readPhoto(req.params.id);
  if (photo) {
    res.set("Content-Type", photo.type);
    res.send(photo);
  } else res.sendStatus(404);
});

router.get("/:id/compressed", async (req, res) => {
  console.log(`GET /photo/${req.params.id}/compressed`);
  const photo = await PhotoService.readCompressedPhoto(req.params.id);
  if (photo) {
    res.set("Content-Type", photo.type);
    res.send(photo);
  } else res.sendStatus(404);
});

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  console.log(`POST /photo/ - ${req.file.originalname}`);
  const photo = await PhotoService.createPhoto(
    req.user.id,
    req.file._id,
    req.body.description
  );
  res.json(photo);
});

router.delete("/:id", isPhotoOwnerOrAdmin, async (req, res) => {
  console.log(`DELETE /photo/${req.params.id}`);
  const deleted = await PhotoService.deletePhoto(req.params.id);
  if (deleted) res.sendStatus(200);
  else res.sendStatus(404);
});

module.exports = router;
