import { Router } from "express";
import { upload } from "../utils/connectDB";
import {
  readUserPhotos,
  readPopularPhotos,
  readLatestPhotos,
  readPhotos,
  readPhoto,
  readCompressedPhoto,
  createPhoto,
  deletePhoto,
} from "../services/photo";
const router = Router();

router.get("/user/:userId", async (req, res) => {
  const photos = await readUserPhotos(req.params.userId);
  res.json(photos);
});

router.get("/popular", async (req, res) => {
  const photos = await readPopularPhotos();
  res.json(photos);
});

router.get("/latest", async (req, res) => {
  const photos = await readLatestPhotos();
  res.json(photos);
});

router.get("/", async (req, res) => {
  const { last } = req.query;
  const photos = await readPhotos(last);
  res.json(photos);
});

router.get("/:id", async (req, res) => {
  const photo = await readPhoto(req.params.id);
  if (photo) res.json(photo);
  else res.sendStatus(404);
});

router.get("/:id/compressed", async (req, res) => {
  const photo = await readCompressedPhoto(req.params.id);
  if (photo) res.json(photo);
  else res.sendStatus(404);
});

router.post("/", upload.single("file"), async (req, res) => {
  const photo = await createPhoto(
    req.body.userId,
    req.file._id,
    req.body.description
  );
  res.json(photo);
});

router.delete("/:id", async (req, res) => {
  const deleted = await deletePhoto(req.params.user, req.params.id);
  if (deleted) res.sendStatus(200);
  else res.sendStatus(404);
});

export default router;
