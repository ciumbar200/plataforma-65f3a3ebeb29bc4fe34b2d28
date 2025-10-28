import React, { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import type { OnboardingStep, User } from '../types';
import { trackEvent } from '../lib/analytics';
import { updateOnboardingCheckpoint, markOnboardingCompleted, useOnboardingProgress, OnboardingRole } from './useOnboarding';
import { PRIMARY_BUTTON_CLASSES, LIGHT_BUTTON_CLASSES } from '../shared/styles';

type OnboardingFlowProps = {
  user: User;
  role: OnboardingRole;
  steps: OnboardingStep[];
  onFinish: (user: User) => void;
  hero: {
    title: string;
    subtitle: string;
    illustration: string;
    accent?: string;
  };
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, role, steps, onFinish, hero }) => {
  const { steps: savedSteps, upsertProgress } = useOnboardingProgress(user, role);
  const [current, setCurrent] = useState(() => {
    if (user.onboarding_status === 'in_progress' && user.onboarding_step) {
      const index = steps.findIndex((s) => s.id === user.onboarding_step);
      return index >= 0 ? index : 0;
    }
    return 0;
  });
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStep = steps[current];
  const progress = useMemo(() => Math.round(((current + 1) / steps.length) * 100), [current, steps.length]);

  const handleChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!activeStep) return;
    const savedPayload = savedSteps[activeStep.id]?.payload ?? {};
    const nextState: Record<string, string> = {};
    activeStep.inputs?.forEach((input) => {
      const storedValue = (savedPayload as Record<string, unknown>)[input.name];
      if (typeof storedValue === 'string' || typeof storedValue === 'number') {
        nextState[input.name] = String(storedValue);
      } else {
        nextState[input.name] = '';
      }
    });
    setFormState(nextState);
  }, [activeStep, savedSteps]);

  const handleNext = async () => {
    if (!activeStep) return;
    setError(null);
    const payload: Record<string, unknown> = {};
    let missingRequired = false;
    activeStep.inputs?.forEach((input) => {
      const value = formState[input.name] ?? '';
      if (input.required && (!value || String(value).trim() === '')) {
        missingRequired = true;
      }
      payload[input.name] = value;
    });

    if (missingRequired) {
      setError('Responde a las preguntas para continuar.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await upsertProgress(activeStep.id, payload, true);
      await updateOnboardingCheckpoint(user, activeStep.id);
      trackEvent('onboarding_step_saved', { role, step: activeStep.id });

      if (current < steps.length - 1) {
        setCurrent((prev) => prev + 1);
      } else {
        const { data, error: updateError } = await markOnboardingCompleted(user, role);
        if (updateError) throw updateError;
        if (data) {
          onFinish(data as User);
          trackEvent('onboarding_completed', { role });
        }
      }
    } catch (err: any) {
      console.error('[onboarding] save step error', err);
      setError(err.message ?? 'No pudimos guardar este paso, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 py-10 px-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <GlassCard className="border-white/10 bg-white/10">
          <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{hero.accent ?? 'Onboarding'}</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{hero.title}</h1>
              <p className="text-sm text-white/70 md:text-base">{hero.subtitle}</p>
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-white/60">
                  Paso {current + 1} de {steps.length}
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/20">
              <img src={hero.illustration} alt={hero.title} className="h-64 w-full object-cover brightness-80 md:h-72" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-white/10 bg-white/5">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">{activeStep?.title}</h2>
            {activeStep?.description && <p className="text-sm text-white/70">{activeStep.description}</p>}

            {activeStep?.inputs?.map((input) => (
              <div key={input.name} className="space-y-2">
                <label className="block text-sm font-semibold text-white/80">
                  {input.label}
                  {input.required && <span className="text-rose-300"> *</span>}
                </label>
                {input.type === 'textarea' ? (
                  <textarea
                    className="min-h-[120px] w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={input.placeholder}
                    value={formState[input.name] ?? ''}
                    onChange={(event) => handleChange(input.name, event.target.value)}
                  />
                ) : input.type === 'select' ? (
                  <select
                    className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formState[input.name] ?? ''}
                    onChange={(event) => handleChange(input.name, event.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    {input.options?.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : input.type === 'choice' ? (
                  <div className="space-y-2">
                    {input.options?.map((option) => {
                      const selected = formState[input.name] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange(input.name, option.value)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected ? 'border-indigo-300 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/30' : 'border-white/15 bg-white/10 text-white/80 hover:border-white/30 hover:bg-white/15'}`}
                        >
                          <span className="block text-sm font-semibold">{option.label}</span>
                          {option.helper && (
                            <span className="mt-1 block text-xs text-white/70">{option.helper}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type={input.type ?? 'text'}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={input.placeholder}
                    value={formState[input.name] ?? ''}
                    onChange={(event) => handleChange(input.name, event.target.value)}
                  />
                )}
                {input.helper && <p className="text-xs text-white/50">{input.helper}</p>}
              </div>
            ))}

            {error && <p className="text-sm text-rose-300">{error}</p>}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-white/50">
                {current + 1}/{steps.length}
              </span>
              <button
                type="button"
                className={`${PRIMARY_BUTTON_CLASSES} ${saving ? 'cursor-wait opacity-70' : ''}`}
                onClick={handleNext}
                disabled={saving}
              >
                {current === steps.length - 1 ? 'Finalizar' : 'Guardar y continuar'}
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
            className={`${LIGHT_BUTTON_CLASSES} ${current === 0 ? 'invisible' : ''}`}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
