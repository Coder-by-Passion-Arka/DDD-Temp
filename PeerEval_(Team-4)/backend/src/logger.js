// Creating Winston Logger for logging. This helps us to log errors, warnings, and other important events to a file.

import { createLogger, format, transports } from "winston";
const { combine, timestamp, colorize, json, printf } = format;

const consoleLogFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ${message}`;
  })
);

const fileLogFormat = format.combine(format.timestamp(), format.json());

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileLogFormat,
    }),
    new transports.File({
      filename: "logs/combined.log",
      format: fileLogFormat,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: consoleLogFormat,
    })
  );
}

export default logger;
