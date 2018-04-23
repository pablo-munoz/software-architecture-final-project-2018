const _ = require('lodash');

const constants = require('./constants');

module.exports = (options) => {
  const persistence = require('./persistence')({
    databaseFile: process.env.DEBUG ? constants.TEST_DATABASE_FILE : constants.PRODUCTION_DATABASE_FILE 
  });

  const getHabitScoreCategory = (score) => {
    if (score < 0) {
      return 'red';
    } else if (0 <= score && score < 10) {
      return 'orange';
    } else if (10 <= score && score < 40) {
      return 'yellow';
    } else if (40 <= score && score < 50) {
      return 'green';
    } else if (50 <= score) {
      return 'blue';
    }
  }

  const updateHabitScore = (habit, kind, callback) => {
    const scoreDelta = constants.HABIT_SCORES_BY_DIFFICULTY[habit.difficulty];
    const scoreCategory = getHabitScoreCategory(habit.score);
    if (kind == 'good') {
      if (scoreCategory == 'green') {
        habit.score += scoreDelta/2;
      } else if (scoreCategory == 'blue') {
        habit.score += 1;
      } else {
        habit.score += scoreDelta;
      }
    } else {
      if (scoreCategory == 'orange') {
        habit.score -= scoreDelta*1.5;
      } else if (scoreCategory == 'red') {
        habit.score -= scoreDelta*2;
      } else {
        habit.score -= scoreDelta;
      }
    }

    persistence.updateHabit(habit.id, habit, callback);
  }

  const doHabit = (habitId, kind, callback) => {
    persistence.getHabit(habitId, (err, habit) => {
      updateHabitScore(habit, kind ? kind : habit.kind, callback);
    });
  }

  const createHabit = (newHabitData, callback) => {
    if (!_.every(['kind', 'difficulty', 'score', 'name', 'account'],
                 _.partial(_.has, newHabitData, _))) {
      callback({
        message: "Missing some attribute of ['kind', 'difficulty', 'score', 'name', 'account']"
      }, null);
      return;
    }

    persistence.insertHabit(newHabitData, callback);
  }

  const listHabits = (searchCriteria, callback) => {
    persistence.listHabits(searchCriteria, callback);
  }

  const getHabit = (habitId, callback) => {
    persistence.getHabit(habitId, callback);
  };

  const updateHabit = (id, newHabitData, callback) => {
    persistence.updateHabit(id, newHabitData, callback);
  }

  const deleteHabit = (id, callback) => {
    persistence.deleteHabit(id, callback);
  }

  return {
    createHabit,
    updateHabitScore,
    getHabit,
    listHabits,
    updateHabit,
    deleteHabit,
    doHabit,
  }
};
