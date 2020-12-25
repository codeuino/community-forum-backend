const {
  topicArchiveResult,
  topicDeleteResult,
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
const Tag = require("../models/tag");
const server = require("../app").server;
const jwt = require("jsonwebtoken");
const { response } = require("express");

let connection, 
  organizationResponse, 
  firstUserSignupResponse, 
  firstUserLoginResponse, 
  firstUserToken, 
  categoryResponse, 
  topicId,
  messageId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});
  await Topic.deleteMany({});
  await Message.deleteMany({});
  await Task.deleteMany({});
  await Tag.deleteMany({});
  organizationResponse = await testCreateOrganization();
  firstUserSignupResponse = await testCreateUser(1);
  firstUserLoginResponse = await testLoginUser(1);
  firstUserToken = firstUserLoginResponse.body.data.login.token;
  categoryResponse = await testCreateCategory(firstUserToken);
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should not create a new topic when user logged out", async () => {
  const response = await testCreateTopic(
    null,
    categoryResponse.body.data.createCategory._id
  );
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("should create a new topic when user logged in", async () => {
  const response = await testCreateTopic(
    firstUserToken,
    categoryResponse.body.data.createCategory._id
  );
  topicId = response.body.data.createTopic._id;
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createTopic.name).toBe("Test Topic");
  expect(response.body.data.createTopic.description).toBe("Lorem Ipsum");
  expect(response.body.data.createTopic.createdBy._id).toEqual(
    firstUserSignupResponse.body.data.createUser._id
  );
  expect(response.body.data.createTopic.tags.length).toEqual(2);
  expect(response.body.data.createTopic.parentCategory).toEqual(
    categoryResponse.body.data.createCategory._id
  );
});

test("get all topics", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ topics {
      _id
      name
      description
  }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.topics.length).toBe(1);
  expect(response.body.data.topics[0].name).toBe("Test Topic");
  expect(response.body.data.topics[0].description).toBe("Lorem Ipsum");
});

test("should not archive a topic by any third user", async () => {
  const userSignupResponse = await testCreateUser(2);
  expect(userSignupResponse.body.data.createUser.isAdmin).toBe(false);
  const userLoginResponse = await testLoginUser(2);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ archiveTopic(
        topicFindInput: {
          _id: "${topicId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(noAuthorizationError);
});

test("should archive a topic with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ archiveTopic(
        topicFindInput: {
          _id: "${topicId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.archiveTopic.result).toBe(topicArchiveResult);
  const topic = await Topic.findById(topicId).lean();
  expect(topic.isSelfArchived).toBe(true);
});

test("should update a topic with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateTopic(
        topicInput: {
          _id: "${topicId}"
          name: "Updated Test Topic"
          description: "Lorem Ipsum"
          tagString: ""
        }
      ) {
        name
        description
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateTopic.name).toBe("Updated Test Topic");
});

test("should delete a topic with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ deleteTopic(
        topicFindInput: {
          _id: "${topicId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.deleteTopic.result).toBe(topicDeleteResult);
  const topics = await Topic.find({}).lean();
  expect(topics.length).toBe(0);
  const category = await Category.findOne({}).lean();
  expect(category.topics.length).toBe(0);
});

test("should get all messages in a particular topic", async () => {
  const topicCreationResponse = await testCreateTopic(
    firstUserToken,
    categoryResponse.body.data.createCategory._id
  );
  const messageCreationResponse = await testCreateMessage(
    firstUserToken,
    topicCreationResponse.body.data.createTopic._id
  );
  topicId = topicCreationResponse.body.data.createTopic._id;
  messageId = messageCreationResponse.body.data.createMessage._id;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getTopicChats(
        topicFindInput: {
          _id: "${topicCreationResponse.body.data.createTopic._id}"
        }
      ) {
        _id
        description
        user {
          name {
            firstName
          }
        }
        userId
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getTopicChats.length).toBe(1);
  expect(response.body.data.getTopicChats[0]._id).toEqual(messageId);
  expect(response.body.data.getTopicChats[0].description).toBe("Lorem Ipsum");
  expect(response.body.data.getTopicChats[0].user.name.firstName).toEqual("TestUser");
  expect(response.body.data.getTopicChats[0].userId)
    .toEqual(firstUserSignupResponse.body.data.createUser._id);
});

test("should get all tasks in a particular topic", async () => {
  const taskCreationResponse = await testCreateTask(
    firstUserToken,
    topicId,
    messageId
  );
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getTopicTasks(
        topicFindInput: {
          _id: "${topicId}"
        }
      ) {
        _id
        description
        parentTopic
      }}`,
    })
    .set("Accept", "application/json")
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getTopicTasks.length).toBe(1);
  expect(response.body.data.getTopicTasks[0].description).toBe("Lorem Ipsum");
  expect(response.body.data.getTopicTasks[0].parentTopic).toEqual(topicId);
});
