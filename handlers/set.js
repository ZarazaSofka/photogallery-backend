const express = require("express");
const router = express.Router();
const SetService = require("../services/set");

router.post("/", async (req, res) => {
  const createdSet = await SetService.createSet(req.body);
  res.json(createdSet);
});

router.get("/:id", async (req, res) => {
  const set = await SetService.readSet(req.params.id);
  if (set) res.json(set);
  else res.sendStatus(404);
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const updatedSet = await SetService.updateSet(
    req.params.user,
    req.params.id,
    name
  );
  res.json(updatedSet);
});

router.delete("/:id", async (req, res) => {
  const deletedSet = await SetService.deleteSet(req.params.user, req.params.id);
  res.json(deletedSet);
});

router.put("/:set_id/photos/:photo_id", async (req, res) => {
  const addedPhoto = await SetService.addPhotoToSet(
    req.params.user,
    req.params.set_id,
    req.params.photo_id
  );
  res.json(addedPhoto);
});

router.delete("/:set_id/photos/:photo_id", async (req, res) => {
  const deletedPhoto = await SetService.deletePhotoFromSet(
    req.params.user,
    req.params.set_id,
    req.params.photo_id
  );
  res.json(deletedPhoto);
});

router.get("/new", async (req, res) => {
  const newSets = await SetService.getNewSets();
  res.json(newSets);
});

router.get("/user/:userId", async (req, res) => {
  const userSets = await SetService.readUserSets(req.params.userId);
  res.json(userSets);
});

module.exports = router;
