const { Router } = require("express");
const multer = require("multer");
const { isPhotoOwnerOrAdmin, authMiddleware } = require("../utils/middleware");

class PhotoHandler {
  constructor() {
    this.router = Router();
    this.upload = multer();
    this.photoService = require("../services/photo");
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", this.safeHandler(this.getAllPhotos));
    this.router.get("/popular", this.safeHandler(this.getPopularPhotos));
    this.router.get("/latest", this.safeHandler(this.getLatestPhotos));
    this.router.get("/:id", this.safeHandler(this.getPhoto));
    this.router.get("/user/:userId", this.safeHandler(this.getUserPhotos));
    this.router.post(
      "/",
      authMiddleware,
      this.upload.single("file"),
      this.safeHandler(this.createPhoto)
    );
    this.router.put(
      "/:id/like",
      authMiddleware,
      this.safeHandler(this.likePhoto)
    );

    this.router.delete(
      "/:id",
      isPhotoOwnerOrAdmin,
      this.safeHandler(this.deletePhoto)
    );
  }

  safeHandler(handler) {
    return async (req, res, next) => {
      try {
        await handler.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  async getUserPhotos(req, res) {
    console.log(`GET /photo/user/${req.params.userId}`);
    const photos = await this.photoService.readUserPhotos(req.params.userId);
    res.json(photos);
  }

  async getPopularPhotos(req, res) {
    console.log("GET /photo/popular");
    const photos = await this.photoService.readPopularPhotos();
    res.json(photos);
  }

  async getLatestPhotos(req, res) {
    console.log("GET /photo/latest");
    const photos = await this.photoService.readLatestPhotos();
    res.json(photos);
  }

  async getAllPhotos(req, res) {
    console.log("GET /photo/");
    const { last } = req.query;
    const photos = await this.photoService.readPhotos(last);
    res.json(photos);
  }

  async getPhoto(req, res) {
    console.log(`GET /photo/${req.params.id}`);
    const photo = await this.photoService.readPhoto(req.params.id);
    res.json(photo);
  }

  async createPhoto(req, res) {
    console.log(req);
    if (!req.file) return res.sendStatus(400);
    console.log(`POST /photo/ - ${req.file.originalname}`);
    console.log(req.body);
    console.log(req.file);
    const photo = await this.photoService.createPhoto(
      req.user.id,
      req.file,
      req.body.description
    );
    res.json(photo);
  }

  async deletePhoto(req, res) {
    console.log(`DELETE /photo/${req.params.id}`);
    const deleted = await this.photoService.deletePhoto(req.params.id);
    if (deleted) res.sendStatus(200);
    else res.sendStatus(404);
  }

  async likePhoto(req, res) {
    try {
      console.log(`PUT /photo/${req.params.id}/like`);
      const { id } = req.params;
      await this.photoService.likePhoto(req.user.id, id);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(404);
    }
  }
}

module.exports = new PhotoHandler();
