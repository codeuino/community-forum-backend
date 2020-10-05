const topicResolver = require("./topic");
const categoryResolver = require("./category");
const authResolver = require("./auth");
const messageResolver = require("./message");

const rootResolver = {
  ...messageResolver,
  ...topicResolver,
  ...categoryResolver,
  ...authResolver,
};

module.exports = rootResolver;
