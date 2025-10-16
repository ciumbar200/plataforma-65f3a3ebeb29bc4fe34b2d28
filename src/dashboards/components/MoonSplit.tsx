import React, { useMemo, useState } from "react";
import GlassCard from '../../components/GlassCard';
import { PlusIcon, TrashIcon, DownloadIcon, PrinterIcon, CurrencyEuroIcon, BuildingIcon } from '../../components/icons';

interface Tenant {
  name: string;
  m2: number | string;
}

const InputField: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; placeholder: string; unit: string }> = ({ label, value, onChange, icon, placeholder, unit }) => (
    <GlassCard className="!p-4 h-full">
        <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
            {icon}
            {label}
        </label>
        <div className="relative">
            <input 
                type="number" 
                value={value} 
                onChange={onChange} 
                min="0" 
                step="0.01" 
                placeholder={placeholder} 
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-2xl font-bold pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold">{unit}</span>
        </div>
    </GlassCard>
);

export default function MoonSplit() {
  const [rent, setRent] = useState<number | string>(1200);
  const [commonArea, setCommonArea] = useState<number | string>(24);
  const [tenants, setTenants] = useState<Tenant[]>([
    { name: "Elena", m2: 12 },
    { name: "Carlos", m2: 8 },
    { name: "Ana", m2: 6 },
  ]);

  const toNum = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  
  const euro = (n: number): string => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
  const round2 = (n: number): number => Math.round(n * 100) / 100;
  
  const calculationResults = useMemo(() => {
    const numRent = toNum(rent);
    const numCommon = toNum(commonArea);
    const validTenants = tenants.filter(t => toNum(t.m2) > 0);
    const numTenants = validTenants.length;
    
    if (numRent <= 0 || numTenants === 0) return null;

    const sumPrivateM2 = validTenants.reduce((acc, t) => acc + toNum(t.m2), 0);
    const totalM2 = sumPrivateM2 + numCommon;
    const commonShareEach = numTenants > 0 ? numCommon / numTenants : 0;

    const rows = validTenants.map((t) => {
      const effectiveM2 = toNum(t.m2) + commonShareEach;
      const percentage = totalM2 > 0 ? effectiveM2 / totalM2 : 0;
      const fee = percentage * numRent;
      return { ...t, effectiveM2, percentage, fee };
    });

    const roundedRows = rows.map((r) => ({ ...r, fee: round2(r.fee) }));
    const sumOfRoundedFees = roundedRows.reduce((acc, r) => acc + r.fee, 0);
    const roundingDifference = round2(numRent - sumOfRoundedFees);

    if (Math.abs(roundingDifference) >= 0.01 && roundedRows.length > 0) {
      const maxIdx = roundedRows.reduce((best, r, i, arr) => (r.effectiveM2 > arr[best].effectiveM2 ? i : best), 0);
      roundedRows[maxIdx].fee = round2(roundedRows[maxIdx].fee + roundingDifference);
    }
    
    const finalSum = roundedRows.reduce((a, r) => a + r.fee, 0);

    return { numTenants, sumPrivateM2, totalM2, commonShareEach, rows: roundedRows, finalSum, roundingDifference: round2(finalSum - numRent) };
  }, [tenants, commonArea, rent]);

  const addTenant = () => setTenants(t => [...t, { name: `Inquilino ${t.length + 1}`, m2: '' }]);
  const changeTenant = (index: number, key: 'name' | 'm2', value: string) => setTenants(arr => arr.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  const deleteTenant = (index: number) => setTenants(arr => arr.filter((_, i) => i !== index));
  
  const safe = (s: any): string => String(s ?? "").replace(/[<>]/g, "");

  const exportCSV = () => {
    if (!calculationResults) return;
    const { rows, commonShareEach, finalSum } = calculationResults;
    const headers = ["Inquilino", "Habitación (m2)", "Comunes asignados (m2)", "m2 efectivos", "% del total", "Cuota mensual (€)"];
    const data = rows.map(r => [ safe(r.name), toNum(r.m2).toFixed(2), commonShareEach.toFixed(2), r.effectiveM2.toFixed(2), (r.percentage * 100).toFixed(2), r.fee.toFixed(2) ]);
    const footer = [ [], ["", "", "", "", "TOTAL", finalSum.toFixed(2)] ];
    
    const csvCell = (s: any) => { const t = String(s ?? ""); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const csv = [headers, ...data, ...footer].map((row: any[]) => row.map(csvCell).join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reparto-moon-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!calculationResults) return;
    const w = window.open("", "PRINT", "width=800,height=900");
    if (!w) return;
    const { rows, finalSum, commonShareEach, numTenants } = calculationResults;

    const html = `
    <!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reparto de Alquiler - MoOn</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #111827; color: #e5e7eb; padding: 2rem; }
        .container { max-width: 800px; margin: auto; }
        header { border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 1.5rem; }
        h1 { font-size: 1.875rem; color: #fff; margin: 0; }
        .summary { display: flex; justify-content: space-between; color: #9ca3af; font-size: 0.875rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        th, td { padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #374151; }
        th { font-weight: 600; color: #d1d5db; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
        th:first-child, td:first-child { text-align: left; }
        tbody tr:last-child td { border-bottom: none; }
        .total-row { border-top: 2px solid #4b5563; }
        .total-row td { font-weight: 700; font-size: 1.125rem; color: #fff; }
        footer { margin-top: 2rem; text-align: center; color: #6b7280; font-size: 0.75rem; }
    </style></head><body><div class="container">
      <header>
          <h1>Reparto de Alquiler</h1>
          <div class="summary">
              <span>${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>Generado con MoOn</span>
          </div>
      </header>
      <p style="color: #9ca3af;">Alquiler total: <strong>${euro(toNum(rent))}</strong> &middot; Zonas comunes: <strong>${toNum(commonArea).toFixed(2)} m²</strong> &middot; Inquilinos: <strong>${numTenants}</strong></p>
      <table><thead><tr>
        <th>Inquilino</th><th>Hab. (m²)</th><th>+ Comunes (m²)</th><th>m² efectivos</th><th>% total</th><th>Cuota (€)</th>
      </tr></thead><tbody>
        ${rows.map(r => `<tr>
          <td>${safe(r.name)}</td>
          <td>${toNum(r.m2).toFixed(2)}</td>
          <td>${commonShareEach.toFixed(2)}</td>
          <td>${r.effectiveM2.toFixed(2)}</td>
          <td>${(r.percentage * 100).toFixed(2)}%</td>
          <td style="font-weight: 600; color: #fff;">${r.fee.toFixed(2)}</td>
        </tr>`).join("")}
        <tr class="total-row">
            <td colspan="5">Total</td>
            <td>${finalSum.toFixed(2)} €</td>
        </tr>
      </tbody></table>
      <footer><p>Fórmula: cuota = (m² privativos + m² comunes / N) / Σ m² totales × Alquiler</p></footer>
    </div><script>window.onload = () => { window.print(); setTimeout(()=>window.close(), 300); };</script></body></html>`;
    w.document.write(html);
    w.document.close();
  };
  
  return (
    <div className="text-white space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold">Reparto de Gastos</h2>
            <p className="text-white/70 mt-2 max-w-2xl mx-auto">
                Calcula de forma justa y transparente el reparto del alquiler basado en los metros cuadrados de cada habitación y las zonas comunes.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <InputField label="Alquiler Mensual Total" value={rent} onChange={e => setRent(e.target.value)} icon={<CurrencyEuroIcon className="w-5 h-5 text-indigo-300" />} placeholder="1200" unit="€" />
            <InputField label="Metros de Zonas Comunes" value={commonArea} onChange={e => setCommonArea(e.target.value)} icon={<BuildingIcon className="w-5 h-5 text-indigo-300" />} placeholder="24" unit="m²" />
        </div>

        <GlassCard className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Inquilinos y Habitaciones</h3>
            <div className="space-y-4">
                {tenants.map((t, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-center gap-3 bg-black/20 p-3 rounded-lg">
                        <input type="text" value={t.name} placeholder={`Nombre Inquilino ${i + 1}`} onChange={e => changeTenant(i, "name", e.target.value)} className="w-full sm:w-1/2 bg-white/10 border border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="relative w-full sm:w-1/2">
                            <input type="number" value={t.m2} min="0" step="0.01" placeholder="Ej: 12" onChange={e => changeTenant(i, "m2", e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">m²</span>
                        </div>
                        <button onClick={() => deleteTenant(i)} className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 rounded-lg transition-colors flex-shrink-0" aria-label={`Eliminar ${t.name || 'inquilino'}`}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addTenant} className="mt-6 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20">
                <PlusIcon className="w-5 h-5" />
                Añadir Inquilino
            </button>
        </GlassCard>

        {calculationResults && (
            <GlassCard className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-4">Resultados del Reparto</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-3 font-semibold text-sm text-white/80">Inquilino</th>
                                <th className="p-3 font-semibold text-sm text-white/80 text-right">m² Efectivos</th>
                                <th className="p-3 font-semibold text-sm text-white/80 text-right">% Total</th>
                                <th className="p-3 font-semibold text-sm text-white/80 text-right">Cuota Mensual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculationResults.rows.map((r, i) => (
                                <tr key={i} className="border-b border-white/10 last:border-0">
                                    <td className="p-3 font-medium text-white">{safe(r.name)}</td>
                                    <td className="p-3 text-right text-white/80">{r.effectiveM2.toFixed(2)} m²</td>
                                    <td className="p-3 text-right text-white/80">{(r.percentage * 100).toFixed(2)}%</td>
                                    <td className="p-3 text-right font-bold text-lg text-indigo-300">{euro(r.fee)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                     <div className="flex gap-4">
                        <button onClick={exportCSV} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-colors">
                            <DownloadIcon className="w-4 h-4" /> CSV
                        </button>
                        <button onClick={exportPDF} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-colors">
                            <PrinterIcon className="w-4 h-4" /> PDF
                        </button>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-white/80">Total Calculado:</span>
                        <p className="font-bold text-2xl">{euro(calculationResults.finalSum)}</p>
                    </div>
                </div>
            </GlassCard>
        )}
    </div>
  );
}
