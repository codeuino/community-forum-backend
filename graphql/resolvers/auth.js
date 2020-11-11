const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../models/user");
const {
  passwordError,
  noUserError,
} = require("../variables/errorMessages");

module.exports = {
  login: async (args) => {
    try {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new Error(noUserError);
      }
      const isequal = await bcrypt.compare(args.password, user.password);
      if (!isequal) {
        throw new Error(passwordError);
      }
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
        },
        `${process.env.JWT_SECRET}`,
        {
          algorithm: "HS256",
          expiresIn: "30d",
        }
      );
      return {
        _id: user._id,
        name: user.name,
        token: token,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
