/**
 * Unit tests for dataset tools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerDatasetTools } from '../../../src/tools/dataset-tools.js';

// Mock the i14y-client module
vi.mock('../../../src/api/i14y-client.js', () => ({
  i14yClient: {
    searchDatasets: vi.fn(),
    getDataset: vi.fn(),
  },
}));

// Import after mocking
const { i14yClient } = await import('../../../src/api/i14y-client.js');

describe('Dataset Tools', () => {
  let mockServer;
  let registeredTools;

  beforeEach(() => {
    vi.clearAllMocks();
    registeredTools = new Map();
    mockServer = {
      tool: vi.fn((name, description, schema, handler) => {
        registeredTools.set(name, { description, schema, handler });
      }),
    };
    registerDatasetTools(mockServer);
  });

  describe('Tool Registration', () => {
    it('should register all dataset tools', () => {
      expect(registeredTools.has('search_datasets')).toBe(true);
      expect(registeredTools.has('get_dataset')).toBe(true);
    });
  });

  describe('search_datasets', () => {
    it('should search datasets successfully', async () => {
      const mockResults = {
        items: [{ id: 'ds-1', identifier: 'dataset-1', title: { de: 'Test' } }],
        totalCount: 1,
      };
      vi.mocked(i14yClient.searchDatasets).mockResolvedValue(mockResults);

      const tool = registeredTools.get('search_datasets');
      const result = await tool.handler({});

      expect(result.content[0].text).toContain('dataset-1');
    });

    it('should handle empty results', async () => {
      vi.mocked(i14yClient.searchDatasets).mockResolvedValue({ items: [], totalCount: 0 });

      const tool = registeredTools.get('search_datasets');
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toEqual([]);
      expect(parsed.totalCount).toBe(0);
    });
  });

  describe('get_dataset', () => {
    it('should get dataset by ID', async () => {
      const mockDataset = { id: 'ds-1', identifier: 'dataset-1', title: { de: 'Test' } };
      vi.mocked(i14yClient.getDataset).mockResolvedValue(mockDataset);

      const tool = registeredTools.get('get_dataset');
      const result = await tool.handler({ id: 'ds-1' });

      expect(result.content[0].text).toContain('dataset-1');
    });

    it('should handle errors when getting dataset', async () => {
      vi.mocked(i14yClient.getDataset).mockRejectedValue(new Error('Not found'));

      const tool = registeredTools.get('get_dataset');
      const result = await tool.handler({ id: 'invalid-id' });

      expect(result.isError).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      vi.mocked(i14yClient.searchDatasets).mockRejectedValue(new Error('API Error'));

      const tool = registeredTools.get('search_datasets');
      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });
  });
});
