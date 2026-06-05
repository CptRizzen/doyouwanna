import '@testing-library/react-native';

// Stable Supabase env for any component that constructs the client under test.
process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key';

// NOTE on MSW: msw's `./node` export is `null` under the `react-native` export
// condition that jest-expo's native preset uses, so MSW cannot run in the same
// project that renders RN components. The MSW server/handlers in test/msw are
// ready infra; they are wired into a dedicated node-condition "api" project
// (see jest.config.js) for Supabase REST integration tests, which use
// test/setup.msw.ts instead of this file.
