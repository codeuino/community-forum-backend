const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw Error("User is already registered");
      }
      const user = new User({
        email: args.userInput.email,
        password: args.userInput.password,
        username: args.userInput.username,
      });
      const saveUser = await user.save();
      return { ...saveUser._doc };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  login: async (args) => {
    try {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new Error("User not registered");
      }
      const isequal = await bcrypt.compare(args.password, user.password);
      if (!isequal) {
        throw new Error("Incorrect password provided");
      }
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
        },
        `${process.env.JWT_SECRET}`,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        }
      );
      return {
        userId: user.id,
        username: user.username,
        token: token,
        tokenexpiration: 1,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
