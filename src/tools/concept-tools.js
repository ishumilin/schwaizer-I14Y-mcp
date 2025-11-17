/**
 * @fileoverview MCP tools for concept-related operations on the Swiss I14Y Interoperability Platform.
 * Registers tools for searching concepts, fetching a single concept, and retrieving code list entries.
 *
 * @see https://www.i14y.admin.ch/
 * @see ../api/i14y-client.js
 */
import { z } from 'zod';
import { i14yClient } from '../api/i14y-client.js';
import { formatSuccess, formatError } from '../utils/formatting.js';
import { logger } from '../utils/logger.js';

/**
 * Search concepts schema
 */
const searchConceptsSchema = z.object({
	conceptIdentifier: z.string().optional().describe('Concept identifier filter'),
	publisherIdentifier: z.string().optional().describe('Publisher identifier filter'),
	version: z.string().optional().describe('Version filter'),
	publicationLevel: z.enum(['Internal', 'Public']).optional().describe('Publication level'),
	registrationStatus: z
		.enum([
			'Incomplete',
			'Candidate',
			'Recorded',
			'Qualified',
			'Standard',
			'PreferredStandard',
			'Superseded',
			'Retired',
		])
		.optional()
		.describe('Concept registration status filter'),
	page: z
		.number()
		.int()
		.min(1)
		.default(1)
		.describe('Page number (1-indexed)'),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.default(25)
		.describe('Items per page'),
});

/**
 * Get concept schema
 */
const getConceptSchema = z.object({
	id: z.string().uuid().describe('Concept ID'),
});

/**
 * Get code list entries schema
 */
const getCodeListEntriesSchema = z.object({
	id: z.string().uuid().describe('Code list concept ID'),
	page: z.number().int().min(1).default(1).describe('Page number (1-indexed)'),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(100)
		.default(25)
		.describe('Items per page'),
});


/**
 * Search concepts using various filters.
 *
 * @param {object} args Tool arguments
 * @returns {Promise<object>} MCP-formatted response
 */
async function searchConcepts(args) {
	try {
		const params = searchConceptsSchema.parse(args);
		logger.info({ params }, 'Searching concepts');
		const result = await i14yClient.searchConcepts(params);
		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to search concepts');
		return {
			content: [
				{
					type: 'text',
					text: `Error searching concepts: ${error.message}`,
				},
			],
			isError: true,
		};
	}
}

/**
 * Get detailed information about a specific concept by ID.
 *
 * @param {object} args Tool arguments containing the concept UUID
 * @returns {Promise<object>} MCP-formatted response
 */
async function getConcept(args) {
	try {
		const { id } = getConceptSchema.parse(args);

		logger.info({ id }, 'Getting concept');

		const result = await i14yClient.getConcept(id, false);

		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to get concept');
		return {
			content: [
				{
					type: 'text',
					text: `Error getting concept: ${error.message}`,
				},
			],
			isError: true,
		};
	}
}


/**
 * Get code list entries for a code list concept.
 * Internally calls getConcept(id, true) to include code list entries.
 *
 * @param {object} args Tool arguments
 * @returns {Promise<object>} MCP-formatted response
 */
async function getCodeListEntries(args) {
	try {
		const { id, page, pageSize } =
			getCodeListEntriesSchema.parse(args);

		logger.info({ id, page, pageSize }, 'Getting code list entries');

		// Get concept with code list entries included
		const result = await i14yClient.getConcept(id, true);

		return formatSuccess(result);
	} catch (error) {
		logger.error({ error, args }, 'Failed to get code list entries');
		return {
			content: [
				{
					type: 'text',
					text: `Error getting code list entries: ${error.message}`,
				},
			],
			isError: true,
		};
	}
}


/**
 * Register concept tools with the MCP server.
 *
 * @param {object} server MCP server instance
 * @returns {void}
 */
export function registerConceptTools(server) {
	server.tool(
		'search_concepts',
		'Search for concepts in the I14Y Interoperability Platform',
		searchConceptsSchema,
		searchConcepts
	);

	server.tool(
		'get_concept',
		'Get detailed information about a specific concept by ID',
		getConceptSchema,
		getConcept
	);

	server.tool(
		'get_code_list_entries',
		'Get entries from a code list concept',
		getCodeListEntriesSchema,
		getCodeListEntries
	);
}
