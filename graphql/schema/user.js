module.exports = `
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
  isBlocked: Boolean!
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
  email: String
  password: String
  phone: String
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
  token: String!
}
`;