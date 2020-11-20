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
} = require("../variables/errorMessages");
const {
  userBlockResult,
  userRemoveResult,
} = require("../variables/resultMessages");
const { login } = require("./auth");

module.exports = {
  users: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        const users = await User.find(
          { isRemoved: false },
          "name email info isFirstAdmin isAdmin isModerator isBlocked isRemoved"
        );
        return users;
      } else {
        throw new Error(adminAccessError);
      }
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
      let existingUser = await User.findOne({
        email: args.userInput.email,
      });
      let user, organization;
      const users = await User.find({}).lean();
      const organizations = await Organization.find({}).lean();
      if (existingUser) {
        if(existingUser.isBlocked) {
          throw new Error(userBlockedError);
        }
        if (existingUser.isRemoved) {
          existingUser.name = args.userInput.name;
          existingUser.password = args.userInput.password,
          existingUser.phone = args.userInput.phone;
          existingUser.info = args.userInput.info;
          existingUser.info.about.designation = "";
          existingUser.info.about.avatarUrl = "";
          existingUser.socialMedia = null;
          existingUser.isAdmin = false;
          existingUser.isModerator = false;
          existingUser.isRemoved = false;
          existingUser = await existingUser.save();
        }
      } else {
        if (users.length === 0) {
          if (organizations.length === 0) {
            throw new Error(noOrganizationError);
          } else {
            organization = await Organization.findOne();
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
          organization = await Organization.findOne();
          user = new User({
            name: args.userInput.name,
            email: args.userInput.email,
            password: args.userInput.password,
            phone: args.userInput.phone,
            info: args.userInput.info,
          });
        }
        const saveUser = await user.save();
        organization.totalUsers += 1;
        await organization.save();
      }
      const loginResponse = await login({
        email: args.userInput.email,
        password: args.userInput.password
      });
      return loginResponse;
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
        if (!user) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminBlockError);
        }
        user.isBlocked = true;
        await user.save();
        const organization = await Organization.findOne();
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

  removeUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      let user;
      const organization = await Organization.findOne();
      if (!args.userFindInput.email && !args.userFindInput._id) {
        user = await User.findById(req.currentUser.id);
        if (!user) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminRemoveError);
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
        if (!user) {
          throw new Error(noUserError);
        }
        if (user.isFirstAdmin) {
          throw new Error(firstAdminRemoveError);
        }
        if (req.currentUser.isAdmin) {
          if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
            throw new Error(noAuthorizationError);
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
      const user = await User.findById(
        req.currentUser.id
      ).populate({
        path: "categoriesCreated",
        populate: {path: "createdBy"}
      });
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
      const user = await User.findById(req.currentUser.id).populate({
        path: "topicsCreated",
        populate: { path: "createdBy tags" },
      });
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
      const user = await User.findById(req.currentUser.id).populate(
        "tasksAssigned"
      );
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
      const user = await User.findById(req.currentUser.id).populate(
        "tasksCreated"
      );
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

  //forgot password resolver to be added
};
