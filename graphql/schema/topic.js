module.exports = `
type topic {
  _id: String!
  name: String!
  description: String!
  createdBy: user!
  parentCategory: String!
  tags: [tag!]
  chats: [String!]!
  isArchived: Boolean
  isSelfArchived: Boolean
}

input topicInput {
  _id: String
  name: String!
  description: String!
  parentCategory: String
  tagString: String
}

input topicFindInput {
  _id: String!
}
`;