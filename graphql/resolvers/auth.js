const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exist already.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
        username: args.userInput.username,
      });
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (err) {
      throw err;
    }
  },
  login: async (args) => {
    const user = await User.findOne({ email: args.email });
    if (!user) {
      throw new Error("User not found");
    }
    const isequal = await bcrypt.compare(args.password, user.password);
    if (!isequal) {
      throw new Error("Password is Incorrect");
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username
      },
      "somesupersecretkey",
      {
        expiresIn: "1h",
      }
    );
    return { userId: user.id, token: token, tokenexpiration: 1, username:user.username};
  },
};
