module.exports = `
type category {
  _id: String!
  name: String!
  description: String!
  createdBy: String!
  topics: [String!]!
  isArchived: Boolean
}

input categoryInput {
  name: String!
  description: String!
}

input categoryFindInput {
  _id: String!
}
`;