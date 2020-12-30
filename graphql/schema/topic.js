module.exports = `
type topic {
  _id: String!
  name: String!
  description: String!
  createdBy: user!
  parentCategory: String!
  tags: [tag!]
  tagString: String
  chats: [String!]!
  isArchived: Boolean
  isSelfArchived: Boolean
  createdAt: Date!
  updatedAt: Date!
}

type topicDetails {
  topic: topic!
  pinnedMessages: [message!]
  announcements: [message!]
}

input topicInput {
  _id: String
  name: String!
  description: String!
  parentCategory: String
  tagString: String!
}

input topicFindInput {
  _id: String!
}
`;
