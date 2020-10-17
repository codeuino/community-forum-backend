require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const { 
  organizationCreatedResult, 
  madeAdminResult, 
  madeModeratorResult, 
  removeAdminResult, 
  removeModeratorResult } = require("../variables/resultMessages");
const { authenticationError, 
  adminAccessError, 
  noUserError, 
  organizationExistError, 
  firstAdminDemoteError, 
  noAdminError, 
  noModeratorError } = require("../variables/errorMessages");

module.exports = {
  createOrganization: async (args) => {
    try {
      const organizations = await Organization.find({}).lean();
      if (organizations.length === 0) {
        const organization = new Organization({
          name: args.organizationInput.name,
          description: args.organizationInput.description,
          contactInfo: args.organizationInput.contactInfo,
        });
        await organization.save();
        return { result: organizationCreatedResult };
      } else {
        throw new Error(organizationExistError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getOrganization: async () => {
    try {
      const organization = await Organization.findOne().lean();
      return organization;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateOrganization: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const organizations = await Organization.find({}).lean();
      if (req.currentUser.isAdmin && organizations.length !== 0) {
        let organization = await Organization.updateOne(
          {},
          {
            $set: {
              name: args.organizationInput.name,
              description: args.organizationInput.description,
              contactInfo: args.organizationInput.contactInfo,
            },
          }
        );
        organization = await Organization.findOne({}).lean();
        return organization;
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  makeAdmin: async (args, req) => {
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
        user.isAdmin = true;
        user.isModerator = true;
        await user.save();
        const organization = await Organization.findOne({});
        organization.adminIds.push(user);
        await organization.save();
        return { result: madeAdminResult };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  makeModerator: async (args, req) => {
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
        user.isModerator = true;
        await user.save();
        const organization = await Organization.findOne({});
        organization.moderatorIds.push(user);
        await organization.save();
        return {
          result: madeModeratorResult,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  removeAdmin: async (args, req) => {
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
          throw new Error(firstAdminDemoteError);
        }
        if(!user.isAdmin) {
          throw new Error(noAdminError);
        }
        user.isAdmin = false;
        user.isModerator = false;
        await user.save();
        const organization = await Organization.findOne({});
        organization.adminIds = organization.adminIds.filter(
          (adminId) => adminId.toString() !== user.id
        );
        await organization.save();
        return { result: removeAdminResult };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  removeModerator: async (args, req) => {
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
        if (!user.isModerator) {
          throw new Error(noModeratorError);
        }
        user.isModerator = false;
        await user.save();
        const organization = await Organization.findOne({});
        organization.moderatorIds = organization.moderatorIds.filter(
          (moderatorId) => moderatorId.toString() !== user.id
        );
        await organization.save();
        return {
          result: removeModeratorResult,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getAdminModerators: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        const organization = await Organization.findOne({})
          .populate("adminIds", "_id name email isFirstAdmin")
          .populate("moderatorIds", "_id name email isFirstAdmin");
        return {
          admins: organization.adminIds,
          moderators: organization.moderatorIds,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
