const { buildSchema } = require("graphql");

module.exports = buildSchema(`
type category {
  categoryName: String!
  _id: String!
  topicIds: [String!]!
}
type user {
  _id: String!
  email: String!
  password: String
  username: String!
}

input UserInput {
  email: String!
  password: String!
  username: String
}

type topic{
  _id:String!
  topicName: String!
  topicDescription: String!
  topicTags: [String!]
  chats: [chat]
}

type chat {
  _id: String
  replyTo: String
  avatarUrl: String
  username: String!
  userId: String!
  description: String!
  likes: Int
  comments: Int
}

input chats {
  replyTo: String
  avatarUrl: String
  username: String!
  userId: String!
  description: String!
  likes: Int
  comments: Int
}

input TopicInput{
  topicName: String!
  topicDescription: String!
  topicTags: [String!]
  categoryID: String!
  chats: [chats]
}

input CategoryInput{
  categoryName: String!
}

type Tasks{
  completed: Boolean,
  description: String!,
  assignedBy: user!,
  date: String!,
  topicId: String!,
  userId: String!,
  dueDate: String!
}

input TasksInput {
  completed: Boolean,
  description: String!,
  assignedBy: String!,
  topicId: String!,
  userId: String!,
  dueDate: String!
}

type RootQuery {
  topics: [topic!]!
  categories: [category!]!
  login(email: String!, password: String!): AuthData!
  tasks(userId: String!): [Tasks!]
}
type AuthData {
  tokenexpiration: Int!, 
  userId: String!, 
  token: String!,
  username: String!
}
type RootMutation {
  createTopics(topicInput:TopicInput) : topic
  createCategories(categoryInput: CategoryInput): category
  createUser(userInput: UserInput): user
  createTasks(TasksInput:TasksInput) : Tasks
}
schema {
  query: RootQuery
  mutation: RootMutation
}
`);
