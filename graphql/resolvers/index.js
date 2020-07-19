const topicResolver = require("./topic");
const categoryResolver = require("./category");
const authResolver = require("./auth");
const taskResolver = require("./tasks");

const rootResolver = {
  ...topicResolver,
  ...categoryResolver,
  ...authResolver,
  ...taskResolver,
};

module.exports = rootResolver;
