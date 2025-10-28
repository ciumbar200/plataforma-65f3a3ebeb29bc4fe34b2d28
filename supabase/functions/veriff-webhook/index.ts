import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();

async function verifySignature(body: string, signatureHex: string | null, secret: string) {
  if (!signatureHex) return false;
  const cleanHex = signatureHex.replace(/[^a-fA-F0-9]/g, "");
  const signatureBytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
  );

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(body));
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const secret = Deno.env.get("VERIFF_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!secret || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables for veriff-webhook");
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-veriff-signature");

  const isValid = await verifySignature(rawBody, signature, secret);
  if (!isValid) {
    console.warn("Invalid Veriff signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error("Invalid JSON payload from Veriff", error);
    return new Response("Invalid JSON", { status: 400 });
  }

  const verification = payload?.verification;
  const sessionId = verification?.id;
  const status = verification?.status ?? null;
  const reason = verification?.code ?? verification?.reason ?? null;

  if (!sessionId) {
    return new Response("Missing verification ID", { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_verified: status === "approved",
      veriff_status: status,
      veriff_reason: reason,
    })
    .eq("veriff_session_id", sessionId)
    .select("id")
    .single();

  if (error) {
    console.error("Error updating profile with Veriff data:", error);
    return new Response("Database error", { status: 500 });
  }

  if (!data) {
    console.warn("No profile found for Veriff session:", sessionId);
    return new Response("Profile not found", { status: 404 });
  }

  return new Response("ok", { status: 200 });
});
