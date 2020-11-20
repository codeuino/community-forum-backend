//users
module.exports.authenticationError = "Login or Signup to continue";
module.exports.userExistError = "User account already present. Please login to continue";
module.exports.noUserError = "No user account found with those credentials";
module.exports.adminAccessError = "Only admins can perform this action";
module.exports.noAdminError = "Provided user doesn't have admin rights"
module.exports.noModeratorError = "Provided user doesn't have moderator rights";
module.exports.firstAdminDemoteError = "You cannot demote first admin account";
module.exports.firstAdminBlockError = "You cannot block first admin account";
module.exports.firstAdminRemoveError = "You cannot remove first admin account";
module.exports.noAuthorizationError = "No rights to perform this action";
module.exports.passwordError = "Incorrect email or password provided";
module.exports.userBlockedError = "User account blocked. Please contact Admin to join again";
module.exports.emailPasswordError =
  "Enter email and password both";

//organizations
module.exports.noOrganizationError = "No user accounts can be created before setting up organization";
module.exports.organizationExistError = "Organization can be created only once";

//categories
module.exports.categoryArchivedError = "Provided category had already been archived";
module.exports.categoryRemovedError = "Provided category had already been deleted";

//topics
module.exports.topicArchivedError =
  "Provided topic had already been archived";
module.exports.topicRemovedError = "Provided topic had already been delete";

//tasks
module.exports.taskAlreadyCreatedError = "Message had already been converted into task";

//tags
module.exports.tagRemovedError = "Provided tag had already been delete";
