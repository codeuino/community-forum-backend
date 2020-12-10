const {
  tagRemovedError,
} = require("../graphql/variables/errorMessages");
const {
  testCreateOrganization,
  testCreateUser,
  testLoginUser,
  testCreateCategory,
  testCreateTopic,
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
  topicResponse;

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
  topicResponse = await testCreateTopic(
    firstUserToken,
    categoryResponse.body.data.createCategory._id
  );
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("get all topics having a particular tag", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getTagTopics(
        tagFindInput: {
          _id: "${topicResponse.body.data.createTopic.tags[0]._id}"
        }
      ) {
      _id
      topics {
        _id
        name
        description
      }
  }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getTagTopics.topics.length).toBe(1);
  expect(response.body.data.getTagTopics.topics[0].name).toBe("Test Topic");
});
