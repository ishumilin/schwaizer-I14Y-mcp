/**
 * Unit tests for Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  searchConceptsSchema,
  getConceptSchema,
  getCodeListEntriesSchema,
  searchDatasetsSchema,
  getDatasetSchema,
  getDatasetStructureSchema,
  exportDatasetStructureSchema,
  listDatasetDistributionsSchema,
  searchDataServicesSchema,
  getDataServiceSchema,
  searchPublicServicesSchema,
  getPublicServiceSchema,
} from '../../../src/api/schemas.js';

describe('Zod Schemas', () => {
  describe('searchConceptsSchema', () => {
    it('should validate valid search parameters', () => {
      const valid = {
        conceptIdentifier: 'test-concept',
        publisherIdentifier: 'pub-123',
        version: '1.0',
        publicationLevel: 'Public',
        registrationStatus: 'Recorded',
        page: 1,
        pageSize: 25,
      };

      const result = searchConceptsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = searchConceptsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid publication level', () => {
      const invalid = {
        publicationLevel: 'InvalidLevel',
      };

      const result = searchConceptsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject invalid page number', () => {
      const invalid = {
        page: 0,
      };

      const result = searchConceptsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject page size exceeding maximum', () => {
      const invalid = {
        pageSize: 101,
      };

      const result = searchConceptsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('getConceptSchema', () => {
    it('should validate valid UUID', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = getConceptSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalid = {
        id: 'not-a-uuid',
      };

      const result = getConceptSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const result = getConceptSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('getCodeListEntriesSchema', () => {
    it('should validate valid parameters', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        page: 1,
        pageSize: 50,
      };

      const result = getCodeListEntriesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should use default pagination values', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = getCodeListEntriesSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(25);
      }
    });
  });

  describe('searchDatasetsSchema', () => {
    it('should validate valid search parameters', () => {
      const valid = {
        accessRights: 'public',
        datasetIdentifier: 'dataset-123',
        publisherIdentifier: 'pub-456',
        publicationLevel: 'Public',
        registrationStatus: 'Recorded',
        page: 2,
        pageSize: 50,
      };

      const result = searchDatasetsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept minimal parameters', () => {
      const result = searchDatasetsSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('getDatasetSchema', () => {
    it('should validate dataset ID with language', () => {
      const valid = {
        id: 'dataset-123',
        language: 'de',
      };

      const result = getDatasetSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept ID without language', () => {
      const valid = {
        id: 'dataset-123',
      };

      const result = getDatasetSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing ID', () => {
      const result = getDatasetSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('getDatasetStructureSchema', () => {
    it('should validate structure request', () => {
      const valid = {
        id: 'dataset-123',
        language: 'fr',
      };

      const result = getDatasetStructureSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('exportDatasetStructureSchema', () => {
    it('should validate export request with format', () => {
      const valid = {
        id: 'dataset-123',
        format: 'json',
        language: 'it',
      };

      const result = exportDatasetStructureSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing format', () => {
      const invalid = {
        id: 'dataset-123',
      };

      const result = exportDatasetStructureSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('listDatasetDistributionsSchema', () => {
    it('should validate distribution list request', () => {
      const valid = {
        id: 'dataset-123',
        language: 'en',
      };

      const result = listDatasetDistributionsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('searchDataServicesSchema', () => {
    it('should validate data service search', () => {
      const valid = {
        accessRights: 'restricted',
        dataServiceIdentifier: 'service-123',
        publisherIdentifier: 'pub-789',
        publicationLevel: 'Internal',
        registrationStatus: 'Candidate',
        page: 1,
        pageSize: 30,
      };

      const result = searchDataServicesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('getDataServiceSchema', () => {
    it('should validate data service UUID', () => {
      const valid = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = getDataServiceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject non-UUID', () => {
      const invalid = {
        id: 'not-a-uuid',
      };

      const result = getDataServiceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('searchPublicServicesSchema', () => {
    it('should validate public service search', () => {
      const valid = {
        publicServiceIdentifier: 'ps-123',
        publisherIdentifier: 'pub-456',
        publicationLevel: 'Public',
        registrationStatus: 'Qualified',
        page: 3,
        pageSize: 15,
      };

      const result = searchPublicServicesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('getPublicServiceSchema', () => {
    it('should validate public service UUID', () => {
      const valid = {
        id: '987e6543-e21b-12d3-a456-426614174000',
      };

      const result = getPublicServiceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values for pagination', () => {
      const minPage = searchConceptsSchema.safeParse({ page: 1 });
      expect(minPage.success).toBe(true);

      const maxPageSize = searchConceptsSchema.safeParse({ pageSize: 100 });
      expect(maxPageSize.success).toBe(true);

      const minPageSize = searchConceptsSchema.safeParse({ pageSize: 1 });
      expect(minPageSize.success).toBe(true);
    });

    it('should reject negative pagination values', () => {
      const negativePage = searchConceptsSchema.safeParse({ page: -1 });
      expect(negativePage.success).toBe(false);

      const negativePageSize = searchConceptsSchema.safeParse({ pageSize: -10 });
      expect(negativePageSize.success).toBe(false);
    });

    it('should handle all registration status values', () => {
      const statuses = [
        'Incomplete',
        'Candidate',
        'Recorded',
        'Qualified',
        'Standard',
        'PreferredStandard',
        'Superseded',
        'Retired',
      ];

      statuses.forEach((status) => {
        const result = searchConceptsSchema.safeParse({ registrationStatus: status });
        expect(result.success).toBe(true);
      });
    });

    it('should handle all publication levels', () => {
      const levels = ['Internal', 'Public'];

      levels.forEach((level) => {
        const result = searchConceptsSchema.safeParse({ publicationLevel: level });
        expect(result.success).toBe(true);
      });
    });
  });
});
