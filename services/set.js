const Set = require("../models/set");

class SetService {
  constructor() {}

  async createSet(userId, name) {
    const set = new Set({
      name,
      user: userId,
      photoList: [],
    });
    await set.save();
    return await Set.findById(set._id).populate("user").exec();
  }

  async readSet(id) {
    return await Set.findById(id).populate("user").exec();
  }

  async updateSet(id, name) {
    const updatedSet = await Set.findByIdAndUpdate(
      id,
      { name },
      {
        new: true,
      }
    );
    return !!updatedSet;
  }

  async deleteSet(id) {
    const deletedSet = await Set.findByIdAndDelete(id);
    return !!deletedSet;
  }

  async addPhotoToSet(set_id, photo_id) {
    const updatedSet = await Set.findByIdAndUpdate(
      set_id,
      { $push: { photoList: photo_id } },
      { new: true }
    );
    return !!updatedSet;
  }

  async deletePhotoFromSet(set_id, photo_id) {
    const updatedSet = await Set.findByIdAndUpdate(
      set_id,
      { $pull: { photoList: photo_id } },
      { new: true }
    );
    return !!updatedSet;
  }

  async getNewSets() {
    return await Set.find({ "photoList.0": { $exists: true } }) // находит наборы, где photoList содержит хотя бы один элемент
      .sort({ createdAt: -1 }) // сортировка по дате создания в убывающем порядке
      .limit(10) // ограничение результатов до 10
      .populate("user") // заполнение поля user
      .exec();
  }

  async readUserSets(userId) {
    return await Set.find({ user: userId }).exec();
  }

  async getSetUser(id) {
    return (await Set.findById(id, "user").exec()).user;
  }
}

const setService = new SetService();
module.exports = setService;
