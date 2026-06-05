# API integration tests (MSW) — staged, not yet in default `npm test`

`rest.test.ts` proves the Supabase PostgREST layer against mocked HTTP via MSW.
The handlers live in `../msw/`. It is **not** run by `npm test` yet because of a
resolver conflict:

- MSW v2's `./node` / core exports are `null` under the `react-native` export
  condition that `jest-expo`'s native preset uses, so MSW cannot run in the same
  Jest project that renders React Native components.
- A dedicated node-environment project fixes the conditions, **but**
  `babel-preset-expo` resolves the `msw` specifier to MSW's TypeScript *source*
  (dragging in untransformed ESM), which defeats `moduleNameMapper`.

## To finish wiring (next iteration)

1. `npm i -D @babel/plugin-transform-modules-commonjs @babel/preset-react`
2. Add an `api` project to `jest.config.js`:
   ```js
   {
     displayName: 'api',
     testEnvironment: 'node',
     testMatch: ['<rootDir>/test/api/**/*.test.ts'],
     setupFilesAfterEnv: ['<rootDir>/test/setup.msw.ts'],
     moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
     transform: {
       '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
         presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
         plugins: ['@babel/plugin-transform-modules-commonjs'],
       }],
     },
     testEnvironmentOptions: { customExportConditions: ['node', 'require', 'default'] },
   }
   ```
3. `npx jest --selectProjects api` should then pass.

The domain suites in `src/domain/__tests__` are the primary spec and already run
at 100% coverage; this MSW layer is complementary integration coverage.
