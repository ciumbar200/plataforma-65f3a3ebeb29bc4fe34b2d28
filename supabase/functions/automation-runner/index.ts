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

  // Process CRM sequence enrollments that are due
  const seqResults: Array<{ id: number; status: string; error?: string }> = [];
  try {
    const nowIso = new Date().toISOString();
    const { data: enrollments, error: enrollError } = await supabase
      .from('crm_enrollments')
      .select('id, contact_id, sequence_id, current_step')
      .eq('status', 'enrolled')
      .lte('next_run_at', nowIso)
      .order('next_run_at', { ascending: true })
      .limit(20);

    if (enrollError) throw enrollError;

    for (const e of (enrollments || []) as Array<{ id: number; contact_id: string; sequence_id: number; current_step: number }>) {
      const stepPos = (e.current_step || 0) + 1;
      try {
        // Step to execute
        const { data: step, error: stepErr } = await supabase
          .from('crm_sequence_steps')
          .select('id, delay_seconds, template_id')
          .eq('sequence_id', e.sequence_id)
          .eq('position', stepPos)
          .maybeSingle();
        if (stepErr) throw stepErr;
        if (!step) {
          // No more steps -> complete
          await supabase.from('crm_enrollments').update({ status: 'completed', next_run_at: null }).eq('id', e.id);
          seqResults.push({ id: e.id, status: 'completed' });
          continue;
        }

        // Load template
        const { data: tpl, error: tplErr } = await supabase
          .from('email_templates')
          .select('provider, sendgrid_template_id')
          .eq('id', step.template_id)
          .maybeSingle();
        if (tplErr) throw tplErr;
        if (!tpl || tpl.provider !== 'sendgrid' || !tpl.sendgrid_template_id) {
          throw new Error('Invalid or unsupported email template for sequence step');
        }

        // Load contact
        const { data: contact, error: cErr } = await supabase
          .from('crm_contacts')
          .select('email, name')
          .eq('id', e.contact_id)
          .single();
        if (cErr) throw cErr;
        if (!contact?.email) throw new Error('Contact has no email');

        await sendViaSendGrid(sendgridApiKey, fromEmail, contact.email, tpl.sendgrid_template_id as string, { name: contact.name });

        // Determine next step scheduling
        const { data: nextStep } = await supabase
          .from('crm_sequence_steps')
          .select('delay_seconds')
          .eq('sequence_id', e.sequence_id)
          .eq('position', stepPos + 1)
          .maybeSingle();

        if (nextStep) {
          const nextRun = new Date(Date.now() + (Number(nextStep.delay_seconds) || 0) * 1000).toISOString();
          await supabase
            .from('crm_enrollments')
            .update({ current_step: stepPos, next_run_at: nextRun })
            .eq('id', e.id);
          seqResults.push({ id: e.id, status: 'sent' });
        } else {
          await supabase
            .from('crm_enrollments')
            .update({ current_step: stepPos, status: 'completed', next_run_at: null })
            .eq('id', e.id);
          seqResults.push({ id: e.id, status: 'completed' });
        }
      } catch (err) {
        await supabase
          .from('crm_enrollments')
          .update({ status: 'error', last_error: (err as Error).message })
          .eq('id', e.id);
        seqResults.push({ id: e.id, status: 'error', error: (err as Error).message });
      }
    }
  } catch (outer) {
    // include as meta error in response but don't fail entire run
    seqResults.push({ id: -1 as unknown as number, status: 'error', error: (outer as Error).message });
  }

  return new Response(JSON.stringify({ processed: results.length, results, sequences: { processed: seqResults.length, results: seqResults } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
