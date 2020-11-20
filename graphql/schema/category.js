module.exports = `
type category {
  _id: String!
  name: String!
  description: String!
  createdBy: user!
  topics: [String!]!
  isArchived: Boolean!
  createdAt: Date!
  updatedAt: Date!
}

input categoryInput {
  _id: String
  name: String!
  description: String!
}

input categoryFindInput {
  _id: String!
}
`;