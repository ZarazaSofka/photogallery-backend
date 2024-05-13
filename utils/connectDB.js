const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const multer = require("multer");
const MongoStore = require("connect-mongo");
const config = require("../config");

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;

let gfs;

connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

const mongoStore = new MongoStore({
  mongoUrl: connection.client.s.url,
});

const gridFsStorage = new GridFsStorage({
  url: config.mongoURI,
  file: (req, file) => {
    return {
      filename: file.originalname,
    };
  },
});

const upload = multer({ gridFsStorage });

module.exports = { gfs, upload, mongoStore };
