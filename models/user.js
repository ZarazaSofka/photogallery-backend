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
    profilePhoto: {
      buffer: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: "image/jpeg",
      },
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
        return {
          id: ret._id,
          login: ret.login,
          email: ret.email,
          registrationDate: ret.registrationDate,
          rights: ret.rights,
        };
      },
    },
  }
);

userSchema.plugin(passportLocalMongoose, { usernameField: "login" });

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Set.deleteMany({ user: doc._id });
    await Photo.deleteMany({ user: doc._id });
  }
});

userSchema.virtual("id").get(function () {
  return this._id;
});

const User = model("User", userSchema);

module.exports = User;
