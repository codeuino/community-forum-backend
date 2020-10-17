const app = require("../app").app;
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const Organization = require("../models/organization");
const User = require("../models/user");
const server = require("../app").server;
const jwt = require("jsonwebtoken");

let connection;
let userId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await User.deleteMany({});
  await Organization.deleteMany({});
  const organizationResponse = await request
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
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should signup new user", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ createUser(userInput: {
          name: {
            firstName: "TestUser"
            lastName: "1"
          }
          email: "abc@email.com"
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
      }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createUser.name).toStrictEqual({
    firstName: "TestUser",
    lastName: "1"
  });
  expect(response.body.data.createUser.email).toBe("abc@email.com");
  expect(response.body.data.createUser.phone).toBe(null);
  userId = response.body.data.createUser._id;
});

test("login existing user", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ login(
        email: "abc@email.com"
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
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.login.name).toStrictEqual({
    firstName: "TestUser",
    lastName: "1",
  });
  const token = response.body.data.login.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  expect(decodedToken.id).toBe(userId);
});
