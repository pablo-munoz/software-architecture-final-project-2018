module.exports = {
  invalidAccountData: {
    code: 1,
    message: 'Invalid account data, check email and name properties'
  },
  databaseUnaccesible: {
    code: 2,
    message: 'Cannot access database'
  },
  emailInUse: {
    code: 3,
    message: 'An account already exists with that email'
  },
  accountSearchMissingEmail: {
    code: 4,
    message: 'An account search was executed without a given email'
  }
};
