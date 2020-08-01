const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  announcement: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  date: {
    type: Date,
    default: new Date(Date.now()),
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
