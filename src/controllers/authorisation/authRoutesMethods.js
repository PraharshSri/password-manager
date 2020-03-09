'use strict';

let userDBHelper;

module.exports = (injectedUserDBHelper) => {
  userDBHelper = injectedUserDBHelper;

  return {
    registerUser: registerUser,
    login: login,
  };
};

/* handles the api call to register the user and insert them into the users table.
  The req body should contain a username and password. */
function registerUser(req, res) {
  // query db to see if the user exists already
  userDBHelper.doesUserExist(req.body.username, (sqlError, doesUserExist) => {
    // check if the user exists
    if (sqlError !== null || doesUserExist) {
      const message = sqlError !== null ? 'Operation unsuccessful' : 'User already exists';
      const error = sqlError !== null ? sqlError : 'User already exists';
      sendResponse(res, message, error);
      return;
    }

    userDBHelper.registerUserInDB(req.body.username, req.body.password, (dataResponseObject) => {
      const message = dataResponseObject.error === null ? 'Registration was successful' : 'Failed to register user';
      sendResponse(res, message, dataResponseObject.error);
    });
  });
}

function login(registerUserQuery, res) {
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
