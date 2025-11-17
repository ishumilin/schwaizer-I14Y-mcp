/**
 * Logger utility using Pino for structured logging
 * @module utils/logger
 */

import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Create and configure the logger instance
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;
