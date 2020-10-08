const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
        required: true,
      },
    ],
  },
  isRemoved: {
    type: Boolean,
    default: false,
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
