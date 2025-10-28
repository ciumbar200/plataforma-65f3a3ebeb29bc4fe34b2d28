import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlowBackground from '../components/GlowBackground';

type NavHandlers = {
  onHomeClick: () => void;
  onLoginClick: () => void;
  onOwnersClick: () => void;
  onBlogClick?: () => void;
  onAboutClick?: () => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  onContactClick?: () => void;
  onSilverClick?: () => void;
  onCalculadoraClick?: () => void;
  onAmbassadorsClick?: () => void;
  onReferFriendsClick?: () => void;
  onBlueprintClick?: () => void;
};

interface PerfectAppPlanPageProps extends NavHandlers {
  onRegisterClick?: () => void;
}

const PerfectAppPlanPage: React.FC<PerfectAppPlanPageProps> = (props) => {
  const {
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
    onRegisterClick,
  } = props;

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

  const pillars = [
    'Confianza verificable con procesos híbridos (IA + revisión humana).',
    'Experiencias guiadas para cada rol: inquilino, propietario, anfitrión y admin.',
    'Comunidad activa y acompañamiento continuo con programas de bienestar.',
    'Crecimiento responsable basado en datos, referidos y embajadores.',
    'Expansión europea con localización, partners y cumplimiento legal.',
  ];

  const okrs = [
    { id: 'O1', label: 'NPS > 55 en todos los roles.' },
    { id: 'O2', label: 'Verificación completa en <48h con satisfacción > 90%.' },
    { id: 'O3', label: 'Tres bucles de crecimiento generando >25% del crecimiento mensual.' },
  ];

  const roadmap = [
    { sprint: '0-2', focus: 'Auditoría UX/UI + research', deliverables: 'Journeys, benchmark, backlog priorizado.' },
    { sprint: '2-4', focus: 'Design system 2.0 + prototipos', deliverables: 'Tokens, componentes, tests de usabilidad.' },
    { sprint: '4-6', focus: 'Onboarding y verificación premium', deliverables: 'Flujos mejorados, IA asistida, métricas base.' },
    { sprint: '6-8', focus: 'Dashboards y mensajería', deliverables: 'Paneles por rol, mensajería segura beta.' },
    { sprint: '8-10', focus: 'Growth loops', deliverables: 'Referidos, embajadores, CRM y tracking.' },
    { sprint: '10-12', focus: 'Pagos y contratos', deliverables: 'Integración PSP, escrow, contratos digitales.' },
    { sprint: '12-14', focus: 'Comunidad y contenido', deliverables: 'Hub convivencias, webinars, recursos educativos.' },
    { sprint: '14-16', focus: 'Expansión Portugal', deliverables: 'Localización, partners, campaña de lanzamiento.' },
  ];

  const owners = [
    { area: 'Producto & UX', owner: 'Head of Product', note: 'Coordina blueprint y design system.' },
    { area: 'Growth & Comunidad', owner: 'Growth Lead', note: 'Referidos, embajadores, PR y CRM.' },
    { area: 'Operaciones & Verificación', owner: 'Ops Lead', note: 'SLAs, soporte 24/7 y KYC.' },
    { area: 'Datos & IA', owner: 'Data Lead', note: 'Instrumentación, modelos predictivos, dashboards.' },
    { area: 'Expansión Europea', owner: 'Expansion Manager', note: 'Localización, partnerships, regulación.' },
    { area: 'Programas Especiales', owner: 'Strategic Partnerships', note: 'Sorteo anual, alianzas premium.' },
  ];

  const researchPlan = [
    'Entrevistas en profundidad (5 por rol) para descubrir bloqueos y deseos.',
    'Tests de usabilidad en prototipos críticos con Maze/Figma (8 participantes).',
    'Encuesta cuantitativa (200 respuestas) para medir NPS y anticipar demanda.',
    'Diary study con roommates para entender dinámicas y conflictos reales.',
    'Panel beta de embajadores con feedback continuo en Slack.',
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
      <Header
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
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

      <main className="flex-grow">
        <section className="relative overflow-hidden py-24">
          <GlowBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/20 pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm uppercase tracking-[0.2em] text-white/70">
              Blueprint + Plan de Acción
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              La hoja de ruta para la app perfecta de convivencia
            </h1>
            <p className="text-lg text-white/75 max-w-3xl mx-auto">
              Una visión completa, un plan operativo y responsables claros para convertir MoOn en la plataforma más deseada de Europa por inquilinos, propietarios y anfitriones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/docs/perfect-app-blueprint.md"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 text-slate-900 font-semibold shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50"
              >
                Descargar blueprint (.md)
              </a>
              <a
                href="/docs/perfect-app-action-plan.md"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
              >
                Ver plan de acción
              </a>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[1.1fr,0.9fr] items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Visión y pilares</h2>
              <p className="text-white/70 leading-relaxed">
                Queremos que cada experiencia MoOn sea confiable, humana y escalable sin perder calidez. Estos cinco pilares guían cada decisión.
              </p>
              <ul className="space-y-4 text-white/80">
                {pillars.map((pillar) => (
                  <li key={pillar} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-4">
              <h3 className="text-2xl font-semibold text-white">OKRs próximos 90 días</h3>
              <ul className="space-y-3">
                {okrs.map((okr) => (
                  <li key={okr.id} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">{okr.id}</p>
                    <p className="text-white mt-2">{okr.label}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <header className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Roadmap de 16 semanas</h2>
              <p className="text-white/70">
                Fases iterativas con entregables concretos. Cada bloque incluye experimentos rápidos, feedback con usuarios y métricas.
              </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {roadmap.map((item) => (
                <article key={item.sprint} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-white/10 text-xs uppercase tracking-[0.18em] text-white/60">
                      Semana {item.sprint}
                    </span>
                    <span className="text-sm text-white/50">{item.focus}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{item.deliverables}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
            <header className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold">Owners y responsabilidades</h2>
              <p className="text-white/70">
                Cada frente tiene un responsable claro, un equipo de apoyo y resultados esperados.
              </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {owners.map((item) => (
                <article key={item.area} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{item.area}</p>
                  <p className="text-white text-lg font-semibold mt-2">{item.owner}</p>
                  <p className="text-white/70 mt-2">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Investigación y métricas que sustentan el plan
            </h2>
            <p className="text-white/70">
              Activamos investigación cualitativa y cuantitativa para priorizar features con impacto.
            </p>
            <div className="grid gap-4 md:grid-cols-2 text-left">
              {researchPlan.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">
                  <p className="text-white/80">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/50">
              Toda la documentación vive en `/docs/` y se actualiza semanalmente tras cada ceremonia de seguimiento.
            </p>
          </div>
        </section>

        <section className="py-24 bg-black/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Próximos pasos para el equipo
            </h2>
            <ol className="text-left space-y-3 text-white/80 max-w-2xl mx-auto list-decimal list-inside">
              <li>Compartir este plan con stakeholders y recoger feedback mediante la plantilla de workshop.</li>
              <li>Confirmar owners y cargar los epics en Linear/Jira usando el CSV preparado en el action plan.</li>
              <li>Iniciar el plan de research (reclutamiento, entrevistas, testing) según cronograma de seis semanas.</li>
              <li>Coordinar con Legal & Finanzas la campaña de embajadores y el sorteo “Vive gratis un año”.</li>
              <li>Programar checkpoints quincenales para revisar métricas, bloqueos y aprendizaje cruzado.</li>
            </ol>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://plataforma.app/ambassadors"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-900 font-semibold shadow-lg shadow-emerald-400/30 transition hover:-translate-y-0.5 hover:shadow-emerald-400/50"
              >
                Revisar programa de embajadores
              </a>
              <a
                href="https://plataforma.app/refer"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
              >
                Ver campaña de referidos
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default PerfectAppPlanPage;

