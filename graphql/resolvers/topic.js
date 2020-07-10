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
      throw new Error("Not Authenticated!");
    }
    try {
      let topic = new Topic({
        topicName: args.topicInput.topicName,
        topicDescription: args.topicInput.topicDescription,
        topicTags: args.topicInput.topicTags,
        chats: args.topicInput.chats
      });
      console.log(args.topicInput);
      let saveTopic = await topic.save();
      let createTopic = { ...saveTopic._doc };
      let categories = await Category.findById(args.topicInput.categoryID);
      // console.log(categories)
      categories.topicIds.push(topic);
      await categories.save();
      return createTopic;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
