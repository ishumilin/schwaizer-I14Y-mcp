/**
 * Global test setup for schwaizer-I14Y MCP server
 * Configures mocks and test environment
 */

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.I14Y_API_BASE_URL = 'https://test.i14y.admin.ch/api/v4';
  process.env.LOG_LEVEL = 'silent';
});

// Clean up after all tests
afterAll(() => {
  vi.clearAllMocks();
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Global test utilities
global.createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

global.createMockError = (message, status = 500) => {
  const error = new Error(message);
  error.response = {
    status,
    statusText: message,
  };
  return error;
};

// Mock i14yClient for tool tests
global.createMockI14YClient = () => ({
  searchConcepts: vi.fn(),
  getConcept: vi.fn(),
  getCodeListEntries: vi.fn(),
  searchDatasets: vi.fn(),
  getDataset: vi.fn(),
  getDatasetStructure: vi.fn(),
  exportDatasetStructure: vi.fn(),
  listDatasetDistributions: vi.fn(),
  searchDataServices: vi.fn(),
  getDataService: vi.fn(),
  searchPublicServices: vi.fn(),
  getPublicService: vi.fn(),
});
