const { buildSchema } = require("graphql");
const userSchema = require("./user");
const organizationSchema = require("./organization");
const categorySchema = require("./category");
const topicSchema = require("./topic");
const messageSchema = require("./message");
const taskSchema = require("./task");
const tagSchema = require("./tag");


module.exports = buildSchema(`
scalar Date
${userSchema}
${organizationSchema}
${tagSchema}
${categorySchema}
${topicSchema}
${messageSchema}
${taskSchema}

type resultData {
  result: String!,
}

type RootQuery {
  users: usersData!
  login(email: String!, password: String!): authData!
  getCurrentUser(_id: String!, token: String!): authData!
  getUserProfile(userFindInput: userFindInput!): user!
  getSelfCategories: [category!]!
  getSelfTopics: [topic!]!
  getAssignedTasks: [task!]!
  getCreatedTasks: [task!]!
  getOrganization: organization!
  getAdminModerators: adminModeratorsData!
  getOrganizationData: organizationData!
  categories: [category!]!
  getCategory(categoryFindInput: categoryFindInput!): category!
  getCategoryTopics(categoryFindInput: categoryFindInput!): [topic!]!
  topics: [topic!]!
  getTopic(topicFindInput: topicFindInput!): topicDetails!
  getTopicChats(topicFindInput: topicFindInput!): [message!]!
  getTask(taskFindInput: taskFindInput!): task!
  getTopicTasks(topicFindInput: topicFindInput!): [task!]!
  getTagTopics(tagFindInput: tagFindInput!): tag!
}

type RootMutation {
  createUser(userInput: userInput!): authData!
  updateUser(userInput: userInput!): user!
  blockUser(userFindInput: userFindInput!): resultData!
  unblockUser(userFindInput: userFindInput!): resultData!
  removeUser(userFindInput: userFindInput!): resultData!
  createOrganization(organizationInput: organizationInput!): resultData!
  updateOrganization(organizationInput: organizationInput!): organization!
  toggleMaintenanceMode: organization!
  makeAdmin(userFindInput: userFindInput!): resultData!
  makeModerator(userFindInput: userFindInput!): resultData!
  removeAdmin(userFindInput: userFindInput!): resultData!
  removeModerator(userFindInput: userFindInput!): resultData!
  createCategory(categoryInput: categoryInput!): category!
  archiveCategory(categoryFindInput: categoryFindInput!): resultData!
  unarchiveCategory(categoryFindInput: categoryFindInput!): resultData!
  updateCategory(categoryInput: categoryInput!): category!
  deleteCategory(categoryFindInput: categoryFindInput!): resultData!
  createTopic(topicInput: topicInput!): topic!
  archiveTopic(topicFindInput: topicFindInput!): resultData!
  unarchiveTopic(topicFindInput: topicFindInput!): resultData!
  updateTopic(topicInput: topicInput!): topic!
  deleteTopic(topicFindInput: topicFindInput!): resultData!
  createMessage(messageInput: messageInput!): message!
  updateMessage(messageInput: messageInput!): message!
  deleteMessage(messageFindInput: messageFindInput!): resultData!
  pinMessage(messageFindInput: messageFindInput!): resultData!
  unpinMessage(messageFindInput: messageFindInput!): resultData!
  announceMessage(messageFindInput: messageFindInput!): resultData!
  removeAnnouncement(messageFindInput: messageFindInput!): resultData!
  createTask(taskInput: taskInput!): task!
  updateTask(taskInput: taskInput!): task!
  deleteTask(taskFindInput: taskFindInput!): resultData!
  completeTask(taskFindInput: taskFindInput!): resultData!
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
