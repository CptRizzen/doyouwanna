import { server } from './msw/server';

// Lifecycle for the node-condition "api" test project (Supabase REST mocking).
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
