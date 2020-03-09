'use strict';

let passwordManagerDBHelper;
let accessTokensDBHelper;

const Cryptr = require('cryptr');
const cryptr = new Cryptr('secret_key');

module.exports = (injectedPasswordManagerDBHelper, injectedAccessTokensDBHelper) => {
  passwordManagerDBHelper = injectedPasswordManagerDBHelper;
  accessTokensDBHelper = injectedAccessTokensDBHelper;

  return {
    addPasswordAccount: addPasswordAccount,
    updatePasswordAccount: updatePasswordAccount,
    deletePasswordAccount: deletePasswordAccount,
    getPasswordAccount: getPasswordAccount,
    getPasswordAccounts: getPasswordAccounts,
    searchPasswordAccounts: searchPasswordAccounts,
  };
};

/* handles the api call to add the user account and insert them into table.
  The req body should contain a acccount_name, username and password. */
function addPasswordAccount(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.addUserAccount(userID, req.body.account_name, req.body.username, cryptr.encrypt(req.body.password), (dataResponseObject) => {
      const message = dataResponseObject.error === null ? 'Password data successful added!' : 'Failed to add data!';
      sendResponse(res, message, dataResponseObject.error);
    });
  });
}

/* handles the api call to update the user account.
  The req body should contain a acccount_name, username and password. */
function updatePasswordAccount(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.updateUserAccount(userID, req.body.account_name, req.body.username, cryptr.encrypt(req.body.new_password), (dataResponseObject) => {
      const message = dataResponseObject.error === null ? 'Password data successful updated!' : 'Failed to update data!';
      sendResponse(res, message, dataResponseObject.error);
    });
  });
}

/* handles the api call to delete the user account
  The req body should contain a acccount_name, username. */
function deletePasswordAccount(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.updateUserAccountStatus(userID, req.query.account_name, req.query.username, 0, (dataResponseObject) => {
      const message = dataResponseObject.error === null ? 'Password data successful deleted!' : 'Failed to delete data!';
      sendResponse(res, message, dataResponseObject.error);
    });
  });
}

/* handles the api call to get the user account.
  The req body should contain a acccount_name, username. */
function getPasswordAccount(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.getUserAccount(userID, req.query.account_name, req.query.username, (sqlError, dataResponseObject) => {
      const message = sqlError !== null || dataResponseObject === null ? 'Failed to get data!' : 'Password data successful obtained!';
      if (dataResponseObject !== null) {
        dataResponseObject.password = cryptr.decrypt(dataResponseObject.password);
      }
      sendDataResponse(res, message, sqlError, dataResponseObject);
    });
  });
}

/* handles the api call to get the user accounts.*/
function getPasswordAccounts(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.getAllUserAccounts(userID, req.query.page_size, req.query.page_number, (sqlError, dataResponseObject) => {
      const message = sqlError !== null || dataResponseObject === null ? 'Failed to get data!' : 'Password data successful obtained!';
      if (dataResponseObject !== null) {
        dataResponseObject.forEach((item) => {
          item.password = cryptr.decrypt(item.password);
        });
      }
      sendDataResponse(res, message, sqlError, dataResponseObject);
    });
  });
}

/* handles the api call to get the user accounts.*/
function searchPasswordAccounts(req, res) {
  accessTokensDBHelper.getUserIDFromBearerToken(req.headers.authorization.split(' ')[1], (userID) => {
    passwordManagerDBHelper.searchUserAccounts(userID, req.query.key, (sqlError, dataResponseObject) => {
      const message = sqlError !== null || dataResponseObject === null ? 'Failed to get data!' : 'Password data successful obtained!';
      if (dataResponseObject !== null) {
        dataResponseObject.forEach((item) => {
          item.password = cryptr.decrypt(item.password);
        });
      }
      sendDataResponse(res, message, sqlError, dataResponseObject);
    });
  });
}


// sends a response created out of the specified parameters to the client.
function sendResponse(res, message, error) {
  res
      .status(error !== null ? 400 : 200)
      .json({
        message: message,
        error: error,
      });
}

// sends a data response created out of the specified parameters to the client.
function sendDataResponse(res, message, error, data) {
  res
      .status(error !== null ? 400 : 200)
      .json({
        message: message,
        error: error,
        data: data,
      });
}
