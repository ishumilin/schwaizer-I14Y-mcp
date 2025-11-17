/**
 * Unit tests for catalog tools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerCatalogTools } from '../../../src/tools/catalog-tools.js';

// Mock the i14y-client module
vi.mock('../../../src/api/i14y-client.js', () => ({
  i14yClient: {
    getCodeListEntries: vi.fn(),
  },
}));

import { i14yClient } from '../../../src/api/i14y-client.js';

describe('Catalog Tools', () => {
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
    registerCatalogTools(mockServer);
  });

  describe('Tool Registration', () => {
    it('should register all catalog tools', () => {
      expect(mockServer.tool).toHaveBeenCalled();
      expect(registeredTools).toHaveProperty('get_code_list_entries');
    });
  });

  describe('get_code_list_entries', () => {
    it('should get code list entries successfully', async () => {
      const mockEntries = {
        items: [
          { code: 'CODE1', name: { de: 'Entry 1' } },
          { code: 'CODE2', name: { de: 'Entry 2' } },
        ],
        totalCount: 2,
      };
      vi.mocked(i14yClient.getCodeListEntries).mockResolvedValue(mockEntries);

      const result = await registeredTools.get_code_list_entries.handler({ id: 'list-1' });

      expect(result.content[0].type).toBe('text');
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.items).toHaveLength(2);
      expect(parsedResult.items[0].code).toBe('CODE1');
      expect(parsedResult.items[1].code).toBe('CODE2');
    });

    it('should handle empty code list', async () => {
      const mockEntries = { items: [], totalCount: 0 };
      vi.mocked(i14yClient.getCodeListEntries).mockResolvedValue(mockEntries);

      const result = await registeredTools.get_code_list_entries.handler({ id: 'list-1' });

      expect(result.content[0].type).toBe('text');
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.items).toHaveLength(0);
      expect(parsedResult.totalCount).toBe(0);
    });

    it('should handle pagination', async () => {
      const mockEntries = {
        items: [{ code: 'CODE1', name: { de: 'Entry 1' } }],
        totalCount: 100,
      };
      vi.mocked(i14yClient.getCodeListEntries).mockResolvedValue(mockEntries);

      const result = await registeredTools.get_code_list_entries.handler({ id: 'list-1', page: 2, pageSize: 10 });

      expect(i14yClient.getCodeListEntries).toHaveBeenCalledWith('list-1', { page: 2, pageSize: 10 });
      expect(result.content[0].type).toBe('text');
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.totalCount).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('API Error');
      vi.mocked(i14yClient.getCodeListEntries).mockRejectedValue(error);
      
      const result = await registeredTools.get_code_list_entries.handler({ id: 'list-1' });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error getting code list entries');
    });
  });
});
