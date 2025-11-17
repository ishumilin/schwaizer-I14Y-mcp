/**
 * Unit tests for formatting utility
 */

import { describe, it, expect } from 'vitest';
import {
  formatConceptResult,
  formatDatasetResult,
  formatDataServiceResult,
  formatPublicServiceResult,
  formatError,
  formatSuccess,
  formatPaginationInfo,
  formatMultilingualText,
  truncateText,
  formatListSummary,
  formatCatalogResponse,
  formatConceptResponse,
  formatDatasetResponse,
  formatDataServiceResponse,
  formatPublicServiceResponse,
  formatListResponse,
} from '../../../src/utils/formatting.js';

describe('Formatting Utilities', () => {
  describe('formatConceptResult', () => {
    it('should format concept with all fields', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: { de: 'Test Konzept', fr: 'Concept de test' },
        description: { de: 'Beschreibung', fr: 'Description' },
        registrationStatus: 'Recorded',
        publicationLevel: 'Public',
      };

      const result = formatConceptResult(concept);

      expect(result).toContain('concept-1');
      expect(result).toContain('Test Konzept');
      expect(result).toContain('Recorded');
      expect(result).toContain('Public');
    });

    it('should handle concept with minimal fields', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
      };

      const result = formatConceptResult(concept);

      expect(result).toContain('concept-1');
      expect(result).toBeDefined();
    });

    it('should handle multilingual titles', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: {
          de: 'Deutscher Titel',
          fr: 'Titre français',
          it: 'Titolo italiano',
          en: 'English title',
        },
      };

      const result = formatConceptResult(concept);

      expect(result).toContain('Deutscher Titel');
    });
  });

  describe('formatDatasetResult', () => {
    it('should format dataset with all fields', () => {
      const dataset = {
        id: 'dataset-123',
        identifier: 'ds-1',
        title: { de: 'Test Dataset' },
        description: { de: 'Dataset description' },
        publisher: { name: { de: 'Publisher Name' } },
        accessRights: 'public',
      };

      const result = formatDatasetResult(dataset);

      expect(result).toContain('ds-1');
      expect(result).toContain('Test Dataset');
      expect(result).toContain('public');
    });

    it('should handle dataset without publisher', () => {
      const dataset = {
        id: 'dataset-123',
        identifier: 'ds-1',
        title: { de: 'Test Dataset' },
      };

      const result = formatDatasetResult(dataset);

      expect(result).toContain('ds-1');
      expect(result).toBeDefined();
    });

    it('should format distributions if present', () => {
      const dataset = {
        id: 'dataset-123',
        identifier: 'ds-1',
        title: { de: 'Test Dataset' },
        distributions: [
          { format: 'CSV', accessURL: 'https://example.com/data.csv' },
          { format: 'JSON', accessURL: 'https://example.com/data.json' },
        ],
      };

      const result = formatDatasetResult(dataset);

      expect(result).toContain('CSV');
      expect(result).toContain('JSON');
    });
  });

  describe('formatDataServiceResult', () => {
    it('should format data service with all fields', () => {
      const service = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'service-1',
        title: { de: 'Test Service' },
        description: { de: 'Service description' },
        endpointURL: 'https://api.example.com',
        accessRights: 'restricted',
      };

      const result = formatDataServiceResult(service);

      expect(result).toContain('service-1');
      expect(result).toContain('Test Service');
      expect(result).toContain('https://api.example.com');
    });

    it('should handle service without endpoint', () => {
      const service = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'service-1',
        title: { de: 'Test Service' },
      };

      const result = formatDataServiceResult(service);

      expect(result).toContain('service-1');
      expect(result).toBeDefined();
    });
  });

  describe('formatPublicServiceResult', () => {
    it('should format public service with all fields', () => {
      const service = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'ps-1',
        title: { de: 'Public Service' },
        description: { de: 'Service description' },
        competentAuthority: { name: { de: 'Authority Name' } },
      };

      const result = formatPublicServiceResult(service);

      expect(result).toContain('ps-1');
      expect(result).toContain('Public Service');
    });

    it('should handle service without authority', () => {
      const service = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'ps-1',
        title: { de: 'Public Service' },
      };

      const result = formatPublicServiceResult(service);

      expect(result).toContain('ps-1');
      expect(result).toBeDefined();
    });
  });

  describe('formatError', () => {
    it('should format standard error', () => {
      const error = new Error('Test error message');

      const result = formatError(error);

      expect(result.content[0].text).toContain('Test error message');
      expect(result.isError).toBe(true);
    });

    it('should format HTTP error with status', () => {
      const error = new Error('Not Found');
      error.response = { status: 404 };

      const result = formatError(error);

      expect(result.content[0].text).toContain('404');
      expect(result.content[0].text).toContain('Not Found');
      expect(result.isError).toBe(true);
    });

    it('should format validation error', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.issues = [
        { path: ['field1'], message: 'Required' },
        { path: ['field2'], message: 'Invalid format' },
      ];

      const result = formatError(error);

      expect(result.content[0].text).toContain('Validation');
      expect(result.content[0].text).toContain('field1');
      expect(result.content[0].text).toContain('field2');
      expect(result.isError).toBe(true);
    });

    it('should handle error without message', () => {
      const error = new Error();

      const result = formatError(error);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.isError).toBe(true);
    });

    it('should handle non-Error objects', () => {
      const error = { message: 'Custom error' };

      const result = formatError(error);

      expect(result.content[0].text).toContain('Custom error');
      expect(result.isError).toBe(true);
    });

    it('should handle string errors', () => {
      const error = 'Simple error string';

      const result = formatError(error);

      expect(result.content[0].text).toContain('Simple error string');
      expect(result.isError).toBe(true);
    });
  });

  describe('formatSuccess', () => {
    it('should format string data', () => {
      const result = formatSuccess('test data');
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('test data');
    });

    it('should format object data as JSON', () => {
      const data = { key: 'value', nested: { prop: 123 } };
      const result = formatSuccess(data);
      
      expect(result.content[0].text).toContain('"key"');
      expect(result.content[0].text).toContain('"value"');
      expect(result.content[0].text).toContain('"nested"');
    });

    it('should format array data', () => {
      const data = [1, 2, 3];
      const result = formatSuccess(data);
      
      expect(result.content[0].text).toContain('[');
      expect(result.content[0].text).toContain('1');
    });
  });

  describe('formatPaginationInfo', () => {
    it('should calculate pagination correctly', () => {
      const result = formatPaginationInfo(0, 25, 100);
      
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(25);
      expect(result.totalItems).toBe(100);
      expect(result.totalPages).toBe(4);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should handle last page', () => {
      const result = formatPaginationInfo(3, 25, 100);
      
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should handle single page', () => {
      const result = formatPaginationInfo(0, 25, 10);
      
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });
  });

  describe('formatMultilingualText', () => {
    it('should return preferred language', () => {
      const text = { de: 'Deutsch', fr: 'Français', en: 'English' };
      
      expect(formatMultilingualText(text, 'fr')).toBe('Français');
    });

    it('should fallback to German', () => {
      const text = { de: 'Deutsch', it: 'Italiano' };
      
      expect(formatMultilingualText(text, 'fr')).toBe('Deutsch');
    });

    it('should fallback to English if no German', () => {
      const text = { en: 'English', it: 'Italiano' };
      
      expect(formatMultilingualText(text, 'fr')).toBe('English');
    });

    it('should return first available if no fallback matches', () => {
      const text = { rm: 'Rumantsch' };
      
      expect(formatMultilingualText(text)).toBe('Rumantsch');
    });

    it('should handle null input', () => {
      expect(formatMultilingualText(null)).toBe('');
    });

    it('should handle empty object', () => {
      expect(formatMultilingualText({})).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 100)).toBe(text);
    });

    it('should truncate long text', () => {
      const text = 'A'.repeat(300);
      const result = truncateText(text, 200);
      
      expect(result.length).toBe(200);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle null text', () => {
      expect(truncateText(null)).toBe(null);
    });

    it('should handle undefined text', () => {
      expect(truncateText(undefined)).toBe(undefined);
    });
  });

  describe('formatListSummary', () => {
    it('should format summary correctly', () => {
      const items = [1, 2, 3];
      const pagination = {
        totalItems: 100,
        page: 0,
        totalPages: 4,
      };
      
      const result = formatListSummary(items, 'concepts', pagination);
      
      expect(result).toContain('Found 100 concepts');
      expect(result).toContain('page 1 of 4');
      expect(result).toContain('3 items on this page');
    });
  });

  describe('formatCatalogResponse', () => {
    it('should format catalog with all fields', () => {
      const catalog = {
        id: 'cat-1',
        title: { de: 'Katalog' },
        description: { de: 'Beschreibung' },
      };
      
      const result = formatCatalogResponse(catalog);
      
      expect(result).toContain('cat-1');
      expect(result).toContain('Katalog');
      expect(result).toContain('Beschreibung');
    });

    it('should handle catalog without description', () => {
      const catalog = {
        id: 'cat-1',
        title: { de: 'Katalog' },
      };
      
      const result = formatCatalogResponse(catalog);
      
      expect(result).toContain('cat-1');
      expect(result).not.toContain('Description:');
    });
  });

  describe('formatConceptResponse', () => {
    it('should format concept with all fields', () => {
      const concept = {
        id: 'concept-1',
        prefLabel: { de: 'Begriff' },
        definition: { de: 'Definition' },
      };
      
      const result = formatConceptResponse(concept);
      
      expect(result).toContain('concept-1');
      expect(result).toContain('Begriff');
      expect(result).toContain('Definition');
    });

    it('should handle concept without definition', () => {
      const concept = {
        id: 'concept-1',
        prefLabel: { de: 'Begriff' },
      };
      
      const result = formatConceptResponse(concept);
      
      expect(result).toContain('concept-1');
      expect(result).not.toContain('Definition:');
    });
  });

  describe('formatDatasetResponse', () => {
    it('should format dataset with distributions', () => {
      const dataset = {
        id: 'ds-1',
        title: { de: 'Dataset' },
        description: { de: 'Beschreibung' },
        distribution: [
          { format: 'CSV', accessURL: 'https://example.com/data.csv' },
        ],
      };
      
      const result = formatDatasetResponse(dataset);
      
      expect(result).toContain('ds-1');
      expect(result).toContain('Dataset');
      expect(result).toContain('Distributions:');
      expect(result).toContain('CSV');
    });

    it('should handle dataset without distributions', () => {
      const dataset = {
        id: 'ds-1',
        title: { de: 'Dataset' },
      };
      
      const result = formatDatasetResponse(dataset);
      
      expect(result).toContain('ds-1');
      expect(result).not.toContain('Distributions:');
    });
  });

  describe('formatDataServiceResponse', () => {
    it('should format service with endpoint', () => {
      const service = {
        id: 'svc-1',
        title: { de: 'Service' },
        description: { de: 'Beschreibung' },
        endpointURL: 'https://api.example.com',
      };
      
      const result = formatDataServiceResponse(service);
      
      expect(result).toContain('svc-1');
      expect(result).toContain('Service');
      expect(result).toContain('https://api.example.com');
    });

    it('should handle service without endpoint', () => {
      const service = {
        id: 'svc-1',
        title: { de: 'Service' },
      };
      
      const result = formatDataServiceResponse(service);
      
      expect(result).toContain('svc-1');
      expect(result).not.toContain('Endpoint:');
    });
  });

  describe('formatPublicServiceResponse', () => {
    it('should format public service', () => {
      const service = {
        id: 'ps-1',
        name: { de: 'Service' },
        description: { de: 'Beschreibung' },
      };
      
      const result = formatPublicServiceResponse(service);
      
      expect(result).toContain('ps-1');
      expect(result).toContain('Service');
      expect(result).toContain('Beschreibung');
    });

    it('should handle service without description', () => {
      const service = {
        id: 'ps-1',
        name: { de: 'Service' },
      };
      
      const result = formatPublicServiceResponse(service);
      
      expect(result).toContain('ps-1');
      expect(result).not.toContain('Description:');
    });
  });

  describe('formatListResponse', () => {
    const simpleFormatter = (item) => `Item: ${item}`;

    it('should format list with items', () => {
      const items = ['a', 'b', 'c'];
      const result = formatListResponse(items, simpleFormatter);
      
      expect(result).toContain('Item: a');
      expect(result).toContain('Item: b');
      expect(result).toContain('Total: 3');
    });

    it('should format list with pagination', () => {
      const items = ['a', 'b'];
      const pagination = { page: 1, limit: 2, total: 10 };
      const result = formatListResponse(items, simpleFormatter, pagination);
      
      expect(result).toContain('Page 1 of 5');
      expect(result).toContain('Total: 10');
    });

    it('should handle empty list', () => {
      const result = formatListResponse([], simpleFormatter);
      
      expect(result).toBe('No items found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: null,
        description: null,
      };

      const result = formatConceptResult(concept);

      expect(result).toBeDefined();
      expect(result).toContain('concept-1');
    });

    it('should handle undefined values gracefully', () => {
      const dataset = {
        id: 'dataset-123',
        identifier: 'ds-1',
        title: undefined,
        description: undefined,
      };

      const result = formatDatasetResult(dataset);

      expect(result).toBeDefined();
      expect(result).toContain('ds-1');
    });

    it('should handle empty objects', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: {},
        description: {},
      };

      const result = formatConceptResult(concept);

      expect(result).toBeDefined();
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(10000);
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: { de: longText },
      };

      const result = formatConceptResult(concept);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const concept = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'concept-1',
        title: { de: 'Test <>&"\'\\n\\t' },
      };

      const result = formatConceptResult(concept);

      expect(result).toBeDefined();
    });
  });
});
