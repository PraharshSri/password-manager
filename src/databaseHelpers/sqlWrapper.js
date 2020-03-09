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
    user: 'knsmlfdzegimwh',
    host: 'ec2-54-80-184-43.compute-1.amazonaws.com',
    database: global.testMode ? 'd5o5c8gsgr4kg6' : 'd5o5c8gsgr4kg6',
    password: '00076fafea8e985adda50b5b83dd483a68e8ab7d94744e6c3d8463ae8fc63405',
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
