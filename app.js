const createError = require("http-errors");
const express = require("express");
const path = require("path");
const isAuth = require("./middleware/is-auth");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const graphqlHTTP = require("express-graphql");
const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const Topic = require("./models/topic");
const User = require("./models/user");
const Message = require("./models/message");
require("./config/mongoose");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(isAuth);

io.sockets.on("connection", function (socket, client) {
  console.log("client connected!");
  socket.on("room", function (room) {
    socket.join(room);
    console.log(`Someone joined the room: ${room}`);
  });
  socket.on("newMessage", async (data) => {
    try {
      console.log(Topic);
      await Topic.findById(data.topicId, async function (err, Topic) {
        if (err) {
          throw new Error(err);
        }
        let user = await User.findById(data.userId, function (err, user) {
          if (err) {
            throw new Error(err);
          }
          return user.username;
        });
        let message = new Message({
          userId: user._id,
          replyTo: data.replyTo,
          description: data.description,
          likes: data.likes,
        });
        await message.save();
        console.log(Topic);
        Topic.chats.push(message);
        await Topic.save();
        io.to(data.topicId).emit("message", Topic.chats.pop());
      });
    } catch {
      console.log(err);
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
