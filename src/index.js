#!/usr/bin/env node

/**
 * @fileoverview Schwaizer I14Y MCP Server - Main entry point.
 * Provides Model Context Protocol (MCP) server for accessing the Swiss I14Y Interoperability Platform.
 * 
 * The I14Y Interoperability Platform is Switzerland's central catalog for metadata about data, 
 * electronic interfaces (APIs), and public services. This server enables AI assistants to:
 * - Search and retrieve concepts (code lists, data elements)
 * - Access dataset metadata and information
 * - Query data service (API) information
 * - Retrieve public service metadata
 * 
 * @module index
 * @see {@link https://www.i14y.admin.ch/|I14Y Interoperability Platform}
 * @see {@link https://handbook.i14y.admin.ch/|I14Y Handbook}
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import logger from "./utils/logger.js";
import { registerCatalogTools } from "./tools/catalog-tools.js";
import { registerConceptTools } from "./tools/concept-tools.js";
import { registerDatasetTools } from "./tools/dataset-tools.js";
import { registerDataServiceTools } from "./tools/data-service-tools.js";
import { registerPublicServiceTools } from "./tools/public-service-tools.js";

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: "schwaizer-i14y",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

/**
 * Tool registry
 */
const tools = new Map();

/**
 * Helper function to register a tool with the server.
 * Extends the MCP Server instance with a convenient tool registration method
 * that stores tools in the registry for later execution.
 * 
 * @function
 * @param {string} name - Unique tool identifier
 * @param {string} description - Human-readable tool description
 * @param {import('zod').ZodSchema} schema - Zod schema for validating tool inputs
 * @param {Function} handler - Async function that executes the tool logic
 * @returns {void}
 * @example
 * server.tool(
 *   'search_concepts',
 *   'Search for concepts in I14Y',
 *   z.object({ query: z.string() }),
 *   async (args) => { ... }
 * );
 */
server.tool = function (name, description, schema, handler) {
  tools.set(name, {
    name,
    description,
    schema,
    handler,
  });
};

/**
 * Register all tools
 */
registerCatalogTools(server);
registerConceptTools(server);
registerDatasetTools(server);
registerDataServiceTools(server);
registerPublicServiceTools(server);

/**
 * Handle list_tools request from MCP client.
 * Returns metadata about all registered tools including their names,
 * descriptions, and JSON schemas for input validation.
 * 
 * @async
 * @returns {Promise<{tools: Array<{name: string, description: string, inputSchema: Object}>}>}
 *          List of available tools with their metadata
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsList = Array.from(tools.values()).map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.schema),
  }));

  logger.debug({ count: toolsList.length }, "Listed tools");
  return { tools: toolsList };
});

/**
 * Handle call_tool request from MCP client.
 * Validates tool arguments against the Zod schema, executes the tool handler,
 * and returns the result in MCP format. Errors are caught and returned as
 * MCP error responses.
 * 
 * @async
 * @param {Object} request - MCP tool call request
 * @param {Object} request.params - Request parameters
 * @param {string} request.params.name - Name of the tool to execute
 * @param {Object} request.params.arguments - Tool arguments to validate and pass to handler
 * @returns {Promise<Object>} Tool execution result in MCP format
 * @throws {Error} If tool is not found in registry
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info({ tool: name }, "Tool called");

  const tool = tools.get(name);
  if (!tool) {
    logger.error({ tool: name }, "Tool not found");
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    // Validate arguments against schema
    const validatedArgs = tool.schema.parse(args);

    // Execute tool handler
    const result = await tool.handler(validatedArgs);

    logger.debug({ tool: name }, "Tool executed successfully");
    return result;
  } catch (error) {
    logger.error({ tool: name, error: error.message }, "Tool execution failed");

    // Return error in MCP format
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initialize and start the I14Y MCP server.
 * Sets up stdio transport for communication with MCP clients and connects the server.
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If server fails to start or connect to transport
 * @example
 * // Server is started automatically at module load
 * // Communicates via stdio with MCP clients
 */
async function main() {
  logger.info("Starting I14Y MCP Server");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("I14Y MCP Server running on stdio");
}

// Handle errors
process.on("uncaughtException", (error) => {
  logger.error({ error: error.message }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
  process.exit(1);
});

// Start server
main().catch((error) => {
  logger.error({ error: error.message }, "Failed to start server");
  process.exit(1);
});
