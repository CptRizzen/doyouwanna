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
        subject: "You're invited — do you wanna join?",
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFFBF5;font-family:-apple-system,BlinkMacSystemFont,'Hanken Grotesk',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;padding:0 20px">
    <tr><td>
      <div style="background:#ffffff;border-radius:24px;padding:36px 32px;border:1px solid rgba(23,20,15,0.08);box-shadow:0 4px 20px rgba(23,20,15,0.08)">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;letter-spacing:0.08em;color:#FF5A3C;text-transform:uppercase">Do you wanna?</p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:600;color:#17140F;line-height:1.2">You're invited</h1>
        <p style="margin:0 0 28px;font-size:16px;color:#5C5750;line-height:1.5">
          Someone sent you an invite. Tap below to join — it takes about 30 seconds to sign up.
        </p>
        <a href="${link}" style="display:block;text-align:center;background:#FF5A3C;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 24px;border-radius:999px;box-shadow:0 4px 14px rgba(255,90,60,0.35)">
          Accept invite
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:#9C978F;text-align:center;line-height:1.5">
          Or copy this link:<br>
          <a href="${link}" style="color:#FF5A3C;word-break:break-all">${link}</a>
        </p>
        <p style="margin:20px 0 0;font-size:12px;color:#C4BEB6;text-align:center">
          This invite expires in 14 days. If you didn't expect this, you can ignore it.
        </p>
      </div>
    </td></tr>
  </table>
</body>
</html>`,
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
