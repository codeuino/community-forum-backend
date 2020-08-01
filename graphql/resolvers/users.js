const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

module.exports = {
  users: async (args,req) => {
    if (!req.isAuth) {
      throw new Error("Not Authenticated!");
    }
    try {
      let users = await User.find();
      return users.map((topic) => {
        return { ...topic._doc };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
