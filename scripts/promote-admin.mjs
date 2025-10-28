#!/usr/bin/env node
// Promote a user to ADMIN role in public.profiles by email.

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const opts = { email: undefined, envFile: '.env.local' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email') opts.email = argv[++i];
    else if (a === '--env-file') opts.envFile = argv[++i] ?? '.env.local';
  }
  return opts;
}

function loadEnv(envPath) {
  const abs = path.resolve(envPath);
  if (!fs.existsSync(abs)) return;
  const content = fs.readFileSync(abs, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq);
    const v = line.slice(eq + 1);
    if (!process.env[k]) process.env[k] = v;
  }
}

async function findUserByEmail(admin, email) {
  // Paginate through users (max 10k) to locate by email.
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.listUsers({ page, perPage });
    if (error) throw new Error('Admin listUsers failed: ' + error.message);
    const found = (data?.users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (!data || data.users.length < perPage) break; // no more pages
  }
  return null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.email) {
    console.error('Usage: node scripts/promote-admin.mjs --email user@example.com [--env-file .env.local]');
    process.exit(1);
  }
  loadEnv(opts.envFile);

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Provide via env or --env-file .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  // 1) Find auth user by email using Admin API
  const admin = supabase.auth.admin;
  const user = await findUserByEmail(admin, opts.email);
  if (!user) {
    console.error('User not found in auth.users for email:', opts.email);
    process.exit(1);
  }
  const userId = user.id;

  // 2) Update or insert profile with ADMIN role
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (selErr) {
    console.error('Error selecting profile:', selErr.message);
    process.exit(1);
  }

  if (existing) {
    const { error: updErr } = await supabase
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', userId);
    if (updErr) {
      console.error('Error updating profile role:', updErr.message);
      process.exit(1);
    }
    console.log(`✔ Updated existing profile to ADMIN for ${opts.email} (${userId})`);
  } else {
    const { error: insErr } = await supabase
      .from('profiles')
      .insert({ id: userId, role: 'ADMIN' });
    if (insErr) {
      console.error('Error inserting profile as ADMIN:', insErr.message);
      process.exit(1);
    }
    console.log(`✔ Inserted new profile as ADMIN for ${opts.email} (${userId})`);
  }

  console.log('Done. You should now have admin access.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

