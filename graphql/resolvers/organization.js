require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const Category = require("../../models/category");
const Topic = require("../../models/topic");

const { 
  organizationCreatedResult, 
  madeAdminResult, 
  madeModeratorResult, 
  removeAdminResult, 
  removeModeratorResult } = require("../variables/resultMessages");
const {
  noAuthorizationError,
  authenticationError, 
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
      if (organization == null) {
        return {
          exists: false,
        };
      }
      return {
        ...organization,
        exists: true,
      };
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
      let organization = await Organization.findOne({});
      if (req.currentUser.isAdmin && organization) {
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        organization.name = args.organizationInput.name;
        organization.description = args.organizationInput.description;
        organization.contactInfo = args.organizationInput.contactInfo;
        await organization.save();
        organization = await Organization.findOne().lean();
        return {
          ...organization,
          exists: true,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  toggleMaintenanceMode: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      let organization = await Organization.findOne({});
      if (req.currentUser.isAdmin && organization) {
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        organization.isUnderMaintenance = !organization.isUnderMaintenance;
        await organization.save();
        organization = await Organization.findOne().lean();
        return {
          ...organization,
          exists: true,
        };
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
        const organization = await Organization.findOne({});
        if (user.isModerator) {
          organization.moderatorIds = organization.moderatorIds.filter(
            (moderatorId) => moderatorId.toString() != user.id
          );
        }
        user.isAdmin = true;
        user.isModerator = true;
        await user.save();
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
        const organization = await Organization.findOne({});
        if (user.isAdmin) {
          organization.adminIds = organization.adminIds.filter(
            (adminId) => adminId.toString() != user.id
          );
        }
        user.isAdmin = false;
        user.isModerator = true;
        await user.save();
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
          throw new Error(firstAdminDemoteError);
        }
        if (!user.isAdmin) {
          throw new Error(noAdminError);
        }
        user.isAdmin = false;
        user.isModerator = false;
        await user.save();
        const organization = await Organization.findOne({});
        organization.adminIds = organization.adminIds.filter(
          (adminId) => adminId.toString() != user.id
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
        if (!user.isModerator) {
          throw new Error(noModeratorError);
        }
        user.isAdmin = false;
        user.isModerator = false;
        await user.save();
        const organization = await Organization.findOne({});
        organization.moderatorIds = organization.moderatorIds.filter(
          (moderatorId) => moderatorId.toString() != user.id
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
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        const organization = await Organization.findOne({})
          .populate({
            path: "adminIds",
            options: { sort: { createdAt: -1 } },
          })
          .populate({
            path: "moderatorIds",
            options: { sort: { createdAt: -1 } },
          });
        let admins = organization.adminIds.filter(admin => !admin.isBlocked);
        let moderators = organization.moderatorIds.filter(
          moderator => !moderator.isAdmin && !moderator.isBlocked
        );
        return {
          admins,
          moderators,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getOrganizationData: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
          throw new Error(noAuthorizationError);
        }
        const categories = await Category.estimatedDocumentCount();
        const topics = await Topic.estimatedDocumentCount();
        return {
          categories,
          topics,
        };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
