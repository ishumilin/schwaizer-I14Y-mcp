/**
 * Unit tests for data service tools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerDataServiceTools } from '../../../src/tools/data-service-tools.js';

// Mock the i14y-client module
vi.mock('../../../src/api/i14y-client.js', () => ({
  i14yClient: {
    searchDataServices: vi.fn(),
    getDataService: vi.fn(),
  },
}));

// Import after mocking
const { i14yClient } = await import('../../../src/api/i14y-client.js');

describe('Data Service Tools', () => {
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
    registerDataServiceTools(mockServer);
  });

  describe('Tool Registration', () => {
    it('should register all data service tools', () => {
      expect(registeredTools.has('search_data_services')).toBe(true);
      expect(registeredTools.has('get_data_service')).toBe(true);
    });
  });

  describe('search_data_services', () => {
    it('should search data services successfully', async () => {
      const mockResults = {
        items: [{ id: 'svc-1', identifier: 'service-1', title: { de: 'Test' } }],
        totalCount: 1,
      };
      vi.mocked(i14yClient.searchDataServices).mockResolvedValue(mockResults);

      const tool = registeredTools.get('search_data_services');
      const result = await tool.handler({});

      expect(result.content[0].text).toContain('service-1');
    });

    it('should handle empty results', async () => {
      vi.mocked(i14yClient.searchDataServices).mockResolvedValue({ items: [], totalCount: 0 });

      const tool = registeredTools.get('search_data_services');
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toEqual([]);
      expect(parsed.totalCount).toBe(0);
    });
  });

  describe('get_data_service', () => {
    it('should get data service by ID', async () => {
      const mockService = { id: '123e4567-e89b-12d3-a456-426614174000', identifier: 'service-1', title: { de: 'Test' } };
      vi.mocked(i14yClient.getDataService).mockResolvedValue(mockService);

      const tool = registeredTools.get('get_data_service');
      const result = await tool.handler({ id: '123e4567-e89b-12d3-a456-426614174000' });

      expect(result.content[0].text).toContain('service-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      vi.mocked(i14yClient.searchDataServices).mockRejectedValue(new Error('API Error'));

      const tool = registeredTools.get('search_data_services');
      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });
  });
});
