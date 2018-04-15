const _ = require('lodash');
const sqlite3 = require('sqlite3');

module.exports = function(options) {
  _.defaults(options, {
    databaseFile: 'db.db'
  });

  let db = new sqlite3.Database(
    options.databaseFile, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
    });

  const listTasks = (searchCriteria, callback) => {
    let sql = `SELECT * FROM task`;

    if (searchCriteria) {
      sql += ` WHERE account = $account`;
    }

    sql += `;`;

    db.all(sql, _.mapKeys(searchCriteria, (v, k) => '$'+k), callback);
  }

  const getTask = (id, callback) => {
    const sql = `SELECT * FROM task WHERE id = ?`;
    db.all(sql, [id], (err, rows) => {
      if (err) return callback(err, rows);
      if (rows.length !== 1) {
        return callback({ message: "No tasks with given id" } , undefined); 
      }
      return callback(err, rows[0]);
    });
  }

  const insertTask = (newTaskData, callback) => {
    const sql = `INSERT INTO task (title, description, due_date, reminder_days, reminder_time, account)
VALUES (?, ?, ?, ?, ?, ?);`;

    const params = _.map(['title', 'description', 'due_date', 'reminder_days', 'reminder_time', 'account'],
                         (attr) => newTaskData[attr]);

    db.run(sql, params, function(err, rows) {
      db.all(`SELECT * FROM task WHERE id = ?;`, [this.lastID], (err, rows) => {
        if (err) return callback(err, rows);
        else return callback(err, rows[0]);
      });
    });
  }

  const updateTask = (id, newTaskData, callback) => {
    const sql = `UPDATE task SET title = $title, description = $description, due_date = $due_date, done_date = $done_date, reminder_days = $reminder_days, reminder_time = $reminder_time, account = $account WHERE id = $id;`;


    db.run(sql, _.mapKeys(_.extend(newTaskData, { id }), (v, k) => '$'+k),
           (err) => {
             db.all(`SELECT * FROM task WHERE id = ?;`, id, (err, rows) => {
               if (err) return callback(err, rows);
               return callback(err, rows[0]);
             });
    });
  }

  const deleteTask = function(id, callback) {
    const sql = `DELETE FROM task WHERE id = ?`;

    db.all(sql, [id], callback);
  }

  return {
    listTasks,
    getTask,
    insertTask,
    updateTask,
    deleteTask,
  }
}
