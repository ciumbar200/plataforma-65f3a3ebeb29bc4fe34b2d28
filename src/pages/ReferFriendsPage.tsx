import React, { useEffect } from 'react';
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

interface ReferFriendsPageProps extends NavHandlers {
  onRegisterClick?: () => void;
}

const ReferFriendsPage: React.FC<ReferFriendsPageProps> = (props) => {
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

  // SEO: hide from search engines
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    const prev = meta.content;
    meta.content = 'noindex, nofollow';
    return () => { meta && (meta.content = prev || ''); };
  }, []);

  const steps = [
    {
      title: 'Comparte tu enlace',
      description:
        'Desde tu panel accede a /referrals y comparte el link personalizado por WhatsApp, email o redes.',
    },
    {
      title: 'Activa a tus amistades',
      description:
        'Cada persona invitada debe registrarse, elegir su rol y completar la verificación correspondiente.',
    },
    {
      title: 'Celebra contratos reales',
      description:
        'Cuando los referidos cierren su primer contrato en MoOn, se suman automáticamente a tu contador.',
    },
  ];

  const rewards = [
    {
      title: '5 referidos válidos',
      reward: '150 € en créditos de alquiler + 1 pase al sorteo “Vive gratis un año”.',
    },
    {
      title: 'Bonus por verificación',
      reward: '20 € en créditos por cada referido que complete KYC, incluso si aún no firma.',
    },
    {
      title: 'Ranking mensual',
      reward: 'Premios extra (equipamiento hogar, suscripciones) a quienes más referidos activen.',
    },
  ];

  const legalItems = [
    'Sorteo certificado ante notario en España, con comunicación previa y posterior.',
    'El alquiler cubierto incluye hasta 12 000 € / año. El ganador se hace cargo de suministros.',
    'Control anti-fraude (IP, documentos, triggers en Supabase) para validar referidos reales.',
    'Bases legales descargables y envío de recordatorios vía email y push.',
  ];

  const roadmap = [
    { week: 'S1', action: 'Diseñar landing y modales, definir emails y notificaciones.', owner: 'Producto + Diseño' },
    { week: 'S1', action: 'Crear tablas y funciones Supabase para tracking.', owner: 'Ingeniería Backend' },
    { week: 'S2', action: 'Integrar front con API y QA end-to-end.', owner: 'Frontend' },
    { week: 'S2', action: 'Redactar reglas legales y FAQ público.', owner: 'Legal & Compliance' },
    { week: 'S3', action: 'Lanzamiento beta con usuarios top + medición.', owner: 'Growth' },
    { week: 'S4', action: 'Despliegue general con campaña paid y PR.', owner: 'Marketing' },
    { week: 'S5', action: 'Publicar ranking, optimizar cadencias y premios.', owner: 'Growth & Datos' },
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
        // Intentionally hiding ambassadors/referrals from public nav
        pageContext="inquilino"
      />

      <main className="flex-grow">
        <section className="relative py-24 overflow-hidden">
          <GlowBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm uppercase tracking-[0.2em] text-white/70">
              Campaña Refer & Win
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Invita a 5 amigos, vive gratis un año*
            </h1>
            <p className="text-lg text-white/75 max-w-3xl mx-auto">
              Comparte tu experiencia MoOn, gana recompensas inmediatas y entra al sorteo que cubre tu alquiler anual (hasta 12 000 €). Tus amigos solo pagarán sus gastos; nosotros asumimos el alquiler.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://plataforma.app/referrals"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-900 font-semibold shadow-lg shadow-emerald-400/30 transition hover:-translate-y-0.5 hover:shadow-emerald-400/50"
              >
                Ir a mi panel de referidos
              </a>
              <button
                onClick={onAmbassadorsClick}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
              >
                ¿Quieres ser embajador?
              </button>
            </div>
            <p className="text-xs text-white/40 max-w-2xl mx-auto">
              *Sujeto a bases legales. Cobertura máxima anual de 12 000 € en concepto de alquiler. El ganador cubrirá suministros y gastos personales.
            </p>
          </div>
        </section>

        <section className="py-20 bg-black/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-10 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Así funciona la magia</h2>
              <p className="text-white/70 leading-relaxed">
                Conviértete en la persona que abre puertas a nuevas convivencias. Esta es la ruta que siguieron quienes ya están acumulando créditos.
              </p>
              <ul className="space-y-4">
                {steps.map((step) => (
                  <li key={step.title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-white/70 mt-2">{step.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
              <h3 className="text-2xl font-semibold text-white">Recompensas en cada hito</h3>
              <p className="text-white/70">
                Agradecemos tu confianza con beneficios tangibles desde el primer referido.
              </p>
              <ul className="space-y-4">
                {rewards.map((reward) => (
                  <li key={reward.title} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/50">{reward.title}</p>
                    <p className="text-white mt-3">{reward.reward}</p>
                  </li>
                ))}
              </ul>
              <a
                href="https://plataforma.app/refer/rules.pdf"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition transform"
              >
                Descargar bases legales
              </a>
            </aside>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            <header className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Transparencia total</h2>
              <p className="text-white/70">
                Queremos que confíes en el proceso. Estas son las garantías y compromisos que asumimos.
              </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {legalItems.map((item) => (
                <article key={item} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
                  <p className="text-white/80 leading-relaxed">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Hoja de ruta de implementación
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {roadmap.map((item) => (
                <div key={`${item.week}-${item.action}`} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-white/10 text-xs uppercase tracking-[0.18em] text-white/60">
                      {item.week}
                    </span>
                    <span className="text-sm text-white/50">{item.owner}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">Es hora de correr la voz</h2>
            <p className="text-white/70">
              Cada habitación disponible puede convertirse en un hogar seguro. Invita a tus amistades, gana recompensas y construyamos convivencia digna para toda Europa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://plataforma.app/referrals"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 text-slate-900 font-semibold shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50"
              >
                Compartir mi enlace ahora
              </a>
              <button
                onClick={onContactClick}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
              >
                ¿Dudas? Hablemos
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default ReferFriendsPage;
