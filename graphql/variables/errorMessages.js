//users
module.exports.authenticationError = "Authentication Required";
module.exports.userExistError = "User is already registered";
module.exports.noUserError = "User not registered";
module.exports.adminAccessError = "Admin authorization required";
module.exports.noAdminError = "User is not an Admin"
module.exports.noModeratorError = "User is not a Moderator";
module.exports.firstAdminDemoteError = "First Admin can't be demoted";
module.exports.firstAdminBlockError = "First Admin can't be blocked";
module.exports.firstAdminRemoveError = "First Admin can't be removed";
module.exports.blockRemoveUserError = "User blocked or removed";
module.exports.noAuthorizationError = "No rights to perform this action";

//organizations
module.exports.noOrganizationError = "Organization to be created first";
module.exports.organizationExistError = "Organization can be created only once";

//categories
module.exports.categoryArchivedError = "Category had been archived";
module.exports.categoryRemovedError = "Category had been deleted";

//topics
module.exports.topicArchivedError = "Topic had been archived";
module.exports.topicRemovedError = "Topic had been deleted";

//tasks
module.exports.taskAlreadyCreatedError = "Message already converted to Task";