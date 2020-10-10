const Topic = require("../../models/topic");
const Category = require("../../models/category");

module.exports = {
  topics: async () => {
    try {
      let topics = await Topic.find();
      return topics.map((topic) => {
        return { ...topic._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createTopics: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Please login to continue");
    }
    try {
      let topic = new Topic({
        topicName: args.topicInput.topicName,
        topicDescription: args.topicInput.topicDescription,
        topicTags: args.topicInput.topicTags,
        chats: args.topicInput.chats,
      });
      let saveTopic = await topic.save();
      let categories = await Category.findById(args.topicInput.categoryId);
      categories.topicIds.push(topic);
      await categories.save();
      return { ...saveTopic._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
