const Message = require("../../models/message");
const Topic = require("../../models/topic");
const {
  authenticationError,
  blockRemoveUserError,
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const topic = await Topic.findById(args.messageInput.parentTopic).lean();
      if (topic.isArchived == false) {
        let message = new Message({
          userId: req.currentUser.id,
          description: args.messageInput.description,
          replyTo: args.messageInput.replyTo,
          parentTopic: args.messageInput.parentTopic,
        });
        const saveMessage = await message.save();
        const saveTopic = await Topic.findById(args.messageInput.parentTopic);
        saveTopic.chats.push(message);
        await saveTopic.save();
        return { ...saveMessage._doc };
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const message = await Message.findById(args.messageInput._id);
      if (message.userId.toString() == req.currentUser.id) {
        message.description = args.messageInput.description;
        const updateMessage = await message.save();
        return { ...updateMessage._doc };
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
      throw new Error(blockRemoveUserError);
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (
        message.userId.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        message.isPinned = true;
        const updateMessage = await message.save();
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (
        message.userId.toString() == req.currentUser.id ||
        req.currentUser.isModerator
      ) {
        message.isPinned = false;
        const updateMessage = await message.save();
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (req.currentUser.isModerator) {
        message.isAnnounced = true;
        const updateMessage = await message.save();
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
      throw new Error(blockRemoveUserError);
    }
    try {
      const message = await Message.findById(args.messageFindInput._id);
      if (req.currentUser.isModerator) {
        message.isAnnounced = false;
        const updateMessage = await message.save();
        return { result: removeAnnouncementResult };
      }
      throw new Error(noAuthorizationError);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
