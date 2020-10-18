const authResolver = require("./auth");
const userResolver = require("./user");
const organizationResolver = require("./organization");

const rootResolver = {
  ...organizationResolver,
  ...userResolver,
  ...authResolver,
};

module.exports = rootResolver;
