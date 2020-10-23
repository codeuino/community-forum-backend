const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("Task", taskSchema);
