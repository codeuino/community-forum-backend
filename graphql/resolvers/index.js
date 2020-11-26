const authResolver = require("./auth");
const userResolver = require("./user");
const organizationResolver = require("./organization");
const categoryResolver = require("./category");
const tagResolver = require("./tag");
const topicResolver = require("./topic");
const messageResolver = require("./message");
const taskResolver = require("./task");
const { GraphQLDateTime } = require("graphql-iso-date");

const rootResolver = {
  Date: GraphQLDateTime,
  ...tagResolver,
  ...messageResolver,
  ...topicResolver,
  ...categoryResolver,
  ...organizationResolver,
  ...userResolver,
  ...authResolver,
  ...taskResolver,
};

module.exports = rootResolver;
