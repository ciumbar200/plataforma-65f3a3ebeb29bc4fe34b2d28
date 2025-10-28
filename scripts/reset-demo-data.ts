import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const loadEnv = () => {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    const contents = readFileSync(fullPath, 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
};

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const reset = async () => {
  const { data: demoNotifications, error: notifFetchError } = await supabase
    .from('notifications')
    .select('id')
    .contains('metadata', { seed: true });

  if (notifFetchError) {
    console.error('Error buscando notificaciones demo', notifFetchError);
  } else if (demoNotifications && demoNotifications.length > 0) {
    const ids = demoNotifications.map(({ id }) => id);
    const { error: deleteError } = await supabase.from('notifications').delete().in('id', ids);
    if (deleteError) {
      console.error('Error eliminando notificaciones demo', deleteError);
    } else {
      console.log(`Eliminadas ${ids.length} notificaciones demo.`);
    }
  }

  const { data: onboardingRows, error: onboardingFetchError } = await supabase
    .from('onboarding_progress')
    .select('id')
    .contains('payload', { __seed: true });

  if (onboardingFetchError) {
    console.error('Error leyendo onboarding_progress', onboardingFetchError);
  } else if (onboardingRows && onboardingRows.length > 0) {
    const { error: onboardingDeleteError } = await supabase
      .from('onboarding_progress')
      .delete()
      .in(
        'id',
        onboardingRows.map((row) => row.id),
      );
    if (onboardingDeleteError) {
      console.error('Error eliminando onboarding_progress demo', onboardingDeleteError);
    } else {
      console.log(`Eliminados ${onboardingRows.length} registros de onboarding_progress demo.`);
    }
  }

  console.log('Reset demo completado.');
};

reset().then(() => process.exit(0));
