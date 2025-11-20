/**
 * Logger utility using Pino for structured logging
 * IMPORTANT: All logs are routed to STDERR so STDOUT remains clean for MCP JSON-RPC.
 * @module utils/logger
 */

import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Create and configure the logger instance
 * - Development: pretty via pino-pretty → STDERR
 * - Production: structured logs → STDERR
 */
export const logger = isDevelopment
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          destination: 2, // STDERR
        },
      },
    })
  : pino(
      { level: process.env.LOG_LEVEL || "info" },
      pino.destination(2) // STDERR
    );

export default logger;
