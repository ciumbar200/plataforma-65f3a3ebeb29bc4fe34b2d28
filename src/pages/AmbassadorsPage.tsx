import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
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

interface AmbassadorsPageProps extends NavHandlers {
  onRegisterClick?: () => void;
}

const perks = [
  {
    title: 'Comisión recurrente del 12%',
    description:
      'Recibe ingresos por cada contrato que cierres gracias a tus recomendaciones durante 12 meses consecutivos.',
  },
  {
    title: 'Acceso anticipado a novedades',
    description:
      'Prueba funcionalidades beta, participa en sesiones privadas y ayuda a perfilar nuestra hoja de ruta.',
  },
  {
    title: 'Visibilidad premium',
    description:
      'Tu perfil destacado en la app, material de marca personalizado y reconocimiento en ranking público.',
  },
  {
    title: 'Experiencias exclusivas',
    description:
      'Retreats anuales, workshops europeos, mentoría 1:1 con el equipo MoOn y comunidad privada.',
  },
];

const onboardingSteps = [
  {
    label: 'Aplica en minutos',
    description:
      'Completa el formulario y cuéntanos tus logros como anfitrión, propietario o líder de comunidad.',
  },
  {
    label: 'Sesión de lanzamiento',
    description:
      'Recibe el kit digital, formación express y acceso al CRM para activar tus primeros referidos.',
  },
  {
    label: 'Activa tu cohorte',
    description:
      'Consigue 5 referidos cualificados en 30 días con apoyo de un mentor interno.',
  },
  {
    label: 'Escala tu impacto',
    description:
      'Accede a niveles Plata y Oro con más comisiones, bonos extra y visibilidad internacional.',
  },
];

const requirements = [
  'NPS personal superior a 9 y al menos tres convivencias exitosas.',
  'Cumplimiento impecable: pagos puntuales y cero incidencias graves.',
  'Capacidad de comunicación en comunidades locales o redes sociales.',
  'Participación en eventos trimestrales y feedback continuo al equipo.',
];

const leaderboardTiers = [
  { tier: 'Nivel Inicial', detail: '12% de comisión por cada contrato originado.' },
  { tier: 'Nivel Plata (25 contratos)', detail: 'Comisión del 14% + bonos trimestrales.' },
  { tier: 'Nivel Oro (50 contratos)', detail: 'Comisión del 16% + viaje anual patrocinado.' },
];

const AmbassadorsPage: React.FC<AmbassadorsPageProps> = (props) => {
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

  // Invite-only gate and SEO noindex
  const [isAllowed, setIsAllowed] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const code = params.get('invite') || params.get('code');
      if (!code) { setIsAllowed(false); return; }
      try {
        const { data, error } = await supabase.rpc('validate_ambassador_code', { p_code: code });
        if (!error && data === true) setIsAllowed(true);
        else setIsAllowed(false);
      } catch { setIsAllowed(false); }
    };
    run();
  }, []);

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

  if (!isAllowed) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex items-center justify-center p-8 text-center">
        <div className="max-w-xl space-y-4">
          <h1 className="text-2xl font-bold">Acceso solo por invitación</h1>
          <p className="text-white/70">Necesitas un enlace de invitación válido para ver esta página.</p>
        </div>
      </div>
    );
  }

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
        pageContext="propietario"
      />

      <main className="flex-grow">
        <section className="relative py-24 overflow-hidden">
          <GlowBackground />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm uppercase tracking-[0.2em] text-white/70">
                Programa de Embajadores
              </span>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                Sé la voz de la convivencia que transforma ciudades
              </h1>
              <p className="text-lg text-white/75 max-w-3xl mx-auto">
                Únete a Moon Hosts, el programa diseñado para anfitriones, propietarios y líderes comunitarios que quieren generar impacto real, acompañar convivencias seguras y construir redes de confianza en toda Europa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://plataforma.app/ambassadors/apply"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 text-slate-900 font-semibold shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50"
                >
                  Aplicar al programa
                </a>
                <button
                  onClick={onReferFriendsClick}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
                >
                  Ver cómo invitar amigos
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <header className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">
                Beneficios hechos a tu medida
              </h2>
              <p className="text-white/70">
                Reconocemos tu trabajo como anfitrión o líder de comunidad. Estas son las ventajas que activas desde el día uno.
              </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {perks.map((perk) => (
                <article
                  key={perk.title}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-lg shadow-indigo-500/5"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{perk.title}</h3>
                  <p className="text-white/70 leading-relaxed">{perk.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[1.1fr,0.9fr] items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">¿Qué esperamos de ti?</h2>
              <p className="text-white/70 leading-relaxed">
                Queremos referentes que eleven el estándar de convivencia. Si te mueve la idea de transformar habitaciones vacías en hogares llenos de vida, estás en el lugar correcto.
              </p>
              <ul className="space-y-4 text-white/80">
                {requirements.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Código ético</h3>
                <p className="text-white/70">
                  Transparencia total en promesas, acompañamiento humano y respeto por la diversidad de perfiles que confían en ti.
                </p>
              </div>
            </div>
            <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
              <h3 className="text-2xl font-semibold text-white">Escala tu impacto</h3>
              <p className="text-white/70">
                Reconocemos tu crecimiento con niveles y recompensas adicionales.
              </p>
              <ul className="space-y-4">
                {leaderboardTiers.map((item) => (
                  <li key={item.tier} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/50">{item.tier}</p>
                    <p className="text-white mt-2">{item.detail}</p>
                  </li>
                ))}
              </ul>
              <a
                href="https://cal.com/moon/ambassadors"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition transform"
              >
                Agenda una llamada
              </a>
            </aside>
          </div>
        </section>

        <section className="py-20 bg-black/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Tu viaje como Moon Host</h2>
            <div className="relative grid gap-12 md:grid-cols-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.label} className="relative flex flex-col items-start md:items-center text-left md:text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 font-semibold shadow-lg shadow-indigo-500/30 mb-6">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.label}</h3>
                  <p className="mt-3 text-white/70 leading-relaxed">{step.description}</p>
                  {index < onboardingSteps.length - 1 && (
                    <span className="hidden md:block absolute top-6 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-white/10 via-white/40 to-white/10" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Multiplica la convivencia segura en tu ciudad
            </h2>
            <p className="text-white/70">
              Seleccionamos a 40 embajadores activos por trimestre. Si sientes que este programa es para ti, da el primer paso y demuestra por qué tu comunidad merece una nueva forma de vivir.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://plataforma.app/ambassadors/apply"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-900 font-semibold shadow-lg shadow-emerald-400/30 transition hover:-translate-y-0.5 hover:shadow-emerald-400/50"
              >
                Aplicar ahora
              </a>
              <button
                onClick={onContactClick}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
              >
                Habla con nuestro equipo
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default AmbassadorsPage;
