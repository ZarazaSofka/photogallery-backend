const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const config = require("../config");

module.exports.connectToDB = async function () {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
    });
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
  }
};

module.exports.getMongoStore = () => {
  return new MongoStore({
    mongoUrl: mongoose.connection.client.s.url,
  });
};
