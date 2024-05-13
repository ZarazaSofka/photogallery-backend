const express = require("express");
const router = express.Router();
const SetService = require("../services/set");
const authMiddleware = require("../utils/middleware");

const isSetOwnerOrAdmin = async (req, res, next) => {
  const userId = await SetService.getSetUser(req.params.setId);
  console.log(
    `Checking access to set ${req.params.setId} by user ${req.user.id}`
  );
  if (
    req.user &&
    (req.user.rights.includes("ROLE_ADMIN") || req.user.id === userId)
  ) {
    next(); // Продолжаем выполнение следующих обработчиков маршрута
  } else {
    res
      .status(403)
      .json({ message: "Недостаточно прав для выполнения данного действия" });
  }
};

router.post("/", authMiddleware, async (req, res) => {
  console.log(
    `Creating set for user ${req.user.id} with name ${req.body.name}`
  );
  res.json(await SetService.createSet(req.user.id, req.body.name));
});

router.get("/:id", async (req, res) => {
  const set = await SetService.readSet(req.params.id);
  if (set) {
    console.log(`Reading set ${req.params.id} by user ${req.user.id}`);
    res.json(set);
  } else res.sendStatus(404);
});

router.put("/:setId", isSetOwnerOrAdmin, async (req, res) => {
  const updatedSet = await SetService.updateSet(
    req.params.setId,
    req.body.name
  );
  console.log(`Updating set ${req.params.setId} by user ${req.user.id}`);
  res.json(updatedSet);
});

router.delete("/:setId", isSetOwnerOrAdmin, async (req, res) => {
  const deletedSet = await SetService.deleteSet(req.params.setId);
  console.log(`Deleting set ${req.params.setId} by user ${req.user.id}`);
  res.json(deletedSet);
});

router.put("/:setId/photos/:photoId", isSetOwnerOrAdmin, async (req, res) => {
  const addedPhoto = await SetService.addPhotoToSet(
    req.params.setId,
    req.params.photoId
  );
  console.log(
    `Adding photo ${req.params.photoId} to set ${req.params.setId} by user ${req.user.id}`
  );
  res.json(addedPhoto);
});

router.delete(
  "/:setId/photos/:photoId",
  isSetOwnerOrAdmin,
  async (req, res) => {
    const deletedPhoto = await SetService.deletePhotoFromSet(
      req.params.setId,
      req.params.photoId
    );
    console.log(
      `Deleting photo ${req.params.photoId} from set ${req.params.setId} by user ${req.user.id}`
    );
    res.json(deletedPhoto);
  }
);

router.get("/new", async (req, res) => {
  const newSets = await SetService.getNewSets();
  console.log(`Reading new sets by user ${req.user.id}`);
  res.json(newSets);
});

router.get("/user/:userId", async (req, res) => {
  const userSets = await SetService.readUserSets(req.params.userId);
  console.log(
    `Reading sets of user ${req.params.userId} by user ${req.user.id}`
  );
  res.json(userSets);
});

module.exports = router;
