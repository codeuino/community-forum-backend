require("dotenv").config();
const User = require("../../models/user");
const Organization = require("../../models/organization");
const Message = require("../../models/message");
const Topic = require("../../models/topic");
const Task = require("../../models/task");
const { 
  taskDeleteResult,
  taskCompleteResult, 
} = require("../variables/resultMessages");
const { 
  authenticationError, 
  taskAlreadyCreatedError,
  noAuthorizationError, 
} = require("../variables/errorMessages");

module.exports = {
  createTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      let task, saveTask;
      const topic = await Topic.findById(args.taskInput.parentTopic);
      if (topic.isArchived == false && topic.isSelfArchived == false) {
        if (args.taskInput.attachedMessage == undefined) {
          task = new Task({
            userId: req.currentUser.id,
            assignedTo: args.taskInput.assignedTo,
            description: args.taskInput.description,
            deadline: args.taskInput.deadline,
            parentTopic: args.taskInput.parentTopic,
          });
          saveTask = await task.save();
        } else {
          const message = await Message.findById(
            args.taskInput.attachedMessage
          );
          if (message.isTasked) {
            throw new Error(taskAlreadyCreatedError);
          }
          task = new Task({
            userId: req.currentUser.id,
            assignedTo: args.taskInput.assignedTo,
            attachedMessage: args.taskInput.attachedMessage,
            deadline: args.taskInput.deadline,
          });
          saveTask = await task.save();
          saveTask.description = message.description;
          saveTask.parentTopic = message.parentTopic;
          message.isTasked = true;
          await message.save();
        }
        topic.tasks.push(task);
        await topic.save();
        const createdUser = await User.findById(req.currentUser.id);
        createdUser.tasksCreated.push(task);
        await createdUser.save();
        if (args.taskInput.assignedTo) {
          const assignedUser = await User.findById(args.taskInput.assignedTo);
          assignedUser.tasksAssigned.push(task);
          await assignedUser.save();
        }
        return saveTask;
      } else {
        throw new Error(topicArchivedError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  updateTask: async (args, req) => {
    let saveTask;
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const task = await Task.findById(args.taskInput._id);
      if (
        req.currentUser.id == task.userId.toString() ||
        req.currentUser.isModerator
      ) {
        if (task.attachedMessage == undefined) {
          task.description = args.taskInput.description;
          task.deadline = args.taskInput.deadline;
          saveTask = await task.save();
        } else {
          const message = await Message.findById(task.attachedMessage);
          message.description = args.taskInput.description;
          const saveMessage = await message.save();
          task.deadline = args.taskInput.deadline;
          saveTask = await task.save();
          saveTask.description = saveMessage.description;
          saveTask.parentTopic = saveMessage.parentTopic;
        }
        return saveTask;
      } else {
        throw new Error(noAuthorizationError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  deleteTask: async (args, req) => {
    let parentTopic;
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const task = await Task.findById(args.taskFindInput._id);
      if (
        req.currentUser.id == task.userId.toString() ||
        req.currentUser.isModerator
      ) {
        await task.remove();
        const createdUser = await User.findById(req.currentUser.id);
        createdUser.tasksCreated = createdUser.tasksCreated.filter(
          (taskId) => taskId.toString() != args.taskFindInput._id
        );
        await createdUser.save();
        if (task.assignedTo) {
          const assignedUser = await User.findById(task.assignedTo);
          assignedUser.tasksAssigned = assignedUser.tasksAssigned.filter(
            (taskId) => taskId.toString() != args.taskFindInput._id
          );
          await assignedUser.save();
        }
        if (task.attachedMessage) {
          const message = await Message.findById(task.attachedMessage);
          message.isTasked = false;
          await message.save();
          parentTopic = await Topic.findById(message.parentTopic);
          parentTopic.tasks = parentTopic.tasks.filter(
            (taskId) => taskId.toString() != args.taskFindInput._id
          );
        } else {
          parentTopic = await Topic.findById(task.parentTopic);
          parentTopic.tasks = parentTopic.tasks.filter(
            (taskId) => taskId.toString() != args.taskFindInput._id
          );
        }
        await parentTopic.save();
        return { result: taskDeleteResult };
      } else {
        throw new Error(noAuthorizationError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  completeTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error(authenticationError);
    }
    if (req.currentUser.isBlocked || req.currentUser.isRemoved) {
      throw new Error(noAuthorizationError);
    }
    try {
      const task = await Task.findById(args.taskFindInput._id);
      if (
        req.currentUser.id == task.userId.toString() ||
        req.currentUser.id == task.assignedTo.toString() ||
        req.currentUser.isModerator
      ) {
        task.isCompleted = true;
        await task.save();
        return { result: taskCompleteResult };
      } else {
        throw new Error(noAuthorizationError);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  getTask: async (args) => {
    try {
      const task = await Task.findById(args.taskFindInput._id).lean();
      if(task.attachedMessage != undefined) {
        const message = await Message.findById(task.attachedMessage).lean();
        task.description = message.description;
        task.parentTopic = message.parentTopic;
      }
      return task;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
