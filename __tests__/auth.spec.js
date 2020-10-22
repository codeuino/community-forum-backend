const {
  testCreateOrganization,
  testCreateUser,
  testLoginUser,
} = require("../config/testVariables");
const app = require("../app").app;
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const Organization = require("../models/organization");
const User = require("../models/user");
const server = require("../app").server;
const jwt = require("jsonwebtoken");

let connection, userId;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await User.deleteMany({});
  await Organization.deleteMany({});
  const organizationResponse = await testCreateOrganization();
  const userResponse = await testCreateUser(1);
  userId = userResponse.body.data.createUser._id;
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("login existing user", async () => {
  const response = await testLoginUser(1);
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
