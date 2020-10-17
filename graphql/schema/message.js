module.exports = `
type chatUser {
  _id: String!
  name: userName!
  info: userInfo!
}

type message {
  _id: String!
  userId: String!
  user: chatUser
  replyTo: String
  description: String!
  likes: Boolean!
  isPinned: Boolean!
  isTasked: Boolean!
  isAnnounced: Boolean!
}
`;