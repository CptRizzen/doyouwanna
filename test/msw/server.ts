import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Shared MSW server used across the component test suite. */
export const server = setupServer(...handlers);
