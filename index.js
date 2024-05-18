const config = require("./config");
const { connectToDB, getMongoStore } = require("./utils/connectDB");

connectToDB()
  .then(() => {
    const express = require("express");
    const cors = require("cors");

    const app = express();
    app.use(
      cors({
        origin: config.CLIENT_SERVER_URL,
        credentials: true,
      })
    );

    const session = require("express-session");

    app.use(
      session({
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: getMongoStore(),
      })
    );

    const passport = require("passport");

    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
      const logData = {
        method: req.method,
        url: req.url,
        user: req.user && req.user.id,
      };
      console.log(JSON.stringify(logData));
      next();
    });

    app.use(express.urlencoded({ extended: false }));
    app.use("/api", express.json());

    const setHandler = require("./handlers/set");
    const photoHandler = require("./handlers/photo");
    const userHandler = require("./handlers/user");

    app.use("/api/user", userHandler.router);
    app.use("/api/photo", photoHandler.router);
    app.use("/api/set", setHandler.router);

    app.listen(config.SERVER_PORT, () => {
      console.log("Server started on port " + config.SERVER_PORT);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
  });
