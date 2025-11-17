/**
 * @fileoverview Configuration loader for I14Y MCP Server.
 * Loads and validates environment variables required for connecting to the I14Y Interoperability Platform API.
 * 
 * Environment variables:
 * - I14Y_API_BASE_URL: Base URL for the I14Y API (required)
 * - I14Y_API_TOKEN: Optional authentication token for the I14Y API
 * - I14Y_API_TIMEOUT: Request timeout in milliseconds (default: 30000)
 * - I14Y_DEFAULT_LANGUAGE: Default language for API responses (default: "de")
 * - I14Y_DEFAULT_PAGE_SIZE: Default number of results per page (default: 20)
 * - I14Y_MAX_PAGE_SIZE: Maximum number of results per page (default: 100)
 * - LOG_LEVEL: Logging level (default: "info")
 * 
 * @module config
 * @see {@link https://www.i14y.admin.ch/|I14Y Interoperability Platform}
 * @example
 * import config from './config.js';
 * console.log(config.apiBaseUrl); // https://www.i14y.admin.ch/api
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: join(__dirname, "..", ".env") });
}

/**
 * Application configuration object containing all I14Y MCP server settings.
 * 
 * @constant {Object} config
 * @property {string} apiBaseUrl - Base URL for the I14Y API (e.g., "https://www.i14y.admin.ch/api")
 * @property {string} apiToken - Optional authentication token for the I14Y API
 * @property {number} apiTimeout - Request timeout in milliseconds (default: 30000)
 * @property {string} defaultLanguage - Default language for API responses: "de", "fr", "it", or "en" (default: "de")
 * @property {number} defaultPageSize - Default number of results per page (default: 20)
 * @property {number} maxPageSize - Maximum number of results per page (default: 100)
 * @property {string} logLevel - Logging level: "trace", "debug", "info", "warn", "error", or "fatal" (default: "info")
 */
const apiBaseUrl = process.env.I14Y_API_BASE_URL;
// Only validate in production, not in test environment
if (!apiBaseUrl && process.env.NODE_ENV !== 'test') {
  throw new Error("I14Y_API_BASE_URL is required");
}

const config = {
  apiBaseUrl,
  apiToken: process.env.I14Y_API_TOKEN || "",
  apiTimeout: parseInt(process.env.I14Y_API_TIMEOUT || "30000", 10),
  defaultLanguage: process.env.I14Y_DEFAULT_LANGUAGE || "de",
  defaultPageSize: parseInt(process.env.I14Y_DEFAULT_PAGE_SIZE || "20", 10),
  maxPageSize: parseInt(process.env.I14Y_MAX_PAGE_SIZE || "100", 10),
  logLevel: process.env.LOG_LEVEL || "info",
};

/**
 * Validates that all required configuration values are present.
 * Throws an error if any required configuration is missing.
 * 
 * @function validateConfig
 * @throws {Error} If I14Y_API_BASE_URL is not set
 * @example
 * import { validateConfig } from './config.js';
 * try {
 *   validateConfig();
 *   console.log('Configuration is valid');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 * }
 */
export function validateConfig() {
  const errors = [];

  if (!config.apiBaseUrl) {
    errors.push("I14Y_API_BASE_URL is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }
}

export { config };
export default config;
