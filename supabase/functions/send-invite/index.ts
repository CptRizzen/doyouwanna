// Supabase Edge Function (Deno) — send an invite email via Resend.
//
// STATUS: stub for a later phase. The invites table + accept_invite RPC already
// exist; this function will be fleshed out when the email flow ships (P1).
// Deploy with: supabase functions deploy send-invite
//
// Expected request body: { inviteId: string }
// Env: RESEND_API_KEY, PUBLIC_APP_URL (e.g. https://doyouwanna.app)

// @ts-nocheck — runs in the Deno edge runtime, not the RN/TS app build.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { inviteId } = await req.json();
    if (!inviteId) {
      return new Response(JSON.stringify({ error: 'inviteId required' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: invite, error } = await supabase
      .from('invites')
      .select('email, token')
      .eq('id', inviteId)
      .single();
    if (error || !invite) {
      return new Response(JSON.stringify({ error: 'invite not found' }), { status: 404 });
    }

    const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'doyouwanna://';
    const link = `${appUrl}/invite/${invite.token}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DoYouWanna <invites@doyouwanna.app>',
        to: invite.email,
        subject: "You're invited on DoYouWanna",
        html: `<p>Tap to join: <a href="${link}">${link}</a></p>`,
      }),
    });

    return new Response(JSON.stringify({ ok: res.ok }), {
      status: res.ok ? 200 : 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
