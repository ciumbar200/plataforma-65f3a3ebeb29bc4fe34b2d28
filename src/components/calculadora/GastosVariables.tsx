import React from 'react';
import GlassCard from '../GlassCard';
import { GastoVariableCalculadora, MetodoRepartoGasto } from './useCalculadoraAntiEspeculacion';
import { PlusIcon, XIcon } from '../icons';

interface GastosVariablesProps {
  gastos: GastoVariableCalculadora[];
  numeroInquilinos: number;
  onGastoChange: (
    index: number,
    payload: Partial<Pick<GastoVariableCalculadora, 'nombre' | 'importe' | 'metodo'>>,
  ) => void;
  onAgregarGasto: () => void;
  onEliminarGasto: (index: number) => void;
}

const etiquetasMetodo: Record<MetodoRepartoGasto, string> = {
  igualitario: 'Igualitario',
  por_m2: 'Por m² privados',
};

const GastosVariables: React.FC<GastosVariablesProps> = ({
  gastos,
  numeroInquilinos,
  onGastoChange,
  onAgregarGasto,
  onEliminarGasto,
}) => {
  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Gastos variables mensuales</h2>
          <p className="text-sm text-white/70">
            Añade internet, suministros u otros gastos y escoge el método de reparto.
          </p>
        </div>
        <button
          type="button"
          onClick={onAgregarGasto}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
          aria-label="Añadir gasto variable"
        >
          <PlusIcon className="h-4 w-4" />
          Añadir gasto
        </button>
      </div>

      <div className="space-y-4">
        {gastos.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
            No hay gastos añadidos todavía. Usa “Añadir gasto” para empezar.
          </p>
        )}
        {gastos.map((gasto, index) => (
          <div
            key={gasto.id}
            className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur transition hover:border-white/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{gasto.nombre || `Gasto ${index + 1}`}</h3>
                <p className="text-xs uppercase tracking-wide text-white/50">Línea #{index + 1}</p>
              </div>
              <button
                type="button"
                onClick={() => onEliminarGasto(index)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/70 transition hover:border-red-300/60 hover:bg-red-400/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/60"
                aria-label={`Eliminar gasto ${gasto.nombre || index + 1}`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-12">
              <label className="lg:col-span-5 flex flex-col text-sm text-white/80">
                <span className="mb-1">Nombre del gasto</span>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="Internet, limpieza, etc."
                  value={gasto.nombre}
                  onChange={(event) => onGastoChange(index, { nombre: event.target.value })}
                />
              </label>

              <label className="lg:col-span-3 flex flex-col text-sm text-white/80">
                <span className="mb-1">Importe (€ / mes)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="45"
                  value={Number.isFinite(gasto.importe) ? gasto.importe : ''}
                  onChange={(event) => onGastoChange(index, { importe: Number(event.target.value) })}
                />
              </label>

              <label className="relative lg:col-span-4 flex flex-col text-sm text-white/80">
                <span className="mb-1 flex items-center gap-2">
                  Método de reparto
                  {gasto.metodo === 'por_m2' ? (
                    <span
                      className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      title="Distribuye el gasto según los m² privados de cada habitación."
                    >
                      i
                    </span>
                  ) : (
                    <span
                      className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      title="Reparte el gasto a partes iguales entre los inquilinos."
                    >
                      i
                    </span>
                  )}
                </span>
                <select
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  value={gasto.metodo}
                  onChange={(event) =>
                    onGastoChange(index, { metodo: event.target.value as MetodoRepartoGasto })
                  }
                >
                  {Object.entries(etiquetasMetodo).map(([value, label]) => (
                    <option key={value} value={value} className="bg-slate-900 text-white">
                      {label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 text-xs text-white/50">
                  {gasto.metodo === 'igualitario'
                    ? `Cada inquilino pagará ${numeroInquilinos > 0 ? '1/' + numeroInquilinos : ''} del importe.`
                    : 'Distribuye el gasto según los m² privados de cada habitación.'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default GastosVariables;
