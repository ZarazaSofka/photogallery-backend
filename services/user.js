const User = require("../models/user");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

class UserService {
  static read(userId) {
    return User.findById(userId).select("-_id -password");
  }

  static register(userData) {
    const user = new User({
      login: userData.login,
      email: userData.email,
      password: bcrypt.hashSync(userData.password, 10),
      rights: ["ROLE_USER"],
    });
    return user.save().select("-_id -password");
  }

  static authenticate(userData) {
    return User.findOne({ login: userData.login }).then((user) =>
      user && bcrypt.compareSync(userData.password, user.password)
        ? user.select("-_id -password")
        : null
    );
  }

  static update(userData) {
    const updateData = {};
    if (userData.login) updateData.login = userData.login;
    if (userData.email) updateData.email = userData.email;
    if (userData.rights) updateData.rights = userData.rights;
    return User.findByIdAndUpdate(userData.id, updateData, {
      new: true,
    }).select("-_id -password");
  }

  static deleteUser(userId) {
    return User.findByIdAndDelete(userId).then((deletedUser) => !!deletedUser);
  }
}

export default UserService;
