const topicResolver = require("./topic");
const categoryResolver = require("./category");
const authResolver = require("./auth");
const messageResolver = require("./message");
const userResolver = require("./user");
const organizationResolver = require("./organization");

const rootResolver = {
  ...messageResolver,
  ...topicResolver,
  ...categoryResolver,
  ...organizationResolver,
  ...userResolver,
  ...authResolver,
};

module.exports = rootResolver;
