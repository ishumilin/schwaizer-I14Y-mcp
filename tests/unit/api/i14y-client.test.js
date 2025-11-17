/**
 * Unit tests for I14Y API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I14YClient } from '../../../src/api/i14y-client.js';

// Mock ky
vi.mock('ky', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

describe('I14YClient', () => {
  let client;
  let mockKy;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Import ky mock
    const ky = vi.mocked(await import('ky')).default;
    mockKy = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    ky.create.mockReturnValue(mockKy);
    
    client = new I14YClient('https://test.i14y.admin.ch/api/v4');
  });

  describe('Constructor', () => {
    it('should create client with base URL', () => {
      expect(client).toBeInstanceOf(I14YClient);
    });

    it('should throw error with invalid base URL', () => {
      expect(() => new I14YClient('')).toThrow();
    });
  });

  describe('searchConcepts', () => {
    it('should search concepts with filters', async () => {
      const mockResponse = {
        items: [
          { id: '1', identifier: 'concept-1' },
          { id: '2', identifier: 'concept-2' },
        ],
        totalCount: 2,
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.searchConcepts({
        conceptIdentifier: 'test',
        page: 1,
        pageSize: 25,
      });

      expect(result).toEqual(mockResponse);
      expect(mockKy.get).toHaveBeenCalledWith(
        'concepts',
        expect.objectContaining({
          searchParams: expect.any(Object),
        })
      );
    });

    it('should handle empty results', async () => {
      mockKy.get.mockResolvedValue({
        json: async () => ({ items: [], totalCount: 0 }),
      });

      const result = await client.searchConcepts({});

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should handle API errors', async () => {
      mockKy.get.mockRejectedValue(new Error('API Error'));

      await expect(client.searchConcepts({})).rejects.toThrow('API Error');
    });
  });

  describe('getConcept', () => {
    it('should get concept by ID', async () => {
      const mockConcept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: { de: 'Test Concept' },
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockConcept,
      });

      const result = await client.getConcept('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockConcept);
      expect(mockKy.get).toHaveBeenCalledWith('concepts/123e4567-e89b-12d3-a456-426614174000');
    });

    it('should get concept with code list entries', async () => {
      const mockConcept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: { de: 'Test Concept' },
        codeListEntries: [{ code: '1', label: { de: 'Entry 1' } }],
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockConcept,
      });

      const result = await client.getConcept('123e4567-e89b-12d3-a456-426614174000', true);

      expect(result).toEqual(mockConcept);
      expect(mockKy.get).toHaveBeenCalledWith(
        'concepts/123e4567-e89b-12d3-a456-426614174000',
        expect.objectContaining({
          searchParams: { includeCodeListEntries: 'true' },
        })
      );
    });

    it('should handle not found errors', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.getConcept('invalid-id')).rejects.toThrow('Resource not found');
    });
  });

  describe('getCodeListEntries', () => {
    it('should get code list entries', async () => {
      const mockResponse = {
        items: [
          { code: '1', label: { de: 'Entry 1' } },
          { code: '2', label: { de: 'Entry 2' } },
        ],
        totalCount: 2,
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.getCodeListEntries('123e4567-e89b-12d3-a456-426614174000', {
        page: 1,
        pageSize: 25,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchDatasets', () => {
    it('should search datasets with filters', async () => {
      const mockResponse = {
        items: [
          { id: '1', identifier: 'dataset-1' },
        ],
        totalCount: 1,
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.searchDatasets({
        datasetIdentifier: 'test',
        page: 1,
        pageSize: 25,
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDataset', () => {
    it('should get dataset by ID', async () => {
      const mockDataset = {
        id: '123',
        identifier: 'dataset-1',
        title: { de: 'Test Dataset' },
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockDataset,
      });

      const result = await client.getDataset('123');

      expect(result).toEqual(mockDataset);
    });

    it('should support language parameter', async () => {
      const mockDataset = {
        id: '123',
        identifier: 'dataset-1',
        title: { fr: 'Jeu de données test' },
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockDataset,
      });

      const result = await client.getDataset('123', 'fr');

      expect(result).toEqual(mockDataset);
      expect(mockKy.get).toHaveBeenCalledWith(
        'datasets/123',
        expect.objectContaining({
          searchParams: { language: 'fr' },
        })
      );
    });
  });

  describe('searchDataServices', () => {
    it('should search data services', async () => {
      const mockResponse = {
        items: [
          { id: '1', identifier: 'service-1' },
        ],
        totalCount: 1,
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.searchDataServices({});

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDataService', () => {
    it('should get data service by ID', async () => {
      const mockService = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'service-1',
        title: { de: 'Test Service' },
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockService,
      });

      const result = await client.getDataService('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockService);
      expect(mockKy.get).toHaveBeenCalledWith('dataservices/123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('searchPublicServices', () => {
    it('should search public services', async () => {
      const mockResponse = {
        items: [
          { id: '1', identifier: 'public-service-1' },
        ],
        totalCount: 1,
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await client.searchPublicServices({});

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPublicService', () => {
    it('should get public service by ID', async () => {
      const mockService = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'public-service-1',
        title: { de: 'Test Public Service' },
      };

      mockKy.get.mockResolvedValue({
        json: async () => mockService,
      });

      const result = await client.getPublicService('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockService);
      expect(mockKy.get).toHaveBeenCalledWith('publicservices/123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockKy.get.mockRejectedValue(new Error('Network error'));

      await expect(client.searchConcepts({})).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'TimeoutError';
      mockKy.get.mockRejectedValue(timeoutError);

      await expect(client.searchConcepts({})).rejects.toThrow('Timeout');
    });

    it('should handle rate limiting', async () => {
      const error = new Error('Too Many Requests');
      error.response = { status: 429 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Too Many Requests');
    });

    it('should handle 400 Bad Request errors', async () => {
      const error = new Error('Bad Request');
      error.response = { status: 400 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Bad Request - Invalid parameters');
    });

    it('should handle 401 Unauthorized errors', async () => {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Unauthorized');
    });

    it('should handle 403 Forbidden errors', async () => {
      const error = new Error('Forbidden');
      error.response = { status: 403 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Forbidden');
    });

    it('should handle 500 Server errors', async () => {
      const error = new Error('Server Error');
      error.response = { status: 500 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Server error');
    });

    it('should handle 502 Bad Gateway errors', async () => {
      const error = new Error('Bad Gateway');
      error.response = { status: 502 };
      mockKy.get.mockRejectedValue(error);

      await expect(client.searchConcepts({})).rejects.toThrow('Server error');
    });
  });

  describe('_buildSearchParams', () => {
    it('should build search params with defaults', () => {
      const params = client._buildSearchParams({}, 1, 25);
      
      expect(params).toEqual({
        page: '1',
        pageSize: '25',
      });
    });

    it('should include provided parameters', () => {
      const params = client._buildSearchParams({
        conceptIdentifier: 'test-123',
        publisherIdentifier: 'pub-456',
      }, 1, 25);
      
      expect(params).toEqual({
        conceptIdentifier: 'test-123',
        publisherIdentifier: 'pub-456',
        page: '1',
        pageSize: '25',
      });
    });

    it('should filter out null and undefined values', () => {
      const params = client._buildSearchParams({
        conceptIdentifier: 'test',
        publisherIdentifier: null,
        version: undefined,
        publicationLevel: '',
      }, 1, 25);
      
      expect(params).toEqual({
        conceptIdentifier: 'test',
        page: '1',
        pageSize: '25',
      });
    });

    it('should convert all values to strings', () => {
      const params = client._buildSearchParams({
        page: 2,
        pageSize: 50,
      }, 1, 25);
      
      expect(params).toEqual({
        page: '2',
        pageSize: '50',
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should export getI14YClient function', async () => {
      const { getI14YClient } = await import('../../../src/api/i14y-client.js');
      expect(typeof getI14YClient).toBe('function');
    });

    it('should export i14yClient proxy', async () => {
      const { i14yClient } = await import('../../../src/api/i14y-client.js');
      expect(i14yClient).toBeDefined();
    });
  });
});
