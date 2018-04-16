const fs = require('fs');
const _ = require('lodash');
const http = require('http');

const HABITS_HOST = process.env.PRODUCTION ? 'habits' : 'localhost';
const TASKS_HOST = process.env.PRODUCTION ? 'tasks' : 'localhost';

const formatDate = (date) => {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

const aggregateHabits = () => {
  return new Promise((fulfill, reject) => {
    const req = http.request({
      host: HABITS_HOST,
      port: '8082',
      path: '/habits',
      method: 'GET',
    }, (res) => {
      res.on('error', (e) => reject(e));

      res.on('data', (d) => {
        const habitsData = JSON.parse(d);

        let maxScore = -Infinity;
        let maxHabit = null;
        let minScore = Infinity;
        let minHabit = null;
        let habitCategoryCount = {
          red: 0,
          orange: 0,
          yellow: 0,
          green: 0,
          blue: 0
        };

        _.forEach(habitsData, (habit) => {
          const score = habit.score;

          if (score > maxScore) {
            maxScore = score;
            maxHabit = habit;
          }

          if (score < minScore) {
            minScore = score;
            minHabit = habit;
          }

          if (score < 0) {
            habitCategoryCount['red'] += 1;
          } else if (0 <= score && score < 10) {
            habitCategoryCount['orange'] += 1;
          } else if (10 <= score && score < 40) {
            habitCategoryCount['yellow'] += 1;
          } else if (40 <= score && score < 50) {
            habitCategoryCount['green'] += 1;
          } else if (50 <= score) {
            habitCategoryCount['blue'] += 1;
          }
        });

        fulfill({
          maxHabit,
          minHabit,
          habitCategoryCount
        });
      });

    });

    req.end();
  });
}

const aggregateTasks = () => {
  return new Promise((fulfill, reject) => {
    const req = http.request({
      host: TASKS_HOST,
      port: '8083',
      path: '/tasks',
      method: 'GET',
    }, (res) => {
      res.on('error', (e) => reject(e));

      const tasksReport = {
        completedTask: {
          total: 0,
          beforeDueDate: 0,
          afterDueDate: 0
        },
        delayedTask: 0,
        availableTask: {
          total: 0,
          toBeDoneToday: 0
        }
      };

      res.on('data', (d) => {
        const today = formatDate(new Date());

        const tasksData = JSON.parse(d.toString());
        _.forEach(tasksData, (task) => {
          if (!task.done_date) {
            tasksReport.availableTask.total += 1;
            if (task.due_date == today) {
              tasksReport.availableTask.toBeDoneToday += 1;
            } else if (task.due_date < today) {
              tasksReport.delayedTask += 1;
            }
          } else {
            tasksReport.completedTask.total += 1;

            if (task.done_date <= task.due_date) {
              tasksReport.completedTask.beforeDueDate += 1;
            } else {
              tasksReport.completedTask.afterDueDate += 1;
            }
          }
        });

        fulfill(tasksReport);
      });

    });

    req.end();
  });
}

const makeAdminReport = () => {
  let report = {
    habitsReport: {},
    tasksReport: {},
  };

  aggregateHabits()
    .then((habitsReport) => {
      report.habitsReport = habitsReport;
      return aggregateTasks();
    })
    .then((tasksReport) => {
      report.tasksReport = tasksReport;
      fs.writeFileSync('report.json', JSON.stringify(report), 'utf8');
    });
}

module.exports = {
  makeAdminReport
};
