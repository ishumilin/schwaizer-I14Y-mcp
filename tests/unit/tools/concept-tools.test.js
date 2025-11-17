import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerConceptTools } from '../../../src/tools/concept-tools.js';

// Mock the i14y-client module
vi.mock('../../../src/api/i14y-client.js', () => ({
	i14yClient: {
		searchConcepts: vi.fn(),
		getConcept: vi.fn(),
	},
}));

// Import after mocking
import { i14yClient } from '../../../src/api/i14y-client.js';

describe('Concept Tools', () => {
	let mockServer;
	let registeredTools;

	beforeEach(() => {
		vi.clearAllMocks();
		registeredTools = {};

		mockServer = {
			tool: vi.fn((name, description, schema, handler) => {
				registeredTools[name] = { description, schema, handler };
			}),
		};

		registerConceptTools(mockServer);
	});

	describe('Tool Registration', () => {
		it('should register all concept tools', () => {
			expect(mockServer.tool).toHaveBeenCalledTimes(3);
			expect(registeredTools).toHaveProperty('search_concepts');
			expect(registeredTools).toHaveProperty('get_concept');
			expect(registeredTools).toHaveProperty('get_code_list_entries');
		});
	});

	describe('search_concepts', () => {
		it('should search concepts successfully', async () => {
			const mockResult = {
				items: [
					{
						id: '123e4567-e89b-12d3-a456-426614174000',
						identifier: 'CONCEPT-001',
						title: { de: 'Test Concept' },
					},
				],
				totalCount: 1,
			};

			i14yClient.searchConcepts.mockResolvedValue(mockResult);

			const result = await registeredTools.search_concepts.handler({
				page: 1,
				pageSize: 25,
			});

			expect(i14yClient.searchConcepts).toHaveBeenCalledWith({
				page: 1,
				pageSize: 25,
			});
			expect(result.content[0].text).toContain('Test Concept');
		});

		it('should handle search errors', async () => {
			i14yClient.searchConcepts.mockRejectedValue(
				new Error('API Error')
			);

			const result = await registeredTools.search_concepts.handler({
				page: 1,
			});

			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain('Error searching concepts');
		});

		it('should validate search parameters', async () => {
			const result = await registeredTools.search_concepts.handler({
				page: 0, // Invalid: must be >= 1
			});

			expect(result.isError).toBe(true);
		});
	});

	describe('get_concept', () => {
		it('should get concept by ID successfully', async () => {
			const mockConcept = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				identifier: 'CONCEPT-001',
				title: { de: 'Test Concept' },
				description: { de: 'Test Description' },
			};

			i14yClient.getConcept.mockResolvedValue(mockConcept);

			const result = await registeredTools.get_concept.handler({
				id: '123e4567-e89b-12d3-a456-426614174000',
			});

			expect(i14yClient.getConcept).toHaveBeenCalledWith(
				'123e4567-e89b-12d3-a456-426614174000',
				false
			);
			expect(result.content[0].text).toContain('Test Concept');
		});

		it('should handle get concept errors', async () => {
			i14yClient.getConcept.mockRejectedValue(
				new Error('Concept not found')
			);

			const result = await registeredTools.get_concept.handler({
				id: '123e4567-e89b-12d3-a456-426614174000',
			});

			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain('Error getting concept');
		});

		it('should validate concept ID format', async () => {
			const result = await registeredTools.get_concept.handler({
				id: 'invalid-uuid',
			});

			expect(result.isError).toBe(true);
		});
	});

	describe('get_code_list_entries', () => {
		it('should get code list entries successfully', async () => {
			const mockCodeList = {
				id: '123e4567-e89b-12d3-a456-426614174000',
				identifier: 'CODELIST-001',
				title: { de: 'Test Code List' },
				codeListEntries: [
					{
						code: 'CODE1',
						name: { de: 'Code 1' },
					},
					{
						code: 'CODE2',
						name: { de: 'Code 2' },
					},
				],
			};

			i14yClient.getConcept.mockResolvedValue(mockCodeList);

			const result = await registeredTools.get_code_list_entries.handler({
				id: '123e4567-e89b-12d3-a456-426614174000',
				page: 1,
				pageSize: 25,
			});

			expect(i14yClient.getConcept).toHaveBeenCalledWith(
				'123e4567-e89b-12d3-a456-426614174000',
				true
			);
			expect(result.content[0].text).toContain('Test Code List');
		});

		it('should handle get code list entries errors', async () => {
			i14yClient.getConcept.mockRejectedValue(
				new Error('Code list not found')
			);

			const result = await registeredTools.get_code_list_entries.handler({
				id: '123e4567-e89b-12d3-a456-426614174000',
			});

			expect(result.isError).toBe(true);
			expect(result.content[0].text).toContain(
				'Error getting code list entries'
			);
		});

		it('should validate pagination parameters', async () => {
			const result = await registeredTools.get_code_list_entries.handler({
				id: '123e4567-e89b-12d3-a456-426614174000',
				page: 0, // Invalid
			});

			expect(result.isError).toBe(true);
		});
	});
});
