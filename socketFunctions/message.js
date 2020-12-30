const jwt = require("jsonwebtoken");
const Topic = require("../models/topic");
const User = require("../models/user");
const Message = require("../models/message");
const {
  authenticationError,
  noAuthorizationError,
  topicArchivedError,
} = require("../graphql/variables/errorMessages");

module.exports = {
  createMessage: async (messageData, callbackFunction) => {
    if (!messageData.token) {
      callbackFunction({
        message: authenticationError,
        error: {
          message: authenticationError,
        },
      });
      return;
    }
    let decodedToken, message;
    try {
      decodedToken = jwt.verify(messageData.token, process.env.JWT_SECRET);
    } catch (err) {
      callbackFunction({
        error: {
          message: err,
        },
      });
      return;
    }
    let user = await User.findById(decodedToken._id);
    if (!user) {
      callbackFunction({
        error: {
          message: authenticationError,
        },
      });
      return;
    }
    if (user.isBlocked || user.isRemoved) {
      callbackFunction({
        error: {
          message: noAuthorizationError,
        },
      });
      return;
    }
    try {
      const topic = await Topic.findById(messageData.parentTopic);
      if (topic.isArchived === false && topic.isSelfArchived === false) {
        if (messageData.replyTo !== null) {
          message = new Message({
            userId: user._id,
            description: messageData.description,
            replyTo: messageData.replyTo,
            parentTopic: messageData.parentTopic,
          });
        } else {
          message = new Message({
            userId: user._id,
            description: messageData.description,
            parentTopic: messageData.parentTopic,
          });
        }
        const saveMessage = await message.save();
        topic.chats.push(message);
        await topic.save();
        return {
          message: saveMessage,
          userName: user.name,
        };
      } else {
        callbackFunction({
          error: {
            message: topicArchivedError,
          },
        });
        return;
      }
    } catch (err) {
      callbackFunction({
        error: {
          message: err,
        },
      });
      return;
    }
  }
};
