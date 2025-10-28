import { useMemo } from 'react';

export type MetodoRepartoGasto = 'igualitario' | 'por_m2';

export interface InquilinoCalculadora {
  id: string;
  nombre: string;
  m2Privados: number;
  alquilerSolo?: number;
}

export interface GastoVariableCalculadora {
  id: string;
  nombre: string;
  importe: number;
  metodo: MetodoRepartoGasto;
}

export interface GastoAsignado {
  gastoId: string;
  nombre: string;
  metodo: MetodoRepartoGasto;
  importe: number;
}

export interface InquilinoResultado {
  id: string;
  nombre: string;
  m2Privados: number;
  alquilerPrivado: number;
  alquilerComunes: number;
  totalAlquiler: number;
  gastosDetalle: GastoAsignado[];
  totalGastos: number;
  totalMensual: number;
  ahorroAnual?: number;
}

export interface CalculadoraValidacion {
  id: string;
  tipo: 'error' | 'warning';
  mensaje: string;
}

export interface CalculadoraValidaciones {
  errores: CalculadoraValidacion[];
  advertencias: CalculadoraValidacion[];
  esValido: boolean;
}

export interface CalculadoraResultado {
  inquilinos: InquilinoResultado[];
  sumPrivados: number;
  normFactor: number;
  totalAlquilerDistribuido: number;
  totalGastosVariables: number;
  totalMensualGrupo: number;
  validaciones: CalculadoraValidaciones;
}

export interface CalculadoraEntradas {
  alquilerTotal: number;
  m2Comunes: number;
  inquilinos: InquilinoCalculadora[];
  gastos: GastoVariableCalculadora[];
}

const sanitizeNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
};

const buildValidaciones = (): CalculadoraValidaciones => ({
  errores: [],
  advertencias: [],
  esValido: true,
});

const cloneBaseResultados = (inquilinos: InquilinoCalculadora[]): InquilinoResultado[] => {
  return inquilinos.map((inquilino) => ({
    id: inquilino.id,
    nombre: inquilino.nombre,
    m2Privados: sanitizeNumber(inquilino.m2Privados),
    alquilerPrivado: 0,
    alquilerComunes: 0,
    totalAlquiler: 0,
    gastosDetalle: [],
    totalGastos: 0,
    totalMensual: 0,
  }));
};

export function calcularDistribucion({
  alquilerTotal,
  m2Comunes,
  inquilinos,
  gastos,
}: CalculadoraEntradas): CalculadoraResultado {
  const validaciones = buildValidaciones();
  const sanitizedAlquiler = sanitizeNumber(alquilerTotal);
  const sanitizedComunes = sanitizeNumber(m2Comunes);
  const sanitizedInquilinos = inquilinos.map((inq, index) => ({
    id: inq.id || `inquilino-${index + 1}`,
    nombre: inq.nombre?.trim() || `Inquilino ${index + 1}`,
    m2Privados: sanitizeNumber(inq.m2Privados),
    alquilerSolo: typeof inq.alquilerSolo === 'number' && Number.isFinite(inq.alquilerSolo)
      ? Math.max(0, inq.alquilerSolo)
      : undefined,
  }));
  const sanitizedGastos = gastos.map((gasto, index) => ({
    id: gasto.id || `gasto-${index + 1}`,
    nombre: gasto.nombre?.trim() || `Gasto ${index + 1}`,
    importe: sanitizeNumber(gasto.importe),
    metodo: gasto.metodo === 'por_m2' ? 'por_m2' : 'igualitario',
  }));

  const numeroInquilinos = sanitizedInquilinos.length;
  const sumPrivados = sanitizedInquilinos.reduce((acc, inq) => acc + inq.m2Privados, 0);

  const resultadosBase = cloneBaseResultados(sanitizedInquilinos);

  if (numeroInquilinos < 2 || numeroInquilinos > 4) {
    validaciones.errores.push({
      id: 'numero-inquilinos',
      tipo: 'error',
      mensaje: 'La calculadora funciona con 2, 3 o 4 inquilinos.',
    });
  }

  if (sanitizedAlquiler <= 0) {
    validaciones.errores.push({
      id: 'alquiler-total',
      tipo: 'error',
      mensaje: 'Introduce un alquiler mensual mayor que cero.',
    });
  }

  if (sumPrivados <= 0) {
    validaciones.errores.push({
      id: 'm2-privados',
      tipo: 'error',
      mensaje: 'Los m² privados totales deben ser mayores que cero.',
    });
  }

  if (inquilinos.length !== numeroInquilinos) {
    validaciones.advertencias.push({
      id: 'coherencia-inquilinos',
      tipo: 'warning',
      mensaje: 'Número de filas e inquilinos no coincide. Revisa la configuración.',
    });
  }

  if (m2Comunes < 0) {
    validaciones.errores.push({
      id: 'm2-comunes',
      tipo: 'error',
      mensaje: 'Los m² comunes no pueden ser negativos.',
    });
  }

  const hasErrores = validaciones.errores.length > 0;
  validaciones.esValido = !hasErrores;

  if (hasErrores || numeroInquilinos === 0) {
    return {
      inquilinos: resultadosBase,
      sumPrivados,
      normFactor: 0,
      totalAlquilerDistribuido: 0,
      totalGastosVariables: 0,
      totalMensualGrupo: 0,
      validaciones,
    };
  }

  const baseCommonsRatio = sumPrivados > 0 ? sanitizedComunes / sumPrivados : 0;
  const alquilerBase = sanitizedInquilinos.map((inq) => {
    const wPriv = sumPrivados > 0 ? inq.m2Privados / sumPrivados : 0;
    const wComunes = 1 / numeroInquilinos;
    const base = wPriv + wComunes * baseCommonsRatio;
    return {
      id: inq.id,
      wPriv,
      wComunes,
      base,
    };
  });
  const baseSum = alquilerBase.reduce((acc, inq) => acc + inq.base, 0);
  const norm = baseSum > 0 ? sanitizedAlquiler / baseSum : 0;

  const resultados = resultadosBase.map((res) => {
    const inputInquilino = sanitizedInquilinos.find((i) => i.id === res.id);
    const base = alquilerBase.find((b) => b.id === res.id);
    if (!base || !inputInquilino) {
      return res;
    }
    const alquilerPrivado = base.wPriv * norm;
    const alquilerComunes = base.wComunes * baseCommonsRatio * norm;
    const totalAlquiler = alquilerPrivado + alquilerComunes;
    const gastosDetalle: GastoAsignado[] = sanitizedGastos.map((g) => {
      const importe = g.metodo === 'igualitario'
        ? g.importe / numeroInquilinos
        : sumPrivados > 0
          ? (res.m2Privados / sumPrivados) * g.importe
          : 0;
      return {
        gastoId: g.id,
        nombre: g.nombre,
        metodo: g.metodo,
        importe,
      };
    });
    const totalGastos = gastosDetalle.reduce((acc, gasto) => acc + gasto.importe, 0);
    const totalMensual = totalAlquiler + totalGastos;
    const ahorroAnual = typeof inputInquilino.alquilerSolo === 'number'
      ? Math.max(0, inputInquilino.alquilerSolo - totalMensual) * 12
      : undefined;

    return {
      ...res,
      alquilerPrivado,
      alquilerComunes,
      totalAlquiler,
      gastosDetalle,
      totalGastos,
      totalMensual,
      ahorroAnual,
    };
  });

  const totalAlquilerDistribuido = resultados.reduce((acc, item) => acc + item.totalAlquiler, 0);
  const totalGastosVariables = resultados.reduce((acc, item) => acc + item.totalGastos, 0);
  const totalMensualGrupo = resultados.reduce((acc, item) => acc + item.totalMensual, 0);

  return {
    inquilinos: resultados,
    sumPrivados,
    normFactor: norm,
    totalAlquilerDistribuido,
    totalGastosVariables,
    totalMensualGrupo,
    validaciones,
  };
}

export const useCalculadoraAntiEspeculacion = ({
  alquilerTotal,
  m2Comunes,
  inquilinos,
  gastos,
}: CalculadoraEntradas): CalculadoraResultado => {
  return useMemo(
    () =>
      calcularDistribucion({
        alquilerTotal,
        m2Comunes,
        inquilinos,
        gastos,
      }),
    [alquilerTotal, m2Comunes, inquilinos, gastos],
  );
};
