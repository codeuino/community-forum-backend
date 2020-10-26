const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) {
    req.isAuth = false;
    return next();
  }
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  let user = await User.findById(decodedToken.id).lean();
  let result = delete user.password;
  req.currentUser = user;
  req.currentUser.id = user._id;
  delete req.currentUser.password;
  delete req.currentUser._id;
  next();
};
