const _ = require('lodash');
const fs = require('fs');
const chai = require('chai');
const sqlite3 = require('sqlite3');
const request = require('supertest');

const should = chai.should();
const expect = chai.expect;

const server = require('../index');
const constants = require('../constants');

describe('Tasks service persistence layer', function() {
  const persistence = require('../persistence')({
    databaseFile: constants.TEST_DATABASE_FILE
  });
  
  it('Should be able to retrieve a list of tasks for a user', function(done) {
    let machingTasks = [];
    
    persistence.listTasks(
      { account: 'test@test.com' }, (err, rows) => {
        should.not.exist(err);
        _.map(rows, _.partial(_.omit, _, 'id')).should.be.eql(
          [ { title: 'Doctors appointment',
              description: 'Get my eyes checked',
              due_date: '2018-04-29',
              done_date: null,
              reminder_days: 1,
              reminder_time: '17:00:00',
              account: 'test@test.com' },
            { title: 'Vaccinate dog',
              description: 'Take the little one to the vet',
              due_date: '2018-04-25',
              done_date: null,
              reminder_days: 2,
              reminder_time: '09:00:00',
              account: 'test@test.com' },
            { title: 'Go to the airport',
              description: 'Pick up father from airport',
              due_date: '2018-04-20',
              done_date: null,
              reminder_days: 0,
              reminder_time: '12:00:00',
              account: 'test@test.com' } ]);

        done();
      });
  });

  it('Should retrieve a single existing task fo a user', function(done) {
    persistence.getTask(1, (err, row) => {
      should.not.exist(err);
      _.omit(row, 'id').should.be.eql({
        title: 'Doctors appointment',
        description: 'Get my eyes checked',
        due_date: '2018-04-29',
        done_date: null,
        reminder_days: 1,
        reminder_time: '17:00:00',
        account: 'test@test.com' });
      done();
    });
  });
  
  it('Should be able to store a new task for a user', (done) => {
    let newTask = undefined;
    
    persistence.insertTask({
      title: 'Pay credit card',
      description: 'Pay Santander credit card online',
      due_date: '2018-04-23',
      done_date: null,
      reminder_days: 2,
      reminder_time: '11:00:00',
      account: 'another@test.com'
    }, (err, row) => {
      should.not.exist(err);
      _.omit(row, 'id').should.be.eql({
        title: 'Pay credit card',
        description: 'Pay Santander credit card online',
        due_date: '2018-04-23',
        done_date: null,
        reminder_days: 2,
        reminder_time: '11:00:00',
        account: 'another@test.com'
      });
      done();
    });
  });
  
  it('Should be able to update an existing task for a user', (done) => {
    let oldTask = {
      title: 'Vacations',
      description: 'Go to disney world',
      due_date: '2018-05-10',
      done_date: null,
      reminder_days: 2,
      reminder_time: '07:00:00',
      account: 'another@test.com'
    };
    
    let updatedTask = {
      title: 'VACATIONS',
      description: 'GO TO DISNEY WORLD',
      due_date: '2018-05-10',
      done_date: null,
      reminder_days: 2,
      reminder_time: '07:00:00',
      account: 'another@test.com'
    };
    
    persistence.updateTask(4, updatedTask, (err, rows) => {
      should.not.exist(err);
      rows.should.be.eql(
        _.extend(updatedTask, { id: 4 })
      );

      persistence.updateTask(4, oldTask, (err, rows) => {
        should.not.exist(err);
        rows.should.be.eql(
          _.extend(oldTask, { id: 4 })
        );
        done();
      });
    });
  });
  
  it('Should be able to delete an existing task for a user', (done) => {
    const taskToBeCreatedAndDeleted = {
      title: 'Software Arch Final Project',
      description: 'Uploat to Schoology',
      due_date: '2018-04-23',
      done_date: null,
      reminder_days: 1,
      reminder_time: '10:00:00',
      account: 'another@test.com'
    };
    
    persistence.insertTask(taskToBeCreatedAndDeleted, (err, rows) => {
      should.not.exist(err);
      let taskId = rows.id;
      
      persistence.deleteTask(taskId, (err, rows) => {
        should.not.exist(err);
        done();
      });
    });
    
  });
});


describe('Tasks service business layer', () => {
  const business = require('../business.js')();
  
  it('createTask should barf on missing attributes', (done) => {
    business.createTask({}, (err, rows) => {
      should.exist(err);
      should.not.exist(rows);
      done();
    });
  });
  
  it('createTask should create a task given the proper data', (done) => {
    business.createTask({
      title: 'Software Arch Final Project',
      description: 'Uploat to Schoology',
      due_date: '2018-04-23',
      done_date: null,
      reminder_days: 1,
      reminder_time: '10:00:00',
      account: 'another@test.com'
    }, (err, task) => {
      should.not.exist(err);
      _.omit(task, 'id').should.be.eql({
        title: 'Software Arch Final Project',
        description: 'Uploat to Schoology',
        due_date: '2018-04-23',
        done_date: null,
        reminder_days: 1,
        reminder_time: '10:00:00',
        account: 'another@test.com'
      });
      done();
    });
  });
  
 
  it('should retrieve the tasks of a user', (done) => {
    business.listTasks(
      { account: 'test@test.com' }, (err, tasks) => {
        should.not.exist(err);
        _.map(tasks, _.partial(_.omit, _, 'id')).should.be.eql(
          [ { title: 'Doctors appointment',
              description: 'Get my eyes checked',
              due_date: '2018-04-29',
              done_date: null,
              reminder_days: 1,
              reminder_time: '17:00:00',
              account: 'test@test.com' },
            { title: 'Vaccinate dog',
              description: 'Take the little one to the vet',
              due_date: '2018-04-25',
              done_date: null,
              reminder_days: 2,
              reminder_time: '09:00:00',
              account: 'test@test.com' },
            { title: 'Go to the airport',
              description: 'Pick up father from airport',
              due_date: '2018-04-20',
              done_date: null,
              reminder_days: 0,
              reminder_time: '12:00:00',
              account: 'test@test.com' } ]);
        
        done();
      });
  });
  
  it('should retrive all the tasks of all users', (done) => {
    business.listTasks(undefined, (err,  tasks) => {
      expect(tasks.length).to.be.at.least(5);
      done();
    });
  });
  
  it('should be able to update an existing task for a user', (done) => {
    let oldTask = {
      title: 'Pick up passport',
      description: 'Go for it',
      due_date: '2018-05-06',
      done_date: null,
      reminder_days: 0,
      reminder_time: '12:00:00',
      account: 'another@test.com'
    };
    
    let updatedTask = {
      title: 'Pick up passport',
      description: 'Go for it',
      due_date: '2018-05-06',
      done_date: null,
      reminder_days: 0,
      reminder_time: '12:00:00',
      account: 'another@test.com'
    };
    
    business.updateTask(5, updatedTask, (err, rows) => {
      should.not.exist(err);
      rows.should.be.eql(
        _.extend(updatedTask, { id: 5 })
      );
      
      business.updateTask(5, oldTask, (err, rows) => {
        should.not.exist(err);
        rows.should.be.eql(
          _.extend(oldTask, { id: 5 })
        );
        done();
      });
    });
  });
  
  it('should be able to delete an existing task for a user', (done) => {
    const taskToBeCreatedAndDeleted = {
      title: 'This should have been deleted',
      description: 'Go for it',
      due_date: '2018-05-06',
      done_date: null,
      reminder_days: 0,
      reminder_time: '12:00:00',
      account: 'another@test.com'
    };
    
    business.createTask(taskToBeCreatedAndDeleted, (err, rows) => {
      should.not.exist(err);
      let taskId = rows.id;
      
      business.deleteTask(taskId, (err, rows) => {
        should.not.exist(err);
        done();
      });
    });
  });

  it('should set the done_date to today when doing a task', (done) => {
    const taskToBeCreatedAndDeleted = {
      title: 'done_date should be today',
      description: 'Go for it',
      due_date: '2018-05-06',
      done_date: null,
      reminder_days: 0,
      reminder_time: '12:00:00',
      account: 'another@test.com'
    };
    
    business.createTask(taskToBeCreatedAndDeleted, (err, rows) => {
      should.not.exist(err);
      let taskId = rows.id;
      
      business.doTask(taskId, (err, rows) => {
        _.omit(rows, 'id').should.be.eql({
          title: 'done_date should be today',
          description: 'Go for it',
          due_date: '2018-05-06',
          done_date: business.formatDate(new Date()),
          reminder_days: 0,
          reminder_time: '12:00:00',
          account: 'another@test.com'
        });

        done();
      });
    });
  });
  
});


describe('Accounts service api', function() {
  const business = require('../business.js')();

  it('GET /tasks with no criteria should return all accounts', function(done) {
    request(server)
      .get('/tasks')
      .end(function(err, res) {
        expect(res.body.length).to.be.at.least(5);
        done();
      });
  });
  
  it('GET /tasks with criteria should return some accounts', function(done) {
    request(server)
      .get('/tasks')
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
  
  it('POST /tasks create a new task', function(done) {
    request(server)
      .post('/tasks')
      .send({
        "title": "Use mocha to test api",
        "description": "Run npm test",
        "due_date": business.formatDate(new Date()),
        "reminder_days": 0,
        "reminder_time": "08:00:00",
        "account": "another@test.com",
      })
      .end(function(err, res) {
        _.omit(res.body, 'id').should.be.eql({
          "title": "Use mocha to test api",
          "description": "Run npm test",
          "due_date": business.formatDate(new Date()),
          "done_date": null,
          "reminder_days": 0,
          "reminder_time": "08:00:00",
        "account": "another@test.com",
        });
        done();
      });
  });
  
});
