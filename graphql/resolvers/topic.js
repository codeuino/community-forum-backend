const User = require("../../models/user");
const Topic = require("../../models/topic");
const Category = require("../../models/category");
const Message = require("../../models/message");
const {
  authenticationError,
  topicRemovedError,
  blockRemoveUserError,
  noAuthorizationError,
  categoryArchivedError,
} = require("../variables/errorMessages");
const {
  topicDeleteResult,
  topicArchiveResult,
} = require("../variables/resultMessages");

module.exports = {
  topics: async () => {
    try {
      let topics = await Topic.find({}).lean();
      return topics;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createTopic: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const category = await Category.findById(
        args.topicInput.parentCategory
      ).lean();
      if (category.isArchived == false) {
        let topic = new Topic({
          name: args.topicInput.name,
          description: args.topicInput.description,
          tags: args.topicInput.tags,
          parentCategory: args.topicInput.parentCategory,
          createdBy: req.currentUser.id,
        });
        const saveTopic = await topic.save();
        const saveCategory = await Category.findById(
          args.topicInput.parentCategory
        );
        saveCategory.topics.push(topic);
        await saveCategory.save();
        const user = await User.findById(req.currentUser.id);
        user.topicsCreated.push(topic);
        await user.save();
        return { ...saveTopic._doc };
      } else {
        throw new Error(categoryArchivedError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateTopic: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        topic.name = args.topicInput.name;
        topic.description = args.topicInput.description;
        topic.tags = args.topicInput.tags;
        const updateTopic = await topic.save();
        return { ...updateTopic._doc };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteTopic: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        await topic.remove();
        await Message.deleteMany({ parentTopic: args.topicFindInput._id });
        const user = await User.findById(req.currentUser.id);
        user.topicsCreated = user.topicsCreated.filter(
          (topicId) => topicId.toString() != args.topicFindInput._id
        );
        await user.save();
        const category = await Category.findById(topic.parentCategory);
        category.topics = category.topics.filter(
          (topicId) => topicId.toString() != args.topicFindInput._id
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

  archiveTopic: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        topic.isArchived = true;
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
      const topic = await Topic.findById(args.topicFindInput._id).populate(
        "chats"
      );
      if (!topic) {
        throw new Error(topicRemovedError);
      }
      topic.chats = topic.chats.map((chat) => {
        let user = User.findById(chat.userId, "_id name");
        chat.user = user;
        return chat;
      });
      return topic.chats;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getTopicTasks: async (args) => {
    try {
      const topic = await Topic.findById(args.topicFindInput._id).populate(
        "tasks"
      ).lean();
      if (!topic) {
        throw new Error(topicRemovedError);
      }
      topic.tasks = topic.tasks.filter((task) => {
        return !task.isCompleted;
      })
      topic.tasks = topic.tasks.map(async (task) => {
        if(task.attachedMessage != undefined) {
          const message = await Message.findById(task.attachedMessage).lean();
          task.description = message.description;
          task.parentTopic = message.parentTopic;
        }
        return task;
      });
      return topic.tasks;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
