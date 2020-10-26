const {
  categoryArchiveResult,
  categoryDeleteResult,
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

let connection,
  organizationResponse,
  firstUserSignupResponse,
  firstUserLoginResponse,
  firstUserToken,
  categoryId;

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
  firstUserToken = firstUserLoginResponse.body.data.login.token;
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should not create a new category when user logged out", async () => {
  const response = await request
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
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("should create a new category when user logged in", async () => {
  const response = await request
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
  categoryId = response.body.data.createCategory._id;
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createCategory.name).toBe("Test Category");
  expect(response.body.data.createCategory.description).toBe("Lorem Ipsum");
  expect(response.body.data.createCategory.createdBy)
    .toEqual(firstUserSignupResponse.body.data.createUser._id);
  const user = await User.findOne({email: "abc1@email.com"}).lean();
  expect(user.categoriesCreated.length).toBe(1);
});

test("get all categories", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ categories {
      _id
      name
      description
  }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.categories.length).toBe(1);
  expect(response.body.data.categories[0].name).toBe("Test Category");
  expect(response.body.data.categories[0].description).toBe("Lorem Ipsum");
});

test("get topics of a particular category", async () => {
  const topicCreationResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createTopic(
        topicInput: {
          name: "Test Topic"
          description: "Lorem Ipsum"
          parentCategory: "${categoryId}"
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
    .set("Authorization", `Bearer ${firstUserToken}`);
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getCategoryTopics(
        categoryFindInput: {
          _id: "${categoryId}"
        }
      ) {
      name
      description
      isArchived
    }}`,
    })
    .set("Accept", "application/json");
    expect(response.body.data.getCategoryTopics.length).toBe(1)
    expect(response.body.data.getCategoryTopics[0].name).toBe("Test Topic")
    expect(response.body.data.getCategoryTopics[0].isArchived).toBe(false);
});

test("should not archive a category by any third user", async () => {
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
      query: `mutation{ archiveCategory(
        categoryFindInput: {
          _id: "${categoryId}"
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

test("should archive a category with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ archiveCategory(
        categoryFindInput: {
          _id: "${categoryId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.archiveCategory.result).toBe(categoryArchiveResult);
  const category = await Category.findById(categoryId).lean();
  expect(category.isArchived).toBe(true);
  const topics = await Topic.find().lean();
  expect(topics.length).toBe(1);
  expect(topics[0].isArchived).toBe(true);
});

test("should update a category with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateCategory(
        categoryInput: {
          _id: "${categoryId}"
          name: "Updated Test Category"
          description: "Lorem Ipsum"
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
  expect(response.body.data.updateCategory.name).toBe("Updated Test Category");
});

test("should delete a category with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ deleteCategory(
        categoryFindInput: {
          _id: "${categoryId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.deleteCategory.result).toBe(categoryDeleteResult);
  const categories = await Category.find({}).lean();
  expect(categories.length).toBe(0);
  const topics = await Topic.find().lean();
  expect(topics.length).toBe(0);
});