const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../models/user");
const {
  passwordError,
  noUserError,
  userBlockedError,
  noAuthorizationError,
} = require("../variables/errorMessages");

module.exports = {
  login: async (args) => {
    try {
      const user = await User.findOne({ email: args.email }).lean();
      if (!user || user.isRemoved) {
        throw new Error(noUserError);
      }
      if(user.isBlocked) {
        throw new Error(userBlockedError);
      }
      const isequal = await bcrypt.compare(args.password, user.password);
      if (!isequal) {
        throw new Error(passwordError);
      }
      const token = jwt.sign(
        {
          _id: user._id,
          name: user.name,
        },
        `${process.env.JWT_SECRET}`,
        {
          algorithm: "HS256",
          expiresIn: "30d",
        }
      );
      return {
        ...user,
        token,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getCurrentUser: async (args) => {
    try {
      const user = await User.findById(args._id).lean();
      if (!user || user.isRemoved) {
        throw new Error(noUserError);
      }
      if (user.isBlocked) {
        throw new Error(noAuthorizationError);
      }
      return {
        ...user,
        token: args.token,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
