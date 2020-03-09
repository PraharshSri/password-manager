const appRoot = require('app-root-path');
const winston = require('winston');
const {combine, timestamp, printf} = winston.format;

const formatMsg = (msg) => {
  return typeof msg === 'object' ? JSON.stringify(msg) : msg;
};
const myFormat = printf(({level, message, timestamp}) => {
  return `${timestamp} ${level}: ${formatMsg(message)}`;
});
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
  },
  errorFile: {
    level: 'error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  level: 'info',
  format: combine(
      combine(timestamp(), myFormat),
  ),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.File(options.errorFile),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
