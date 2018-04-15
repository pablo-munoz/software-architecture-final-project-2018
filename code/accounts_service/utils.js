const _ = require('lodash');

module.exports = {
  isValidAccountData: function(accountData) {
    return _.every(['email', 'name'], _.partial(_.has, accountData));
  }
};
