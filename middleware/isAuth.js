const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  let user = await User.findById(decodedToken._id).lean();
  if (user) {
    req.isAuth = true;
    req.currentUser = user;
    req.currentUser.id = user._id;
    delete req.currentUser.password;
    delete req.currentUser._id;
  }
  next();
};
