const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate(name) {
      if (validator.isEmpty(name)) {
        throw new Error("Category Name is required");
      }
      if (!validator.isLength(name, { min: 3 })) {
        throw new Error("Invalid Category Name: Atleast 3 characters long");
      }
    },
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    validate(description) {
      if (validator.isEmpty(description)) {
        throw new Error("Description is required");
      }
      if (!validator.isLength(description, { min: 5 })) {
        throw new Error("Invalid Description: Atleast 5 characters long");
      }
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  topics: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Category", categorySchema);
