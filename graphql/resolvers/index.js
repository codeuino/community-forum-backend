const authResolver = require("./auth");
const userResolver = require("./user");
const organizationResolver = require("./organization");
const categoryResolver = require("./category");
const topicResolver = require("./topic");

const rootResolver = {
  ...topicResolver,
  ...categoryResolver,
  ...organizationResolver,
  ...userResolver,
  ...authResolver,
};

module.exports = rootResolver;
