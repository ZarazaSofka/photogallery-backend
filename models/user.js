import { Schema, model } from "mongoose";

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
    password: {
      type: String,
      required: true,
    },
    rights: {
      type: [String],
      default: [],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.virtual("id").get(function () {
  return this._id;
});

export default User = model("User", userSchema);
