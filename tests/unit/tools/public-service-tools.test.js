/**
 * Unit tests for public service tools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerPublicServiceTools } from '../../../src/tools/public-service-tools.js';

// Mock the i14y-client module
vi.mock('../../../src/api/i14y-client.js', () => ({
  i14yClient: {
    searchPublicServices: vi.fn(),
    getPublicService: vi.fn(),
  },
}));

// Import after mocking
const { i14yClient } = await import('../../../src/api/i14y-client.js');

describe('Public Service Tools', () => {
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
    registerPublicServiceTools(mockServer);
  });

  describe('Tool Registration', () => {
    it('should register all public service tools', () => {
      expect(registeredTools.has('search_public_services')).toBe(true);
      expect(registeredTools.has('get_public_service')).toBe(true);
    });
  });

  describe('search_public_services', () => {
    it('should search public services successfully', async () => {
      const mockResults = {
        items: [{ id: 'ps-1', identifier: 'public-service-1', title: { de: 'Test' } }],
        totalCount: 1,
      };
      vi.mocked(i14yClient.searchPublicServices).mockResolvedValue(mockResults);

      const tool = registeredTools.get('search_public_services');
      const result = await tool.handler({});

      expect(result.content[0].text).toContain('public-service-1');
    });

    it('should handle empty results', async () => {
      vi.mocked(i14yClient.searchPublicServices).mockResolvedValue({ items: [], totalCount: 0 });

      const tool = registeredTools.get('search_public_services');
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.items).toEqual([]);
      expect(parsed.totalCount).toBe(0);
    });
  });

  describe('get_public_service', () => {
    it('should get public service by ID', async () => {
      const mockService = { id: '123e4567-e89b-12d3-a456-426614174000', identifier: 'public-service-1', title: { de: 'Test' } };
      vi.mocked(i14yClient.getPublicService).mockResolvedValue(mockService);

      const tool = registeredTools.get('get_public_service');
      const result = await tool.handler({ id: '123e4567-e89b-12d3-a456-426614174000' });

      expect(result.content[0].text).toContain('public-service-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      vi.mocked(i14yClient.searchPublicServices).mockRejectedValue(new Error('API Error'));

      const tool = registeredTools.get('search_public_services');
      const result = await tool.handler({});

      expect(result.isError).toBe(true);
    });
  });
});
