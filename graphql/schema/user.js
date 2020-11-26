module.exports = `
type userName {
  firstName: String!
  lastName: String!
}

type userSocialMedia {
  twitter: String
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
  _id: String
  name: userName
  email: String
  phone: String
  socialMedia: userSocialMedia
  info: userInfo
  isFirstAdmin: Boolean
  isAdmin: Boolean
  isModerator: Boolean
  isBlocked: Boolean
  isRemoved: Boolean!
  categoriesCreated: [category!]
  topicsCreated: [topic!]
}

input userNameInput {
  firstName: String!
  lastName: String!
}

input userSocialMediaInput {
  twitter: String
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
  email: String
  password: String
  phone: String!
  socialMedia: userSocialMediaInput
  info: userInfoInput!
}

input userFindInput {
  _id: String
  email: String
}

type authData {
  _id: String!
  name: userName!
  email: String!
  phone: String!
  socialMedia: userSocialMedia
  info: userInfo!
  isFirstAdmin: Boolean!
  isAdmin: Boolean!
  isModerator: Boolean!
  isBlocked: Boolean!
  isRemoved: Boolean!
  token: String!
}
`;