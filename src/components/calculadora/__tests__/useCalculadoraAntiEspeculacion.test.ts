// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { calcularDistribucion } from '../useCalculadoraAntiEspeculacion';

describe('calcularDistribucion', () => {
  it('calcula un reparto equilibrado para alquiler y gastos', () => {
    const resultado = calcularDistribucion({
      alquilerTotal: 1800,
      m2Comunes: 30,
      inquilinos: [
        { id: 'a', nombre: 'Inquilino 1', m2Privados: 12, alquilerSolo: 900 },
        { id: 'b', nombre: 'Inquilino 2', m2Privados: 15, alquilerSolo: 1000 },
        { id: 'c', nombre: 'Inquilino 3', m2Privados: 9, alquilerSolo: 850 },
      ],
      gastos: [
        { id: 'g1', nombre: 'Internet', importe: 90, metodo: 'igualitario' },
        { id: 'g2', nombre: 'Luz', importe: 120, metodo: 'por_m2' },
      ],
    });

    expect(resultado.validaciones.esValido).toBe(true);
    expect(resultado.inquilinos).toHaveLength(3);
    const totals = resultado.inquilinos.map((inquilino) => Number(inquilino.totalMensual.toFixed(2)));
    expect(totals[0]).toBeCloseTo(670, 2);
    expect(totals[1]).toBeCloseTo(761.82, 2);
    expect(totals[2]).toBeCloseTo(578.18, 2);
    const alquileres = resultado.inquilinos.map((inquilino) => Number(inquilino.totalAlquiler.toFixed(2)));
    expect(alquileres[0]).toBeCloseTo(600, 2);
    expect(alquileres[1]).toBeCloseTo(681.82, 2);
    expect(alquileres[2]).toBeCloseTo(518.18, 2);
    const ahorros = resultado.inquilinos.map((inquilino) => Number((inquilino.ahorroAnual ?? 0).toFixed(0)));
    expect(ahorros[0]).toBe(2760);
    expect(ahorros[1]).toBe(2858);
    expect(ahorros[2]).toBe(3262);
    expect(Number(resultado.totalAlquilerDistribuido.toFixed(2))).toBeCloseTo(1800, 2);
    expect(Number(resultado.totalGastosVariables.toFixed(2))).toBeCloseTo(210, 2);
    expect(Number(resultado.totalMensualGrupo.toFixed(2))).toBeCloseTo(2010, 2);
  });

  it('marca error cuando la suma de m² privados es cero', () => {
    const resultado = calcularDistribucion({
      alquilerTotal: 1200,
      m2Comunes: 20,
      inquilinos: [
        { id: 'a', nombre: 'Inquilino 1', m2Privados: 0 },
        { id: 'b', nombre: 'Inquilino 2', m2Privados: 0 },
      ],
      gastos: [],
    });

    expect(resultado.validaciones.esValido).toBe(false);
    expect(resultado.validaciones.errores.some((err) => err.id === 'm2-privados')).toBe(true);
    expect(resultado.totalMensualGrupo).toBe(0);
  });
});
