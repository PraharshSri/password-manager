'use strict';

let sqlConnection;

module.exports = (injectedSqlConnection) => {
  sqlConnection = injectedSqlConnection;

  return {

    registerUserInDB: registerUserInDB,
    getUserFromCrentials: getUserFromCrentials,
    doesUserExist: doesUserExist,
  };
};

/**
 * attempts to register a user in the DB with the specified details.
 *
 * @param username
 * @param password
 * @param registrationCallback - takes a DataResponseObject
 */
function registerUserInDB(username, password, registrationCallback) {
  const registerUserQuery = `INSERT INTO users (email_id, password) VALUES ('${username}', ENCODE(DIGEST('${password}','sha1'),'hex'))`;

  // execute the query to register the user
  sqlConnection.query(registerUserQuery, registrationCallback);
}

/**
 * Gets the user with the specified username and password.
 *
 * @param username
 * @param password
 * @param callback - takes an error and a user object
 */
function getUserFromCrentials(username, password, callback) {
  const getUserQuery = `SELECT * FROM users WHERE email_id = '${username}' AND password = ENCODE(DIGEST('${password}','sha1'),'hex')`;

  sqlConnection.query(getUserQuery, (dataResponseObject) => {
    callback(false, dataResponseObject.results !== null && dataResponseObject.results.length === 1 ? dataResponseObject.results[0] : null);
  });
}

/**
 * Determines whether or not user with the specified userName exists.
 *
 * @param username
 * @param callback - takes an error and a boolean value indicating
 *                   whether a user exists
 */
function doesUserExist(username, callback) {
  const doesUserExistQuery = `SELECT * FROM users WHERE email_id = '${username}'`;

  sqlConnection.query(doesUserExistQuery, (dataResponseObject) => {
    const doesUserExist = dataResponseObject.results !== null ? dataResponseObject.results.length > 0 : null;

    callback(dataResponseObject.error, doesUserExist);
  });
}
