/**
 * @fileoverview MCP tools for data service (API) operations on the Swiss I14Y Interoperability Platform.
 * Registers tools for searching data services and retrieving a single data service by ID.
 *
 * @see https://www.i14y.admin.ch/
 * @see ../api/i14y-client.js
 */
import { z } from 'zod';
import { i14yClient } from '../api/i14y-client.js';
import { formatSuccess, formatError } from '../utils/formatting.js';
import { logger } from '../utils/logger.js';

const searchDataServicesSchema = z.object({
	accessRights: z.string().optional(),
	dataServiceIdentifier: z.string().optional(),
	publisherIdentifier: z.string().optional(),
	publicationLevel: z.string().optional(),
	registrationStatus: z.string().optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(25),
});

const getDataServiceSchema = z.object({
	id: z.string().uuid(),
});

/**
 * Search data services (APIs) using various filters.
 *
 * @param {{
 *   accessRights?: string,
 *   dataServiceIdentifier?: string,
 *   publisherIdentifier?: string,
 *   publicationLevel?: string,
 *   registrationStatus?: string,
 *   page?: number,
 *   pageSize?: number
 * }} args Tool arguments
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function searchDataServices(args) {
	try {
		const params = searchDataServicesSchema.parse(args);
		const result = await i14yClient.searchDataServices(params);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to search data services');
		return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
	}
}

/**
 * Get detailed information about a specific data service by ID.
 *
 * @param {{ id: string }} args Tool arguments containing the data service UUID
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function getDataService(args) {
	try {
		const { id } = getDataServiceSchema.parse(args);
		const result = await i14yClient.getDataService(id);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to get data service');
		return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
	}
}

/**
 * Register data service tools with the MCP server.
 *
 * @param {import('@modelcontextprotocol/sdk/server/index.js').Server} server MCP server instance
 * @returns {void}
 */
export function registerDataServiceTools(server) {
	server.tool('search_data_services', 'Search for data services (APIs) in the I14Y Interoperability Platform', searchDataServicesSchema, searchDataServices);
	server.tool('get_data_service', 'Get detailed information about a specific data service by ID', getDataServiceSchema, getDataService);
}
