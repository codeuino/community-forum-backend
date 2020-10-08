require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");

module.exports = {
  users: async () => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        const users = await User.find(
          { isRemoved: false },
          "name email info isAdmin isModerator isActivated"
        );
        return users;
      } else {
        throw new Error("Admin authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw Error("User is already registered");
      }
      let user;
      if (User.count() === 0) {
        if (Organization.count() === 0) {
          throw Error("Organization to be created first");
        } else {
          user = new User({
            name: {
              firstName: args.userInput.firstName,
              lastName: args.userInput.lastName,
            },
            email: args.userInput.email,
            password: args.userInput.password,
            phone: args.userInput.phone,
            isFirstAdmin: true,
            isAdmin: true,
            isModerator: true,
            info: {
              about: {
                shortDescription: args.userInput.shortDescription,
                designation: args.userInput.designation,
              },
            },
          });
        }
      } else {
        user = new User({
          name: {
            firstName: args.userInput.firstName,
            lastName: args.userInput.lastName,
          },
          email: args.userInput.email,
          password: args.userInput.password,
          phone: args.userInput.phone,
          info: {
            about: {
              shortDescription: args.userInput.shortDescription,
              designation: args.userInput.designation,
            },
          },
        });
      }
      const saveUser = await user.save();
      const organization = await Organization.findOne();
      organization.totalUser += 1;
      await organization.save();
      return { ...saveUser._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  updateUser: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
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
            info: {
              about: {
                shortDescription: args.userInput.shortDescription,
                designation: args.userInput.designation,
              },
            },
          },
        }
      );
      return { ...user._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  blockUser: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        let user;
        if (args.userFindInput.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput.id) {
          user = await User.findById(args.userFindInput.id);
        }
        if (!user) {
          throw new Error("User not registered");
        }
        if (user.isFirstAdmin) {
          throw new Error("First Admin can't be blocked");
        }
        user.isActivated = false;
        await user.save();
        const organization = await Organization.findOne();
        organization.blockedUsers.push(user);
        await organization.save();
        return { result: "User blocked successfully" };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  removeUser: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      let user;
      const organization = await Organization.findOne();
      if (!args.userFindInput.email && !args.userFindInput.id) {
        user = await User.findById(req.currentUser.id);
        if (!user) {
          throw new Error("User not registered");
        }
        if (user.isFirstAdmin) {
          throw new Error("First Admin can't be removed");
        }
        user.isRemoved = true;
        await user.save();
        organization.totalUser -= 1;
        if (user.isAdmin) {
          organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
            (adminId) => adminId !== user.id
          );
        }
        if (user.isModerator) {
          organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
            (moderatorId) => moderatorId !== user.id
          );
        }
        await organization.save();
        return { result: "User removed successfully" };
      } else {
        if (args.userFindInput.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput.id) {
          user = await User.findById(args.userFindInput.id);
        }
        if (!user) {
          throw new Error("User not registered");
        }
        if (user.isFirstAdmin) {
          throw new Error("First Admin can't be removed");
        }
        if (req.currentUser.isAdmin) {
          user.isRemoved = true;
          await user.save();
          organization.totalUser -= 1;
          if (user.isAdmin) {
            organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
              (adminId) => adminId !== user.id
            );
          }
          if (user.isModerator) {
            organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
              (moderatorId) => moderatorId !== user.id
            );
          }
          await organization.save();
          return { result: "User removed successfully" };
        } else {
          throw new Error("Admin Authorization required");
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getSelfCategories: async () => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
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
  getSelfTopics: async () => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
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
  //forgot password resolver
};
