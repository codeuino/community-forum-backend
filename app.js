const express = require("express");
const app = express();
var port_number = process.env.PORT || 4000;
const server = app.listen(port_number);
const cors = require("cors");
app.use(cors());

app.get("/", function (req, res) {
  res.redirect("https://github.com/codeuino/community-forum-backend");
});
