const Topic = require("../../models/topic");

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
  createTopics: async (args) => {
    try {
      let topic = new Topic({
        idName: args.topicInput.idName,
        topicName: args.topicInput.topicName,
        topicDescription: args.topicInput.topicDescription,
        topicTags: args.topicInput.topicTags,
      });
      let saveTopic = await topic.save();
      let createTopic = { ...saveTopic._doc };
      let categories = await Category.findById(args.topicInput.categoryID);
      categories.topicIds.push(topic);
      await categories.save();
      return createTopic;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
