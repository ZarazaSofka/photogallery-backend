const config = {
  MAX_DOWNLOAD_PHOTOS_VALUE: 10,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024,
  COMPRESSES_RESOLUTION: {
    width: 500,
    height: 400,
  },
  mongoURI: "mongodb://root:example@localhost:27017/PhotoGallery",
  SESSION_SECRET: "123456789",
  SERVER_PORT: 3111,
  PROFILE_PHOTO_RESOLUTION: 100,
  CLIENT_SERVER_URL: "http://localhost:3000",
};

module.exports = config;
