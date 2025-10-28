#!/usr/bin/env node
// Queue a test email via RPC public.queue_email using Service Role key.

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const opts = {
    envFile: '.env.local',
    to: undefined,
    template: undefined,
    delay: 0,
    data: undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env-file') opts.envFile = argv[++i] ?? '.env.local';
    else if (a === '--to') opts.to = argv[++i];
    else if (a === '--template') opts.template = argv[++i];
    else if (a === '--delay') opts.delay = Number(argv[++i] ?? '0');
    else if (a === '--data') opts.data = argv[++i];
  }
  return opts;
}

function loadEnv(envPath) {
  const abs = path.resolve(envPath);
  if (fs.existsSync(abs)) {
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
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  loadEnv(opts.envFile);

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env. Use --env-file .env.local');
    process.exit(1);
  }

  if (!opts.to || !opts.template) {
    console.error('Usage: node scripts/queue-test-email.mjs --to you@example.com --template d-<sendgrid-template-id> [--delay 0] [--data "{\\"name\\":\\"Test\\"}"]');
    process.exit(1);
  }

  let dataObj = { name: 'Test' };
  if (opts.data) {
    try { dataObj = JSON.parse(opts.data); } catch {
      console.warn('Could not parse --data JSON. Using default {"name":"Test"}');
    }
  }

  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase.rpc('queue_email', {
    p_email: opts.to,
    p_template: opts.template,
    p_delay_seconds: opts.delay,
    p_data: dataObj,
  });

  if (error) {
    console.error('RPC error:', error.message);
    process.exit(1);
  }
  console.log('Queued:', { to: opts.to, template: opts.template, delay: opts.delay, data: dataObj });
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

