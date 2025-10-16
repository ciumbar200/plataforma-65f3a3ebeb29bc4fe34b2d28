import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import {
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  MoonIcon,
  CheckCircleIcon,
  UsersIcon,
} from '../components/icons';

const Silver = ({
  onHomeClick,
  onLoginClick,
  onOwnersClick,
  onRegisterClick,
  onBlogClick,
  onAboutClick,
  onPrivacyClick,
  onTermsClick,
  onContactClick,
}) => {
  const footerProps = { onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick };

  const motivos = [
    {
      title: 'Compatibilidad que abraza la diversidad',
      description:
        'Nuestro algoritmo prioriza afinidades humanas: rutinas, valores y metas compartidas para que cada convivencia se sienta segura, respetuosa y libre de prejuicios.',
      icon: SparklesIcon,
    },
    {
      title: 'Acompañamiento humano en cada paso',
      description:
        'Un equipo cercano te guía desde la búsqueda del hogar hasta la firma, con recursos para resolver dudas legales, emocionales y prácticas sin dejarte sola ni solo.',
      icon: UsersIcon,
    },
    {
      title: 'Confianza blindada',
      description:
        'Verificaciones inteligentes, scoring antifraude y seguros integrales que protegen a todas las partes para que la convivencia sea tan transparente como el cristal.',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Diseñado para sentirte en casa',
      description:
        'Interiores virtuales, playlists colaborativas y rituales de convivencia que crean hogares con magia MoOn, incluso antes de compartir las llaves.',
      icon: HeartIcon,
    },
  ];

  const pasos = [
    {
      title: '1. Cuéntanos quién eres',
      detail:
        'Completa un perfil empático e inclusivo, donde reconocemos tus necesidades, tus límites y la energía que deseas compartir.',
    },
    {
      title: '2. Haz match con tranquilidad',
      detail:
        'Recibe propuestas de espacios y compañerxs que vibran contigo. Conversa, agenda videollamadas seguras y resuelve dudas con nuestra guía.',
    },
    {
      title: '3. Formaliza sin estrés',
      detail:
        'Gestiona contratos, seguros y acompañamiento con soporte 24/7. Celebramos tu mudanza con rituales para cuidar la convivencia desde el día uno.',
    },
  ];

  const beneficios = [
    'Club MoOn con experiencias mensuales en tu ciudad.',
    'Acceso prioritario a propiedades verificadas.',
    'Alertas personalizadas cuando aparece tu match ideal.',
    'Herramientas de convivencia para co-crear acuerdos claros.',
  ];

  const testimonios = [
    {
      quote:
        '“Con Silver encontré a personas que respetan mis tiempos de descanso y mi trabajo remoto. Nos acompañaron en todo el proceso y hoy nuestro piso es un hogar lleno de calma.”',
      author: 'Lúa, diseñadora UX en Valencia',
    },
    {
      quote:
        '“Soy propietaria primeriza y Silver me dio la seguridad que necesitaba. Las visitas estaban prefiltradas, el seguro cubre imprevistos y seguimos en contacto con la comunidad MoOn.”',
      author: 'María José, cuidadora y anfitriona en Sevilla',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white flex flex-col">
      <Header
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onHomeClick={onHomeClick}
        onOwnersClick={onOwnersClick}
        pageContext="inquilino"
      />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/80">
              <MoonIcon className="w-4 h-4" />
              Bienvenidx a la experiencia MoOn Silver
            </div>
            <h1 className="mt-8 text-4xl sm:text-5xl font-extrabold leading-tight">
              Hogares compartidos donde sentirte abrazadx, segura y libre.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
              Silver es nuestro círculo más cuidado: personas compatibles, procesos claros y un
              acompañamiento que pone tu bienestar en el centro.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50"
              >
                Quiero unirme a Silver
              </a>
              <button
                type="button"
                onClick={onLoginClick}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-white/10"
              >
                Prefiero explorar primero
              </button>
            </div>
          </div>
        </section>

        {/* Por qué MoOn Silver */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold">¿Por qué MoOn Silver?</h2>
              <p className="mt-4 text-white/70">
                Creamos conexiones auténticas que celebran tu forma de vivir. Cada detalle está
                pensado para que compartir hogar sea sinónimo de bienestar.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {motivos.map(({ title, description, icon: Icon }) => (
                <GlassCard
                  key={title}
                  className="p-6 md:p-8 bg-white/5 border-white/15 hover:border-white/30 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-100">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                  </div>
                  <p className="mt-4 text-white/70">{description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-20 bg-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">¿Cómo funciona Silver?</h2>
            <p className="mt-4 text-center text-white/70">
              Tres pasos suaves y acompañados para que mudarte sea una experiencia alegre.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pasos.map(({ title, detail }) => (
                <GlassCard
                  key={title}
                  className="h-full p-6 bg-white/5 border-white/10 text-center flex flex-col justify-between"
                >
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-4 text-white/70">{detail}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios clave */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Beneficios clave que vas a amar</h2>
            <p className="mt-4 text-white/70">
              Pensamos en la convivencia como un ecosistema vivo. Silver te entrega recursos para
              disfrutarlo plenamente.
            </p>
            <ul className="mt-10 space-y-4 text-left">
              {beneficios.map((beneficio) => (
                <li
                  key={beneficio}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <CheckCircleIcon className="w-6 h-6 text-indigo-300 flex-shrink-0 mt-1" />
                  <span className="text-white/80">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-20 bg-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">Historias Silver</h2>
            <p className="mt-4 text-center text-white/70">
              Comunidades reales que hoy florecen gracias a la magia compartida de MoOn.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonios.map(({ quote, author }) => (
                <GlassCard
                  key={author}
                  className="p-6 md:p-8 bg-white/5 border-white/10 flex flex-col gap-4"
                >
                  <p className="text-lg italic text-white/80">{quote}</p>
                  <span className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
                    {author}
                  </span>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <GlassCard className="p-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/15">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Listxs para dar el salto a MoOn Silver
              </h2>
              <p className="mt-4 text-white/80">
                Regístrate en nuestra experiencia premium y vive la convivencia como siempre la
                soñaste: cuidada, transparente y llena de apoyo mutuo.
              </p>
              <a
                href="/register"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-10 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50"
              >
                Empezar mi registro Silver
              </a>
            </GlassCard>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default Silver;
