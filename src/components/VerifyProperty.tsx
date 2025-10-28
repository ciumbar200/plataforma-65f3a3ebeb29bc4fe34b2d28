import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SupabaseManualVerifier } from '../lib/verifier';
import type { User, Property } from '../types';
import { UserRole } from '../types';

interface VerifyPropertyProps {
  user: User;
  property: Property;
}

const verifier = new SupabaseManualVerifier(supabase);

type PropertyStatus = 'none' | 'pending' | 'approved' | 'rejected';

export const VerifyProperty: React.FC<VerifyPropertyProps> = ({ user, property }) => {
  const [address, setAddress] = useState(property.address || '');
  const [tourVideoFile, setTourVideoFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<PropertyStatus>('none');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const temporarilyDisabled = true;
  const isHost = user.role === UserRole.ANFITRION;

  useEffect(() => {
    const loadLatestVerification = async () => {
      const { data, error: queryError } = await supabase
        .from('verifications')
        .select('status, submitted_address')
        .eq('user_id', user.id)
        .eq('kind', 'property')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        console.error(queryError);
        return;
      }

      if (data) {
        setStatus((data.status as PropertyStatus) ?? 'pending');
        if (data.submitted_address) {
          setAddress(data.submitted_address);
        }
      }
    };

    void loadLatestVerification();
  }, [user.id, property.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (temporarilyDisabled) {
      setError('Estamos actualizando la verificación de propiedades. Vuelve a intentarlo en unos días.');
      return;
    }

    if (!consent) {
      setError('Necesitamos tu autorización para revisar el documento.');
      return;
    }
    if (!address.trim()) {
      setError('Escribe la dirección de la vivienda.');
      return;
    }
    if (!tourVideoFile) {
      setError('Añade el video completo de la vivienda.');
      return;
    }
    if (!contractFile) {
      setError('Adjunta el contrato firmado o las normas del piso.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verifier.submitPropertyVerification({
        userId: user.id,
        propertyId: property.id,
        address,
        proofFile: contractFile,
      });
      setStatus(result.status as PropertyStatus);
      setMessage(result.message);
      setTourVideoFile(null);
      setContractFile(null);
      setConsent(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'No se pudo enviar la verificación de propiedad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-6 space-y-4">
      {temporarilyDisabled && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center gap-3 text-center px-6">
          <h4 className="text-white font-semibold text-base">Verificación en mantenimiento</h4>
          <p className="text-white/70 text-sm max-w-md">
            Estamos reforzando la seguridad y aplicando nuevas revisiones manuales. De momento no aceptamos envíos.
          </p>
        </div>
      )}

      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-white">Verificar propiedad</h3>
          <p className="text-sm text-white/70">
            Sube un recorrido en video del hogar completo{isHost ? ' (incluye la habitación disponible)' : ''} y el contrato
            firmado o reglamento interno. Revisaremos todo manualmente.
          </p>
        </div>
        <span className="text-sm font-semibold px-3 py-1 rounded-full border border-white/20 text-white/80">
          Estado: {status === 'none' ? 'Sin verificar' : status === 'pending' ? 'En revisión' : status === 'approved' ? 'Verificado' : 'Rechazado'}
        </span>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${temporarilyDisabled ? 'pointer-events-none opacity-60' : ''}`}
        aria-disabled={temporarilyDisabled}
      >
        <label className="block text-sm font-medium text-white/80 space-y-2">
          Dirección completa de la vivienda
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Calle Luna 123, Madrid"
            disabled={temporarilyDisabled}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50"
          />
        </label>

        <label className="block text-sm font-medium text-white/80 space-y-2">
          Video completo de la vivienda{isHost ? ' y habitación' : ''}
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={(e) => setTourVideoFile(e.target.files?.[0] ?? null)}
            disabled={temporarilyDisabled}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50"
          />
          <span className="text-xs text-white/60">
            Haz un recorrido continuo mostrando entrada, espacios comunes y, si aplica, la habitación ofrecida. Formatos aceptados: MP4, MOV, WebM (máx. 250 MB).
          </span>
        </label>

        <label className="block text-sm font-medium text-white/80 space-y-2">
          Contrato o normas del piso
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
            disabled={temporarilyDisabled}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50"
          />
          <span className="text-xs text-white/60">
            Adjunta el contrato vigente o un documento con las normas de convivencia para validar la información legal del hogar.
          </span>
        </label>

        <label className="flex items-start gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={temporarilyDisabled}
            className="mt-1 accent-indigo-500"
          />
          <span>
            Confirmo que tengo derecho legal a usar esta vivienda y autorizo la revisión manual de este documento solo para
            fines de verificación. <a href="/privacy" className="underline text-indigo-300">Política de privacidad</a>.
          </span>
        </label>

        {message && <p className="text-sm text-emerald-300">{message}</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || status === 'pending' || temporarilyDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {temporarilyDisabled
            ? 'Módulo en mantenimiento'
            : isSubmitting
            ? 'Enviando...'
            : status === 'pending'
            ? 'En revisión'
            : 'Enviar verificación'}
        </button>
      </form>

      <p className="text-xs text-white/50">
        🔒 Solo el equipo de MoOn puede acceder a estos archivos. Se eliminarán tras completar la verificación o en un plazo máximo de 90 días.
      </p>
    </section>
  );
};

export default VerifyProperty;
