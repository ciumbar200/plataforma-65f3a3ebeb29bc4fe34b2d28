import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreatePayload = {
  count?: number;
  expires_at?: string | null; // ISO string
  invited_email?: string | null;
};

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      }
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response('Server misconfigured', { status: 500 });
  }
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? '50');
    const page = Number(url.searchParams.get('page') ?? '0');
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from('ambassador_invites')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  if (req.method === 'POST') {
    let payload: CreatePayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    const count = Math.max(1, Math.min(100, Number(payload.count ?? 1)));
    const expires_at = payload.expires_at ?? null;
    const invited_email = payload.invited_email ?? null;

    // Create N codes
    const codes = Array.from({ length: count }, () => crypto.randomUUID().replace(/-/g, ''));
    const rows = codes.map((code) => ({ code, expires_at, invited_email }));
    const { data, error } = await supabase
      .from('ambassador_invites')
      .insert(rows)
      .select('*');
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
});

