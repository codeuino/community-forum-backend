const topicResolver = require('./topic');
const categoryResolver = require('./category');
const authResolver = require('./auth')

const rootResolver = {
  ...topicResolver,
  ...categoryResolver,
  ...authResolver
}

module.exports = rootResolver;