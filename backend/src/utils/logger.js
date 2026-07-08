import winston from 'winston';
import config from '../config/index.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = config.env === 'development' ? 'debug' : 'warn';

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

const transports = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

if (config.env !== 'test') {
  transports.unshift(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), format),
    })
  );
}

const logger = winston.createLogger({
  levels,
  level,
  format,
  transports,
});

export default logger;
