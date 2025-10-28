import React, { useMemo } from 'react';
import {
  CalculadoraResultado,
  MetodoRepartoGasto,
} from './useCalculadoraAntiEspeculacion';

interface ResumenCopiableProps {
  resultado: CalculadoraResultado;
  metrosComunes: number;
  className?: string;
}

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

const formatEuro = (valor: number): string => euroFormatter.format(Math.round(valor * 100) / 100);

const etiquetaMetodo = (metodo: MetodoRepartoGasto) =>
  metodo === 'igualitario' ? 'igualitario' : 'por m² privados';

export const generarResumenCalculadora = (
  resultado: CalculadoraResultado,
  metrosComunes: number,
): string => {
  if (!resultado.validaciones.esValido) return '';
  const lineas: string[] = [];

  lineas.push('Calculadora Anti-Especulación (MoOn)');
  lineas.push('Reparte alquiler y gastos de forma justa por m² privados y zonas comunes.');
  lineas.push('');
  lineas.push(`m² comunes: ${metrosComunes}`);
  lineas.push(`Total alquiler distribuido: ${formatEuro(resultado.totalAlquilerDistribuido)}`);
  lineas.push(`Gastos variables: ${formatEuro(resultado.totalGastosVariables)}`);
  lineas.push(`Total mensual conjunto: ${formatEuro(resultado.totalMensualGrupo)}`);
  lineas.push('');
  lineas.push('Reparto por inquilino:');

  resultado.inquilinos.forEach((inquilino, index) => {
    lineas.push(
      `${index + 1}. ${inquilino.nombre} (${inquilino.m2Privados} m² privados) · Total mensual ${formatEuro(
        inquilino.totalMensual,
      )}`,
    );
    lineas.push(
      `   - Alquiler privados: ${formatEuro(inquilino.alquilerPrivado)} · Alquiler comunes: ${formatEuro(
        inquilino.alquilerComunes,
      )}`,
    );
    if (inquilino.gastosDetalle.length > 0) {
      inquilino.gastosDetalle.forEach((gasto) =>
        lineas.push(
          `   - ${gasto.nombre}: ${formatEuro(gasto.importe)} (${etiquetaMetodo(gasto.metodo)})`,
        ),
      );
    } else {
      lineas.push('   - Gastos variables: 0 €');
    }
    if (typeof inquilino.ahorroAnual === 'number') {
      lineas.push(
        `   - Ahorro anual: ${
          inquilino.ahorroAnual > 0
            ? formatEuro(inquilino.ahorroAnual)
            : '0 € · Sin ahorro vs vivir solo'
        }`,
      );
    }
  });

  return lineas.join('\n');
};

const ResumenCopiable: React.FC<ResumenCopiableProps> = ({ resultado, metrosComunes, className }) => {
  const resumen = useMemo(
    () => generarResumenCalculadora(resultado, metrosComunes),
    [resultado, metrosComunes],
  );

  if (!resumen) return null;

  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-indigo-900/20 ${
        className ?? ''
      }`}
      aria-live="polite"
    >
      <p className="text-xs uppercase tracking-wide text-white/50">Resumen listo para copiar</p>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
        {resumen}
      </pre>
    </div>
  );
};

export default ResumenCopiable;
