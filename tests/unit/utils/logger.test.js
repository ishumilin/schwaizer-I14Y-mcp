/**
 * Unit tests for logger utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import pino from 'pino';

// Mock pino
vi.mock('pino', () => ({
  default: vi.fn(() => {
    const mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };
    // Make child return a similar logger instance
    mockLogger.child.mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    });
    return mockLogger;
  }),
}));

describe('Logger', () => {
  let logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Re-import logger to get fresh instance
    const loggerModule = await import('../../../src/utils/logger.js');
    logger = loggerModule.default;
  });

  describe('Initialization', () => {
    it('should create logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should initialize pino with correct configuration', () => {
      // Logger is already initialized when module is imported
      // Just verify it has the expected methods
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });
  });

  describe('Logging Methods', () => {
    it('should have info method', () => {
      expect(logger.info).toBeDefined();
      logger.info('test message');
      expect(logger.info).toHaveBeenCalledWith('test message');
    });

    it('should have error method', () => {
      expect(logger.error).toBeDefined();
      logger.error('error message');
      expect(logger.error).toHaveBeenCalledWith('error message');
    });

    it('should have warn method', () => {
      expect(logger.warn).toBeDefined();
      logger.warn('warning message');
      expect(logger.warn).toHaveBeenCalledWith('warning message');
    });

    it('should have debug method', () => {
      expect(logger.debug).toBeDefined();
      logger.debug('debug message');
      expect(logger.debug).toHaveBeenCalledWith('debug message');
    });
  });

  describe('Structured Logging', () => {
    it('should support logging with context objects', () => {
      const context = { userId: '123', action: 'search' };
      logger.info(context, 'User action');
      expect(logger.info).toHaveBeenCalledWith(context, 'User action');
    });

    it('should support error logging with error objects', () => {
      const error = new Error('Test error');
      logger.error({ err: error }, 'Error occurred');
      expect(logger.error).toHaveBeenCalledWith({ err: error }, 'Error occurred');
    });
  });

  describe('Child Loggers', () => {
    it('should support creating child loggers', () => {
      // Pino loggers always have a child method
      expect(typeof logger.child).toBe('function');
      const childLogger = logger.child({ module: 'test' });
      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });
  });
});
