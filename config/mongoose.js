const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@anonymous-project-shard-00-00-e0dq9.mongodb.net:27017,anonymous-project-shard-00-01-e0dq9.mongodb.net:27017,anonymous-project-shard-00-02-e0dq9.mongodb.net:27017/<test_codeuino>?ssl=true&replicaSet=Anonymous-Project-shard-0&authSource=admin&retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => {
    console.log('mongodb connection successful')
  })
  .catch((err) => {
    console.log('mongodb connection error', err)
  })