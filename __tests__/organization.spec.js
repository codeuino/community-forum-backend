const {
  organizationCreatedResult,
  madeAdminResult,
  madeModeratorResult,
  removeAdminResult,
  removeModeratorResult,
} = require("../graphql/variables/resultMessages");
const {
  authenticationError,
  adminAccessError,
} = require("../graphql/variables/errorMessages");
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

let connection;

beforeAll(async (done) => {
  connection = await server.listen(process.env.PORT);
  console.log(`Test: listening on ${process.env.PORT}`);
  await Organization.deleteMany({});
  await User.deleteMany({});
  await done();
});

afterAll(async () => {
  await connection.close();
  await mongoose.connection.close();
});

test("should create organization", async () => {
  const response = await testCreateOrganization();
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.createOrganization.result).toBe(
    organizationCreatedResult
  );
  const organization = await Organization.find({}).lean();
  expect(organization.length).toBe(1);
});

test("get organization details", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getOrganization {
        name
        totalUsers
      }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getOrganization.name).toBe(
    "Test Organization"
  );
  expect(response.body.data.getOrganization.totalUsers).toBe(0);
});

test("don't update organization details without admin authorization", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateOrganization(
        organizationInput: {
          name: "Test Organization"
          description: {
            shortDescription: "Updated Lorem Ipsum"
          }
          contactInfo: {
            email: "test@email.com"
            website: "www.newWebsite.com"
          }
        }
      ) {
        description {
          shortDescription
        }
        contactInfo {
          website
        }
      }}`,
    })
    .set("Accept", "application/json");
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("update organization details with admin authorization", async () => {
  const userSignupResponse = await testCreateUser(1);
  expect(userSignupResponse.body.data.createUser.isAdmin).toBe(true);
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateOrganization(
        organizationInput: {
          name: "Test Organization"
          description: {
            shortDescription: "Updated Lorem Ipsum"
          }
          contactInfo: {
            email: "test@email.com"
            website: "www.newWebsite.com"
          }
        }
      ) {
        description {
          shortDescription
        }
        contactInfo {
          website
        }
      }}`,
    })
    .set("Accept", "application/json")
    .set('Authorization', `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(
    response.body.data.updateOrganization.description.shortDescription
  ).toBe("Updated Lorem Ipsum");
  expect(response.body.data.updateOrganization.contactInfo.website).toBe(
    "www.newWebsite.com"
  );
});

test("escalate provided user to admin by another admin using Email", async () => {
  const userSignupResponse = await testCreateUser(2);
  expect(userSignupResponse.body.data.createUser.isAdmin).toBe(false);
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ makeAdmin(
        userFindInput: {
          email: "abc2@email.com"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.makeAdmin.result).toBe(
    madeAdminResult
  );
  const escalatedUser = await User.findOne({email: "abc2@email.com"}).lean();
  expect(escalatedUser.isAdmin).toBe(true);
});

test("escalate provided user to admin by another admin using Id", async () => {
  const userSignupResponse = await testCreateUser(3);
  const toBeAdmin = userSignupResponse.body.data.createUser._id;
  expect(userSignupResponse.body.data.createUser.isAdmin).toBe(false);
  const userLoginResponse = await testLoginUser(2);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ makeAdmin(
        userFindInput: {
          _id: "${toBeAdmin}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.makeAdmin.result).toBe(madeAdminResult);
  const escalatedUser = await User.findOne({ email: "abc3@email.com" }).lean();
  expect(escalatedUser.isAdmin).toBe(true);
});

test("escalate provided user to moderator by another admin using Email", async () => {
  const userSignupResponse = await testCreateUser(4);
  expect(userSignupResponse.body.data.createUser.isModerator).toBe(false);
  const userLoginResponse = await testLoginUser(3);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ makeModerator(
        userFindInput: {
          email: "abc4@email.com"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.makeModerator.result).toBe(madeModeratorResult);
  const escalatedUser = await User.findOne({ email: "abc4@email.com" }).lean();
  expect(escalatedUser.isModerator).toBe(true);
});

test("escalate provided user to moderator by another admin using Id", async () => {
  const userSignupResponse = await testCreateUser(5);
  const tobeModerator = userSignupResponse.body.data.createUser._id;
  expect(userSignupResponse.body.data.createUser.isModerator).toBe(false);
  const userLoginResponse = await testLoginUser(3);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ makeModerator(
        userFindInput: {
          _id: "${tobeModerator}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.makeModerator.result).toBe(madeModeratorResult);
  const escalatedUser = await User.findOne({ email: "abc5@email.com" }).lean();
  expect(escalatedUser.isModerator).toBe(true);
});

test("demote provided admin to user by another admin using Email", async () => {
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeAdmin(
        userFindInput: {
          email: "abc2@email.com"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeAdmin.result).toBe(removeAdminResult);
  const demotedAdmin = await User.findOne({ email: "abc2@email.com" }).lean();
  expect(demotedAdmin.isAdmin).toBe(false);
});

test("demote provided admin to user by another admin using Id", async () => {
  const user = await User.findOne({email: "abc3@email.com"}).lean();
  const toBeDemoted = user._id;
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeAdmin(
        userFindInput: {
          _id: "${toBeDemoted}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeAdmin.result).toBe(removeAdminResult);
  const demotedUser = await User.findOne({ email: "abc3@email.com" }).lean();
  expect(demotedUser.isAdmin).toBe(false);
});

test("demote provided moderator to user by another admin using Email", async () => {
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeModerator(
        userFindInput: {
          email: "abc4@email.com"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeModerator.result).toBe(removeModeratorResult);
  const demotedModerator = await User.findOne({ email: "abc4@email.com" }).lean();
  expect(demotedModerator.isModerator).toBe(false);
});

test("demote provided moderator to user by another admin using Id", async () => {
  const user = await User.findOne({ email: "abc5@email.com" }).lean();
  const toBeDemoted = user._id;
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeModerator(
        userFindInput: {
          _id: "${toBeDemoted}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeModerator.result).toBe(removeModeratorResult);
  const demotedUser = await User.findOne({ email: "abc5@email.com" }).lean();
  expect(demotedUser.isModerator).toBe(false);
});

test("get all admins and moderators with admin authorization", async () => {
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getAdminModerators {
        admins {
          _id
          name {
            firstName
            lastName
          }
          isFirstAdmin
        }
        moderators {
          _id
          name {
            firstName
            lastName
          }
        }
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getAdminModerators.admins.length).toBe(1);
  expect(response.body.data.getAdminModerators.moderators.length).toBe(0);
  expect(response.body.data.getAdminModerators.admins[0].isFirstAdmin).toBe(true);
});

test("get more organization details with admin authorization", async () => {
  const userLoginResponse = await testLoginUser(1);
  const token = userLoginResponse.body.data.login.token;
  const response = await request
    .post("/graphql")
    .send({
      query: `{ getOrganizationData {
        categories
        topics
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${token}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.getOrganizationData.categories).toBe(0);
  expect(response.body.data.getOrganizationData.topics).toBe(0);
});
