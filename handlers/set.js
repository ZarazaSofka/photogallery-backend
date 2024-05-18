const express = require("express");
const { authMiddleware, isSetOwnerOrAdmin } = require("../utils/middleware");

class SetHandler {
  constructor() {
    this.router = express.Router();
    this.setService = require("../services/set");
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/new", this.getNewSets.bind(this));
    this.router.get("/:id", this.readSet.bind(this));
    this.router.get("/user/:userId", this.readUserSets.bind(this));
    this.router.post("/", authMiddleware, this.createSet.bind(this));
    this.router.put("/:setId", isSetOwnerOrAdmin, this.updateSet.bind(this));
    this.router.put(
      "/:setId/photos/:photoId",
      isSetOwnerOrAdmin,
      this.addPhotoToSet.bind(this)
    );
    this.router.delete("/:setId", isSetOwnerOrAdmin, this.deleteSet.bind(this));
    this.router.delete(
      "/:setId/photos/:photoId",
      isSetOwnerOrAdmin,
      this.deletePhotoFromSet.bind(this)
    );
  }

  async createSet(req, res) {
    console.log(req);
    console.log(req.body);
    console.log(
      `Creating set for user ${req.user.id} with name ${req.body.name}`
    );
    res.json(await this.setService.createSet(req.user.id, req.body.name));
  }

  async readSet(req, res) {
    const set = await this.setService.readSet(req.params.id);
    if (set) {
      console.log(`Reading set ${req.params.id}`);
      res.json(set);
    } else res.sendStatus(404);
  }

  async updateSet(req, res) {
    const updatedSet = await this.setService.updateSet(
      req.params.setId,
      req.body.name
    );
    console.log(`Updating set ${req.params.setId} by user ${req.user.id}`);
    res.json(updatedSet);
  }

  async deleteSet(req, res) {
    const deletedSet = await this.setService.deleteSet(req.params.setId);
    console.log(`Deleting set ${req.params.setId} by user ${req.user.id}`);
    res.json(deletedSet);
  }

  async addPhotoToSet(req, res) {
    const addedPhoto = await this.setService.addPhotoToSet(
      req.params.setId,
      req.params.photoId
    );
    console.log(
      `Adding photo ${req.params.photoId} to set ${req.params.setId} by user ${req.user.id}`
    );
    res.json(addedPhoto);
  }

  async deletePhotoFromSet(req, res) {
    const deletedPhoto = await this.setService.deletePhotoFromSet(
      req.params.setId,
      req.params.photoId
    );
    console.log(
      `Deleting photo ${req.params.photoId} from set ${req.params.setId} by user ${req.user.id}`
    );
    res.json(deletedPhoto);
  }

  async getNewSets(req, res) {
    const newSets = await this.setService.getNewSets();
    console.log(`Reading new sets`);
    res.json(newSets);
  }

  async readUserSets(req, res) {
    const userSets = await this.setService.readUserSets(req.params.userId);
    console.log(`Reading sets of user ${req.params.userId}`);
    res.json(userSets);
  }
}

module.exports = new SetHandler();
