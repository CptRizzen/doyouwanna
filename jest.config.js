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
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/api/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup.msw.ts'],
      moduleNameMapper,
      transform: {
        '^.+\\.(ts|tsx|js|jsx|mjs|cjs)$': ['babel-jest', {
          configFile: false,
          presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
          plugins: ['@babel/plugin-transform-modules-commonjs'],
        }],
      },
      testEnvironmentOptions: { customExportConditions: ['node', 'require', 'default'] },
      transformIgnorePatterns: [
        'node_modules/(?!(msw|rettime|until-async|@open-draft/deferred-promise|@mswjs)/)',
      ],
    },
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
