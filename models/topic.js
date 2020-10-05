const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  topicName: {
    type: String,
    required: true,
  },
  topicDescription: {
    type: String,
    default: null,
  },
  topicTags: {
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
});

module.exports = mongoose.model("Topic", topicSchema);
