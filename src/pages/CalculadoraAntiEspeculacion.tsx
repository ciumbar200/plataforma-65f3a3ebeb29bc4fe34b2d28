import React, { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlowBackground from '../components/GlowBackground';
import GlassCard from '../components/GlassCard';
import InquilinosForm from '../components/calculadora/InquilinosForm';
import GastosVariables from '../components/calculadora/GastosVariables';
import ResultadosTabla from '../components/calculadora/ResultadosTabla';
import ResumenCopiable, { generarResumenCalculadora } from '../components/calculadora/ResumenCopiable';
import {
  GastoVariableCalculadora,
  InquilinoCalculadora,
  useCalculadoraAntiEspeculacion,
} from '../components/calculadora/useCalculadoraAntiEspeculacion';

interface PageProps {
  onHomeClick: () => void;
  onLoginClick: () => void;
  onOwnersClick: () => void;
  onBlogClick: () => void;
  onAboutClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onContactClick: () => void;
  onSilverClick?: () => void;
  onCalculadoraClick?: () => void;
  onAmbassadorsClick?: () => void;
  onReferFriendsClick?: () => void;
  onBlueprintClick?: () => void;
}

const crearInquilino = (index: number): InquilinoCalculadora => ({
  id: `inquilino-${index + 1}`,
  nombre: `Inquilino ${index + 1}`,
  m2Privados: index === 0 ? 12 : index === 1 ? 14 : index === 2 ? 10 : 9,
  alquilerSolo: index === 0 ? 900 : index === 1 ? 950 : index === 2 ? 850 : 820,
});

const crearGasto = (index: number): GastoVariableCalculadora => ({
  id: `gasto-${index + 1}`,
  nombre: index === 0 ? 'Internet y plataformas' : index === 1 ? 'Luz y gas' : 'Limpieza',
  importe: index === 0 ? 60 : index === 1 ? 120 : 45,
  metodo: index === 1 ? 'por_m2' : 'igualitario',
});

const valoresInicialesInquilinos: InquilinoCalculadora[] = [0, 1, 2, 3].map(crearInquilino);
const valoresInicialesGastos: GastoVariableCalculadora[] = [0, 1].map(crearGasto);

const CalculadoraAntiEspeculacion: React.FC<PageProps> = ({
  onHomeClick,
  onLoginClick,
  onOwnersClick,
  onBlogClick,
  onAboutClick,
  onPrivacyClick,
  onTermsClick,
  onContactClick,
  onSilverClick,
  onCalculadoraClick,
  onAmbassadorsClick,
  onReferFriendsClick,
  onBlueprintClick,
}) => {
  const [alquilerTotal, setAlquilerTotal] = useState<number>(1900);
  const [m2Comunes, setM2Comunes] = useState<number>(38);
  const [numeroInquilinos, setNumeroInquilinos] = useState<number>(3);
  const [inquilinos, setInquilinos] = useState<InquilinoCalculadora[]>(() =>
    valoresInicialesInquilinos.map((inquilino) => ({ ...inquilino })),
  );
  const [gastos, setGastos] = useState<GastoVariableCalculadora[]>(() =>
    valoresInicialesGastos.map((gasto) => ({ ...gasto })),
  );
  const [copiado, setCopiado] = useState(false);

  const inquilinosActivos = useMemo(
    () =>
      inquilinos.slice(0, numeroInquilinos).map((inquilino, index) => ({
        ...inquilino,
        nombre: inquilino.nombre || `Inquilino ${index + 1}`,
      })),
    [inquilinos, numeroInquilinos],
  );

  const calculo = useCalculadoraAntiEspeculacion({
    alquilerTotal,
    m2Comunes,
    inquilinos: inquilinosActivos,
    gastos,
  });

  useEffect(() => {
    if (copiado) {
      const timeout = setTimeout(() => setCopiado(false), 2200);
      return () => clearTimeout(timeout);
    }
    return;
  }, [copiado]);

  const handleNumeroInquilinosChange = (cantidad: number) => {
    setNumeroInquilinos(cantidad);
    setInquilinos((prev) => {
      if (prev.length >= cantidad) {
        return prev;
      }
      const nuevos: InquilinoCalculadora[] = [];
      for (let i = prev.length; i < cantidad; i += 1) {
        nuevos.push(crearInquilino(i));
      }
      return [...prev, ...nuevos];
    });
  };

  const handleInquilinoChange = (
    index: number,
    payload: Partial<Pick<InquilinoCalculadora, 'nombre' | 'm2Privados' | 'alquilerSolo'>>,
  ) => {
    setInquilinos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...payload };
      return next;
    });
  };

  const handleGastoChange = (
    index: number,
    payload: Partial<Pick<GastoVariableCalculadora, 'nombre' | 'importe' | 'metodo'>>,
  ) => {
    setGastos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...payload };
      return next;
    });
  };

  const handleAgregarGasto = () => {
    setGastos((prev) => [
      ...prev,
      {
        id: `gasto-${Date.now()}`,
        nombre: '',
        importe: 0,
        metodo: 'igualitario',
      },
    ]);
  };

  const handleEliminarGasto = (index: number) => {
    setGastos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRestablecer = () => {
    setAlquilerTotal(1900);
    setM2Comunes(38);
    setNumeroInquilinos(3);
    setInquilinos(valoresInicialesInquilinos.map((inquilino) => ({ ...inquilino })));
    setGastos(valoresInicialesGastos.map((gasto) => ({ ...gasto })));
    setCopiado(false);
  };

  const puedeCopiar = calculo.validaciones.esValido;

  const handleCopiar = async () => {
    if (!puedeCopiar) return;
    const resumen = generarResumenCalculadora(calculo, m2Comunes);
    if (!resumen) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resumen);
      } else {
        throw new Error('Clipboard API no disponible');
      }
      setCopiado(true);
    } catch (error) {
      console.warn('No fue posible copiar automáticamente. Mostrando resumen.', error);
      window.prompt('Copia manualmente el resumen:', resumen);
    }
  };

  const footerProps = {
    onBlogClick,
    onAboutClick,
    onPrivacyClick,
    onTermsClick,
    onContactClick,
    onOwnersClick,
    onSilverClick,
    onAmbassadorsClick,
    onReferFriendsClick,
    onBlueprintClick,
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white">
      <Header
        onLoginClick={onLoginClick}
        onHomeClick={onHomeClick}
        onOwnersClick={onOwnersClick}
        onBlogClick={onBlogClick}
        onSilverClick={onSilverClick}
        onCalculadoraClick={onCalculadoraClick}
        onAmbassadorsClick={onAmbassadorsClick}
        onReferFriendsClick={onReferFriendsClick}
        onBlueprintClick={onBlueprintClick}
        pageContext="inquilino"
      />

      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-20">
          <GlowBackground />
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <GlassCard className="relative overflow-hidden border-white/30 bg-white/10 px-6 py-10 text-center shadow-2xl shadow-indigo-900/40 sm:px-10">
              <div className="absolute inset-0 -z-10 opacity-40">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 via-purple-500/30 to-transparent blur-3xl" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Calculadora Anti-Especulación (MoOn)
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-base text-white/80 sm:text-lg">
                Reparte alquiler y gastos de forma justa por m² privados y zonas comunes. Ajusta los
                valores y obtén transparencia instantánea.
              </p>
            </GlassCard>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <GlassCard className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Datos del piso</h2>
                  <p className="text-sm text-white/70">
                    Introduce el alquiler total y los m² comunes compartidos.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col text-sm text-white/80">
                    <span className="mb-1">Alquiler total del piso (€/mes)</span>
                    <input
                      type="number"
                      min={1}
                      step={10}
                      inputMode="decimal"
                      className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      value={alquilerTotal}
                      onChange={(event) => setAlquilerTotal(Number(event.target.value))}
                      aria-describedby="ayuda-alquiler-total"
                    />
                    <span id="ayuda-alquiler-total" className="mt-1 text-xs text-white/50">
                      Debe ser mayor que 0 para activar el cálculo.
                    </span>
                  </label>
                  <label className="flex flex-col text-sm text-white/80">
                    <span className="mb-1 flex items-center gap-2">
                      m² comunes del piso
                      <span
                        className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                        title="Los m² comunes se reparten a partes iguales entre inquilinos."
                      >
                        i
                      </span>
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      inputMode="decimal"
                      className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      value={m2Comunes}
                      onChange={(event) => setM2Comunes(Number(event.target.value))}
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestablecer}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    Restablecer demo
                  </button>
                  <button
                    type="button"
                    onClick={handleCopiar}
                    disabled={!puedeCopiar}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/40 ${
                      puedeCopiar
                        ? 'bg-indigo-500/80 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500'
                        : 'cursor-not-allowed bg-white/10 text-white/40'
                    }`}
                    aria-disabled={!puedeCopiar}
                  >
                    {copiado ? '¡Copiado!' : 'Copiar resultados'}
                  </button>
                  {!puedeCopiar && (
                    <span className="text-xs text-white/60">
                      Completa los campos obligatorios para copiar el resumen.
                    </span>
                  )}
                </div>
              </GlassCard>

              <div className="lg:col-span-5">
                <ResumenCopiable resultado={calculo} metrosComunes={m2Comunes} className="h-full" />
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <InquilinosForm
                numeroInquilinos={numeroInquilinos}
                inquilinos={inquilinosActivos}
                onNumeroInquilinosChange={handleNumeroInquilinosChange}
                onInquilinoChange={handleInquilinoChange}
              />

              <GastosVariables
                gastos={gastos}
                numeroInquilinos={numeroInquilinos}
                onGastoChange={handleGastoChange}
                onAgregarGasto={handleAgregarGasto}
                onEliminarGasto={handleEliminarGasto}
              />

              <ResultadosTabla resultado={calculo} metrosComunes={m2Comunes} />
            </div>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default CalculadoraAntiEspeculacion;
