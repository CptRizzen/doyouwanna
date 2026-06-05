const expoPreset = require('jest-expo/jest-preset');

const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
};

module.exports = {
  // Two projects: pure domain logic (fast, node) and component/integration tests (jest-expo).
  projects: [
    {
      ...expoPreset,
      displayName: 'domain',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/domain/**/*.test.ts'],
      moduleNameMapper,
    },
    {
      ...expoPreset,
      displayName: 'components',
      testMatch: [
        '<rootDir>/src/**/*.test.tsx',
        '<rootDir>/app/**/*.test.tsx',
        '<rootDir>/test/**/*.test.tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
      moduleNameMapper,
    },
    // NOTE: a third "api" project for MSW-backed Supabase REST tests is staged
    // but not wired into the default run yet. MSW v2 resolves to its TS source
    // under babel-preset-expo (defeating moduleNameMapper), so the api project
    // needs a plain @babel/preset-typescript transform + module-commonjs plugin
    // (not currently installed). The infra is in test/msw/* and test/api/* and
    // documented in test/api/README.md for the next iteration.
  ],
  // Coverage config lives at the root when using `projects`.
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    '!src/domain/**/*.test.ts',
    '!src/domain/index.ts',
    '!src/domain/types.ts',
  ],
  coverageThreshold: {
    './src/domain/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
