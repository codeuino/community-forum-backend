const { 
  userBlockResult,
  userUnblockResult,
  userRemoveResult,
} = require("../graphql/variables/resultMessages");
const {
  authenticationError,
  noAuthorizationError,
} = require("../graphql/variables/errorMessages");
const {
  testCreateOrganization,
  testCreateUser,
  testLoginUser,
  testCreateCategory,
  testCreateTopic,
  testCreateMessage,
  testCreateTask,
} = require("../config/testVariables");
const app = require("../app").app;
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const Organization = require("../models/organization");
const User = require("../models/user");
const Category = require("../models/category");
const Topic = require("../models/topic");
const Message = require("../models/message");
const Task = require("../models/task");
const server = require("../app").server;
const jwt = require("jsonwebtoken");

let connection, 
  userId,
  secondUserId,
  firstUserLoginResponse, 
  firstUserToken,
  categoryId,
  topicId,
  messageId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await User.deleteMany({});
  await Organization.deleteMany({});
  await Category.deleteMany({});
  await Topic.deleteMany({});
  await Message.deleteMany({});
  await Task.deleteMany({});
  const organizationResponse = await testCreateOrganization();
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should signup new user", async () => {
  const response = await testCreateUser(1);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createUser.name).toStrictEqual({
    firstName: "TestUser",
    lastName: "1"
  });
  expect(response.body.data.createUser.email).toBe("abc1@email.com");
  expect(response.body.data.createUser.phone).toBe("0000000000");
  userId = response.body.data.createUser._id;
});

test("get all users via admin authorization", async () => {
  firstUserLoginResponse = await testLoginUser(1);
  firstUserToken = firstUserLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ users {
      _id
      name {
        firstName
      }
      email
  }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.users.length).toBe(1);
  expect(response.body.data.users[0].name.firstName).toBe("TestUser");
  expect(response.body.data.users[0].email).toBe("abc1@email.com");
});

test("should not update user details if logged out", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateUser(
        userInput: {
          name: {
            firstName: "Updated TestUser"
            lastName: "1"
          }
          phone: "0000000000"
          info: {
            about: {
              shortDescription: "Lorem Ipsum"
            }
          }
        }
      ) {
        name {
          firstName
        }
        phone
      }}`,
    })
    .set("Accept", "application/json")
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("should update user details if logged in", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateUser(
        userInput: {
          name: {
            firstName: "Updated TestUser"
            lastName: "1"
          }
          phone: "0000000000"
          info: {
            about: {
              shortDescription: "Updated Lorem Ipsum"
            }
          }
        }
      ) {
        name {
          firstName
        }
        phone
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateUser.name.firstName).toBe("Updated TestUser");
  expect(response.body.data.updateUser.phone).toBe("0000000000");
});

test("admin should be able to block other users", async () => {
  const userCreationResponse = await testCreateUser(2);
  secondUserId = userCreationResponse.body.data.createUser._id;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ blockUser(userFindInput: {
      email: "abc2@email.com" 
    }) {
      result
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.blockUser.result).toBe(userBlockResult);
    const organization = await Organization.findOne({}).lean();
    expect(organization.blockedUsers.length).toBe(1);
    expect(organization.totalUsers).toBe(1);
});

test("admin should be able to unblock other users", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ unblockUser(userFindInput: {
      email: "abc2@email.com" 
    }) {
      result
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.unblockUser.result).toBe(userUnblockResult);
  const organization = await Organization.findOne({}).lean();
  expect(organization.blockedUsers.length).toBe(0);
  expect(organization.totalUsers).toBe(2);
});

test("admin should be able to remove other users", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeUser(userFindInput: {
      email: "abc2@email.com" 
    }) {
      result
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeUser.result).toBe(userRemoveResult);
  const organization = await Organization.findOne({}).lean();
  expect(organization.removedUsers.length).toBe(1);
  expect(organization.totalUsers).toBe(1);
});

test("current user should be able to remove himself", async () => {
  const userCreationResponse = await testCreateUser(3);
  const userLoginResponse = await testLoginUser(3);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeUser(userFindInput: {
    }) {
      result
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeUser.result).toBe(userRemoveResult);
  const organization = await Organization.findOne({}).lean();
  expect(organization.removedUsers.length).toBe(2);
  expect(organization.totalUsers).toBe(1);
});

test("current user should be able to get categories created by him", async () => {
  const categoryCreationResponse = await testCreateCategory(firstUserToken);
  categoryId = categoryCreationResponse.body.data.createCategory._id;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getSelfCategories {
      _id
      name
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
    expect(response.type).toBe("application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.getSelfCategories.length).toBe(1);
    expect(response.body.data.getSelfCategories[0].name).toBe("Test Category");
});

test("current user should be able to get topics created by him", async () => {
  const topicCreationResponse = await testCreateTopic(firstUserToken, categoryId);
  topicId = topicCreationResponse.body.data.createTopic._id;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getSelfTopics {
      _id
      name
      tags {
        name
      }
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getSelfTopics.length).toBe(1);
  expect(response.body.data.getSelfTopics[0].name).toBe("Test Topic");
  expect(response.body.data.getSelfTopics[0].tags.length).toBe(2);
  expect(response.body.data.getSelfTopics[0].tags[0].name).toBe("Tag1");

});

test("current user should be able to get tasks created by him", async () => {
  const taskCreationResponse = await testCreateTask(
    firstUserToken,
    topicId,
  );
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getCreatedTasks {
      _id
      description
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getCreatedTasks.length).toBe(1);
  expect(response.body.data.getCreatedTasks[0].description).toBe("Lorem Ipsum");
});

test("current user should be able to get tasks assigned to him", async () => {
  const thirdUserCreationResponse = await testCreateUser(3);
  const thirdUserLoginResponse = await testLoginUser(3);
  const thirdUserId = thirdUserCreationResponse.body.data.createUser._id;
  const taskCreationResponse = await testCreateTask(
    firstUserToken, 
    topicId,
    undefined,
    thirdUserId,
  );
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getAssignedTasks {
      _id
      description
      userId
    }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${thirdUserLoginResponse.body.data.login.token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getAssignedTasks.length).toBe(1);
  expect(response.body.data.getAssignedTasks[0].description).toBe("Lorem Ipsum");
  expect(response.body.data.getAssignedTasks[0].userId).toBe(userId);
});