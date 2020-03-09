'use strict';

module.exports = {
  query: query,
};

const Pool = require('pg').Pool;

let pool = null;

/**
 * Create the connection to the db
 */
function initConnection(testMode) {
  pool = new Pool({
    user: 'root',
    host: 'localhost',
    database: global.testMode ? 'pwd_manager_test' : 'pwd_manager',
    password: 'password',
    port: 5432,
  });
}


/**
 * executes the specified sql query and provides a callback which is given
 * with the results in a DataResponseObject
 *
 * @param queryString
 * @param callback - takes a DataResponseObject
 */
function query(queryString, callback) {
  // init the connection object.
  initConnection(global.testMode);

  // execute the query and collect the results in the callback
  pool.query(queryString, (error, results) => {
    // send the response in the callback
    callback(createDataResponseObject(error, results === undefined ? null : results === null ? null : results.rows));
  });
}

/**
 * creates and returns a DataResponseObject made out of the specified parameters.
 * A DataResponseObject has two variables. An error which is a boolean and the results of the query.
 *
 * @param error
 * @param results
 * @return {DataResponseObject<{error, results}>}
 */
function createDataResponseObject(error, results) {
  return {
    error: error === undefined ? null : error === null ? null : error,
    results: results === undefined ? null : results === null ? null : results,
  };
}
