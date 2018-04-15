const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const errors = require('./errors');
const utils = require('./utils');

module.exports = function(options) {
  const { databaseFile } = options;

  const readUserDbase = function() {
    let rawUserDbase = null;

    try {
      rawUserDbase = fs.readFileSync(databaseFile, 'utf8');
    } catch(err) {
      console.error(err);
      throw({
        code: errors.databaseUnaccesible
      });
    }

    let userDbase = null;
    if (rawUserDbase !== null) {
      userDbase = JSON.parse(rawUserDbase);
    }

    return userDbase;
  }

  const saveUserDbase = function(newDbaseContents) {
    try {
      fs.writeFileSync(databaseFile, JSON.stringify(newDbaseContents), 'utf8');
    } catch(err) {
      console.error(err);
      throw({
        code: error_codes.DATABASE_UNACCESSIBLE_ERROR
      });
    }
  }

  const insertAccount = function(accountData) {
    if (!utils.isValidAccountData(accountData)) {
      throw errors.invalidAccountData;
    }

    userDbase = readUserDbase();

    userDbase.push(_.pick(accountData, ['email', 'name']));
    saveUserDbase(userDbase);

    return _.pick(accountData, ['email', 'name']);
  }

  const selectAccount = function(accountSearch) {
    if (_.isUndefined(accountSearch.email)) {
      throw errors.accountSearchMissingEmail;
    }

    userDbase = readUserDbase();

    userData = _.find(userDbase, _.pick(accountSearch, 'email'));
    return userData;
  }

  return {
    insertAccount,
    selectAccount,
  };

};
