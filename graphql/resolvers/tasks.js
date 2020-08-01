const Task = require("../../models/task");
const moment = require("moment");

module.exports = {
  tasks: async (args) => {
    try {
      let tasks = await Task.find({ userId: args.userId }).populate(
        "assignedBy"
      );
      return tasks.map((result) => {
        return {
          ...result._doc,
          date: moment(result._doc.date).format("ll"),
          dueDate: moment(result._doc.dueDate).format("ll"),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createTasks: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Not Authenticated!");
    }
    try {
      console.log(args);
      let dueDateMoment = moment(args.TasksInput.dueDate, "YYYY-MM-DD");
      let task = new Task({
        description: args.TasksInput.description,
        completed: args.TasksInput.completed,
        assignedBy: args.TasksInput.assignedBy,
        topicId: args.TasksInput.topicId,
        userId: args.TasksInput.userId,
        dueDate: dueDateMoment,
      });
      let result = await task.save();
      return { ...result._doc };
    } catch (err) {
      throw err;
    }
  },
};