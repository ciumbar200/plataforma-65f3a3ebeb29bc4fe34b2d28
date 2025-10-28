import React, { useEffect, useMemo } from 'react';
import { User } from '../types';
import { SparklesIcon, HeartIcon, XIcon } from './icons';

interface MatchCelebrationProps {
  currentUser: User;
  matchedUser: User;
  compatibility?: number | null;
  onClose: () => void;
  onViewMatches?: () => void;
}

const AvatarBubble: React.FC<{ user: User; animationDelay?: number }> = ({ user, animationDelay = 0 }) => {
  const initials = useMemo(() => user.name?.charAt(0)?.toUpperCase() ?? 'M', [user.name]);

  return (
    <div
      className="match-avatar relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 shadow-lg shadow-purple-900/50"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className="absolute inset-0 opacity-60 blur-2xl" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(250, 113, 205, 0.6), transparent 60%)' }} />
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className="relative h-full w-full object-cover" />
      ) : (
        <span className="relative text-3xl font-semibold text-white">{initials}</span>
      )}
    </div>
  );
};

const MatchCelebration: React.FC<MatchCelebrationProps> = ({ currentUser, matchedUser, compatibility, onClose, onViewMatches }) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(onClose, 10000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const compatibilityLabel = useMemo(() => {
    if (compatibility == null || Number.isNaN(compatibility)) return null;
    return `${compatibility}%`;
  }, [compatibility]);

  const loggedFirstName = useMemo(() => currentUser.name?.split(' ')[0] || currentUser.name, [currentUser.name]);
  const matchedFirstName = useMemo(() => matchedUser.name?.split(' ')[0] || matchedUser.name, [matchedUser.name]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className="match-confetti"
            style={{
              left: `${(index + 1) * (100 / 15)}%`,
              animationDelay: `${index * 0.25}s`,
              background: index % 3 === 0
                ? 'linear-gradient(180deg, rgba(236,72,153,0.95), rgba(168,85,247,0.75))'
                : index % 3 === 1
                  ? 'linear-gradient(180deg, rgba(56,189,248,0.95), rgba(99,102,241,0.75))'
                  : 'linear-gradient(180deg, rgba(250,204,21,0.95), rgba(244,114,182,0.75))',
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#20103d]/90 via-[#2d1855]/90 to-[#161133]/90 shadow-[0_0_90px_rgba(99,102,241,0.35)]"
        onClick={event => event.stopPropagation()}
      >
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
        <button
          type="button"
          aria-label="Cerrar celebración de match"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/15 p-2 text-white/80 transition hover:bg-white/30 hover:text-white"
        >
          <XIcon className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 text-white">
          <div className="flex items-center gap-6">
            <AvatarBubble user={currentUser} animationDelay={0} />
            <div className="match-heart relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 shadow-lg shadow-purple-900/40">
              <div className="absolute inset-0 rounded-[28px] border border-white/30" />
              <div className="absolute inset-1 rounded-[26px] bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-transparent backdrop-blur-sm" />
              <SparklesIcon className="relative h-9 w-9 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
              <div className="match-heart-outline absolute inset-0 rounded-[28px]" />
            </div>
            <AvatarBubble user={matchedUser} animationDelay={0.25} />
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
              <HeartIcon className="h-4 w-4 text-pink-300" />
              Match confirmado
            </span>
            <h3 className="text-3xl font-bold md:text-4xl">
              ¡{loggedFirstName} y {matchedFirstName} han hecho match!
            </h3>
            <p className="max-w-2xl text-sm text-white/80 md:text-base">
              Habéis conectado porque compartís la forma de vivir la convivencia. Os hemos enviado un email con los siguientes pasos para que la conversación continúe sin esperar.
            </p>
            {compatibilityLabel && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-purple-500/20 px-5 py-1 text-sm font-semibold tracking-wide text-white/90">
                <SparklesIcon className="h-4 w-4 text-indigo-200" />
                Compatibilidad {compatibilityLabel}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">
            Hemos enviado una guía con próximos pasos a vuestros correos.
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {onViewMatches && (
              <button
                type="button"
                onClick={onViewMatches}
                className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:shadow-purple-700/40"
              >
                Ir a mis matches
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              Seguir descubriendo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCelebration;
