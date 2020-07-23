const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const topicSchema = new Schema({
  topicName: {
    type: String,
    required: true,
  },
  topicDescription: {
    type: String,
    required: true,
  },
  topicTags: {
    type: [String],
    required: true,
  },
  chats: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
      replyTo: String,
      avatarUrl: String,
      username: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      description: String,
      likes: Number,
      comments: Number,
    },
  ],
});

module.exports = mongoose.model("Topic", topicSchema);
