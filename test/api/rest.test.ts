import { createClient } from '@supabase/supabase-js';
import { http, HttpResponse } from 'msw';
import { Database } from '@/types/database.types';
import { server } from '../msw/server';

const SUPABASE_URL = 'http://localhost:54321';

/**
 * Proves the MSW infra intercepts Supabase PostgREST traffic. We build a bare
 * isomorphic client here (no expo-secure-store / react-native) so it runs under
 * the node export condition that MSW requires.
 */
function makeClient() {
  return createClient<Database>(SUPABASE_URL, 'test-anon-key', {
    auth: { persistSession: false },
  });
}

describe('Supabase REST via MSW', () => {
  it('returns rows that MSW serves for a table query', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/circles`, () =>
        HttpResponse.json([
          {
            id: 'c1',
            owner_id: 'u1',
            name: 'Hiking Crew',
            description: null,
            activity_tags: ['hiking'],
            created_at: '2026-06-05T00:00:00Z',
            updated_at: '2026-06-05T00:00:00Z',
          },
        ]),
      ),
    );

    const supabase = makeClient();
    const { data, error } = await supabase.from('circles').select('*');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].name).toBe('Hiking Crew');
  });

  it('surfaces PostgREST errors to the caller', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/circles`, () =>
        HttpResponse.json(
          { message: 'permission denied', code: '42501' },
          { status: 403 },
        ),
      ),
    );

    const supabase = makeClient();
    const { error } = await supabase.from('circles').select('*');

    expect(error).not.toBeNull();
  });
});

describe('Invites via MSW', () => {
  it('inserts an invite row', async () => {
    const invite = {
      id: 'inv-1',
      email: 'friend@example.com',
      circle_id: 'circle-1',
      event_id: null,
      inviter_id: 'user-1',
      token: 'abc123',
      status: 'pending',
      accepted_by: null,
      expires_at: '2026-06-19T00:00:00Z',
      created_at: '2026-06-05T00:00:00Z',
      accepted_at: null,
    };

    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/invites`, () =>
        HttpResponse.json([invite], { status: 201 }),
      ),
    );

    const supabase = makeClient();
    const { data, error } = await supabase
      .from('invites')
      .insert({ email: 'friend@example.com', inviter_id: 'user-1', circle_id: 'circle-1' })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  it('returns pending invites for a circle', async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/invites`, () =>
        HttpResponse.json([
          { id: 'inv-1', email: 'a@b.com', status: 'pending', circle_id: 'c1' },
          { id: 'inv-2', email: 'c@d.com', status: 'pending', circle_id: 'c1' },
        ]),
      ),
    );

    const supabase = makeClient();
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('circle_id', 'c1')
      .eq('status', 'pending');

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it('revokes an invite', async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/invites`, () =>
        HttpResponse.json([{ id: 'inv-1', status: 'revoked' }]),
      ),
    );

    const supabase = makeClient();
    const { error } = await supabase
      .from('invites')
      .update({ status: 'revoked' })
      .eq('id', 'inv-1');

    expect(error).toBeNull();
  });
});
