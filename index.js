'use strict';

const port = 8014;
const morgan = require('morgan');
const winston = require('./src/logger/winston');
const sqlConnection = require('./src/databaseHelpers/sqlWrapper');
const accessTokenDBHelper = require('./src/databaseHelpers/accessTokensDBHelper')(sqlConnection);
const userDBHelper = require('./src/databaseHelpers/userDBHelper')(sqlConnection);
const passwordManagerDBHelper = require('./src/databaseHelpers/passwordManagerDBHelper')(sqlConnection);
const oAuthModel = require('./src/controllers/authorisation/accessTokenModel')(userDBHelper, accessTokenDBHelper);
const oAuth2Server = require('node-oauth2-server');
const express = require('express');
const expressApp = express();
expressApp.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: true,
});

const passwordManagerRoutesMethods = require('./src/controllers/passwordManager/passwordManagerRoutesMethods.js')(passwordManagerDBHelper, accessTokenDBHelper);
// eslint-disable-next-line new-cap
const passwordManagerRoutes = require('./src/controllers/passwordManager/passwordManagerRoutes.js')(express.Router(), expressApp, passwordManagerRoutesMethods);
const authRoutesMethods = require('./src/controllers/authorisation/authRoutesMethods')(userDBHelper);
// eslint-disable-next-line new-cap
const authRoutes = require('./src/controllers/authorisation/authRoutes')(express.Router(), expressApp, authRoutesMethods);
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

expressApp.use(morgan('combined', {stream: winston.stream}));
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());

const getLoggerForStatusCode = (statusCode) => {
  if (statusCode >= 500) {
    return winston.error.bind(winston);
  }
  if (statusCode >= 400) {
    return winston.warn.bind(winston);
  }

  return winston.info.bind(winston);
};

const logRequestStart = (req, res, next) => {
  winston.info(`${req.method} ${req.originalUrl}`);

  const cleanup = () => {
    res.removeListener('finish', logFn);
    res.removeListener('close', abortFn);
    res.removeListener('error', errorFn);
  };

  const logFn = () => {
    cleanup();
    const logger = getLoggerForStatusCode(res.statusCode);
    logger(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`);
  };

  const abortFn = () => {
    cleanup();
    winston.warn('Request aborted by the client');
  };

  const errorFn = (err) => {
    cleanup();
    winston.error(`Request pipeline error: ${err}`);
  };

  res.on('finish', logFn);
  res.on('close', abortFn);
  res.on('error', errorFn);

  next();
};

expressApp.use(logRequestStart);

expressApp.use(expressApp.oauth.errorHandler());

expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

expressApp.use('/auth', authRoutes);

expressApp.use('/api', passwordManagerRoutes);


expressApp.listen(process.env.PORT || port, () => {
  winston.info(`listening on port ${port}`);
});
module.exports = {
  app: expressApp,
  sqlConnection: sqlConnection,
};
