const Set = require("../models/set");

const SetService = {
  createSet: async (userId, name) =>
    await Set.create({
      name,
      user: userId,
      photoList: [],
    })
      .populate("user")
      .exec(),

  readSet: async (id) =>
    Set.findById(id)
      .populate("user")
      .populate("photoList")
      .populate("photoList.user")
      .exec(),

  updateSet: async (id, name) =>
    await Set.findByIdAndUpdate(id, { name }, { new: true })
      .exec()
      .then((updatedSet) => !!updatedSet),

  deleteSet: async (id) =>
    await Set.findByIdAndDelete(id)
      .exec()
      .then((deletedSet) => !!deletedSet),
  addPhotoToSet: async (set_id, photo_id) =>
    await Set.findByIdAndUpdate(
      set_id,
      { $push: { photoList: photo_id } },
      { new: true }
    )
      .exec()
      .then((updatedSet) => !!updatedSet),
  deletePhotoFromSet: async (set_id, photo_id) =>
    await Set.findByIdAndUpdate(
      set_id,
      { $pull: { photoList: photo_id } },
      { new: true }
    )
      .exec()
      .then((updatedSet) => !!updatedSet),
  getNewSets: async () =>
    await Set.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("user")
      .populate("photoList")
      .exec(),

  readUserSets: async (userId) => await Set.find({ user: userId }).exec(),
  getSetUser: async (id) => await Set.findById(id, "user").exec(),
};

module.exports = SetService;
