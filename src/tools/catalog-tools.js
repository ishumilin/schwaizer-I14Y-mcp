/**
 * @fileoverview MCP tools for catalog-related operations (e.g., code list entries)
 * on the Swiss I14Y Interoperability Platform.
 *
 * Registers tools under the MCP server which can be invoked by LLM clients.
 *
 * @see https://www.i14y.admin.ch/
 * @see ../api/schemas.js
 */
import { z } from 'zod';
import { i14yClient } from '../api/i14y-client.js';
import { logger } from '../utils/logger.js';
import { getCodeListEntriesSchema } from '../api/schemas.js';

/**
 * Register catalog-related tools with the MCP server.
 *
 * @param {object} server - MCP server instance
 * @returns {void}
 * @see getCodeListEntriesSchema
 */
export function registerCatalogTools(server) {
	server.tool(
		'get_code_list_entries',
		'Get entries from a code list concept',
		getCodeListEntriesSchema,
		/**
		 * Tool handler: Get entries from a code list concept.
		 *
		 * @param {object} args - Tool arguments
		 * @returns {Promise<object>}
		 */
		async (args) => {
			try {
				const result = await i14yClient.getCodeListEntries(args.id, {
					page: args.page,
					pageSize: args.pageSize,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result, null, 2),
						},
					],
				};
			} catch (error) {
				logger.error('Failed to get code list entries', {
					conceptId: args.id,
					error: {
						message: error.message,
						response: error.response?.status,
					},
				});
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
	);
}
