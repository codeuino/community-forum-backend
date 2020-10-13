require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const {
  authenticationError,
  userExistError,
  noOrganizationError,
  adminAccessError,
  firstAdminBlockError,
  firstAdminRemoveError,
  noUserError,
} = require("./errorMessages");
const {
  userBlockResult,
  userRemoveResult,
} = require("./resultMessages");

module.exports = {
  users: async (req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        const users = await User.find(
          { isRemoved: false },
          "name email info isAdmin isModerator isActivated"
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
    try {
      const existingUser = await User.findOne({
        email: args.userInput.email,
      }).lean();
      if (existingUser) {
        throw new Error(userExistError);
      }
      let user, organization;
      const users = await User.find({}).lean();
      const organizations = await Organization.find({}).lean();
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
          organization.adminInfo.adminIds.push(user);
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
      const saveUser = await user.save();
      organization.totalUsers += 1;
      await organization.save();
      return { ...saveUser._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateUser: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const user = await User.updateOne(
        { id: req.currentUser.id },
        {
          $set: {
            name: {
              firstName: args.userInput.firstName,
              lastName: args.userInput.lastName,
            },
            email: args.userInput.email,
            password: args.userInput.password,
            phone: args.userInput.phone,
            info: args.userInput.info,
          },
        }
      );
      return { ...user._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  blockUser: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
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
        user.isActivated = false;
        await user.save();
        const organization = await Organization.findOne();
        organization.blockedUsers.push(user);
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

  removeUser: async (req, args) => {
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
        organization.totalUser -= 1;
        if (user.isAdmin) {
          organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
            (adminId) => adminId.toString() !== user.id
          );
        }
        if (user.isModerator) {
          organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
            (moderatorId) => moderatorId.toString() !== user.id
          );
        }
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
          user.isRemoved = true;
          await user.save();
          organization.totalUser -= 1;
          if (user.isAdmin) {
            organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
              (adminId) => adminId.toString() !== user.id
            );
          }
          if (user.isModerator) {
            organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
              (moderatorId) => moderatorId.toString() !== user.id
            );
          }
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

  getSelfCategories: async (req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const user = (await User.findById(req.currentUser.id)).populate(
        "categoriesCreated"
      );
      return user.categoriesCreated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getSelfTopics: async (req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const user = (await User.findById(req.currentUser.id)).populate(
        "topicsCreated"
      );
      return user.topicsCreated;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  //forgot password resolver to be added
};
