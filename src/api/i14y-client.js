/**
 * @fileoverview I14Y API client for the Swiss I14Y Interoperability Platform.
 * Provides wrapper methods around the public REST API (concepts, datasets,
 * data services, public services) with standardized logging, retries, and error handling.
 *
 * @see https://www.i14y.admin.ch/
 * @see https://handbook.i14y.admin.ch/
 */
import ky from 'ky';
import config from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * I14Y API client.
 * @class
 * @classdesc Handles communication with the I14Y Interoperability Platform Public API using ky.
 * Adds request/response logging, retry policy and translates HTTP failures into user-friendly errors.
 *
 * @example
 * const client = new I14YClient('https://www.i14y.admin.ch/api');
 * const concept = await client.getConcept('b9c91d1a-6a3f-4a2d-9b0d-4e1a2b3c4d5e');
 *
 * @param {string} [baseUrl=config.apiBaseUrl] Base URL of the I14Y API.
 * @throws {Error} If baseUrl is not provided.
 */
class I14YClient {
	constructor(baseUrl = config.apiBaseUrl) {
		if (!baseUrl) {
			throw new Error('Base URL is required');
		}
		this.baseUrl = baseUrl;
		this.client = ky.create({
			prefixUrl: this.baseUrl,
			timeout: 30000,
			retry: {
				limit: 2,
				methods: ['get'],
				statusCodes: [408, 413, 429, 500, 502, 503, 504],
			},
			hooks: {
				beforeRequest: [
					(request) => {
						logger.debug({ url: request.url }, 'Making API request');
					},
				],
				afterResponse: [
					(_request, _options, response) => {
						logger.debug(
							{ status: response.status, url: response.url },
							'API response received'
						);
						return response;
					},
				],
			},
		});
	}


	/**
	 * Get concept by ID
	 * @param {string} conceptId - Concept UUID
	 * @param {boolean} includeCodeListEntries - Include code list entries (for CodeList concepts)
	 * @returns {Promise<Object>} - Concept data
	 */
	async getConcept(conceptId, includeCodeListEntries = false) {
		try {
			const response = includeCodeListEntries
				? await this.client.get(`concepts/${conceptId}`, {
						searchParams: { includeCodeListEntries: 'true' },
				  })
				: await this.client.get(`concepts/${conceptId}`);
			return await response.json();
		} catch (error) {
			logger.error({ error, conceptId }, 'Failed to get concept');
			throw this._handleError(error);
		}
	}

	/**
	 * Get code list entries for a CodeList concept
	 * @param {string} conceptId - CodeList concept UUID
	 * @param {Object} params - Pagination parameters
	 * @param {number} [params.page=1] - Page number (1-based)
	 * @param {number} [params.pageSize=25] - Results per page
	 * @returns {Promise<Object>} - Code list entries
	 */
	async getCodeListEntries(conceptId, params = {}) {
		try {
			const searchParams = this._buildSearchParams(params, 1, 25);
			const response = await this.client.get(
				`concepts/${conceptId}/codelistentries`,
				{ searchParams }
			);
			return await response.json();
		} catch (error) {
			logger.error({ error, conceptId }, 'Failed to get code list entries');
			throw this._handleError(error);
		}
	}

	/**
	 * Search concepts with filters
	 * @param {Object} params - Search parameters
	 * @param {string} [params.conceptIdentifier] - Concept identifier filter
	 * @param {string} [params.publisherIdentifier] - Publisher identifier filter
	 * @param {string} [params.version] - Version filter
	 * @param {string} [params.publicationLevel] - Publication level (Internal, Public)
	 * @param {string} [params.registrationStatus] - Registration status
	 * @param {number} [params.page=1] - Page number (1-based)
	 * @param {number} [params.pageSize=25] - Results per page
	 * @returns {Promise<Object>} - Search results
	 */
	async searchConcepts(params = {}) {
		try {
			const searchParams = this._buildSearchParams(params, 1, 25);
			const response = await this.client.get('concepts', { searchParams });
			return await response.json();
		} catch (error) {
			logger.error({ error, params }, 'Failed to search concepts');
			throw this._handleError(error);
		}
	}


	/**
	 * Get dataset by ID
	 * @param {string} datasetId - Dataset UUID
	 * @param {string} [language] - Language code (e.g., de, fr, it, en)
	 * @returns {Promise<Object>} - Dataset data
	 */
	async getDataset(datasetId, language) {
		try {
			const response = language
				? await this.client.get(`datasets/${datasetId}`, {
						searchParams: { language },
				  })
				: await this.client.get(`datasets/${datasetId}`);
			return await response.json();
		} catch (error) {
			logger.error({ error, datasetId }, 'Failed to get dataset');
			throw this._handleError(error);
		}
	}

	/**
	 * Search datasets with filters
	 * @param {Object} params - Search parameters
	 * @param {string} [params.accessRights] - Access rights code
	 * @param {string} [params.datasetIdentifier] - Dataset identifier filter
	 * @param {string} [params.publisherIdentifier] - Publisher identifier filter
	 * @param {string} [params.publicationLevel] - Publication level
	 * @param {string} [params.registrationStatus] - Registration status
	 * @param {number} [params.page=1] - Page number (1-based)
	 * @param {number} [params.pageSize=25] - Results per page
	 * @returns {Promise<Object>} - Search results
	 */
	async searchDatasets(params = {}) {
		try {
			const searchParams = this._buildSearchParams(params, 1, 25);
			const response = await this.client.get('datasets', { searchParams });
			return await response.json();
		} catch (error) {
			logger.error({ error, params }, 'Failed to search datasets');
			throw this._handleError(error);
		}
	}

	/**
	 * Get dataset structure/schema via export endpoint with fallbacks
	 * Docs: GET /datasets/{datasetId}/structures/exports/{format}
	 * @param {string} datasetId - Dataset UUID
	 * @param {string} [format='JsonLd'] - One of: Ttl | Rdf | JsonLd (case-insensitive accepted)
	 * @param {string} [language] - Language code (e.g., de, fr, it, en) - optional passthrough as query
	 * @returns {Promise<Object>} - { datasetId, format, contentType, body }
	 */
	/**
	 * Get dataset structure (JSON)
	 * Docs: GET /datasets/{datasetId}/structure
	 * @param {string} datasetId
	 * @param {string} [language]
	 * @returns {Promise<Object>}
	 */
	async getDatasetStructure(datasetId, language) {
		try {
			let response;
			if (language) {
				response = await this.client.get(`datasets/${datasetId}/structure`, {
					searchParams: { language },
				});
			} else {
				// Call with single argument (no options) to satisfy test expectations
				response = await this.client.get(`datasets/${datasetId}/structure`);
			}
			return await response.json();
		} catch (error) {
			logger.error({ error, datasetId, language }, 'Failed to get dataset structure');
			throw this._handleError(error);
		}
	}

	/**
	 * Export dataset structure in specified format (alias of getDatasetStructure)
	 * Docs: GET /datasets/{datasetId}/structures/exports/{format}
	 * @param {string} datasetId - Dataset UUID
	 * @param {string} format - One of: Ttl | Rdf | JsonLd (case-insensitive accepted)
	 * @param {string} [language] - Language code (optional passthrough)
	 * @returns {Promise<Object>} - { datasetId, format, contentType, body }
	 */
	/**
	 * Export dataset structure in specified format
	 * Docs: GET /datasets/{datasetId}/structure/export
	 */
	async exportDatasetStructure(datasetId, format, language) {
		try {
			const searchParams = { format };
			if (language) searchParams.language = language;
			const response = await this.client.get(`datasets/${datasetId}/structure/export`, { searchParams });
			return await response.text();
		} catch (error) {
			logger.error({ error, datasetId, format, language }, 'Failed to export dataset structure');
			throw this._handleError(error);
		}
	}

	/**
	 * List dataset distributions (access points)
	 * @param {string} datasetId - Dataset UUID
	 * @param {string} [language] - Language code (e.g., de, fr, it, en)
	 * @returns {Promise<Object>} - Dataset distributions
	 */


	/**
	 * Get data service by ID
	 * @param {string} dataServiceId - Data service UUID
	 * @returns {Promise<Object>} - Data service data
	 */
	async getDataService(dataServiceId) {
		try {
			const response = await this.client.get(`dataservices/${dataServiceId}`);
			return await response.json();
		} catch (error) {
			logger.error({ error, dataServiceId }, 'Failed to get data service');
			throw this._handleError(error);
		}
	}

	/**
	 * Search data services with filters
	 * @param {Object} params - Search parameters
	 * @param {string} [params.accessRights] - Access rights code
	 * @param {string} [params.dataServiceIdentifier] - Data service identifier filter
	 * @param {string} [params.publisherIdentifier] - Publisher identifier filter
	 * @param {string} [params.publicationLevel] - Publication level
	 * @param {string} [params.registrationStatus] - Registration status
	 * @param {number} [params.page=1] - Page number (1-based)
	 * @param {number} [params.pageSize=25] - Results per page
	 * @returns {Promise<Object>} - Search results
	 */
	async searchDataServices(params = {}) {
		try {
			const searchParams = this._buildSearchParams(params, 1, 25);
			const response = await this.client.get('dataservices', { searchParams });
			return await response.json();
		} catch (error) {
			logger.error({ error, params }, 'Failed to search data services');
			throw this._handleError(error);
		}
	}

	/**
	 * Get public service by ID
	 * @param {string} publicServiceId - Public service UUID
	 * @returns {Promise<Object>} - Public service data
	 */
	async getPublicService(publicServiceId) {
		try {
			const response = await this.client.get(
				`publicservices/${publicServiceId}`
			);
			return await response.json();
		} catch (error) {
			logger.error({ error, publicServiceId }, 'Failed to get public service');
			throw this._handleError(error);
		}
	}

	/**
	 * Search public services with filters
	 * @param {Object} params - Search parameters
	 * @param {string} [params.publicServiceIdentifier] - Public service identifier filter
	 * @param {string} [params.publisherIdentifier] - Publisher identifier filter
	 * @param {string} [params.publicationLevel] - Publication level
	 * @param {string} [params.registrationStatus] - Registration status
	 * @param {number} [params.page=1] - Page number (1-based)
	 * @param {number} [params.pageSize=25] - Results per page
	 * @returns {Promise<Object>} - Search results
	 */
	async searchPublicServices(params = {}) {
		try {
			const searchParams = this._buildSearchParams(params, 1, 25);
			const response = await this.client.get('publicservices', {
				searchParams,
			});
			return await response.json();
		} catch (error) {
			logger.error({ error, params }, 'Failed to search public services');
			throw this._handleError(error);
		}
	}

	/**
	 * Build search parameters with defaults.
	 * Converts provided values to strings and ensures pagination defaults are present (1‑based indexing).
	 *
	 * @private
	 * @param {Record<string, unknown>} params Arbitrary search parameters.
	 * @param {number} [defaultPage=1] Default page number (1-based).
	 * @param {number} [defaultPageSize=25] Default page size.
	 * @returns {Record<string, string>} Search parameters suitable for URL query strings.
	 */
	_buildSearchParams(params, defaultPage = 1, defaultPageSize = 25) {
		const searchParams = {};

		// Add all provided parameters
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				searchParams[key] = String(value);
			}
		});

		// Set pagination defaults (1-based indexing)
		if (!searchParams.page) {
			searchParams.page = String(defaultPage);
		}
		if (!searchParams.pageSize) {
			searchParams.pageSize = String(defaultPageSize);
		}

		return searchParams;
	}

	/**
	 * Normalize ky/HTTP errors into user-friendly Error instances.
	 *
	 * @private
	 * @param {any} error Error thrown by ky or application code.
	 * @returns {Error} Normalized Error with meaningful message.
	 */
	_handleError(error) {
		// If the error already has a message, preserve it
		if (error.message && !error.response) {
			return error;
		}

		if (error.response) {
			const status = error.response.status;
			const message = `API request failed with status ${status}`;

			if (status === 400) {
				return new Error(`${message}: Bad Request - Invalid parameters`);
			}
			if (status === 401) {
				return new Error(`${message}: Unauthorized`);
			}
			if (status === 403) {
				return new Error(`${message}: Forbidden`);
			}
			if (status === 404) {
				return new Error(`${message}: Resource not found`);
			}
			if (status >= 500) {
				return new Error(`${message}: Server error`);
			}
		}

		return error;
	}
}

// Export both the class (for testing) and a lazy-initialized singleton instance (for use)
export { I14YClient };

let _i14yClient = null;

/**
 * Get or create the singleton I14Y client instance
 * @returns {I14YClient}
 */
export function getI14YClient() {
	if (!_i14yClient) {
		_i14yClient = new I14YClient();
	}
	return _i14yClient;
}

// For backward compatibility and convenience
export const i14yClient = new Proxy({}, {
	get(target, prop) {
		return getI14YClient()[prop];
	}
});
