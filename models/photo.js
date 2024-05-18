const { Schema, model } = require("mongoose");
const Set = require("./set");

const photoSchema = new Schema(
  {
    buffer: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["image/jpeg", "image/png"],
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
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

photoSchema.virtual("id").get(function () {
  return this._id;
});

photoSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Set.updateMany(
      { photoList: doc._id },
      { $pull: { photoList: doc._id } }
    );
  }
});

photoSchema.pre("deleteMany", async function (next) {
  try {
    const docs = await this.model.find(this.getFilter());
    if (docs.length > 0) {
      const photoIds = docs.map((doc) => doc._id);
      await Set.updateMany(
        { photoList: { $in: photoIds } },
        { $pull: { photoList: { $in: photoIds } } }
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Photo = model("Photo", photoSchema);

module.exports = Photo;
