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

  const listHabits = (searchCriteria, callback) => {
    let sql = `SELECT * FROM habit`;

    if (searchCriteria) {
      sql += ` WHERE account = $account`;
    }

    sql += `;`;

    db.all(sql, _.mapKeys(searchCriteria, (v, k) => '$'+k), callback);
  }

  const getHabit = (id, callback) => {
    const sql = `SELECT * FROM habit WHERE id = ?`;
    db.all(sql, [id], (err, rows) => {
      if (err) return callback(err, rows);
      if (rows.length !== 1) {
        return callback({ message: "No habits with given id" } , undefined); 
      }
      return callback(err, rows[0]);
    });
  }

  const insertHabit = (newHabitData, callback) => {
    const sql = `INSERT INTO habit (kind, difficulty, score, name, account)
VALUES (?, ?, ?, ?, ?);`;

    const params = _.map(['kind', 'difficulty', 'score', 'name', 'account'],
                         (attr) => newHabitData[attr]);

    db.run(sql, params, function(err, rows) {
      db.all(`SELECT * FROM habit WHERE id = ?;`, [this.lastID], (err, rows) => {
        if (err) return callback(err, rows);
        else return callback(err, rows[0]);
      });
    });
  }

  const updateHabit = (id, newHabitData, callback) => {
    const sql = `UPDATE habit SET kind = $kind, difficulty = $difficulty, score = $score, name = $name, account = $account WHERE id = $id;`

    db.run(sql, _.mapKeys(_.extend(newHabitData, { id }), (v, k) => '$'+k),
           (err) => {
             db.all(`SELECT * FROM habit WHERE id = ?;`, id, (err, rows) => {
               if (err) return callback(err, rows);
               return callback(err, rows[0]);
             });
    });
  }

  const deleteHabit = function(id, callback) {
    const sql = `DELETE FROM habit WHERE id = ?`;

    db.all(sql, [id], callback);
  }

  return {
    listHabits,
    getHabit,
    insertHabit,
    updateHabit,
    deleteHabit,
  }
}
