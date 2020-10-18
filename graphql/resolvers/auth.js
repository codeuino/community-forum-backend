const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../../models/user");

module.exports = {
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
          id: user.id,
        },
        `${process.env.JWT_SECRET}`,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        }
      );
      return {
        id: user.id,
        name: user.name,
        token: token,
        tokenexpiration: 1,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
