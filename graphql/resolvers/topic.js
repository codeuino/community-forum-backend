const User = require("../../models/user");
const Topic = require("../../models/topic");
const Category = require("../../models/category");
const Message = require("../../models/message");
const Tag = require("../../models/tag");
const {
  authenticationError,
  topicRemovedError,
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
      let topics = await Topic.find({}).populate({
        path: "topics",
        populate: { path: "createdBy tags" },
      });
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
      throw new Error(noAuthorizationError);
    }
    try {
      let category = await Category.findById(
        args.topicInput.parentCategory
      ).lean();
      if (category.isArchived == false) {
        let topic = new Topic({
          name: args.topicInput.name,
          description: args.topicInput.description,
          tagString: args.topicInput.tagString,
          parentCategory: args.topicInput.parentCategory,
          createdBy: req.currentUser.id,
        });
        if(args.topicInput.tagString) {
          let tagStringArray = args.topicInput.tagString.trim().split(" ");
          tagStringArray.forEach((tagElement, index) => {
            const tagElementNoSpace = tagElement.trim();
            if (
              !tagElementNoSpace.match(`/^\s*$/`) &&
              tagElementNoSpace.length != 0
            ) {
              tagStringArray[index] =
                tagElementNoSpace[0].toUpperCase() +
                tagElementNoSpace.slice(1).toLowerCase();
            }
          });
          let uniqueTagStringArray = [...new Set(tagStringArray)];
          for (const stringTag of uniqueTagStringArray) {
            if (stringTag.match(`/^\s*$/`) || stringTag.length == 0) {
              continue;
            }
            let tag = await Tag.findOne({ name: stringTag });
            if (tag) {
              tag.topics.push(topic);
            } else {
              tag = new Tag({
                name: stringTag,
                topics: [topic],
              });
            }
            await tag.save();
            topic.tags.push(tag);
          }
        }
        await topic.save();
        const saveCategory = await Category.findById(
          args.topicInput.parentCategory
        );
        saveCategory.topics.push(topic);
        await saveCategory.save();
        const user = await User.findById(req.currentUser.id);
        user.topicsCreated.push(topic);
        await user.save();
        topic = await Topic.findById(topic._id).populate(
          "createdBy tags"
        );
        return topic;
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
      throw new Error(noAuthorizationError);
    }
    try {
      let topic = await Topic.findById(args.topicInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        let oldTagStringArray = [];
        let oldUniqueTagStringArray = [];
        let newTagStringArray = [];
        let newUniqueTagStringArray = [];
        if (topic.tagString) {
          oldTagStringArray = topic.tagString.trim().split(" ");
          oldTagStringArray.forEach((tagElement, index) => {
            const tagElementNoSpace = tagElement.trim();
            if (
              !tagElementNoSpace.match(`/^\s*$/`) &&
              tagElementNoSpace.length != 0
            ) {
              oldTagStringArray[index] =
                tagElementNoSpace[0].toUpperCase() +
                tagElementNoSpace.slice(1).toLowerCase();
            }
          });
          oldUniqueTagStringArray = [...new Set(oldTagStringArray)];
        }
        topic.name = args.topicInput.name;
        topic.description = args.topicInput.description;
        topic.tagString = args.topicInput.tagString;
        if (args.topicInput.tagString) {
          newTagStringArray = args.topicInput.tagString.trim().split(" ");
          newTagStringArray.forEach((tagElement, index) => {
            const tagElementNoSpace = tagElement.trim();
            if (
              !tagElementNoSpace.match(`/^\s*$/`) &&
              tagElementNoSpace.length != 0
            ) {
              newTagStringArray[index] =
                tagElementNoSpace[0].toUpperCase() +
                tagElementNoSpace.slice(1).toLowerCase();
            }
          });
          newUniqueTagStringArray = [...new Set(newTagStringArray)];
        }
        const oldRemovableTags = oldUniqueTagStringArray.filter(
          (tag) => !newUniqueTagStringArray.includes(tag)
        );
        for (const stringTag of oldRemovableTags) {
          const tag = await Tag.findOne({ name: stringTag });
          tag.topics = tag.topics.filter(
            (topicId) => topicId.toString() != args.topicInput._id
          );
          if (tag.topics.length == 0) {
            await tag.remove();
          } else {
            await tag.save();
          }
        }
        const newAddableTags = newUniqueTagStringArray.filter(
          (tag) => !oldUniqueTagStringArray.includes(tag)
        );
        for (const stringTag of newAddableTags) {
          if (stringTag.match(`/^\s*$/`) || stringTag.length == 0) {
            continue;
          }
          let tag = await Tag.findOne({ name: stringTag });
          if (tag) {
            tag.topics.push(topic);
          } else {
            tag = new Tag({
              name: stringTag,
              topics: [topic],
            });
          }
          await tag.save();
          topic.tags.push(tag);
        }
        await topic.save();
        topic = await Topic.findById(args.topicInput._id).populate(
          "createdBy tags"
        );
        return topic;
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
      throw new Error(noAuthorizationError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        for (const stringTag of topic.tags) {
          const tag = await Tag.findById(stringTag);
          tag.topics = tag.topics.filter(
            (topicId) => topicId.toString() != args.topicFindInput._id
          );
          if (tag.topics.length == 0) {
            await tag.remove();
          } else {
            await tag.save();
          }
        }
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
      throw new Error(noAuthorizationError);
    }
    try {
      const topic = await Topic.findById(args.topicFindInput._id);
      if (
        topic.createdBy.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        if (topic.isArchived == true) {
          throw new Error(noAuthorizationError);
        }
        topic.isSelfArchived = true;
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
