module.exports = `
type topic {
  _id: String!
  name: String!
  description: String!
  createdBy: String!
  parentCategory: String!
  tags: [String!]!
  chats: [String!]!
  isArchived: Boolean
}

input topicInput {
  _id: String
  name: String!
  description: String!
  parentCategory: String
  tags: [String!]
}

input topicFindInput {
  _id: String!
}
`;