import { Schema, model } from "mongoose";

const setSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photoList: {
      type: [Schema.Types.ObjectId],
      ref: "Photo",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

setSchema.virtual("id").get(function () {
  return this._id;
});

export default model("Set", setSchema);
