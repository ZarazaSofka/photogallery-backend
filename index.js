const express = require("express");
const session = require("express-session");
const passport = require("passport");
const userRoute = require("./services/user");
const photoRoute = require("./handlers/photo");
const setRoute = require("./handlers/set");
const { mongoStore } = require("./utils/connectDB");
const config = require("./config");

const app = express();

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
app.use("/api/user", userRoute);
app.use("/api/photo", photoRoute);
app.use("/api/set", setRoute);

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.listen(config.SERVER_PORT, () => {
  console.log("Server started on port " + config.SERVER_PORT);
});
