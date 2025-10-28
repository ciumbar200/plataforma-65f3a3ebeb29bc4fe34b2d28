import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.css';
import {
  ensureAffiliateCode,
  getMyAffiliateCode,
  getMyKpis,
  getMyMonthlyHistory,
} from './api';

interface AffiliateKpis {
  total_referrals: number;
  active_referrals: number;
  churned_referrals: number;
  pending_commissions: number;
  lifetime_commissions: number;
}

interface MonthlyCommissionRow {
  period: string;
  total_commission: number;
  paid_referrals: number;
  status: string;
}

function AffiliatePortal() {
  const [code, setCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [kpis, setKpis] = useState<AffiliateKpis | null>(null);
  const [history, setHistory] = useState<MonthlyCommissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const portalUrl = useMemo(() => {
    if (!code) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/?ref=${code}`;
  }, [code]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const [affCode, summary, monthly] = await Promise.all([
        getMyAffiliateCode(),
        getMyKpis(),
        getMyMonthlyHistory(),
      ]);
      if (!mounted) return;
      setCode(affCode);
      setKpis(summary as AffiliateKpis | null);
      setHistory(monthly as MonthlyCommissionRow[]);
      setIsLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleGenerateCode() {
    setIsGenerating(true);
    const newCode = await ensureAffiliateCode();
    if (newCode) {
      setCode(newCode);
    }
    setIsGenerating(false);
  }

  async function handleCopy() {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore copy errors
    }
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.badge}>Panel privado</div>
        <h1 className={styles.h1}>Gestiona tus referidos y comisiones</h1>
        <p className={styles.p}>
          Aquí encontrarás tus métricas clave, el estado de tus comisiones y tu enlace personal para compartir MoOn.
        </p>
        <div className={styles.card}>
          <h3>Tu enlace de afiliado</h3>
          {code ? (
            <div>
              <input className={styles.input} readOnly value={portalUrl} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className={styles.btn} onClick={handleCopy} type="button">
                  {copied ? 'Copiado ✅' : 'Copiar enlace'}
                </button>
              </div>
              <p className={`${styles.p} ${styles.small}`}>
                Cualquier usuario que se registre desde este enlace quedará atribuido durante 90 días.
              </p>
            </div>
          ) : (
            <button
              className={styles.btn}
              onClick={handleGenerateCode}
              type="button"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando…' : 'Crear mi enlace'}
            </button>
          )}
        </div>
      </section>

      <section className={`${styles.grid} ${styles.cols3}`}>
        {isLoading ? (
          <article className={styles.card}>Cargando…</article>
        ) : kpis ? (
          <>
            <article className={styles.kpi}>
              <div className={styles.kpiTitle}>Referidos totales</div>
              <div className={styles.kpiNum}>{kpis.total_referrals ?? 0}</div>
            </article>
            <article className={styles.kpi}>
              <div className={styles.kpiTitle}>Activos</div>
              <div className={styles.kpiNum}>{kpis.active_referrals ?? 0}</div>
            </article>
            <article className={styles.kpi}>
              <div className={styles.kpiTitle}>Comisiones pendientes</div>
              <div className={styles.kpiNum}>{(kpis.pending_commissions ?? 0).toFixed(2)}€</div>
            </article>
          </>
        ) : (
          <article className={styles.card}>
            <p className={styles.p}>Genera tu enlace para comenzar a trackear tus referidos.</p>
          </article>
        )}
      </section>

      <section className={`${styles.grid} ${styles.cols2}`}>
        <article className={styles.card}>
          <h3>Histórico mensual</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Comisión</th>
                <th>Referidos pagados</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4}>Sin registros aún.</td>
                </tr>
              ) : (
                history.map(row => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>{row.total_commission.toFixed(2)}€</td>
                    <td>{row.paid_referrals}</td>
                    <td>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>

        <article className={styles.card}>
          <h3>Detalles adicionales</h3>
          <p className={styles.p}>
            Tus comisiones se recalculan automáticamente cada inicio de mes en base a los pagos marcados como
            <strong> paid </strong> de tus referidos. Puedes exportar la tabla desde Supabase si necesitas un CSV.
          </p>
          <p className={`${styles.p} ${styles.small}`}>
            Este portal es opt-in: si el flag de entorno está desactivado, las rutas no se montarán en producción.
          </p>
        </article>
      </section>
    </div>
  );
}

export default AffiliatePortal;
