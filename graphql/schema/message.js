module.exports = `
type chatUser {
  _id: String
  name: userName
}

type message {
  _id: String!
  userId: String!
  user: chatUser
  replyTo: String
  description: String!
  parentTopic: String!
  likes: Int!
  isPinned: Boolean!
  isTasked: Boolean!
  isAnnounced: Boolean!
}

input messageInput {
  _id: String
  replyTo: String
  description: String!
  parentTopic: String
}

input messageFindInput {
  _id: String!
}
`;