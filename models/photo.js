import { Schema, model } from "mongoose";

const photoSchema = new Schema(
  {
    file: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    compressed: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        like: {
          type: Number,
          enum: [-1, 0, 1],
          default: 0,
        },
      },
    ],
    createdAt: {
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

photoSchema.virtual("id").get(function () {
  return this._id;
});

const Photo = model("Photo", photoSchema);

export { Photo };
