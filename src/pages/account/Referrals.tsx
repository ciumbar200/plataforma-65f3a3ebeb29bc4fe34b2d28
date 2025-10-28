import React, { useEffect, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { supabase } from '../../lib/supabaseClient';
import { ensureReferralCode, fetchMyReferrals } from '../../lib/referrals';

type Referral = {
  id: number;
  referee_email: string | null;
  status: 'invited' | 'registered' | 'verified' | 'contracted' | 'invalid';
  created_at: string;
};

const Referrals: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [items, setItems] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) { setLoading(false); return; }
      const { code } = await ensureReferralCode(user.id);
      if (code) setCode(code);
      const res = await fetchMyReferrals(user.id);
      if (!('error' in res) && res.data) setItems(res.data as Referral[]);
      setLoading(false);
    };
    run();
  }, []);

  const link = code ? `${window?.location?.origin || ''}/?ref=${code}` : undefined;

  return (
    <div className="space-y-6">
      <GlassCard className="bg-white/5 border-white/15">
        <h2 className="text-2xl font-bold text-white">Invita a tus amigos</h2>
        <p className="text-white/80 mt-2">
          Comparte MoOn con 5 amigos y entra en el sorteo “Vive gratis un año”. Aquí verás tu enlace personal y el progreso de tus invitaciones cuando activemos el panel.
        </p>
        <div className="mt-4 rounded-xl bg-black/30 border border-white/10 p-4">
          <p className="text-white/60 text-sm">Tu enlace personal</p>
          {loading ? (
            <div className="mt-2 text-white/70 text-sm">Cargando…</div>
          ) : link ? (
            <div className="mt-2 flex items-center gap-3">
              <code className="text-white/80 text-sm break-all">{link}</code>
              <button
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-semibold"
                onClick={async () => {
                  try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
                }}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          ) : (
            <div className="mt-2 text-white/70 text-sm">No disponible</div>
          )}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">Progreso</h3>
          {items.length === 0 ? (
            <p className="text-white/60 text-sm mt-2">Aún no hay referidos registrados.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {items.map((r) => (
                <li key={r.id} className="flex justify-between items-center rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white/80">
                  <span>{r.referee_email || 'Usuario'}</span>
                  <span className="text-white/60">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </GlassCard>

      <GlassCard className="bg-white/5 border-white/15">
        <h3 className="text-xl font-semibold text-white">Cómo funciona</h3>
        <ol className="mt-3 list-decimal list-inside space-y-2 text-white/80">
          <li>Comparte tu enlace personal con tus amigos.</li>
          <li>Tus amigos se registran, completan la verificación y cierran su primer contrato.</li>
          <li>Por 5 referidos válidos: 150 € en créditos + pase al sorteo anual.</li>
        </ol>
        <p className="mt-3 text-white/60 text-sm">Consulta las bases legales y fechas en la landing oficial.</p>
      </GlassCard>
    </div>
  );
};

export default Referrals;
