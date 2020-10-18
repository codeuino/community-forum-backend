require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const { 
  organizationCreatedResult, 
  madeAdminResult, 
  madeModeratorResult, 
  removeAdminResult, 
  removeModeratorResult } = require("./resultMessages");
const { authenticationError, 
  adminAccessError, 
  noUserError, 
  organizationExistError, 
  firstAdminDemoteError, 
  noAdminError, 
  noModeratorError } = require("./errorMessages");

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

  updateOrganization: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      const organizations = await Organization.find({}).lean();
      if (req.currentUser.isAdmin && organizations.length !== 0) {
        const organization = await Organization.updateOne(
          {},
          {
            $set: {
              name: args.organizationInput.name,
              description: args.organizationInput.description,
              contactInfo: args.organizationInput.contactInfo,
            },
          }
        );
        return { ...organization._doc };
      } else {
        throw new Error(adminAccessError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  makeAdmin: async (req, args) => {
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
        await user.save();
        const organization = await Organization.findOne({});
        organization.adminInfo.adminIds.push(user);
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

  makeModerator: async (req, args) => {
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
        organization.moderatorInfo.moderatorIds.push(user);
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

  removeAdmin: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    console.log(args.userFindInput);
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
        console.log(organization.adminInfo.adminIds);
        organization.adminInfo.adminIds = organization.adminInfo.adminIds.filter(
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

  removeModerator: async (req, args) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        let user;
        if (args.email) {
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
        organization.moderatorInfo.moderatorIds = organization.moderatorInfo.moderatorIds.filter(
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

  getAdminModerators: async (req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    try {
      if (req.currentUser.isAdmin) {
        const organization = await Organization.findOne({}).populate();
        return {
          admins: organization.adminInfo.adminIds,
          moderators: organization.moderatorInfo.moderatorIds,
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
