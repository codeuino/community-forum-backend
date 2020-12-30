const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    attachedMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    description: {
      type: String,
      trim: true,
      validate(description) {
        if (!validator.isLength(description, { min: 5 })) {
          throw new Error("Use 5 characters or more for task description");
        }
      },
    },
    deadline: {
      type: Date,
    },
    parentTopic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
