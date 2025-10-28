import React from 'react';
import GlassCard from '../GlassCard';
import {
  CalculadoraResultado,
  CalculadoraValidacion,
  MetodoRepartoGasto,
} from './useCalculadoraAntiEspeculacion';

interface ResultadosTablaProps {
  resultado: CalculadoraResultado;
  metrosComunes: number;
}

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

const formatEuro = (valor: number): string => euroFormatter.format(Math.round(valor * 100) / 100);

const renderValidaciones = (items: CalculadoraValidacion[], variant: 'error' | 'warning') => {
  if (items.length === 0) return null;
  const baseClasses =
    variant === 'error'
      ? 'border-red-400/60 bg-red-500/10 text-red-100'
      : 'border-amber-300/60 bg-amber-500/15 text-amber-50';
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${baseClasses}`}>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item.id}>{item.mensaje}</li>
        ))}
      </ul>
    </div>
  );
};

const getMetodoBadge = (metodo: MetodoRepartoGasto) =>
  metodo === 'igualitario' ? 'Igualitario' : 'Por m²';

const ResultadosTabla: React.FC<ResultadosTablaProps> = ({ resultado, metrosComunes }) => {
  const { inquilinos, validaciones, totalAlquilerDistribuido, totalGastosVariables, totalMensualGrupo } =
    resultado;

  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Resultados del reparto</h2>
          <p className="text-sm text-white/70">
            Desglose por inquilino: alquiler (privados + comunes), gastos variables y ahorro anual.
          </p>
        </div>
        <div
          className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/70"
          title="Los m² comunes se reparten a partes iguales entre inquilinos."
        >
          m² comunes: <span className="font-semibold text-white">{metrosComunes}</span>
        </div>
      </div>

      {renderValidaciones(validaciones.errores, 'error')}
      {validaciones.esValido && renderValidaciones(validaciones.advertencias, 'warning')}

      {!validaciones.esValido ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-white/70">
          Corrige los datos para ver el reparto detallado.
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inquilinos.map((inquilino) => (
              <div
                key={inquilino.id}
                className="flex h-full flex-col rounded-2xl border border-white/15 bg-gradient-to-br from-indigo-500/20 via-slate-900/40 to-purple-500/20 p-5 shadow-lg shadow-indigo-900/30 transition hover:border-white/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{inquilino.nombre}</h3>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      {formatEuro(inquilino.totalMensual)} / mes
                    </p>
                  </div>
                  <span className="rounded-xl bg-white/15 px-3 py-1 text-xs font-medium text-white/80">
                    {inquilino.m2Privados} m² privados
                  </span>
                </div>

                <dl className="mt-4 space-y-3 text-sm text-white/80">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/70">Privados</dt>
                    <dd className="font-medium text-white">{formatEuro(inquilino.alquilerPrivado)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="flex items-center gap-1 text-white/70">
                      Comunes
                      <span
                        className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                        title="Los m² comunes se reparten a partes iguales entre inquilinos."
                      >
                        i
                      </span>
                    </dt>
                    <dd className="font-medium text-white">{formatEuro(inquilino.alquilerComunes)}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-xs uppercase tracking-wide text-white/50">Gastos (detalle)</p>
                    <ul className="mt-2 space-y-1 text-white/75">
                      {inquilino.gastosDetalle.length === 0 ? (
                        <li className="text-xs text-white/50">Sin gastos variables</li>
                      ) : (
                        inquilino.gastosDetalle.map((gasto) => (
                          <li key={gasto.gastoId} className="flex justify-between gap-2 text-sm">
                            <span>
                              {gasto.nombre}{' '}
                              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-indigo-100">
                                {getMetodoBadge(gasto.metodo)}
                              </span>
                            </span>
                            <span className="font-medium text-white">{formatEuro(gasto.importe)}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base font-semibold text-white">
                    <span>Total mensual</span>
                    <span>{formatEuro(inquilino.totalMensual)}</span>
                  </div>
                  {typeof inquilino.ahorroAnual === 'number' && (
                    <div className="flex justify-between gap-4 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100">
                      <span>Ahorro anual</span>
                      <span>
                        {inquilino.ahorroAnual > 0 ? formatEuro(inquilino.ahorroAnual) : '0 € · Sin ahorro vs vivir solo'}
                      </span>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-white/60">Alquiler distribuido</p>
              <p className="mt-2 text-2xl font-semibold">{formatEuro(totalAlquilerDistribuido)}</p>
              <p className="text-sm text-white/60">Suma de privados + comunes</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-white/60">Gastos variables</p>
              <p className="mt-2 text-2xl font-semibold">{formatEuro(totalGastosVariables)}</p>
              <p className="text-sm text-white/60">Impacto mensual agregado</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-white/60">Total mensual del piso</p>
              <p className="mt-2 text-2xl font-semibold">{formatEuro(totalMensualGrupo)}</p>
              <p className="text-sm text-white/60">Incluye alquiler + todos los gastos</p>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  );
};

export default ResultadosTabla;
