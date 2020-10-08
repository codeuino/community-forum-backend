const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type user {
  _id: String!
  name: {
    firstName: String!
    lastName: String!
  }
  email: String!
  phone: String
  socialMedia: {
    youtube: String
    facebook: String
    twitter: String
    github: String
    linkedin: String
  }
  info: {
    about: {
      shortDescription: String!
      designation: String
    }
    avatarUrl: String
  }
  isFirstAdmin: Boolean
  isAdmin: Boolean
  isModerator: Boolean
  isActivated: Boolean
  isRemoved: Boolean
}

input UserInput {
  name: {
    firstName: String!
    lastName:  String!
  }
  email: String!
  password: String!
  phone: String
  socialMedia: {
    youtube: String
    facebook: String
    twitter: String
    github: String
    linkedin: String
  }
  info: {
    about: {
      shortDescription: String!
      designation: String
    }
    avatarUrl: String
  }
}

input UserFindInput {
  _id: String
  email: String
}

type organization {
  _id: String!
  name: String!
  description: {
    shortDescription: String!
    longDescription: String
  }
  contactInfo: {
    email: String!
    website: String!
  }
  isArchived: Boolean!
  isUnderMaintenance: Boolean!
  totalUsers: Int!
}

input OrganizationInput {
  name: String!
  description: {
    shortDescription: String!
    longDescription: String
  }
  contactInfo: {
    email: String!
    website: String!
  }
}

type AdminModeratorsData {
  admins: [user!]!
  moderators: [user!]!
}

type category {
  _id: String!
  categoryName: String!
  topicIds: [String!]!
}

input CategoryInput {
  categoryName: String!
}

type message {
  _id: String!
  userId: String!
  replyTo: String
  description: String!
  likes: Int!
}

type topic {
  _id: String!
  topicName: String!
  topicDescription: String
  topicTags: [String!]!
  chats: [message!]!
}

input messageInput {
  userId: String!
  replyTo: String
  description: String!
  likes: Int
}

input TopicInput {
  topicName: String!
  topicDescription: String!
  topicTags: [String!]
  categoryId: String!
  chats: [messageInput!]
}

type AuthData {
  userId: String!,
  username: String!
  token: String!,
  tokenexpiration: Int!,
}

type Result {
  result: String!,
}

type AdminModeratorsData {
  admins: [user!]!
  moderators: [user!]!
}

type RootQuery {
  users: [user!]!
  getOrganization: organization!
  getAdminModerators(): AdminModeratorsData!
  topics: [topic!]!
  categories: [category!]!
  messages(topicId: String!): [message!]!
  login(email: String!, password: String!): AuthData!
}

type RootMutation {
  createTopics(topicInput:TopicInput) : topic
  createCategories(categoryInput: CategoryInput): category
  createUser(userInput: UserInput): user
  updateUser(userInput: UserInput): user
  blockUser(userFindInput: UserFindInput): Result
  removeUser(userFindInput: UserFindInput): Result
  createOrganization(organizationInput: OrganizationInput): Result
  updateOrganization(organizatinInput: OrganizationInput): organization
  makeAdmin(userFindInput: UserFindInput): Result
  makeModerator(userFindInput: UserFindInput): Result
  removeAdmin(userFindInput: UserFindInput): Result
  removeModerator(userFindInput: UserFindInput): Result
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
