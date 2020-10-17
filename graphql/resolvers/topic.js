const User = require("../../models/user");
const Topic = require("../../models/topic");
const Category = require("../../models/category");
const {
  authenticationError,
  topicRemovedError,
  blockRemoveUserError,
  noAuthorizationError,
} = require("../variables/errorMessages");
const {
  topicDeleteResult,
  topicArchiveResult,
} = require("../variables/resultMessages");

module.exports = {
  topics: async () => {
    try {
      let topics = await Topic.find({}).lean();
      return topics.map((topic) => {
        return { ...topic._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createTopic: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      let topic = new Topic({
        name: args.topicInput.name,
        description: args.topicInput.description,
        tags: args.topicInput.tags,
        parentCategory: args.topicInput.parentCategory,
      });
      const saveTopic = await topic.save();
      const saveCategory = await Category.findById(args.topicInput.parentCategory);
      saveCategory.topicIds.push(topic);
      await saveCategory.save();
      const user = await User.findById(req.currentUser.id);
      user.topicsCreated.push(topic);
      await user.save();
      return { ...saveTopic._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateTopic: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() === req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        topic[name] = args.topicInput.name;
        topic[description] = args.topicInput.description;
        topic[tags] = args.topicInput.tags;
        const updateTopic = await topic.save();
        return { ...updateTopic._doc };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteTopic:  async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() === req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        await topic.remove();
        await Message.deleteMany({parentTopic: args.topicFindInput._id});
        const user = await User.findById(req.currentUser.id);
        user.topicsCreated.filter(
          (topicId) => topicId.toString() !== args.topicFindInput._id
        );
        await user.save();
        const category = await Category.findById(topic.parentCategory);
        category.topics.filter(
          (topicId) => topicId.toString() !== args.topicFindInput._id
        );
        await category.save();
        return { result: topicDeleteResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  archiveTopic: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() === req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        topic[isArchived] = true;
        await topic.save();
        return { result: topicArchiveResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getTopicChats: async (args) => {
    try {
      const topic = await Topic.findById(
        args.topicFindInput._id
      ).populate("chats");
      if (!topic) {
        throw new Error(topicRemovedError);
      }
      topic.chats = topic.chats.map(
        (chat) => {
          let user = User.findById(chat.userId, "name info");
          chat.user = user;
          return chat;
        }
      );
      return topic.chats;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
