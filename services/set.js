const Set = require("../models/set");

const SetService = {
  createSet: async ({ name, userId }) =>
    await Set.create({
      name,
      user: userId,
      photoList: [],
    })
      .select("-_id")
      .populate("user", "-_id -password")
      .exec(),

  readSet: async (id) =>
    Set.findById(id)
      .select("-_id")
      .populate("user", "-_id -password")
      .populate("photoList", "-_id -file -compressed")
      .populate("photoList.user", "-_id -password")
      .exec(),

  updateSet: async (user, id, name) => {
    const set = await Set.findById(id).exec();
    if (!set || (!user.rights.includes("ROLE_ADMIN") && user.id !== set.user))
      return false;
    return await Set.findByIdAndUpdate(id, { name }, { new: true })
      .exec()
      .then((updatedSet) => !!updatedSet);
  },

  deleteSet: async (user, id) => {
    const set = await Set.findById(id).exec();
    if (!set || (!user.rights.includes("ROLE_ADMIN") && user.id !== set.user))
      return false;
    return await Set.findByIdAndDelete(id)
      .exec()
      .then((deletedSet) => !!deletedSet);
  },
  addPhotoToSet: async (user, set_id, photo_id) => {
    const set = await Set.findById(set_id).exec();
    if (!set || (!user.rights.includes("ROLE_ADMIN") && user.id !== set.user))
      return false;
    return await Set.findByIdAndUpdate(
      set_id,
      { $push: { photoList: photo_id } },
      { new: true }
    )
      .exec()
      .then((updatedSet) => !!updatedSet);
  },
  deletePhotoFromSet: async (user, set_id, photo_id) => {
    const set = await Set.findById(set_id).exec();
    if (!set || (!user.rights.includes("ROLE_ADMIN") && user.id !== set.user))
      return false;
    return await Set.findByIdAndUpdate(
      set_id,
      { $pull: { photoList: photo_id } },
      { new: true }
    )
      .exec()
      .then((updatedSet) => !!updatedSet);
  },
  getNewSets: async () =>
    await Set.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .select("-_id")
      .populate("user", "-_id -password")
      .populate("photoList", "-_id -file -compressed")
      .exec(),

  readUserSets: async (userId) =>
    await Set.find({ user: userId }).select("-_id").exec(),
};

module.exports = SetService;
