import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type OutboxRow = {
  id: number;
  to_email: string;
  template: string;
  data: Record<string, unknown> | null;
};

async function sendViaSendGrid(apiKey: string, fromEmail: string, to: string, template: string, data: Record<string, unknown> = {}) {
  const payload = {
    from: { email: fromEmail, name: "MoOn" },
    personalizations: [ { to: [{ email: to }], dynamic_template_data: data } ],
    template_id: template,
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${body}`);
  }
}

serve(async (req) => {
  // Simple protection with secret for cron
  const secret = Deno.env.get('AUTOMATION_RUNNER_SECRET');
  const header = req.headers.get('x-automation-secret');
  if (!secret || header !== secret) return new Response('Forbidden', { status: 403 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');
  if (!supabaseUrl || !serviceRoleKey || !sendgridApiKey || !fromEmail) {
    return new Response('Server misconfigured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Fetch up to 50 pending emails due
  const { data: rows, error } = await supabase
    .from('email_outbox')
    .select('id, to_email, template, data')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results: Array<{ id: number; status: string; error?: string }> = [];

  for (const row of (rows || []) as OutboxRow[]) {
    try {
      await sendViaSendGrid(sendgridApiKey, fromEmail, row.to_email, row.template, (row.data as any) || {});
      await supabase.from('email_outbox').update({ status: 'sent', sent_at: new Date().toISOString(), error: null }).eq('id', row.id);
      results.push({ id: row.id, status: 'sent' });
    } catch (e) {
      await supabase.from('email_outbox').update({ status: 'error', error: (e as Error).message }).eq('id', row.id);
      results.push({ id: row.id, status: 'error', error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

