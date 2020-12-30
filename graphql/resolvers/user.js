require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const {
  noAuthorizationError,
  authenticationError,
  userBlockedError,
  noOrganizationError,
  adminAccessError,
  firstAdminBlockError,
  firstAdminRemoveError,
  noUserError,
  emailPasswordError,
  alreadyBlockedError,
  alreadyRemovedError,
} = require("../variables/errorMessages");
const {
  userBlockResult,
  userUnblockResult,
  userRemoveResult,
} = require("../variables/resultMessages");
const { login } = require("./auth");

module.exports = {
  users: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const users = await User.find(
        {
          isRemoved: false,
        },
        "name email info isBlocked isAdmin isModerator createdAt"
      )
        .sort([["createdAt", -1]])
        .lean();
      let blockedUsers = [];
      let normalUsers = [];
      for (const user of users) {
        if (user.isBlocked === true) {
          blockedUsers.push(user);
        } else if (user.isAdmin == false && user.isModerator == false) {
          normalUsers.push(user);
        }
      }
      return {
        users: normalUsers,
        blockedUsers,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createUser: async (args) => {
    if (!args.userInput.email || !args.userInput.password) {
      throw new Error(emailPasswordError);
    }
    try {
      let user;
      let existingUser = await User.findOne({
        email: args.userInput.email,
      });
      const organization = await Organization.findOne({});
      if (existingUser) {
        if (existingUser.isBlocked) {
          throw new Error(userBlockedError);
        }
        if (existingUser.isRemoved) {
          existingUser.name = args.userInput.name;
          existingUser.password = args.userInput.password;
          existingUser.phone = args.userInput.phone;
          existingUser.info = args.userInput.info;
          existingUser.info.about.designation = "";
          existingUser.info.about.avatarUrl = "";
          existingUser.socialMedia = null;
          existingUser.isAdmin = false;
          existingUser.isModerator = false;
          existingUser.isRemoved = false;
          existingUser = await existingUser.save();
          organization.removedUsers = organization.removedUsers.filter(
            (userId) => userId.toString() != existingUser.id
          );
        }
      } else {
        const users = await User.find({}).lean();
        if (users.length === 0) {
          if (!organization) {
            throw new Error(noOrganizationError);
          } else {
            user = new User({
              name: args.userInput.name,
              email: args.userInput.email,
              password: args.userInput.password,
              phone: args.userInput.phone,
              isFirstAdmin: true,
              isAdmin: true,
              isModerator: true,
              info: args.userInput.info,
            });
            organization.adminIds.push(user);
          }
        } else {
          user = new User({
            name: args.userInput.name,
            email: args.userInput.email,
            password: args.userInput.password,
            phone: args.userInput.phone,
            info: args.userInput.info,
          });
        }
        await user.save();
      }
      organization.totalUsers += 1;
      await organization.save();
      const loginResponse = await login({
        email: args.userInput.email,
        password: args.userInput.password,
      });
      return loginResponse;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getUserProfile: async (args, req) => {
    try {
      const user = await User.findById(args.userFindInput._id)
        .populate({
          path: "categoriesCreated topicsCreated",
          populate: { path: "tags" },
        })
        .lean();
      if (!user) {
        throw new Error(noUserError);
      }
      if (user.isRemoved) {
        return {
          isRemoved: true,
        };
      }
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
        throw new Error(noAuthorizationError);
      }
      let user = await User.findOne({ _id: req.currentUser.id });
      user.name = args.userInput.name;
      user.phone = args.userInput.phone;
      user.info = args.userInput.info;
      user.socialMedia = args.userInput.socialMedia;
      user = await user.save();
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  blockUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        let user;
        if (args.userFindInput.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput._id) {
          user = await User.findById(args.userFindInput._id);
        }
        if (!user || user.isRemoved) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminBlockError);
        }
        if (user.isBlocked) {
          throw new Error(alreadyBlockedError);
        }
        user.isBlocked = true;
        await user.save();
        const organization = await Organization.findOne({});
        organization.blockedUsers.push(user);
        organization.totalUsers -= 1;
        await organization.save();
        return { result: userBlockResult };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  unblockUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        let user;
        if (args.userFindInput.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput._id) {
          user = await User.findById(args.userFindInput._id);
        }
        if (!user || user.isRemoved) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(noAuthorizationError);
        }
        user.isBlocked = false;
        await user.save();
        const organization = await Organization.findOne();
        organization.blockedUsers = organization.blockedUsers.filter(
          (userId) => userId.toString() != user.id
        );
        organization.totalUsers += 1;
        await organization.save();
        return { result: userUnblockResult };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  removeUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      let user;
      const organization = await Organization.findOne();
      if (!args.userFindInput.email && !args.userFindInput._id) {
        user = await User.findById(req.currentUser.id);
        if (!user || user.isRemoved) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminRemoveError);
        }
        if (user.isRemoved) {
          throw new Error(alreadyRemovedError);
        }
        user.isRemoved = true;
        await user.save();
        organization.totalUsers -= 1;
        if (user.isAdmin) {
          organization.adminIds = organization.adminIds.filter(
            (adminId) => adminId.toString() != user.id
          );
        }
        if (user.isModerator) {
          organization.moderatorIds = organization.moderatorIds.filter(
            (moderatorId) => moderatorId.toString() != user.id
          );
        }
        organization.removedUsers.push(user);
        await organization.save();
        return { result: userRemoveResult };
      } else {
        if (args.userFindInput.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput._id) {
          user = await User.findById(args.userFindInput._id);
        }
        if (!user || user.isRemoved) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminRemoveError);
        }
        if (user.isRemoved) {
          throw new Error(alreadyRemovedError);
        }
        if (req.currentUser.isAdmin) {
          if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
            throw new Error(noAuthorizationError);
          }
          user.isRemoved = true;
          await user.save();
          if (!user.isBlocked) {
            organization.totalUsers -= 1;
          }
          if (user.isAdmin) {
            organization.adminIds = organization.adminIds.filter(
              (adminId) => adminId.toString() != user.id
            );
          }
          if (user.isModerator) {
            organization.moderatorIds = organization.moderatorIds.filter(
              (moderatorId) => moderatorId.toString() != user.id
            );
          }
          organization.removedUsers.push(user);
          await organization.save();
          return { result: userRemoveResult };
        } else {
          throw new Error(adminAccessError);
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getSelfCategories: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
        throw new Error(noAuthorizationError);
      }
      const user = await User.findById(req.currentUser.id)
        .populate({
          path: "categoriesCreated",
          populate: { path: "createdBy" },
        })
        .lean();
      return user.categoriesCreated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getSelfTopics: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
        throw new Error(noAuthorizationError);
      }
      const user = await User.findById(req.currentUser.id)
        .populate({
          path: "topicsCreated",
          populate: { path: "createdBy tags" },
        })
        .lean();
      return user.topicsCreated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getAssignedTasks: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
        throw new Error(noAuthorizationError);
      }
      const user = await User.findById(req.currentUser.id)
        .populate("tasksAssigned")
        .lean();
      user.tasksAssigned = user.tasksAssigned.filter((task) => {
        return !task.isCompleted;
      });
      user.tasksAssigned = user.tasksAssigned.map(async (task) => {
        if (task.attachedMessage != undefined) {
          const message = await Message.findById(task.attachedMessage);
          task.description = message.description;
          task.parentTopic = message.parentTopic;
        }
        return task;
      });
      return user.tasksAssigned;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getCreatedTasks: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
        throw new Error(noAuthorizationError);
      }
      const user = await User.findById(req.currentUser.id)
        .populate("tasksCreated")
        .lean();
      user.tasksCreated = user.tasksCreated.filter((task) => {
        return !task.isCompleted;
      });
      user.tasksCreated = user.tasksCreated.map(async (task) => {
        if (task.attachedMessage != undefined) {
          const message = await Message.findById(task.attachedMessage);
          task.description = message.description;
          task.parentTopic = message.parentTopic;
        }
        return task;
      });
      return user.tasksCreated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  //TBD: Forgot password functionality
};
