const topicResolver = require('./topic');
const categoryResolver = require('./category');

const rootResolver = {
  ...topicResolver,
  ...categoryResolver
}

module.exports = rootResolver;