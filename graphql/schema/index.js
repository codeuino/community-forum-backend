const {buildSchema} = require('graphql');

module.exports = buildSchema(`
type category {
  categoryName: String!
  _id: String!
  topicIds: [String!]!
  idName: String!
}

type topic{
  _id:String!
  idName: String
  topicName: String!
  topicDescription: String!
  topicTags: [String!]
}

input TopicInput{
  topicName: String!
  topicDescription: String!
  topicTags: [String!]
  idName: String!
  categoryID: String!
}

input CategoryInput{
  categoryName: String!
  idName: String!
}

type RootQuery {
  topics: [topic!]!
  categories: [category!]!
}
type RootMutation {
  createTopics(topicInput:TopicInput) : topic
  createCategories(categoryInput: CategoryInput): category
}
schema {
  query: RootQuery
  mutation: RootMutation
}
`)