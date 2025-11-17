import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'src/index.js',
      ],
      thresholds: {
        lines: 80,
        functions: 70,
        branches: 80,
        statements: 80,
      },
    },
    globals: true,
    environment: 'node',
  },
});
