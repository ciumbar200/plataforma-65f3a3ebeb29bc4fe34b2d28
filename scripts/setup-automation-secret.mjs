#!/usr/bin/env node
// Utility to generate and propagate AUTOMATION_RUNNER_SECRET without ts-node.

import { randomBytes } from 'crypto';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const opts = {
    secret: undefined,
    length: 32, // bytes
    encoding: 'hex', // 'hex' | 'base64'
    setSupabase: false,
    setVercel: false,
    updateLocalEnv: false,
    envFile: '.env.local',
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--secret') opts.secret = argv[++i];
    else if (a === '--length') opts.length = Number(argv[++i] ?? '32');
    else if (a === '--encoding') {
      const enc = (argv[++i] ?? 'hex');
      opts.encoding = enc === 'base64' ? 'base64' : 'hex';
    } else if (a === '--set-supabase') opts.setSupabase = true;
    else if (a === '--set-vercel') opts.setVercel = true;
    else if (a === '--update-local-env') opts.updateLocalEnv = true;
    else if (a === '--env-file') opts.envFile = argv[++i] ?? '.env.local';
  }
  return opts;
}

function generateSecret(bytes, encoding) {
  return randomBytes(bytes).toString(encoding);
}

function setSupabaseSecret(secret) {
  try {
    execSync(`supabase functions secrets set AUTOMATION_RUNNER_SECRET="${secret}"`, { stdio: 'inherit' });
    console.log('\n✔ Set AUTOMATION_RUNNER_SECRET in Supabase Functions secrets.');
  } catch (e) {
    console.warn('\n⚠ Could not set Supabase secret automatically. Please run:');
    console.warn(`  supabase functions secrets set AUTOMATION_RUNNER_SECRET="${secret}"`);
  }
}

function printVercelInstructions(secret) {
  console.log('\nVercel → add this env var in Project Settings → Environment Variables:');
  console.log('  Name: AUTOMATION_RUNNER_SECRET');
  console.log('  Value:', secret);
  console.log('  Environments: Production (y opcional Preview/Development)');
  console.log('\nCLI alternative (project must be linked, will prompt):');
  console.log('  echo "' + secret + '" | vercel env add AUTOMATION_RUNNER_SECRET production');
}

function updateLocalEnvFile(envPath, key, value) {
  const abs = path.resolve(envPath);
  let content = '';
  if (fs.existsSync(abs)) content = fs.readFileSync(abs, 'utf8');
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  const line = `${key}=${JSON.stringify(value).slice(1, -1)}`;
  if (idx >= 0) lines[idx] = line; else lines.push(line);
  const out = lines.filter((l, i, arr) => i === arr.length - 1 ? l.trim() !== '' : true).join('\n') + '\n';
  fs.writeFileSync(abs, out, 'utf8');
  console.log(`\n✔ Wrote ${key} to ${envPath} (local only, NOT for git).`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const secret = opts.secret || generateSecret(opts.length, opts.encoding);

  console.log('AUTOMATION_RUNNER_SECRET generated:');
  console.log(secret);

  if (opts.setSupabase) {
    setSupabaseSecret(secret);
  } else {
    console.log('\nTo set in Supabase now:');
    console.log(`  supabase functions secrets set AUTOMATION_RUNNER_SECRET="${secret}"`);
  }

  if (opts.setVercel) {
    printVercelInstructions(secret);
  } else {
    console.log('\nTo set in Vercel:');
    console.log('  Project Settings → Environment Variables');
    console.log('  Name: AUTOMATION_RUNNER_SECRET');
    console.log('  Value:', secret);
    console.log('\nOptional CLI:');
    console.log('  echo "' + secret + '" | vercel env add AUTOMATION_RUNNER_SECRET production');
  }

  if (opts.updateLocalEnv) {
    updateLocalEnvFile(opts.envFile, 'AUTOMATION_RUNNER_SECRET', secret);
  } else {
    console.log(`\n(Local) To write into ${opts.envFile}:`);
    console.log(`  echo AUTOMATION_RUNNER_SECRET=${secret} >> ${opts.envFile}`);
  }

  console.log('\nNext steps:');
  console.log('- Deploy function if not yet deployed:');
  console.log('    supabase functions deploy automation-runner');
  console.log('- Set Vercel env SUPABASE_FUNCTION_AUTOMATION_URL to the function URL.');
  console.log('- Optionally set AUTOMATION_TRIGGER_TOKEN and call your cron endpoint with x-automation-trigger.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

