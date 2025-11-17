/**
 * Unit tests for configuration module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Config Module', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear module cache to get fresh config
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Configuration Loading', () => {
    it('should load configuration with default values', async () => {
      process.env.I14Y_API_BASE_URL = 'https://test.i14y.admin.ch/api/v4';
      
      const { config } = await import('../../src/config.js');
      
      expect(config.apiBaseUrl).toBe('https://test.i14y.admin.ch/api/v4');
      expect(config.logLevel).toBeDefined();
    });

    it('should use custom log level when provided', async () => {
      process.env.I14Y_API_BASE_URL = 'https://test.i14y.admin.ch/api/v4';
      process.env.LOG_LEVEL = 'debug';
      
      const { config } = await import('../../src/config.js');
      
      expect(config.logLevel).toBe('debug');
    });

    it('should not throw error in test environment when API base URL is missing', async () => {
      delete process.env.I14Y_API_BASE_URL;
      process.env.NODE_ENV = 'test';
      
      const { config } = await import('../../src/config.js');
      
      // In test environment, config should load without throwing
      expect(config).toBeDefined();
      expect(config.apiBaseUrl).toBeUndefined();
    });

    it('should throw error when validateConfig is called without API base URL', async () => {
      delete process.env.I14Y_API_BASE_URL;
      process.env.NODE_ENV = 'test';
      
      const { validateConfig } = await import('../../src/config.js');
      
      expect(() => validateConfig()).toThrow('I14Y_API_BASE_URL is required');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate API base URL format', async () => {
      process.env.I14Y_API_BASE_URL = 'https://test.i14y.admin.ch/api/v4';
      
      const { config } = await import('../../src/config.js');
      
      expect(config.apiBaseUrl).toMatch(/^https?:\/\//);
    });

    it('should handle trailing slashes in API base URL', async () => {
      process.env.I14Y_API_BASE_URL = 'https://test.i14y.admin.ch/api/v4/';
      
      const { config } = await import('../../src/config.js');
      
      // Should work with or without trailing slash
      expect(config.apiBaseUrl).toBeTruthy();
    });
  });
});
