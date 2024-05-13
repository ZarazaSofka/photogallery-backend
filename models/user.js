const { Schema, model } = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Photo = require("./photo");
const Set = require("./set");

const userSchema = new Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    rights: {
      type: [String],
      default: ["ROLE_USER"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove the _id and password fields from the returned object
        delete ret._id;
        delete ret.password;
      },
    },
  }
);

userSchema.plugin(passportLocalMongoose, { usernameField: "login" });

userSchema.virtual("id").get(function () {
  return this._id;
});

userSchema.pre("remove", async function (next) {
  try {
    await Photo.deleteMany({ user: this._id });
    await Set.deleteMany({ user: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

const User = model("User", userSchema);

module.exports = User;
