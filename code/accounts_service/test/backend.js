const fs = require('fs');
const chai = require('chai');
const should = chai.should();
const errors = require('../errors');
const expect = chai.expect;
var request = require('supertest');
var server = require('../index');

const TEST_DATABASE_FILE = 'test.db'

describe('Accounts service persistence layer', function() {
  const persistence = require('../persistence.js')({
    databaseFile: TEST_DATABASE_FILE
  });

  fs.writeFileSync(TEST_DATABASE_FILE, '[]');

  it('persistence layer should insert a new user', function() {
    persistence.insertAccount({
      email: 'test@test.com',
      name: 'testuser'
    });
  });

  it('persistence layer should retrieve existing user data given email', function() {
    const account = persistence.selectAccount({
      email: 'test@test.com',
    });
    account.should.be.eql({ email: 'test@test.com', name: 'testuser' });
  });

  it('persistence layer should return null on non-existent account find', function() {
    const account = persistence.selectAccount({
      email: 'notauser@test.com',
    });
    should.not.exist(account);
  });

});

describe('Accounts service business layer', function() {
  const business = require('../business.js')({
    DEBUG: true,
  });

  it('should create a new account', function() {
    const account = business.createAccount({
      email: 'test@test.com',
      name: 'testuser'
    });

    account.should.be.eql({
      email: 'test@test.com',
      name: 'testuser'
    });
  });

  it('should refuse to create an account with an email in use', function() {
    const account = business.createAccount({
      email: 'doubleaccount@test.com',
      name: 'testuser'
    });

    account.should.be.eql({
      email: 'doubleaccount@test.com',
      name: 'testuser'
    });


    try {
      const account2 = business.createAccount({
        email: 'doubleaccount@test.com',
        name: 'testuser'
      });
    } catch(error) {
      error.should.be.eql(errors.emailInUse);
    }
  });

  it('should retrieve the account of an existing user', function() {
    const existingAccount = business.createAccount({
      email: 'existinguser@test.com',
      name: 'existinguser'
    });

    const account = business.findAccount({
      email: 'existinguser@test.com',
      name: 'existinguser'
    });

    account.should.be.eql({
      email: 'existinguser@test.com',
      name: 'existinguser'
    });
  });
  
  fs.writeFileSync('test2.db', '[]');
});

describe('Accounts service api', function() {
  it('POST /accounts/register', function(done) {
    request(server)
      .post('/accounts/register')
      .send({
        email: 'apiuser@test.com',
        name: 'apiuser'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body.should.be.eql({
          email: 'apiuser@test.com',
          name: 'apiuser'
        });
      });

    done();
  });

  it('POST /accounts/login', function(done) {
    request(server)
      .post('/accounts/register')
      .send({
        email: 'existinguser@test.com',
        name: 'existinguser'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body.should.be.eql({
          email: 'existinguser@test.com',
          name: 'existinguser'
        });

        request(server)
          .post('/accounts/login')
          .send({
            email: 'existinguser@test.com',
          })
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            res.body.should.be.eql({
              email: 'existinguser@test.com',
              name: 'existinguser'
            });
          });
      });

    done();
  });
});
