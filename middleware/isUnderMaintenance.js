const Organization = require("../models/organization");

module.exports = async (req, res, next) => {
  const organization = await Organization.findOne({}).lean();
  if (organization && organization.isUnderMaintenance) {
    if (req.headers["access-level"] == -1 || (req.currentUser && req.currentUser.isAdmin)) {
      return next();
    } else {
      return res.status(500).json({
        errors: [
          {
            message: "We are currently under maintenance. Please refresh to continue.",
          },
        ],
        data: null,
      });
    }
  }
  next();
}
