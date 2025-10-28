import React from 'react';
import GlassCard from '../GlassCard';
import { InquilinoCalculadora } from './useCalculadoraAntiEspeculacion';

interface InquilinosFormProps {
  numeroInquilinos: number;
  inquilinos: InquilinoCalculadora[];
  onNumeroInquilinosChange: (numero: number) => void;
  onInquilinoChange: (
    index: number,
    payload: Partial<Pick<InquilinoCalculadora, 'nombre' | 'm2Privados' | 'alquilerSolo'>>,
  ) => void;
}

const opcionesInquilinos = [2, 3, 4];

const InquilinosForm: React.FC<InquilinosFormProps> = ({
  numeroInquilinos,
  inquilinos,
  onNumeroInquilinosChange,
  onInquilinoChange,
}) => {
  return (
    <GlassCard className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Reparto entre inquilinos</h2>
          <p className="text-sm text-white/70">
            Ajusta el número de convivientes y define los m² privados de cada habitación.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Número de inquilinos">
          {opcionesInquilinos.map((cantidad) => {
            const isActive = numeroInquilinos === cantidad;
            return (
              <button
                key={cantidad}
                type="button"
                onClick={() => onNumeroInquilinosChange(cantidad)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive
                    ? 'bg-indigo-500/80 text-white border-white/40 shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 text-white/75 border-white/20 hover:bg-white/20'
                }`}
                aria-pressed={isActive}
              >
                {cantidad} inq.
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        {inquilinos.map((inquilino, index) => (
          <div
            key={inquilino.id}
            className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-white/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {inquilino.nombre.trim() || `Inquilino ${index + 1}`}
                </h3>
                <p className="text-xs uppercase tracking-wide text-white/50">Habitación {index + 1}</p>
              </div>
              <span className="rounded-xl bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur">
                #{index + 1}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col text-sm text-white/80">
                <span className="mb-1">Nombre</span>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder={`Inquilino ${index + 1}`}
                  value={inquilino.nombre}
                  onChange={(event) =>
                    onInquilinoChange(index, { nombre: event.target.value })
                  }
                  aria-label={`Nombre del inquilino ${index + 1}`}
                />
              </label>

              <label className="flex flex-col text-sm text-white/80">
                <span className="mb-1">m² privados</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="14"
                  value={Number.isFinite(inquilino.m2Privados) ? inquilino.m2Privados : ''}
                  onChange={(event) =>
                    onInquilinoChange(index, { m2Privados: Number(event.target.value) })
                  }
                  aria-label={`Metros privados del inquilino ${index + 1}`}
                />
              </label>

              <label className="flex flex-col text-sm text-white/80">
                <span className="mb-1">Alquiler si viviera solo (€/mes)</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="Ej. 950"
                  value={
                    typeof inquilino.alquilerSolo === 'number' && Number.isFinite(inquilino.alquilerSolo)
                      ? inquilino.alquilerSolo
                      : ''
                  }
                  onChange={(event) =>
                    onInquilinoChange(index, {
                      alquilerSolo:
                        event.target.value === ''
                          ? undefined
                          : Math.max(0, Number(event.target.value)),
                    })
                  }
                  aria-label={`Alquiler estimado en solitario del inquilino ${index + 1}`}
                />
                <span className="mt-1 text-xs text-white/50">
                  Opcional. Usado para calcular el ahorro anual frente a vivir solo.
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default InquilinosForm;
