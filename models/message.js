const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const messageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate(description) {
        if (validator.isEmpty(description)) {
          throw new Error("Enter message");
        }
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
    parentTopic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isAnnounced: {
      type: Boolean,
      default: false,
    },
    isTasked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
