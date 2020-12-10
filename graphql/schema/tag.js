module.exports = `
type tag {
  _id: String!
  name: String!
  hexColorCode: String!
  categories: [category!]!
  topics: [topic!]!
}

input tagFindInput {
  _id: String!
}
`;
