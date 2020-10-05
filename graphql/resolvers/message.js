const Message = require("../../models/message");
const Topic = require("../../models/topic");

module.exports = {
  messages: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Please login to continue");
    }
    try {
      let topic = await Topic.findById(args.topicId);
      console.log(topic);
      return topic.chats.map(async (chatId) => {
        let message = await Message.findById(chatId);
        return { ...message._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
