const createError = require("http-errors");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");

const isAuth = require("./middleware/isAuth");
const isUnderMaintenance = require("./middleware/isUnderMaintenance");

const graphqlHTTP = require("express-graphql");
const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");

require("./config/mongoose");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const {
  createMessage,
} = require("./socketFunctions/message");

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(isAuth);
app.use(isUnderMaintenance);

io.on("connection", (socket) => {
  console.log("Socket connection");
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Join room connection: ${roomId}`);
  });
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`Leave room connection: ${roomId}`);
  });
  socket.on("newMessage", async (data, callback) => {
    const saveMessage = await createMessage(data, callback);
    if (Object.keys(saveMessage).length !== 0) {
      io.to(data.parentTopic.toString()).emit("newMessage", saveMessage.message, saveMessage.userName);
    }
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app: app, server: server };
