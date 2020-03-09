'use strict';

let sqlConnection;

module.exports = (injectedSqlConnection) => {
  sqlConnection = injectedSqlConnection;

  return {

    addUserAccount: addUserAccount,
    updateUserAccount: updateUserAccount,
    updateUserAccountStatus: updateUserAccountStatus,
    getAllUserAccounts: getAllUserAccounts,
    getUserAccount: getUserAccount,
    searchUserAccounts: searchUserAccounts,
  };
};

/**
 * attempts to save user account in the DB with the specified details.
 *
 * @param userId
 * @param accountName
 * @param username
 * @param password
 * @param registrationCallback - takes a DataResponseObject
 */
function addUserAccount(userId, accountName, username, password, callback) {
  const saveUserAccountQuery = `INSERT INTO user_accounts (user_id, account_name, username, password) VALUES ('${userId}', '${accountName}', '${username}', '${password}')`;

  sqlConnection.query(saveUserAccountQuery, callback);
}

/**
 * attempts to update user account in the DB with the specified details.
 *
 * @param userId
 * @param accountName
 * @param username
 * @param password
 * @param registrationCallback - takes a DataResponseObject
 */
function updateUserAccount(userId, accountName, username, password, callback) {
  const updateUserAccountQuery = `UPDATE user_accounts SET password = '${password}' WHERE user_id = '${userId}' AND account_name = '${accountName}' AND username = '${username}'`;

  sqlConnection.query(updateUserAccountQuery, callback);
}

/**
 * attempts to update user account status in the DB with the specified details.
 *
 * @param userId
 * @param accountName
 * @param username
 * @param isActive
 * @param registrationCallback - takes a DataResponseObject
 */
function updateUserAccountStatus(userId, accountName, username, isActive, callback) {
  const updateUserAccountQuery = `UPDATE user_accounts SET is_active = '${isActive}' WHERE user_id = '${userId}' AND account_name = '${accountName}' AND username = '${username}'`;

  sqlConnection.query(updateUserAccountQuery, callback);
}

/**
 * Gets the user with the specified account_name, username and password.
 * @param userId
 * @param accountName
 * @param username
 * @param callback - takes an error and a user object
 */
function getUserAccount(userId, accountName, username, callback) {
  const getUserAccountQuery = `SELECT * FROM user_accounts WHERE user_id = '${userId}' AND account_name = '${accountName}' AND username = '${username}' AND is_active = 1`;

  sqlConnection.query(getUserAccountQuery, (dataResponseObject) => {
    // pass in the error which may be null and pass the results object which we get the user from if it is not null
    callback(dataResponseObject.error, dataResponseObject.results !== null && dataResponseObject.results.length === 1 ? dataResponseObject.results[0] : null);
  });
}

/**
 * Gets the user with the specified username and password.
 * @param userId
 * @param pageSize
 * @param pageNumber
 * @param callback - takes an error and a user object
 */
function getAllUserAccounts(userId, pageSize, pageNumber, callback) {
  const offset = pageSize * (pageNumber - 1);
  const getUserAccountsQuery = `SELECT * FROM user_accounts WHERE user_id = '${userId}' AND is_active = 1 order by id desc OFFSET ${offset} LIMIT ${pageSize}`;

  sqlConnection.query(getUserAccountsQuery, (dataResponseObject) => {
    // pass in the error which may be null and pass the results object which we get the user from if it is not null
    callback(dataResponseObject.error, dataResponseObject.results !== null && dataResponseObject.results.length > 0 ? dataResponseObject.results : null);
  });
}

/**
 * Gets the user with the specified username and password.
 * @param userId
 * @param searchString
 * @param callback - takes an error and a user object
 */
function searchUserAccounts(userId, searchString, callback) {
  const getUserAccountsQuery = `SELECT * FROM user_accounts WHERE user_id = '${userId}' AND is_active = 1 AND (account_name like '%${searchString}%' OR username like '%${searchString}%')`;

  sqlConnection.query(getUserAccountsQuery, (dataResponseObject) => {
    // pass in the error which may be null and pass the results object which we get the user from if it is not null
    callback(dataResponseObject.error, dataResponseObject.results !== null && dataResponseObject.results.length > 0 ? dataResponseObject.results : null);
  });
}
