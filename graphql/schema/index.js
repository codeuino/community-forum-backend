const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type user {
  _id: String!
  username: String!
  email: String!
  avatarUrl: String
}

input UserInput {
  email: String!
  password: String!
  username: String!
}

type category {
  _id: String!
  categoryName: String!
  topicIds: [String!]!
}

input CategoryInput{
  categoryName: String!
}

type message {
  _id: String!
  userId: String!
  replyTo: String
  description: String!
  likes: Int!
}

type topic{
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

input TopicInput{
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

type RootQuery {
  topics: [topic!]!
  categories: [category!]!
  messages(topicId: String!): [message!]!
  login(email: String!, password: String!): AuthData!
}

type RootMutation {
  createTopics(topicInput:TopicInput) : topic
  createCategories(categoryInput: CategoryInput): category
  createUser(userInput: UserInput): user
}

schema {
  query: RootQuery
  mutation: RootMutation
}
`);
