/**
 * @fileoverview MCP tools for public service operations on the Swiss I14Y Interoperability Platform.
 * Registers tools for searching public services and retrieving a single public service by ID.
 *
 * @see https://www.i14y.admin.ch/
 * @see ../api/i14y-client.js
 */
import { z } from 'zod';
import { i14yClient } from '../api/i14y-client.js';
import { formatSuccess, formatError } from '../utils/formatting.js';
import { logger } from '../utils/logger.js';

const searchPublicServicesSchema = z.object({
	publicServiceIdentifier: z.string().optional(),
	publisherIdentifier: z.string().optional(),
	publicationLevel: z.string().optional(),
	registrationStatus: z.string().optional(),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(25),
});

const getPublicServiceSchema = z.object({
	id: z.string().uuid(),
});

/**
 * Search public services using various filters.
 *
 * @param {{
 *   publicServiceIdentifier?: string,
 *   publisherIdentifier?: string,
 *   publicationLevel?: string,
 *   registrationStatus?: string,
 *   page?: number,
 *   pageSize?: number
 * }} args Tool arguments
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function searchPublicServices(args) {
	try {
		const params = searchPublicServicesSchema.parse(args);
		const result = await i14yClient.searchPublicServices(params);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to search public services');
		return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
	}
}

/**
 * Get detailed information about a specific public service by ID.
 *
 * @param {{ id: string }} args Tool arguments containing the public service UUID
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function getPublicService(args) {
	try {
		const { id } = getPublicServiceSchema.parse(args);
		const result = await i14yClient.getPublicService(id);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to get public service');
		return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
	}
}

/**
 * Register public service tools with the MCP server.
 *
 * @param {import('@modelcontextprotocol/sdk/server/index.js').Server} server MCP server instance
 * @returns {void}
 */
export function registerPublicServiceTools(server) {
	server.tool('search_public_services', 'Search for public services in the I14Y Interoperability Platform', searchPublicServicesSchema, searchPublicServices);
	server.tool('get_public_service', 'Get detailed information about a specific public service by ID', getPublicServiceSchema, getPublicService);
}
