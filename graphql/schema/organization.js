module.exports = `
type organizationDescription {
  shortDescription: String!
  longDescription: String
}

type organizationInfo {
  email: String!
  website: String!
}

type organization {
  _id: String
  name: String
  description: organizationDescription
  contactInfo: organizationInfo
  isArchived: Boolean
  isUnderMaintenance: Boolean
  totalUsers: Int
  exists: Boolean
}

input organizationDescriptionInput {
  shortDescription: String!
  longDescription: String
}

input organizationInfoInput {
  email: String!
  website: String!
}

input organizationInput {
  name: String!
  description: organizationDescriptionInput!
  contactInfo: organizationInfoInput!
}

type adminModeratorsData {
  admins: [user!]!
  moderators: [user!]!
}
`;