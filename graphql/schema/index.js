const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type userName {
  firstName: String!
  lastName: String!
}

type userSocialMedia {
  youtube: String
  facebook: String
  twitter: String
  github: String
  linkedin: String
}

type userInfo {
  about: userAbout!
  avatarUrl: String
}

type userAbout {
  shortDescription: String!
  designation: String
}

type user {
  _id: String!
  name: userName
  email: String!
  phone: String
  socialMedia: userSocialMedia
  info: userInfo!
  isFirstAdmin: Boolean!
  isAdmin: Boolean!
  isModerator: Boolean!
  isActivated: Boolean!
  isRemoved: Boolean!
}

input userNameInput {
  firstName: String!
  lastName: String!
}

input userSocialMediaInput {
  youtube: String
  facebook: String
  twitter: String
  github: String
  linkedin: String
}

input userInfoInput {
  about: userAboutInput!
  avatarUrl: String
}

input userAboutInput {
  shortDescription: String!
  designation: String
}

input userInput {
  name: userNameInput!
  email: String!
  password: String!
  phone: String
  socialMedia: userSocialMediaInput
  info: userInfoInput!
}

input userFindInput {
  _id: String
  email: String
}

type organizationDescription {
  shortDescription: String!
  longDescription: String
}

type organizationInfo {
  email: String!
  website: String!
}

type organization {
  _id: String!
  name: String!
  description: organizationDescription!
  contactInfo: organizationInfo!
  isArchived: Boolean!
  isUnderMaintenance: Boolean!
  totalUsers: Int!
}

input organizationDescriptionInput {
  shortDescription: String!
  longDescription: String
}

input organizationInfoInput {
  email: String!
  website: String!
}

input organizationInput {
  name: String!
  description: organizationDescriptionInput!
  contactInfo: organizationInfoInput!
}

type category {
  name: String!
  description: String!
  createdBy: String!
  topics: [String!]!
  isArchived: Boolean
}

input categoryInput {
  name: String!
  description: String!
}

input categoryFindInput {
  _id: String!
}

type topic {
  name: String!
  description: String!
  createdBy: String!
  parentCategory: String!
  tags: [String!]!
  chats: [String!]!
  isArchived: Boolean
}

input topicInput {
  name: String!
  description: String!
  parentCategory: String!
  tags: [String!]
}

input topicFindInput {
  _id: String!
}

type chatUser {
  name: userName!
  info: userInfo!
}

type message {
  userId: String!
  user: chatUser
  replyTo: String
  description: String!
  likes: Boolean!
  isPinned: Boolean!
  isTasked: Boolean!
  isAnnounced: Boolean!
}

type adminModeratorsData {
  admins: [user!]!
  moderators: [user!]!
}

type authData {
  _id: String!,
  name: String!
  token: String!
  tokenexpiration: Int!
}

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
