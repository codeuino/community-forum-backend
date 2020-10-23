module.exports = `
type task {
  _id: String!
  userId: String!
  assignedTo: String
  attachedMessage: String
  description: String!
  deadline: Date
  parentTopic: String!
  isCompleted: Boolean!
}

input taskInput {
  _id: String
  assignedTo: String
  attachedMessage: String
  description: String
  deadline: Date
  parentTopic: String
}

input taskFindInput {
  _id: String!
}`;