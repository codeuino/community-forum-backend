const topicResolver = require("./topic");
const categoryResolver = require("./category");
const authResolver = require("./auth");
const taskResolver = require("./tasks");
const usersResolver = require("./users");
const announcementsResolver = require("./announcements");

const rootResolver = {
  ...announcementsResolver,
  ...topicResolver,
  ...categoryResolver,
  ...authResolver,
  ...taskResolver,
  ...usersResolver,
};

module.exports = rootResolver;
