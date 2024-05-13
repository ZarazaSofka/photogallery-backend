const { Schema, model } = require("mongoose");

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
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.file;
        delete ret.compressed;
      },
    },
  }
);

photoSchema.virtual("id").get(function () {
  return this._id;
});

photoSchema.pre("remove", async function (next) {
  try {
    // Находим все наборы, содержащие данную фотографию и удаляем ее из них
    await Set.updateMany(
      { photoList: this._id },
      { $pull: { photoList: this._id } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Photo = model("Photo", photoSchema);

module.exports = Photo;
