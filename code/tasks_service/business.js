const _ = require('lodash');

const constants = require('./constants');

module.exports = (options) => {
  const persistence = require('./persistence')({
    databaseFile: process.env.DEBUG ? constants.TEST_DATABASE_FILE : constants.PRODUCTION_DATABASE_FILE 
  });

  const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  const doTask = (taskId, callback) => {
    persistence.getTask(taskId, (err, task) => {
      task.done_date = formatDate(new Date());
      persistence.updateTask(taskId, task, callback);
    });
  }

  const createTask = (newTaskData, callback) => {
    if (!_.every(['title', 'description', 'due_date', 'reminder_days', 'reminder_time', 'account'],
                 _.partial(_.has, newTaskData, _))) {
      callback({
        message: "Missing some attribute of ['kind', 'difficulty', 'score', 'name', 'account']"
      }, null);
      return;
    }

    persistence.insertTask(newTaskData, callback);
  }

  const listTasks = (searchCriteria, callback) => {
    persistence.listTasks(searchCriteria, callback);
  }

  const updateTask = (id, newTaskData, callback) => {
    persistence.updateTask(id, newTaskData, callback);
  }

  const deleteTask = (id, callback) => {
    persistence.deleteTask(id, callback);
  }

  return {
    formatDate,
    createTask,
    listTasks,
    updateTask,
    deleteTask,
    doTask,
  }
};
