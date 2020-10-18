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
  getOrganization: organization!
  getAdminModerators: adminModeratorsData!
  login(email: String!, password: String!): authData!
}

type RootMutation {
  createUser(userInput: userInput): user
  updateUser(userInput: userInput): user
  blockUser(userFindInput: userFindInput): resultData
  removeUser(userFindInput: userFindInput): resultData
  createOrganization(organizationInput: organizationInput): resultData
  updateOrganization(organizationInput: organizationInput): organization
  makeAdmin(userFindInput: userFindInput): resultData
  makeModerator(userFindInput: userFindInput): resultData
  removeAdmin(userFindInput: userFindInput): resultData
  removeModerator(userFindInput: userFindInput): resultData
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
