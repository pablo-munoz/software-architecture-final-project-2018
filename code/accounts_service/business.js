const _ = require('lodash');
const errors = require('./errors');
const utils = require('./utils');

module.exports = function(options) {
  const persistence = require('./persistence')({
    databaseFile: process.env.DEBUG ? 'test2.db' : 'accounts.db'
  });

  const createAccount = function(accountData) {
    if (!utils.isValidAccountData(accountData)) {
      throw errors.invalidAccountData;
    }

    const emailAlreadyInUse = !!persistence.selectAccount(
      _.pick(accountData, 'email'));

    if (emailAlreadyInUse) {
      throw errors.emailInUse;
    }

    return persistence.insertAccount(accountData);
  }

  const findAccount = function(accountSearch) {
    return persistence.selectAccount(accountSearch);
  }

  return {
    createAccount,
    findAccount
  };
};
