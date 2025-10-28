import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  let body: { user_id?: string };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }
  const userIdToDelete = body.user_id;
  if (!userIdToDelete) return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  // Validate caller is ADMIN
  const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: me } = await authed.auth.getUser();
  const callerId = me?.user?.id ?? null;
  if (!callerId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const { data: isAdmin, error: adminErr } = await authed.rpc('is_admin', { uid: callerId });
  if (adminErr || !isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });

  const admin = createClient(supabaseUrl, serviceRoleKey);
  // Delete profile row first (cascade will delete dependants)
  const { error: delProfileErr } = await admin.from('profiles').delete().eq('id', userIdToDelete);
  if (delProfileErr) {
    // continue but note error
    console.warn('Profile delete error', delProfileErr.message);
  }
  // Delete auth user
  const { error: delAuthErr } = await admin.auth.admin.deleteUser(userIdToDelete);
  if (delAuthErr) return new Response(JSON.stringify({ error: delAuthErr.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

