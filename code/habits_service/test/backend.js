const _ = require('lodash');
const fs = require('fs');
const chai = require('chai');
const sqlite3 = require('sqlite3');
const request = require('supertest');

const should = chai.should();
const expect = chai.expect;

const server = require('../index');
const constants = require('../constants');

describe('Habits service persistence layer', function() {
  const persistence = require('../persistence')({
    databaseFile: constants.TEST_DATABASE_FILE
  });
  
  it('Should be able to retrieve a list of habits for a user', function(done) {
    let machingHabits = [];
    
    persistence.listHabits(
      { account: 'test@test.com' }, (err, rows) => {
        should.not.exist(err);
        _.map(rows, _.partial(_.omit, _, 'id')).should.be.eql(
          [ { kind: 'good',
              difficulty: 'medium',
              score: 0,
              name: 'Practice TDD',
              account: 'test@test.com' },
            { kind: 'good',
              difficulty: 'hard',
              score: 0,
              name: 'Practice design patterns',
              account: 'test@test.com' },
            { kind: 'both',
              difficulty: 'medium',
              score: 0,
              name: 'Play videogames',
              account: 'test@test.com' } ]);

        done();
      });
  });

  it('Should retrieve a single existing habit fo a user', function(done) {
    persistence.getHabit(4, (err, rows) => {
      should.not.exist(err);
      rows.should.be.eql( {
        id: 4,
        kind: 'bad',
        difficulty: 'hard',
        score: 0,
        name: 'Smoking',
        account: 'another@test.com'
      });
      done();
    });
  });
  
  it('Should be able to store a new habit for a user', (done) => {
    let newHabit = undefined;
    
    persistence.insertHabit({
      kind: 'good',
      difficulty: 'easy',
      score: 0,
      name: 'Test my code',
      account: 'another@test.com'
    }, (err, row) => {
      should.not.exist(err);
      _.omit(row, 'id').should.be.eql({ kind: 'good',
                                           difficulty: 'easy',
                                           score: 0,
                                           name: 'Test my code',
                                           account: 'another@test.com'});
      done();
    });
  });
  
  it('Should be able to update an existing habit for a user', (done) => {
    let oldHabit = {
      kind: 'good',
      difficulty: 'hard',
      score: 0,
      name: 'go for a run',
      account: 'another@test.com'
    };
    
    let updatedHabit = {
      kind: 'bad',
      difficulty: 'easy',
      score: 5,
      name: 'GO FOR A RUN',
      account: 'another@test.com'
    };
    
    persistence.updateHabit(5, updatedHabit, (err, rows) => {
      should.not.exist(err);
      rows.should.be.eql(
        _.extend(updatedHabit, { id: 5 })
      );

      persistence.updateHabit(5, oldHabit, (err, rows) => {
        should.not.exist(err);
        rows.should.be.eql(
          _.extend(oldHabit, { id: 5 })
        );
        done();
      });
    });
  });
  
  it('Should be able to delete an existing habit for a user', (done) => {
    const habitToBeCreatedAndDeleted = {
      kind: 'bad',
      difficulty: 'hard',
      name: 'Be on facebook',
      score: 0,
      account: 'another@test.com'
    };
    
    persistence.insertHabit(habitToBeCreatedAndDeleted, (err, rows) => {
      should.not.exist(err);
      let habitId = rows.id;
      
      persistence.deleteHabit(habitId, (err, rows) => {
        should.not.exist(err);
        done();
      });
    });
    
  });
});


describe('Habits service business layer', () => {
  const business = require('../business.js')();

  it('createHabit should barf on missing attributes', (done) => {
    business.createHabit({}, (err, rows) => {
      should.exist(err);
      should.not.exist(rows);
      done();
    });
  });

  it('createHabit should create a habit given the proper data', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': 0,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      should.not.exist(err);
      _.omit(habit, 'id').should.be.eql({
        'kind': 'good',
        'difficulty': 'medium',
        'score': 0,
        'name': 'Do homework',
        'account': 'another@test.com'
      });
      done();
    });
  });

  it('should properly do a good red habit', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': -1,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'good', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(2.0);
        done();
      });
    })
  });

  it('should properly do a good orange habit', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': 0,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'good', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(3.0);
        done();
      });
    })
  });

  it('should properly do a good yellow habit', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': 10,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'good', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(13.0);
        done();
      });
    })
  });

  it('should properly do a good green habit', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': 40,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'good', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(41.5);
        done();
      });
    })
  });

  it('should properly do a good blue habit', (done) => {
    business.createHabit({
      'kind': 'good',
      'difficulty': 'medium',
      'score': 50,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'good', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(51.0);
        done();
      });
    })
  });

  it('should properly do a bad red habit', (done) => {
    business.createHabit({
      'kind': 'bad',
      'difficulty': 'medium',
      'score': -1,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'bad', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(-7.0);
        done();
      });
    })
  });

  it('should properly do a bad orange habit', (done) => {
    business.createHabit({
      'kind': 'bad',
      'difficulty': 'medium',
      'score': 0,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'bad', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(-4.5);
        done();
      });
    })
  });

  it('should properly do a bad yellow habit', (done) => {
    business.createHabit({
      'kind': 'bad',
      'difficulty': 'medium',
      'score': 10,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'bad', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(7.0);
        done();
      });
    })
  });

  it('should properly do a bad green habit', (done) => {
    business.createHabit({
      'kind': 'bad',
      'difficulty': 'medium',
      'score': 40,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'bad', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(37.0);
        done();
      });
    })
  });

  it('should properly do a bad blue habit', (done) => {
    business.createHabit({
      'kind': 'bad',
      'difficulty': 'medium',
      'score': 50,
      'name': 'Do homework',
      'account': 'another@test.com'
    }, (err, habit) => {
      business.updateHabitScore(habit, 'bad', (err, scoredHabit) => {
        expect(scoredHabit.score).to.be.equal(47.0);
        done();
      });
    })
  });

  it('should retrieve the habits of a user', (done) => {
    business.listHabits(
      { account: 'test@test.com' }, (err, habits) => {
        should.not.exist(err);
        _.map(habits, _.partial(_.omit, _, 'id')).should.be.eql(
          [ { kind: 'good',
              difficulty: 'medium',
              score: 0,
              name: 'Practice TDD',
              account: 'test@test.com' },
            { kind: 'good',
              difficulty: 'hard',
              score: 0,
              name: 'Practice design patterns',
              account: 'test@test.com' },
            { kind: 'both',
              difficulty: 'medium',
              score: 0,
              name: 'Play videogames',
              account: 'test@test.com' } ]);

        done();
      });
  });

  it('should retrive all the habits of all users', (done) => {
    business.listHabits(undefined, (err,  habits) => {
      expect(habits.length).to.be.at.least(5);
      done();
    });
  });

  it('should be able to update an existing habit for a user', (done) => {
    let oldHabit = {
      kind: 'good',
      difficulty: 'hard',
      score: 0,
      name: 'go for a run',
      account: 'another@test.com'
    };
    
    let updatedHabit = {
      kind: 'bad',
      difficulty: 'easy',
      score: 5,
      name: 'GO FOR A RUN',
      account: 'another@test.com'
    };
    
    business.updateHabit(5, updatedHabit, (err, rows) => {
      should.not.exist(err);
      rows.should.be.eql(
        _.extend(updatedHabit, { id: 5 })
      );

      business.updateHabit(5, oldHabit, (err, rows) => {
        should.not.exist(err);
        rows.should.be.eql(
          _.extend(oldHabit, { id: 5 })
        );
        done();
      });
    });
  });

  it('should be able to delete an existing habit for a user', (done) => {
    const habitToBeCreatedAndDeleted = {
      kind: 'bad',
      difficulty: 'hard',
      name: 'Be on facebook',
      score: 0,
      account: 'another@test.com'
    };
    
    business.createHabit(habitToBeCreatedAndDeleted, (err, rows) => {
      should.not.exist(err);
      let habitId = rows.id;
      
      business.deleteHabit(habitId, (err, rows) => {
        should.not.exist(err);
        done();
      });
    });
    
  });

});


describe('Accounts service api', function() {
  it('GET /habits with no criteria should return all accounts', function(done) {
    request(server)
      .get('/habits')
      .end(function(err, res) {
        expect(res.body.length).to.be.at.least(5);
        done();
      });
  });

  it('GET /habits with criteria should return some accounts', function(done) {
    request(server)
      .get('/habits')
      .send({
        account: 'test@test.com'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.length).to.be.equal(3);
        done();
      });
  });

  it('POST /habits create a new habit', function(done) {
    request(server)
      .post('/habits')
      .send({
        "kind": "bad",
        "difficulty": "medium",
        "name": "sleeping in class",
        "score": 0,
        "account": "another@test.com"
      })
      .end(function(err, res) {
        _.omit(res.body, 'id').should.be.eql({
          "kind": "bad",
          "difficulty": "medium",
          "name": "sleeping in class",
          "score": 0,
          "account": "another@test.com"
        });
        done();
      });
  });

});
