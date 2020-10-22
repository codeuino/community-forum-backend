const {
  messageDeleteResult,
  pinMessageResult,
  unpinMessageResult,
  messageAnnouncementResult,
  removeAnnouncementResult,
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
const server = require("../app").server;
const jwt = require("jsonwebtoken");

let connection,
  organizationResponse,
  firstUserSignupResponse,
  firstUserLoginResponse,
  firstUserToken,
  categoryResponse,
  topicResponse,
  messageId;

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

test("should not create a new message when user logged out", async () => {
  const response = await testCreateMessage(
    null,
    topicResponse.body.data.createTopic._id
  );
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(500);
  expect(response.body.errors[0].message).toBe(authenticationError);
});

test("should create a new message when user logged in", async () => {
  const response = await testCreateMessage(
    firstUserToken,
    topicResponse.body.data.createTopic._id
  );
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  messageId = response.body.data.createMessage._id;
  expect(response.body.data.createMessage.description).toBe("Lorem Ipsum");
  expect(response.body.data.createMessage.parentTopic).toEqual(
    topicResponse.body.data.createTopic._id
  );
  const topic = await Topic.findById(topicResponse.body.data.createTopic._id).lean();
  expect(topic.chats.length).toBe(1);
});

test("should update a message with creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ updateMessage(
        messageInput: {
          _id: "${messageId}"
          description: "Updated Lorem Ipsum"
        }
      ) {
        description
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.updateMessage.description).toBe("Updated Lorem Ipsum");
});

test("should delete a message with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ deleteMessage(
        messageFindInput: {
          _id: "${messageId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.deleteMessage.result).toBe(messageDeleteResult);
  const topic = await Topic.findById(
    topicResponse.body.data.createTopic._id
  ).lean();
  expect(topic.chats.length).toBe(0);
});

test("should pin a message with admin/moderator/creator access", async () => {
  const messageCreationResponse = await request
    .post("/graphql")
    .send({
      query: `mutation{ createMessage(
        messageInput: {
          description: "Lorem Ipsum"
          parentTopic: "${topicResponse.body.data.createTopic._id}"
        }
      ) {
        _id
        description
        parentTopic
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  messageId = messageCreationResponse.body.data.createMessage._id;
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ pinMessage(
        messageFindInput: {
          _id: "${messageId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.pinMessage.result).toBe(pinMessageResult);
  const message = await Message.findById(
    messageId
  ).lean();
  expect(message.isPinned).toBe(true);
});

test("should unpin a message with admin/moderator/creator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ unpinMessage(
        messageFindInput: {
          _id: "${messageId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.unpinMessage.result).toBe(unpinMessageResult);
  const message = await Message.findById(messageId).lean();
  expect(message.isPinned).toBe(false);
});

test("should announce a message with admin/moderator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ announceMessage(
        messageFindInput: {
          _id: "${messageId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.announceMessage.result).toBe(messageAnnouncementResult);
  const message = await Message.findById(messageId).lean();
  expect(message.isAnnounced).toBe(true);
});

test("should remove message from announcement with admin/moderator access", async () => {
  const response = await request
    .post("/graphql")
    .send({
      query: `mutation{ removeAnnouncement(
        messageFindInput: {
          _id: "${messageId}"
        }
      ) {
        result
      }}`,
    })
    .set("Accept", "application/json")
    .set("Authorization", `Bearer ${firstUserToken}`);
  expect(response.type).toBe("application/json");
  expect(response.status).toBe(200);
  expect(response.body.data.removeAnnouncement.result).toBe(
    removeAnnouncementResult
  );
  const message = await Message.findById(messageId).lean();
  expect(message.isAnnounced).toBe(false);
});
