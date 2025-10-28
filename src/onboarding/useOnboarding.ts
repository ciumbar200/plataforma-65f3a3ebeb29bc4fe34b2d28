import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { OnboardingStep, User } from '../types';

export type OnboardingRole = 'tenant' | 'owner' | 'host';

export type StoredOnboardingStep = {
  step: string;
  payload?: Record<string, unknown> | null;
  completed: boolean;
  updated_at: string;
};

export const useOnboardingProgress = (user: User | null, role: OnboardingRole) => {
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Record<string, StoredOnboardingStep>>({});

  const loadProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', role)
        .order('updated_at', { ascending: false });
      if (error) {
        console.warn('[onboarding] RLS/select error', error.message);
        setSteps({});
        return;
      }
      const map: Record<string, StoredOnboardingStep> = {};
      data?.forEach((record) => {
        map[record.step] = {
          step: record.step,
          payload: record.payload,
          completed: record.completed,
          updated_at: record.updated_at,
        };
      });
      setSteps(map);
    } catch (err) {
      console.error('[onboarding] load error', err);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const upsertProgress = useCallback(
    async (stepId: string, payload: Record<string, unknown> | undefined, completed: boolean) => {
      if (!user) return;
    const { error } = await supabase
        .from('onboarding_progress')
        .upsert(
          {
            user_id: user.id,
            role,
            step: stepId,
            payload: payload ?? null,
            completed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,role,step' }
        );

      if (error) {
        console.warn('[onboarding] upsert error', error.message);
        return;
      }

      setSteps((prev) => ({
        ...prev,
        [stepId]: {
          step: stepId,
          payload,
          completed,
          updated_at: new Date().toISOString(),
        },
      }));
    },
    [user, role],
  );

  return {
    loading,
    steps,
    reload: loadProgress,
    upsertProgress,
  };
};

export const markOnboardingCompleted = async (user: User, role: OnboardingRole) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      onboarding_status: 'completed',
      onboarding_step: null,
      onboarding_updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateOnboardingCheckpoint = async (user: User, stepId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      onboarding_status: 'in_progress',
      onboarding_step: stepId,
      onboarding_updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const tenantSteps: OnboardingStep[] = [
  {
    id: 'tenant-welcome',
    title: 'Bienvenida a tu tribu MoOn',
    description: 'Cuéntanos cómo vives para presentarte a personas afines.',
  },
  {
    id: 'tenant-style',
    title: '¿Qué tipo de convivencia buscas?',
    inputs: [
      {
        name: 'tenant_style',
        type: 'choice',
        label: 'Selecciona la opción que más se parece a ti',
        required: true,
        options: [
          { value: 'tribu', label: 'Compartir mucho tiempo, cenas y planes en casa' },
          { value: 'equilibrio', label: 'Convivencia equilibrada: charlamos y respetamos espacios' },
          { value: 'independiente', label: 'Busco independencia, coincidimos cuando se da' },
          { value: 'coliving', label: 'Ambiente dinámico con gente nueva a menudo' },
        ],
      },
    ],
  },
  {
    id: 'tenant-rhythm',
    title: 'Ritmo y energía del hogar',
    inputs: [
      {
        name: 'tenant_rhythm',
        type: 'choice',
        label: '¿Cómo imaginas la casa en el día a día?',
        required: true,
        options: [
          { value: 'calma', label: 'Ambiente silencioso y ordenado todo el día' },
          { value: 'activo', label: 'Movimiento medio: conversaciones, música suave' },
          { value: 'flex', label: 'Depende: a veces tranquila, a veces social' },
          { value: 'vibrante', label: 'Casa con energía alta y visitas frecuentes' },
        ],
      },
    ],
  },
  {
    id: 'tenant-commitment',
    title: 'Tu compromiso con la convivencia',
    inputs: [
      {
        name: 'tenant_commitment',
        type: 'choice',
        label: '¿Qué detalle te representa mejor?',
        required: true,
        options: [
          { value: 'organizado', label: 'Mantengo el hogar en orden y sigo los acuerdos' },
          { value: 'dialogo', label: 'Me gusta hablar rápido si surge algo' },
          { value: 'apoyo', label: 'Estoy para echar una mano y cuidar el ambiente' },
          { value: 'flexible', label: 'Me adapto fácil a las dinámicas que acordemos' },
        ],
      },
    ],
  },
];

export const ownerSteps: OnboardingStep[] = [
  {
    id: 'owner-welcome',
    title: 'Bienvenido/a a MoOn Propietarios',
    description: 'Vamos a preparar tu anuncio para que el matcheo sea ágil y seguro.',
  },
  {
    id: 'owner-ideal-tenant',
    title: '¿Qué perfil encaja mejor con tu propiedad?',
    inputs: [
      {
        name: 'ideal_tenant',
        type: 'choice',
        label: 'Selecciona la descripción más cercana',
        required: true,
        options: [
          { value: 'profesional', label: 'Profesional estable, horarios regulares, estancia larga' },
          { value: 'estudiante', label: 'Estudiantes responsables, estancias de curso académico' },
          { value: 'pareja', label: 'Pareja o grupo reducido, convivencia relajada' },
          { value: 'mix', label: 'Abierto a varias opciones si comparten valores' },
        ],
      },
    ],
  },
  {
    id: 'owner-checklist',
    title: '¿Qué tienes listo para publicar?',
    inputs: [
      {
        name: 'owner_documents',
        type: 'choice',
        label: 'Selecciona la opción que mejor te describa',
        required: true,
        options: [
          { value: 'todo', label: 'Tengo contrato, fotos y normas listas' },
          { value: 'parcial', label: 'Tengo parte de la info, necesito ayuda con detalles' },
          { value: 'basico', label: 'Solo tengo lo esencial, quiero guía paso a paso' },
          { value: 'sin_preparar', label: 'Aún no tengo nada preparado' },
        ],
      },
    ],
  },
  {
    id: 'owner-rhythm',
    title: '¿Qué energía quieres en tu propiedad?',
    inputs: [
      {
        name: 'owner_rhythm',
        type: 'choice',
        label: 'Elige el ambiente que prefieres',
        required: true,
        options: [
          { value: 'sereno', label: 'Sereno y muy ordenado' },
          { value: 'equilibrado', label: 'Activa pero respetuosa' },
          { value: 'sociable', label: 'Me gusta fomentar planes y comunidad en casa' },
          { value: 'flexible', label: 'Me adapto según quien conviva' },
        ],
      },
    ],
  },
];

export const hostSteps: OnboardingStep[] = [
  {
    id: 'host-welcome',
    title: 'Modo anfitrión en marcha',
    description: 'Publica tu habitación en minutos y conecta con inquilinos compatibles.',
  },
  {
    id: 'host-space',
    title: 'Describe tu espacio',
    inputs: [
      {
        name: 'host_room_summary',
        type: 'choice',
        label: '¿Cuál resume mejor tu habitación?',
        required: true,
        options: [
          { value: 'baño_privado', label: 'Habitación con baño propio y servicios premium' },
          { value: 'luminosa', label: 'Espacio luminoso, perfecto para teletrabajar' },
          { value: 'compacta', label: 'Habitación funcional y cómoda, con zonas comunes potentes' },
          { value: 'compartida', label: 'Habitación compartida, ideal para estancias flexibles' },
        ],
      },
    ],
  },
  {
    id: 'host-rules',
    title: 'Reglas básicas de convivencia',
    inputs: [
      {
        name: 'host_rules',
        type: 'choice',
        label: '¿Qué quieres dejar claro desde el inicio?',
        required: true,
        options: [
          { value: 'horarios', label: 'Busco personas con horarios similares a los míos' },
          { value: 'visitas', label: 'Visitas puntuales y avisadas con antelación' },
          { value: 'limpieza', label: 'Prioridad: orden y limpieza compartida' },
          { value: 'flexible', label: 'Prefiero acordar normas en persona según el perfil' },
        ],
      },
    ],
  },
];
