const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      validate(name) {
        if (validator.isEmpty(name)) {
          throw new Error("Enter category name");
        }
        if (!validator.isLength(name, { min: 3 })) {
          throw new Error("Use 3 characters or more for category name");
        }
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(description) {
        if (validator.isEmpty(description)) {
          throw new Error("Enter category description");
        }
        if (!validator.isLength(description, { min: 5 })) {
          throw new Error("Use 6 characters or more for category description");
        }
      },
    },
    topics: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
