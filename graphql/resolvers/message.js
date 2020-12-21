const Message = require("../../models/message");
const Topic = require("../../models/topic");
const User = require("../../models/user");
const {
  authenticationError,
  noAuthorizationError,
  topicArchivedError,
} = require("../variables/errorMessages");
const {
  messageDeleteResult,
  pinMessageResult,
  unpinMessageResult,
  messageAnnouncementResult,
  removeAnnouncementResult,
} = require("../variables/resultMessages");

module.exports = {
  createMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const topic = await Topic.findById(args.messageInput.parentTopic);
      if (topic.isArchived == false && topic.isSelfArchived == false) {
        let message = new Message({
          userId: req.currentUser.id,
          description: args.messageInput.description,
          replyTo: args.messageInput.replyTo,
          parentTopic: args.messageInput.parentTopic,
        });
        const saveMessage = await message.save();
        topic.chats.push(message);
        await topic.save();
        let user = User.findById(req.currentUser.id, "name");
        saveMessage.user = user;
        return saveMessage;
      } else {
        throw new Error(topicArchivedError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageInput._id);
      if (message.userId.toString() == req.currentUser.id) {
        message.description = args.messageInput.description;
        const updateMessage = await message.save();
        let user = User.findById(req.currentUser.id, "_id name");
        updateMessage.user = user;
        return updateMessage;
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (
        message.userId.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        await message.remove();
        const topic = await Topic.findById(message.parentTopic);
        topic.chats = topic.chats.filter(
          (messageId) => messageId.toString() != args.messageFindInput._id
        );
        await topic.save();
        return { result: messageDeleteResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  pinMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (
        message.userId.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        const parentTopic = await Topic.findById(message.parentTopic);
        parentTopic.pinnedMessages.push(message);
        message.isPinned = true;
        await parentTopic.save();
        await message.save();
        return { result: pinMessageResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  unpinMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (
        message.userId.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        const parentTopic = await Topic.findById(message.parentTopic);
        parentTopic.pinnedMessages = parentTopic.pinnedMessages.filter(
          (messageId) => messageId.toString() != message._id
        );
        message.isPinned = false;
        await parentTopic.save();
        await message.save();
        return { result: unpinMessageResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  announceMessage: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (req.currentUser.isModerator) {
        const parentTopic = await Topic.findById(message.parentTopic);
        parentTopic.announcements.push(message);
        message.isAnnounced = true;
        await parentTopic.save();
        await message.save();
        return { result: messageAnnouncementResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  removeAnnouncement: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (req.currentUser.isModerator) {
        const parentTopic = await Topic.findById(message.parentTopic);
        parentTopic.announcements = parentTopic.announcements.filter(
          (messageId) => messageId.toString() != message._id
        );
        message.isAnnounced = false;
        await parentTopic.save();
        await message.save();
        return { result: removeAnnouncementResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
