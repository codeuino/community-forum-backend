require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");

module.exports = {
  createOrganization: async (args) => {
    try {
      if (Organization.count() === 0) {
        const organization = new Organization({
          name: args.organizationInput.name,
          description: {
            shortDescription: args.organizationInput.shortDescription,
            longDescription: args.organizationInput.longDescription,
          },
          contactInfo: {
            email: args.organizationInput.email,
            website: args.organizationInput.website,
          },
        });
        await organization.save();
        return { result: "Organization created successfully" };
      } else {
        throw new Error("Organization can be created only once");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getOrganization: async () => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        const organization = await Organization.findOne();
        return organization;
      } else {
        throw new Error("Admin authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  updateOrganization: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        const organization = await Organization.updateOne(
          {},
          {
            $set: {
              name: args.organizationInput.name,
              description: {
                shortDescription: args.organizationInput.shortDescription,
                longDescription: args.organizationInput.longDescription,
              },
              contactInfo: {
                email: args.organizationInput.email,
                website: args.organizationInput.website,
              },
            },
          }
        );
        return { ...organization._doc };
      } else {
        throw new Error("Admin authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  makeAdmin: async (args) => {
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
        user.isAdmin = true;
        await user.save();
        const organization = await Organization.findOne();
        organization.adminInfo.adminIds.push(user);
        await organization.save();
        return { result: "User promoted to Admin authorization successfully" };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  makeModerator: async (args) => {
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
        user.isModerator = true;
        await user.save();
        const organization = await Organization.findOne();
        organization.moderatorInfo.moderatorIds.push(user);
        await organization.save();
        return {
          result: "User promoted to Moderator authorization successfully",
        };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  removeAdmin: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        let user;
        if (args.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput.id) {
          user = await User.findById(args.userFindInput.id);
        }
        if (!user) {
          throw new Error("User not registered");
        }
        if (user.isFirstAdmin) {
          throw new Error("First Admin can't be demoted");
        }
        user.isAdmin = false;
        await user.save();
        const organization = await Organization.findOne();
        organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
          (adminId) => adminId !== user.id
        );
        await organization.save();
        return { result: "Admin demoted to User authorization successfully" };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  removeModerator: async (args) => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        let user;
        if (args.email) {
          user = await User.findOne({ email: args.userFindInput.email });
        } else if (args.userFindInput.id) {
          user = await User.findById(args.userFindInput.id);
        }
        if (!user) {
          throw new Error("User not registered");
        }
        user.isModerator = false;
        await user.save();
        const organization = await Organization.findOne();
        organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
          (moderatorId) => moderatorId !== user.id
        );
        await organization.save();
        return {
          result: "Moderator demoted to User authorization successfully",
        };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getAdminModerators: async () => {
    if (!req.isAuth) {
      throw new Error("Authentication required");
    }
    try {
      if (req.currentUser.isAdmin) {
        const organization = await (await Organization.findOne()).populate();
        return {
          admins: organization.adminInfo.adminIds,
          moderators: organization.moderatorInfo.moderatorIds,
        };
      } else {
        throw new Error("Admin Authorization required");
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
