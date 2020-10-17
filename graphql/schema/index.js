const { buildSchema } = require("graphql");
const userSchema = require("./user");
const organizationSchema = require("./organization");
const categorySchema = require("./category");
const topicSchema = require("./topic");
const messageSchema = require("./message");

module.exports = buildSchema(`
${userSchema}
${organizationSchema}
${categorySchema}
${topicSchema}
${messageSchema}

type resultData {
  result: String!,
}

type RootQuery {
  users: [user!]!
  login(email: String!, password: String!): authData!
  getSelfCategories: [category!]!
  getSelfTopics: [topic!]!
  getOrganization: organization!
  getAdminModerators: adminModeratorsData!
  categories: [category!]!
  getCategoryTopics(categoryFindInput: categoryFindInput!): [topic!]!
  topics: [topic!]!
  getChats(topicFindInput: topicFindInput!): [message!]!
}

type RootMutation {
  createUser(userInput: userInput!): user!
  updateUser(userInput: userInput!): user!
  blockUser(userFindInput: userFindInput!): resultData!
  removeUser(userFindInput: userFindInput!): resultData!
  createOrganization(organizationInput: organizationInput!): resultData!
  updateOrganization(organizationInput: organizationInput!): organization!
  makeAdmin(userFindInput: userFindInput!): resultData!
  makeModerator(userFindInput: userFindInput!): resultData!
  removeAdmin(userFindInput: userFindInput!): resultData!
  removeModerator(userFindInput: userFindInput!): resultData!
  createCategory(categoryInput: categoryInput!): category!
  archiveCategory(categoryFindInput: categoryFindInput!): resultData!
  updateCategory(categoryFindInput: categoryFindInput!): category!
  deleteCategory(categoryFindInput: categoryFindInput!): resultData!
  createTopic(topicInput: topicInput!): topic!
  archiveTopic(topicFindInput: topicFindInput!): resultData!
  updateTopic(topicFindInput: topicFindInput!): topic!
  deleteTopic(topicFindInput: topicFindInput!): resultData!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
