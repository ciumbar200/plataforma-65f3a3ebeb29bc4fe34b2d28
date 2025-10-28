#!/usr/bin/env node
// Trigger the automation-runner function directly using its secret.

import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const opts = {
    envFile: '.env.local',
    url: process.env.SUPABASE_FUNCTION_AUTOMATION_URL,
    secret: process.env.AUTOMATION_RUNNER_SECRET,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env-file') opts.envFile = argv[++i] ?? '.env.local';
    else if (a === '--url') opts.url = argv[++i];
    else if (a === '--secret') opts.secret = argv[++i];
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

  const url = opts.url || process.env.SUPABASE_FUNCTION_AUTOMATION_URL;
  const secret = opts.secret || process.env.AUTOMATION_RUNNER_SECRET;
  if (!url || !secret) {
    console.error('Missing SUPABASE_FUNCTION_AUTOMATION_URL or AUTOMATION_RUNNER_SECRET. Provide with --url/--secret or in env.');
    process.exit(1);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-automation-secret': secret },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  console.log('Status:', res.status, res.ok ? 'OK' : 'ERROR');
  console.log('Body:', json);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
