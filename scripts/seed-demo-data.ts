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

const sampleNotifications = [
  {
    type: 'system',
    title: 'Bienvenida a MoOn',
    body: 'Ya puedes completar tu perfil para recibir matches.',
  },
  {
    type: 'match',
    title: 'Nuevo match',
    body: 'Encontramos una persona compatible al 92%.',
  },
  {
    type: 'onboarding',
    title: 'Retoma tu onboarding',
    body: 'En dos pasos más desbloqueas sugerencias personalizadas.',
  },
];

const tenantSteps = [
  { step: 'tenant-style', payload: { tenant_style: 'equilibrio', __seed: true }, completed: true },
  { step: 'tenant-rhythm', payload: { tenant_rhythm: 'flex', __seed: true }, completed: true },
  { step: 'tenant-commitment', payload: { tenant_commitment: 'dialogo', __seed: true }, completed: true },
];

const ownerSteps = [
  { step: 'owner-ideal-tenant', payload: { ideal_tenant: 'profesional', __seed: true }, completed: true },
  { step: 'owner-checklist', payload: { owner_documents: 'parcial', __seed: true }, completed: true },
  { step: 'owner-rhythm', payload: { owner_rhythm: 'equilibrado', __seed: true }, completed: true },
];

const hostSteps = [
  { step: 'host-space', payload: { host_room_summary: 'luminosa', __seed: true }, completed: true },
  { step: 'host-rules', payload: { host_rules: 'limpieza', __seed: true }, completed: true },
];

const seed = async () => {
  const { data: profiles, error } = await supabase.from('profiles').select('id, role').limit(30);
  if (error) {
    console.error('Error obteniendo perfiles', error);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('No hay perfiles en la base de datos.');
    return;
  }

  const batchedNotifications = profiles.flatMap((profile) =>
    sampleNotifications.map((notification) => ({
      user_id: profile.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      metadata: { seed: true },
      delivered_at: new Date().toISOString(),
    })),
  );

  const { error: notifError } = await supabase.from('notifications').insert(batchedNotifications);
  if (notifError) {
    console.error('Error insertando notificaciones demo', notifError);
  } else {
    console.log(`Notificaciones demo insertadas para ${profiles.length} perfiles.`);
  }

  const onboardingPayload: Array<{
    user_id: string;
    role: string;
    step: string;
    payload: Record<string, unknown>;
    completed: boolean;
  }> = [];

  for (const profile of profiles) {
    if (profile.role === 'INQUILINO') {
      tenantSteps.forEach((step) =>
        onboardingPayload.push({
          user_id: profile.id,
          role: 'tenant',
          step: step.step,
          payload: step.payload,
          completed: step.completed,
        }),
      );
    } else if (profile.role === 'PROPIETARIO') {
      ownerSteps.forEach((step) =>
        onboardingPayload.push({
          user_id: profile.id,
          role: 'owner',
          step: step.step,
          payload: step.payload,
          completed: step.completed,
        }),
      );
    } else if (profile.role === 'ANFITRION') {
      hostSteps.forEach((step) =>
        onboardingPayload.push({
          user_id: profile.id,
          role: 'host',
          step: step.step,
          payload: step.payload,
          completed: step.completed,
        }),
      );
    }
  }

  if (onboardingPayload.length > 0) {
    const { error: onboardingError } = await supabase.from('onboarding_progress').upsert(onboardingPayload, {
      onConflict: 'user_id,role,step',
    });
    if (onboardingError) {
      console.error('Error insertando onboarding demo', onboardingError);
    } else {
      console.log(`Onboarding demo guardado para ${onboardingPayload.length} registros.`);
    }
  }

  console.log('Seed demo completado.');
};

seed().then(() => process.exit(0));
