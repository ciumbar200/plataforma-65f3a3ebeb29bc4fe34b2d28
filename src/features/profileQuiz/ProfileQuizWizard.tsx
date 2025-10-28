import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { QUIZ_QUESTIONS, QUIZ_VERSION, QuizQuestion, QuizOption } from './questions';
import type { User, ConvivenciaQuizAnswer } from '../../types';
import GlassCard from '../../components/GlassCard';
import { supabase } from '../../lib/supabaseClient';
import { XIcon, CameraIcon, ChevronLeftIcon } from '../../components/icons';
import { trackEvent } from '../../lib/analytics';

type ProfileQuizWizardProps = {
  user: User;
  isOpen: boolean;
  onSkip?: () => void;
  onUserUpdate?: (user: User) => void;
  onCompleted: (user: User) => void;
};

const TOTAL_STEPS = QUIZ_QUESTIONS.length + 1; // +1 foto

const wizardBackgroundClass = 'bg-gradient-to-br from-slate-950/95 via-indigo-950/80 to-slate-900/90';

const OPTION_BASE_CLASSES =
  'relative flex flex-col items-start gap-2 rounded-2xl border border-white/15 bg-white/[.08] px-5 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 hover:border-white/40 hover:bg-white/[.12]';

const PRIMARY_BUTTON_CLASSES =
  'inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

const LIGHT_BUTTON_CLASSES =
  'inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2 font-semibold text-white/80 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

const PHOTO_BUCKET = 'profile-photos';

const aggregatePersonaTags = (answers: Array<{ question: QuizQuestion; option: QuizOption }>) => {
  const tagCount = new Map<string, number>();

  answers.forEach(({ option }) => {
    option.personaTags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
    });
  });

  const sorted = Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1]);
  const dominantTags = sorted.slice(0, 4).map(([tag]) => tag);

  const profileSummary = dominantTags.length
    ? `Tu hogar ideal es ${dominantTags
        .map((tag) => tag.replace('-', ' '))
        .slice(0, 3)
        .join(', ')}.`
    : null;

  return {
    dominantTags,
    totalAnswers: answers.length,
    tagHistogram: Object.fromEntries(sorted),
    summary: profileSummary,
  };
};

const ProfileQuizWizard: React.FC<ProfileQuizWizardProps> = ({ user, isOpen, onSkip, onUserUpdate, onCompleted }) => {
  const [step, setStep] = useState(0);
  const [isUploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.avatar_url ?? null);
  const [isSavingAnswer, setSavingAnswer] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, QuizOption>>({});
  const [isFinishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(photoUrl ? 1 : 0);
    }
  }, [isOpen, photoUrl]);

  useEffect(() => {
    if (!isOpen) {
      setCompletedQuestions({});
      setError(null);
      setFinishing(false);
      setSavingAnswer(false);
    }
  }, [isOpen]);

  const progress = useMemo(() => Math.min(((step + (photoUrl ? 1 : 0)) / TOTAL_STEPS) * 100, 100), [step, photoUrl]);

  const sortedAnswers = useMemo(() => {
    return QUIZ_QUESTIONS.filter((question) => completedQuestions[question.id]).map((question) => ({
      question,
      option: completedQuestions[question.id],
    }));
  }, [completedQuestions]);

  const handlePhotoSelected = async (file: File) => {
    setError(null);
    setUploadingPhoto(true);
    try {
      const extension = file.type.split('/')[1] ?? 'jpg';
      const storagePath = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la foto.');
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPhotoUrl(publicUrl);
      if (data && onUserUpdate) {
        onUserUpdate(data as User);
      }
      setStep(1);
      trackEvent('profile_photo_uploaded', { context: 'quiz_onboarding' });
    } catch (err: any) {
      console.error('Error subiendo foto de perfil', err);
      setError(err.message ?? 'No se pudo subir tu foto. Inténtalo de nuevo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveAnswer = useCallback(
    async (question: QuizQuestion, option: QuizOption) => {
      setSavingAnswer(true);
      setError(null);
      try {
        const payload: ConvivenciaQuizAnswer = {
          questionId: question.id,
          answerId: option.id,
          metadata: {
            personaTags: option.personaTags,
            questionTitle: question.title,
            answerLabel: option.label,
            version: QUIZ_VERSION,
          },
        };

        const { error: upsertError } = await supabase.from('profile_quiz_answers').upsert(
          {
            user_id: user.id,
            question_id: payload.questionId,
            answer_id: payload.answerId,
            metadata: payload.metadata ?? null,
          },
          {
            onConflict: 'user_id,question_id',
          },
        );

        if (upsertError) throw upsertError;

        setCompletedQuestions((prev) => ({
          ...prev,
          [question.id]: option,
        }));
        trackEvent('quiz_answer_saved', { questionId: question.id, answerId: option.id, role: user.role });

        setTimeout(() => {
          setSavingAnswer(false);
          setStep((prevStep) => Math.min(prevStep + 1, TOTAL_STEPS - 1));
        }, 180);
      } catch (err: any) {
        console.error('Error guardando respuesta', err);
        setError(err.message ?? 'No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.');
        setSavingAnswer(false);
      }
    },
    [user.id],
  );

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(photoUrl ? 1 : 0, prev - 1));
  };

  const finishQuiz = async () => {
    setFinishing(true);
    setError(null);
    try {
      const personaProfile = aggregatePersonaTags(sortedAnswers);
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          convivencia_quiz_completed: true,
          convivencia_quiz_version: QUIZ_VERSION,
          convivencia_quiz_completed_at: new Date().toISOString(),
          convivencia_persona: personaProfile,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('No se pudo actualizar el perfil.');

      onCompleted(data as User);
      trackEvent('quiz_completed', { role: user.role, version: QUIZ_VERSION });
    } catch (err: any) {
      console.error('Error finalizando quiz', err);
      setError(err.message ?? 'Ocurrió un problema al cerrar el quiz. Inténtalo nuevamente.');
    } finally {
      setFinishing(false);
    }
  };

  if (!isOpen) return null;

  const isPhotoStep = step === 0 && !photoUrl;
  const question = !isPhotoStep ? QUIZ_QUESTIONS[step - 1] : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 px-4 py-8 backdrop-blur-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" aria-hidden />
      <div className="relative mx-auto w-full max-w-5xl space-y-6">
        <GlassCard className={`${wizardBackgroundClass} border border-white/10 px-6 py-6 md:px-10 md:py-8`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Quiz de convivencia</p>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {isPhotoStep ? 'Ponle cara a tu perfil' : question?.title}
              </h2>
              <p className="mt-2 text-sm text-white/70 md:text-base">
                {isPhotoStep
                  ? 'Una foto cálida aumenta un 3x tus matches. Solo la verán tus posibles compañer@s.'
                  : question?.description}
              </p>
            </div>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/15 md:inline-flex"
              >
                Guardar más tarde
              </button>
            )}
          </div>

          <div className="mt-6">
            <div aria-hidden className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-white/60">
              Paso {Math.min(step + (photoUrl ? 0 : 1), TOTAL_STEPS)} / {TOTAL_STEPS}
            </p>
          </div>

          {isPhotoStep && (
            <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80"
                      alt="Personas posando sonrientes en casa"
                      className="h-full w-full object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white/90">
                      <CameraIcon className="h-6 w-6 text-yellow-300" />
                      <p className="text-sm font-medium">
                        Sube una foto real y reciente. Nada de filtros extremos: buscamos que seas tú mism@.
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• Mejor con buena luz natural.</li>
                  <li>• Si salís varias personas, que quede claro quién eres.</li>
                  <li>• Puedes actualizarla en cualquier momento desde tu perfil.</li>
                </ul>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/30">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`${user.name} avatar`} className="h-full w-full object-cover" />
                  ) : (
                    <CameraIcon className="h-10 w-10 text-indigo-300" />
                  )}
                </div>
                <label className="relative inline-flex cursor-pointer items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handlePhotoSelected(file);
                      }
                    }}
                    disabled={isUploadingPhoto}
                  />
                  <span className={`${PRIMARY_BUTTON_CLASSES} ${isUploadingPhoto ? 'cursor-wait opacity-70' : ''}`}>
                    {isUploadingPhoto ? 'Subiendo…' : 'Cargar foto'}
                  </span>
                </label>
                {error && <p className="text-sm text-red-300">{error}</p>}
              </div>
            </div>
          )}

          {!isPhotoStep && question && (
            <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-start">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <img src={question.image} alt={question.title} className="h-64 w-full object-cover brightness-75 md:h-[22rem]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-medium text-white/85">
                    Cuéntanos cómo vives esta situación para afinar tus matches.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {question.options.map((option) => {
                  const isSelected = completedQuestions[question.id]?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => saveAnswer(question, option)}
                      className={`${OPTION_BASE_CLASSES} ${isSelected ? 'border-indigo-300 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20' : ''}`}
                      disabled={isSavingAnswer}
                    >
                      <span className="text-base font-semibold text-white">{option.label}</span>
                      {option.helper && <span className="text-sm text-white/70">{option.helper}</span>}
                      <div className="flex flex-wrap gap-2">
                        {option.personaTags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isSelected ? 'bg-indigo-400/30 text-indigo-100' : 'bg-white/10 text-white/60'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}

                {error && <p className="text-sm text-red-300">{error}</p>}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={handleBack} className={LIGHT_BUTTON_CLASSES} disabled={step <= (photoUrl ? 1 : 0)}>
                    <ChevronLeftIcon className="mr-2 h-4 w-4" />
                    Anterior
                  </button>
                  {step === TOTAL_STEPS - 1 ? (
                    <button
                      type="button"
                      onClick={finishQuiz}
                      className={`${PRIMARY_BUTTON_CLASSES} ${isFinishing ? 'cursor-wait opacity-70' : ''}`}
                      disabled={isFinishing}
                    >
                      {isFinishing ? 'Guardando…' : 'Ver mis matches'}
                    </button>
                  ) : (
                    <span className="text-xs text-white/50">
                      {step + 1}/{TOTAL_STEPS} preguntas respondidas
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="flex justify-end">
          {onSkip && (
            <button type="button" onClick={onSkip} className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 transition hover:text-white/80 md:hidden">
              Omitir ahora
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileQuizWizard;
