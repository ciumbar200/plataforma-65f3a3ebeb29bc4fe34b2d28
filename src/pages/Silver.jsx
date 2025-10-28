import React, { useState } from 'react';
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
import { supabase } from '../lib/supabaseClient';
import { useI18n } from '../i18n';

const SILVER_HERO_IMAGE = 'https://images.pexels.com/photos/7551678/pexels-photo-7551678.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1200';
const SILVER_FACE_IMAGES = [
  'https://images.pexels.com/photos/7551671/pexels-photo-7551671.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=200',
  'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=200',
  'https://images.pexels.com/photos/7551699/pexels-photo-7551699.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=200',
];

const HERO_FACTS_DEFAULT = [
  { label: 'Habitaciones vacías en España', value: '3M+' },
  { label: 'Ahorro medio Silver', value: '≈450€ / mes' },
  { label: 'Personas acompañadas 2024', value: '280' },
];

const PILLARS_DEFAULT = [
  {
    title: 'Matching vital y emocional',
    description:
      'Perfilamos hábitos, horarios, intereses y necesidades de apoyo para que convivas con personas que comparten tu ritmo y valores.',
    icon: SparklesIcon,
  },
  {
    title: 'Seguridad legal y cuidados compartidos',
    description:
      'Co-diseñamos contratos claros, seguros y protocolos de convivencia. Coordinamos profesionales (limpieza, asistencia) si el grupo lo desea.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Equipo humano que acompaña',
    description:
      'Un concierge Silver facilita entrevistas, dinamiza los primeros encuentros y media ante cualquier necesidad durante la convivencia.',
    icon: UsersIcon,
  },
  {
    title: 'Hogar con alma y comunidad',
    description:
      'Actividades, acuerdos y rituales que transforman una vivienda infrautilizada en un hogar lleno de compañía y propósito.',
    icon: HeartIcon,
  },
];

const STEPS_DEFAULT = [
  {
    title: '1. Escucha Silver',
    detail:
      'Sesión inicial con nuestro equipo para entender tu historia, salud, presupuesto y preferencias. Todas las conversaciones son confidenciales.',
  },
  {
    title: '2. Curamos combinaciones y espacios',
    detail:
      'Verificamos viviendas luminosas con habitaciones adaptables y proponemos compañeros compatibles. Puedes conocerlos online y en persona.',
  },
  {
    title: '3. Plan de convivencia y activación',
    detail:
      'Definimos reglas, reparto de gastos y apoyos externos. Firmamos juntos y hacemos seguimiento durante los primeros 90 días.',
  },
];

const BENEFITS_DEFAULT = [
  'Reduce hasta un 45% del coste mensual al compartir alquiler, suministros y servicios.',
  'Mantén tu independencia en tu barrio mientras cuentas con compañía diaria.',
  'Comparte los honorarios de una empleada del hogar o asistencia profesional cuando la necesitáis.',
  'Espacios verificados, contratos transparentes y seguros adaptados a mayores de 55.',
  'Programas de bienestar, actividades y comunidad para activar nuevos proyectos de vida.',
];

const SCENARIOS_DEFAULT = [
  {
    title: '3 personas en un piso amplio',
    detail:
      'Cada persona aporta 460 €/mes y se libera un presupuesto conjunto de 320 € para empleada del hogar tres días por semana.',
  },
  {
    title: 'Pareja + 1 habitación extra',
    detail:
      'La tercera persona cubre el 35% del alquiler, permitiendo destinar 250 € a actividades y cuidado puntual compartido.',
  },
  {
    title: 'Vecinas que reúnen dos viviendas vacías',
    detail:
      'Unen recursos, alquilan una vivienda adaptada y liberan dos pisos en la ciudad para nuevas familias.',
  },
];

const TESTIMONIOS_DEFAULT = [
  {
    quote:
      '“No quería irme del barrio ni vivir sola. Ahora comparto piso con Rosa y Pilar; con lo que ahorramos pagamos a Ana, que nos ayuda en casa y nos acompaña a las revisiones médicas.”',
    author: 'Carmen · 67 años · Barcelona',
  },
  {
    quote:
      '“Mi hijo descansó al saber que tengo compañía y contratos seguros. El equipo Silver sigue pendiente de nosotras para que la convivencia fluya.”',
    author: 'Antonio · 72 años · Valencia',
  },
];

const FORM_HIGHLIGHTS_DEFAULT = [
  'Diagnóstico personalizado en menos de 48 horas.',
  'Te proponemos viviendas y compañeros verificados.',
  'Equipo Silver acompañándote durante toda la convivencia.',
];

const ensureArray = (value, fallback) => (Array.isArray(value) && value.length > 0 ? value : fallback);
const normalizePillars = (items) =>
  items.map((item, index) => {
    const fallback = PILLARS_DEFAULT[index % PILLARS_DEFAULT.length];
    const IconComponent = item.icon || fallback.icon;
    return {
      ...fallback,
      ...item,
      icon: IconComponent || SparklesIcon,
    };
  });

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
  onSilverClick,
  onCalculadoraClick,
  onAmbassadorsClick,
  onReferFriendsClick,
  onBlueprintClick,
}) => {
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
  const { scope } = useI18n();
  const copy = scope('silver') || {};
  const heroFactsData = ensureArray(copy.hero?.facts, HERO_FACTS_DEFAULT);
  const scenariosData = ensureArray(copy.scenarios, SCENARIOS_DEFAULT);
  const pillarsData = normalizePillars(ensureArray(copy.pillars, PILLARS_DEFAULT));
  const stepsData = ensureArray(copy.steps, STEPS_DEFAULT);
  const benefitsData = ensureArray(copy.benefits, BENEFITS_DEFAULT);
  const testimonialsData = ensureArray(copy.testimonials, TESTIMONIOS_DEFAULT);
  const highlightsData = ensureArray(copy.form?.highlights, FORM_HIGHLIGHTS_DEFAULT);
  const benefitsTitle = copy.benefitsTitle || 'Beneficios que sentirás desde el primer mes';
  const benefitsSubtitle = copy.benefitsSubtitle || 'Silver equilibra ahorro, seguridad y bienestar emocional con acompañamiento permanente.';
  const storiesTitle = copy.testimonialsTitle || 'Historias Silver';
  const storiesSubtitle = copy.testimonialsSubtitle || 'Personas reales que decidieron compartir hogar y ganar tranquilidad.';
  const formTitle = copy.form?.title || 'Déjanos tus datos y diseñamos tu hogar compartido';
  const formSubtitle = copy.form?.subtitle || 'Te contactaremos en menos de 48 horas para conocer tu situación y proponerte compañeros y viviendas compatibles.';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const [formMessage, setFormMessage] = useState('');

  const handleSilverNav = () => {
    if (onSilverClick) {
      onSilverClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormStatus('loading');
    setFormMessage('');

    const formData = new FormData(event.currentTarget);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const city = (formData.get('city') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    const payload = {
      name,
      email,
      phone,
      city,
      message: message || null,
      origin: 'silver_program',
      source_url: typeof window !== 'undefined' ? window.location.href : null,
    };

    try {
      const { error } = await supabase.from('silver_leads').insert([payload]);

      if (error) {
        throw error;
      }

      setFormStatus('success');
      setFormMessage('¡Gracias! Te contactaremos en menos de 48 horas para proponerte tu combinación ideal.');
      event.currentTarget.reset();
    } catch (error) {
      console.error('Error al registrar lead Silver:', error);
      setFormStatus('error');
      setFormMessage('No hemos podido enviar tu solicitud. Inténtalo de nuevo o escríbenos a hello@moonsharedliving.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white flex flex-col">
      <Header
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        onHomeClick={onHomeClick}
        onOwnersClick={onOwnersClick}
        onBlogClick={onBlogClick}
        onSilverClick={handleSilverNav}
        onCalculadoraClick={onCalculadoraClick}
        onAmbassadorsClick={onAmbassadorsClick}
        onReferFriendsClick={onReferFriendsClick}
        onBlueprintClick={onBlueprintClick}
        reserveSpace={false}
        pageContext="inquilino"
      />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/80 mx-auto lg:mx-0">
                  <MoonIcon className="w-4 h-4" />
                  {copy.hero?.badge || 'Programa MoOn Silver · +55'}
                </div>
                <h1 className="mt-8 text-4xl sm:text-5xl font-extrabold leading-tight">
                  {copy.hero?.title || 'Vive acompañado, cuida tus finanzas y permanece en tu barrio.'}
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-3xl mx-auto lg:mx-0">
                  {copy.hero?.lead1 || 'En España el alquiler en solitario se ha disparado un 40% en cinco años mientras millones de habitaciones siguen vacías. Silver reactiva esos hogares con convivencias compatibles, contratos claros y apoyos compartidos.'}
                </p>
                <p className="mt-4 text-base text-white/70 max-w-3xl mx-auto lg:mx-0">
                  {copy.hero?.lead2 || 'Compartir vivienda con personas afines te permite vivir con dignidad, contratar ayuda en casa entre varias personas y seguir formando parte de tu comunidad.'}
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {heroFactsData.map(({ label, value }) => (
                    <GlassCard key={label} className="bg-white/5 border-white/15 backdrop-blur-xl p-5 text-center sm:text-left">
                      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
                      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
                    </GlassCard>
                  ))}
                </div>
                <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 px-6 py-5 backdrop-blur-xl shadow-lg max-w-3xl mx-auto lg:mx-0">
                  <p className="text-sm sm:text-base text-white/75">{copy.hero?.note || 'Si tres personas mayores comparten un piso amplio, liberan dos viviendas que estaban vacías y con el ahorro mensual pueden contratar juntas a una empleada de hogar. En Silver te ayudamos a que esa ecuación sea segura y humana.'}</p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <div className="flex -space-x-4">
                    {SILVER_FACE_IMAGES.map((src, index) => (
                      <img key={src} src={src} alt={(copy.hero?.faceAltPrefix || 'Persona Silver') + ` ${index + 1}`} className="w-14 h-14 rounded-full border-2 border-white/30 object-cover" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 max-w-xs sm:max-w-sm">
                    {copy.hero?.footnote || 'Más de 280 personas Silver ya comparten hogar con apoyo profesional de MoOn. Diseñamos cada convivencia a medida.'}
                  </p>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#solicitud-silver"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50"
                  >
                    {copy.cta?.join || 'Apuntarme al programa Silver'}
                  </a>
                  <button
                    type="button"
                    onClick={() => document.getElementById('impacto-silver')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-white/10"
                  >
                    {copy.cta?.how || 'Ver cómo funciona'}
                  </button>
                </div>
              </div>
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <GlassCard className="relative overflow-hidden border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-0">
                  <img src={SILVER_HERO_IMAGE} alt={copy.hero?.imageAlt || 'Grupo de personas mayores compartiendo un piso acogedor'} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 to-transparent p-6">
                    <p className="text-sm text-white/80">{copy.hero?.quote || '“Compartimos gastos, contratamos ayuda doméstica y seguimos en nuestro barrio. Nos sentimos acompañadas y seguras.”'}</p>
                    <p className="mt-3 text-xs uppercase tracking-wide text-white/50">{copy.hero?.quoteBy || 'Comunidad Silver · Barcelona'}</p>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
        <section id="impacto-silver" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold">{copy.impact?.title || 'Transformamos viviendas vacías en hogares vivos'}</h2>
              <p className="mt-4 text-white/70">{copy.impact?.subtitle || 'La crisis de vivienda en España no se resuelve con residencias masivas, sino conectando personas que desean seguir viviendo con dignidad. Silver acompaña ese salto con procesos seguros y cuidados compartidos.'}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {scenariosData.map(({ title, detail }) => (
                <GlassCard key={title} className="h-full bg-white/5 border-white/15 p-6 backdrop-blur-xl">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-white/70">{detail}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold">{copy.unique?.title || 'Lo que hace único a MoOn Silver'}</h2>
              <p className="mt-4 text-white/70">{copy.unique?.subtitle || 'No solo juntamos personas, diseñamos una convivencia sostenible con soporte profesional y comunidad.'}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {pillarsData.map(({ title, description, icon: Icon }) => (
                <GlassCard key={title} className="p-6 md:p-8 bg-white/5 border-white/15 hover:border-white/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-100">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                  </div>
                  <p className="mt-4 text-white/70">{description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">{copy.stepsTitle || 'Así activamos tu convivencia'}</h2>
            <p className="mt-4 text-center text-white/70">{copy.stepsSubtitle || 'Cada proceso está guiado por nuestro equipo Silver para que sientas seguridad en cada paso.'}</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {stepsData.map(({ title, detail }) => (
                <GlassCard key={title} className="h-full p-6 bg-white/5 border-white/10 flex flex-col justify-between">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-4 text-white/70">{detail}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">{benefitsTitle}</h2>
            <p className="mt-4 text-center text-white/70">{benefitsSubtitle}</p>
            <ul className="mt-10 space-y-4">
              {benefitsData.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CheckCircleIcon className="w-6 h-6 text-indigo-300 flex-shrink-0 mt-1" />
                  <span className="text-white/80">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center">{storiesTitle}</h2>
            <p className="mt-4 text-center text-white/70">{storiesSubtitle}</p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {testimonialsData.map(({ quote, author }) => (
                <GlassCard key={author} className="p-6 md:p-8 bg-white/5 border-white/10 flex flex-col gap-4">
                  <p className="text-lg italic text-white/80">{quote}</p>
                  <span className="text-sm font-semibold uppercase tracking-wide text-indigo-300">{author}</span>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section id="solicitud-silver" className="py-24 bg-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="bg-white/8 border-white/20 p-8 sm:p-10">
              <div className="grid gap-10 md:grid-cols-2 items-start">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">{formTitle}</h2>
                  <p className="mt-4 text-white/75">{formSubtitle}</p>
                  <ul className="mt-6 space-y-3 text-white/75">
                    {highlightsData.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-indigo-300 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-white/80 mb-1" htmlFor="silver-name">{copy.form?.fields?.name || 'Nombre y apellidos'}</label>
                    <input
                      id="silver-name"
                      name="name"
                      required
                      placeholder={copy.form?.placeholders?.name || 'Ej. Carmen López'}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1" htmlFor="silver-email">{copy.form?.fields?.email || 'Email'}</label>
                      <input
                        id="silver-email"
                        type="email"
                        name="email"
                        required
                        placeholder={copy.form?.placeholders?.email || 'tu@email.com'}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1" htmlFor="silver-phone">{copy.form?.fields?.phone || 'Teléfono'}</label>
                      <input
                        id="silver-phone"
                        type="tel"
                        name="phone"
                        required
                        placeholder={copy.form?.placeholders?.phone || '+34 600 000 000'}
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1" htmlFor="silver-city">{copy.form?.fields?.city || 'Ciudad donde quieres convivir'}</label>
                    <input
                      id="silver-city"
                      name="city"
                      required
                      placeholder={copy.form?.placeholders?.city || 'Barcelona, Valencia, Madrid...'}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1" htmlFor="silver-message">{copy.form?.fields?.message || 'Cuéntanos tu situación'}</label>
                    <textarea
                      id="silver-message"
                      name="message"
                      rows={4}
                      placeholder={copy.form?.placeholders?.message || 'Ej. Vivo sola en un piso grande y busco dos compañeras para compartir gastos y contratar ayuda en casa.'}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition ${
                      isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-indigo-500/50'
                    }`}
                  >
                    {isSubmitting ? (copy.form?.sending || 'Enviando...') : (copy.form?.submit || 'Quiero mi diagnóstico Silver')}
                  </button>
                  {formMessage && (
                    <p
                      role="status"
                      className={`text-sm text-center ${
                        formStatus === 'success' ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {formMessage}
                    </p>
                  )}
                  <p className="text-xs text-white/50 text-center">{copy.form?.privacy || 'Tus datos se tratarán según nuestra Política de Privacidad. Solo los usamos para contactarte sobre Silver.'}</p>
                </form>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      <Footer {...footerProps} />
    </div>
  );
};

export default Silver;
