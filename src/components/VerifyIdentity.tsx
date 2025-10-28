import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SupabaseManualVerifier } from '../lib/verifier';
import type { User } from '../types';

interface VerifyIdentityProps {
  user: User;
  onStatusChange?: (status: 'pending' | 'approved' | 'rejected') => void;
}

const verifier = new SupabaseManualVerifier(supabase);

const statusLabels: Record<string, string> = {
  pending: 'En revisión',
  approved: 'Verificado',
  rejected: 'Rechazado',
  none: 'Sin verificar',
};

export const VerifyIdentity: React.FC<VerifyIdentityProps> = ({ user, onStatusChange }) => {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>(user.verification_status || 'none');

  useEffect(() => {
    setStatus(user.verification_status || 'none');
  }, [user.verification_status]);

  const disabled = useMemo(() => status === 'pending', [status]);
  const temporarilyDisabled = true;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (temporarilyDisabled) {
      setError('La verificación está temporalmente deshabilitada mientras ajustamos nuestra seguridad.');
      setMessage(null);
      return;
    }

    setMessage(null);
    setError(null);

    if (!consent) {
      setError('Necesitamos tu consentimiento para revisar tus documentos.');
      return;
    }
    if (!documentFile || !selfieFile) {
      setError('Selecciona la fotografía del documento y tu selfie.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verifier.submitIdentityVerification({
        userId: user.id,
        documentFile,
        selfieFile,
      });
      setStatus(result.status);
      setMessage(result.message);
      onStatusChange?.(result.status);
      setDocumentFile(null);
      setSelfieFile(null);
      setConsent(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'No se pudo enviar tu verificación. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-6 space-y-4">
      {temporarilyDisabled && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-3 text-center px-6">
          <h4 className="text-white font-semibold text-base">Verificación temporalmente deshabilitada</h4>
          <p className="text-white/70 text-sm max-w-md">
            Estamos reforzando la seguridad y reactivaremos este módulo en breve. Tus datos previos siguen protegidos.
          </p>
        </div>
      )}

      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-white">Verificar identidad</h3>
          <p className="text-sm text-white/70">
            Sube la imagen de tu documento oficial (anverso) y una selfie. Revisaremos la información manualmente.
          </p>
        </div>
        <span className="text-sm font-semibold px-3 py-1 rounded-full border border-white/20 text-white/80">
          Estado: {statusLabels[status] ?? status}
        </span>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${temporarilyDisabled ? 'pointer-events-none opacity-60' : ''}`}
        aria-disabled={temporarilyDisabled}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-white/80 space-y-2">
            Documento (anverso)
            <input
              type="file"
              accept="image/*,.pdf"
              capture="environment"
              onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
              disabled={temporarilyDisabled}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50"
            />
          </label>

          <label className="block text-sm font-medium text-white/80 space-y-2">
            Selfie reciente
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
              disabled={temporarilyDisabled}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50"
            />
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={temporarilyDisabled}
            className="mt-1 accent-indigo-500"
          />
          <span>
            Autorizo a MoOn a revisar estos documentos únicamente con fines de verificación y acepto que se eliminen tras
            finalizar el proceso. <a href="/privacy" className="underline text-indigo-300">Más información</a>.
          </span>
        </label>

        {message && <p className="text-sm text-emerald-300">{message}</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || disabled || temporarilyDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {temporarilyDisabled ? 'Módulo en mantenimiento' : isSubmitting ? 'Enviando...' : disabled ? 'En revisión' : 'Enviar verificación'}
        </button>
      </form>

      <p className="text-xs text-white/50">
        🕒 Conservaremos tus archivos un máximo de 90 días tras la revisión y sólo personal autorizado podrá acceder.
      </p>
    </section>
  );
};

export default VerifyIdentity;
