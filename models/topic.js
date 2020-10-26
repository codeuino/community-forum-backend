const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const topicSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    validate(name) {
      if (validator.isEmpty(name)) {
        throw new Error("Topic Name is required");
      }
      if (!validator.isLength(name, { min: 3 })) {
        throw new Error("Invalid Topic Name: Atleast 3 characters long");
      }
    },
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  tags: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
  },
  chats: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
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

module.exports = mongoose.model("Topic", topicSchema);
