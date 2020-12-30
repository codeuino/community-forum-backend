const {
  taskDeleteResult,
  taskCompleteResult,
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
  organizationResponse,
  firstUserSignupResponse,
  secondUserSignupResponse,
  firstUserLoginResponse,
  firstUserToken,
  categoryResponse,
  topicResponse,
  messageResponse,
  firstTaskId,
  secondTaskId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});
  await Topic.deleteMany({});
  await Message.deleteMany({});
  organizationResponse = await testCreateOrganization();
  firstUserSignupResponse = await testCreateUser(1);
  secondUserSignupResponse = await testCreateUser(2);
  firstUserLoginResponse = await testLoginUser(1);
  firstUserToken = firstUserLoginResponse.body.data.login.token;
  categoryResponse = await testCreateCategory(firstUserToken);
  topicResponse = await testCreateTopic(
    firstUserToken,
    categoryResponse.body.data.createCategory._id
  );
  messageResponse = await testCreateMessage(
    firstUserToken,
    topicResponse.body.data.createTopic._id
  );
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should create a task without message reference when user logged in", async () => {
  const response = await testCreateTask(
    firstUserToken, 
    topicResponse.body.data.createTopic._id
  );
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  firstTaskId = response.body.data.createTask._id;
  expect(response.body.data.createTask.description).toBe("Lorem Ipsum");
  expect(response.body.data.createTask.attachedMessage).toBe(null);
  expect(response.body.data.createTask.deadline).toBe("2020-02-20T02:20:20.000Z");
});

test("should create a task with message reference when user logged in", async () => {
  const response = await testCreateTask(
    firstUserToken,
    topicResponse.body.data.createTopic._id,
    messageResponse.body.data.createMessage._id,
    secondUserSignupResponse.body.data.createUser._id,
  );
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  secondTaskId = response.body.data.createTask._id;
  expect(response.body.data.createTask.description).toBe("Lorem Ipsum");
  expect(response.body.data.createTask.attachedMessage).toBe(
    messageResponse.body.data.createMessage._id
  );
  expect(response.body.data.createTask.deadline).toBe(
    "2020-02-20T02:20:20.000Z"
  );
  const topic = await Topic.findById(topicResponse.body.data.createTopic._id).lean();
  expect(topic.tasks.length).toBe(2);
  const firstUser = await User.findById(
    firstUserSignupResponse.body.data.createUser._id
  ).lean();
  expect(firstUser.tasksCreated.length).toBe(2);
  const secondUser = await User.findById(
    secondUserSignupResponse.body.data.createUser._id
  ).lean();
  expect(secondUser.tasksAssigned.length).toBe(1);
});

test("should update a task without message reference when user logged in", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateTask(
            taskInput: {
              _id: "${firstTaskId}"
              description: "Updated Lorem Ipsum"
              deadline: "2022-02-20T02:20:20.000Z"
            }
          ) {
            _id
            description
            deadline
          }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateTask.description).toBe("Updated Lorem Ipsum");
  expect(response.body.data.updateTask.deadline).toBe(
    "2022-02-20T02:20:20.000Z"
  );
});

test("should update a task with message reference when user logged in", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateTask(
            taskInput: {
              _id: "${secondTaskId}"
              description: "Updated Lorem Ipsum"
              deadline: "2022-02-20T02:20:20.000Z"
            }
          ) {
            _id
            description
            deadline
            attachedMessage
          }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateTask.description).toBe("Updated Lorem Ipsum");
  expect(response.body.data.updateTask.deadline).toBe(
    "2022-02-20T02:20:20.000Z"
  );
  const message = await Message.findById(response.body.data.updateTask.attachedMessage);
  expect(message.description).toBe("Updated Lorem Ipsum");
});

test("should mark a task complete when user logged in", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ completeTask(
            taskFindInput: {
              _id: "${firstTaskId}"
            }
          ) {
            result
          }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.completeTask.result).toBe(taskCompleteResult);
  const task = await Task.findById(firstTaskId);
  expect(task.isCompleted).toBe(true);
});

test("get a task when user logged in", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getTask(
            taskFindInput: {
              _id: "${firstTaskId}"
            }
          ) {
            _id
            description
            isCompleted
          }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getTask.description).toBe("Updated Lorem Ipsum");
  expect(response.body.data.getTask.isCompleted).toBe(true);
});

test("delete a task when user logged in", async () => {
  const task = await Task.findById(secondTaskId).lean();
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ deleteTask(
            taskFindInput: {
              _id: "${secondTaskId}"
            }
          ) {
            result
          }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.deleteTask.result).toBe(taskDeleteResult);
  const message = await Message.findById(task.attachedMessage).lean();
  expect(message.isTasked).toBe(false);
  const topic = await Topic.findById(
    topicResponse.body.data.createTopic._id
  ).lean();
  expect(topic.tasks.length).toBe(1);
  const firstUser = await User.findById(
    firstUserSignupResponse.body.data.createUser._id
  ).lean();
  expect(firstUser.tasksCreated.length).toBe(1);
  const secondUser = await User.findById(
    secondUserSignupResponse.body.data.createUser._id
  ).lean();
  expect(secondUser.tasksAssigned.length).toBe(0);
});

