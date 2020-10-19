const {
  topicArchiveResult,
  topicDeleteResult,
} = require("../graphql/variables/resultMessages");
const {
  authenticationError,
  noAuthorizationError,
} = require("../graphql/variables/errorMessages");
const app = require("../app").app;
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const Organization = require("../models/organization");
const User = require("../models/user");
const Category = require("../models/category");
const Topic = require("../models/topic");
const server = require("../app").server;
const jwt = require("jsonwebtoken");

let connection, organizationResponse, firstUserSignupResponse, firstUserLoginResponse, categoryResponse, topicId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});
  await Topic.deleteMany({});
  organizationResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createOrganization(organizationInput: {
          name: "Test Organization"
          description: {
            shortDescription: "Lorem Ipsum"
          }
          contactInfo: {
            email: "test@email.com"
            website: "www.website.com"
          }
      }) {
        result
      }}`,
    })
    .set("Accept", "application/json");
  firstUserSignupResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createUser(userInput: {
          name: {
            firstName: "TestUser"
            lastName: "1"
          }
          email: "abc1@email.com"
          password: "password"
          info: {
            about: {
              shortDescription: "Lorem Ipsum"
            }
          }
      }) {
        _id
        name {
          firstName
          lastName
        }
        email
        phone
        isAdmin
      }}`,
    })
    .set("Accept", "application/json");
  firstUserLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc1@email.com"
        password: "password"
      ) {
        name {
          firstName
          lastName
        }
        token
      } }`,
    })
    .set("Accept", "application/json");
  const firstUserToken = firstUserLoginResponse.body.data.login.token;
  categoryResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createCategory(
        categoryInput: {
          name: "Test Category"
          description: "Lorem Ipsum"
        }
      ) {
        _id
        name
        description
        createdBy
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should not create a new topic when user logged out", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ createTopic(
        topicInput: {
          name: "Test Topic"
          description: "Lorem Ipsum"
          parentCategory: "${categoryResponse.body.data.createCategory._id}"
        }
      ) {
        _id
      }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("should create a new topic when user logged in", async () => {
  const userLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc1@email.com"
        password: "password"
      ) {
        name {
          firstName
          lastName
        }
        token
      } }`,
    })
    .set("Accept", "application/json");
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ createTopic(
        topicInput: {
          name: "Test Topic"
          description: "Lorem Ipsum"
          parentCategory: "${categoryResponse.body.data.createCategory._id}"
        }
      ) {
        _id
        name
        description
        createdBy
        parentCategory
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  topicId = response.body.data.createTopic._id;
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createTopic.name).toBe("Test Topic");
  expect(response.body.data.createTopic.description).toBe("Lorem Ipsum");
  expect(response.body.data.createTopic.createdBy).toEqual(
    firstUserSignupResponse.body.data.createUser._id
  );
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
  const userSignupResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createUser(userInput: {
        name: {
          firstName: "TestUser"
          lastName: "2"
        }
        email: "abc2@email.com"
        password: "password"
        info: {
          about: {
            shortDescription: "Lorem Ipsum"
          }
        }
    }) {
      _id
      name {
        firstName
        lastName
      }
      email
      phone
      isAdmin
    }}`,
    })
    .set("Accept", "application/json");
  expect(userSignupResponse.body.data.createUser.isAdmin).toBe(false);
  const userLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
      email: "abc2@email.com"
      password: "password"
    ) {
      token
    } }`,
    })
    .set("Accept", "application/json");
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
  const userLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc1@email.com"
        password: "password"
      ) {
        name {
          firstName
          lastName
        }
        token
      } }`,
    })
    .set("Accept", "application/json");
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
  expect(response.status).toBe(200);
  expect(response.body.data.archiveTopic.result).toBe(topicArchiveResult);
  const topic = await Topic.findById(topicId).lean();
  expect(topic.isArchived).toBe(true);
});

test("should update a topic with admin/moderator/creator access", async () => {
  const userLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc1@email.com"
        password: "password"
      ) {
        name {
          firstName
          lastName
        }
        token
      } }`,
    })
    .set("Accept", "application/json");
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateTopic(
        topicInput: {
          _id: "${topicId}"
          name: "Updated Test Topic"
          description: "Lorem Ipsum"
        }
      ) {
        name
        description
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateTopic.name).toBe("Updated Test Topic");
});

test("should delete a topic with admin/moderator/creator access", async () => {
  const userLoginResponse = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc1@email.com"
        password: "password"
      ) {
        name {
          firstName
          lastName
        }
        token
      } }`,
    })
    .set("Accept", "application/json");
  const token = userLoginResponse.body.data.login.token;
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
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.deleteTopic.result).toBe(topicDeleteResult);
  const topics = await Topic.find({}).lean();
  expect(topics.length).toBe(0);
  const category = await Category.findOne({}).lean();
  expect(category.topics.length).toBe(0);
});

//getTopicChats to be tested after Message API
