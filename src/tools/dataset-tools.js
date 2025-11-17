/**
 * @fileoverview MCP tools for dataset-related operations on the Swiss I14Y Interoperability Platform.
 * Registers tools for searching datasets and retrieving a single dataset by ID.
 *
 * @see https://www.i14y.admin.ch/
 * @see ../api/i14y-client.js
 */
import { z } from 'zod';
import { i14yClient } from '../api/i14y-client.js';
import { formatSuccess, formatError } from '../utils/formatting.js';
import { logger } from '../utils/logger.js';

const searchDatasetsSchema = z.object({
	accessRights: z.string().optional().describe('Access rights code'),
	datasetIdentifier: z.string().optional().describe('Dataset identifier filter'),
	publisherIdentifier: z.string().optional().describe('Publisher identifier filter'),
	publicationLevel: z.string().optional().describe('Publication level'),
	registrationStatus: z.string().optional().describe('Registration status'),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(25),
});

const getDatasetSchema = z.object({
	id: z.string().describe('Dataset ID'),
	language: z.string().optional().describe('Language code (e.g., de, fr, it, en)'),
});




/**
 * Search datasets using various filters.
 *
 * @param {{
 *   accessRights?: string,
 *   datasetIdentifier?: string,
 *   publisherIdentifier?: string,
 *   publicationLevel?: string,
 *   registrationStatus?: string,
 *   page?: number,
 *   pageSize?: number
 * }} args Tool arguments
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function searchDatasets(args) {
	try {
		const params = searchDatasetsSchema.parse(args);
		const result = await i14yClient.searchDatasets(params);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to search datasets');
		return formatError(error);
	}
}

/**
 * Get detailed information about a specific dataset by ID.
 *
 * @param {{ id: string, language?: string }} args Tool arguments containing the dataset ID and optional language
 * @returns {Promise<{content: Array<{type: 'text', text: string}>, isError?: boolean}>} MCP-formatted response
 */
async function getDataset(args) {
	try {
		const { id, language } = getDatasetSchema.parse(args);
		const result = await i14yClient.getDataset(id, language);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to get dataset');
		return formatError(error);
	}
}




/**
 * Register dataset tools with the MCP server.
 *
 * @param {import('@modelcontextprotocol/sdk/server/index.js').Server} server MCP server instance
 * @returns {void}
 */
export function registerDatasetTools(server) {
	server.tool('search_datasets', 'Search for datasets in the I14Y Interoperability Platform', searchDatasetsSchema, searchDatasets);
	server.tool('get_dataset', 'Get detailed information about a specific dataset by ID', getDatasetSchema, getDataset);
}
