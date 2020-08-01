var createError = require("http-errors");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var http = require("http");
var graphqlHTTP = require("express-graphql");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var graphQlSchema = require("./graphql/schema/index");
var graphQlResolvers = require("./graphql/resolvers/index");
var isAuth = require("./middleware/is-auth");
var User = require("./models/user");
var Task = require("./models/task");
const { topics } = require("./graphql/resolvers/index");
require("./config/mongoose");
var app = express();

var server = http.createServer(app);
var io = require("socket.io")(server);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  }
  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(isAuth);
app.use("/", indexRouter);
app.use("/users", usersRouter);

io.sockets.on("connection", function (socket, client) {
  console.log("client connected!");
  socket.on("room", function (room) {
    socket.join(room);
    console.log(`Someone joined the room: ${room}`);
  });
  socket.on("newMessage", async (data) => {
    try {
      console.log(data);
      let Topic = await Topic.findById(data.topicId, async function (
        err,
        Topic
      ) {
        if (err) {
          throw new Error(err);
        } else {
          return Topic;
        }
      });
      let user = await User.findById(data.userId, function (err, user) {
        if (err) {
          throw new Error(err);
        }
        return user.username;
      });
      let newChat = {
        username: user.username,
        replyTo: data.replyTo,
        description: data.description,
        userId: user._id,
      };
      Topic.chats.push(newChat);
      await Topic.save();
      io.to(data.topicId).emit("newChat", Topic.chats.pop());
    } catch {
      console.log("Error");
    }
  });
  socket.on("TaskCompleted", async (data) => {
    try {
      Task.findById(data._id, async function (err, task) {
        if (err) {
          throw new Error(err);
        }
        task.completed = true;
        await task.save();
      });
    } catch {
      console.log("Error");
    }
  });
  socket.on("TaskIncomplete", async (data) => {
    try {
      Task.findById(data._id, async function (err, task) {
        if (err) {
          throw new Error(err);
        }
        task.completed = false;
        await task.save();
      });
    } catch {
      console.log("Error");
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
