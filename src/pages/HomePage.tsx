import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import { CompassIcon, UsersIcon, BuildingIcon, ChevronDownIcon, PencilIcon, SearchIcon, SignatureIcon, ChevronLeftIcon, CheckCircleIcon, SparklesIcon, ShieldCheckIcon, XIcon } from '../components/icons';
import GlassCard from '../components/GlassCard';
import { RentalGoal } from '../types';
import { CITIES_DATA } from '../constants';
import { useI18n } from '../i18n';

const silverCohortImage = new URL('../assets/home-cohort-silver.webp', import.meta.url).href;

interface HomePageProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onStartRegistration: (data: { rentalGoal: RentalGoal; city: string; locality: string }) => void;
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

type HomeHeroBenefitKey = 'contracts' | 'matching' | 'support';
type CohortAction = 'register' | 'owners' | 'silver';

type HomeCopy = {
    hero: {
        badge: string;
        headline: string[];
        description: string;
        secondary: string;
        ctas: { search: string; howItWorks: string };
        benefits: Array<{ key: HomeHeroBenefitKey; label: string }>;
        compatibility: {
            badge: string;
            trio: string;
            profile: {
                name: string;
                matchLabel: string;
                summary: string;
                traits: string[];
                values: string;
                extraMatches: string;
                actions: { reject: string; accept: string };
            };
            footnote: string;
            detail: {
                title: string;
                score: string;
                person: { name: string; description: string };
                breakdown: Array<{ label: string; value: number; total: number; colorClass: string }>;
                footnote: string;
            };
        };
    };
    cohorts: {
        title: string;
        subtitle: string;
        cards: Array<{ label: string; description: string; cta: string }>;
    };
    features: {
        title: string;
        cards: Array<{ title: string; description: string }>;
    };
    howItWorks: {
        title: string;
        steps: Array<{ title: string; description: string }>;
    };
    testimonials: {
        title: string;
        subtitle: string;
        aria: { previous: string; next: string };
        items: Array<{ quote: string; author: string; details: string; img: string }>;
    };
    faq: {
        title: string;
        subtitle: string;
        items: Array<{ question: string; answerHtml: string }>;
    };
};

type HomeGuidedSearchCopy = {
    title: string;
    subtitle: string;
    closeAria: string;
    validation: string;
    submit: string;
    steps: {
        goal: {
            label: string;
            placeholder: string;
            options: {
                findRoommatesAndApartment: string;
                findRoom: string;
                both: string;
            };
        };
        city: {
            label: string;
            placeholder: string;
        };
        locality: {
            placeholder: string;
        };
    };
};

const DEFAULT_HOME_COPY: HomeCopy = {
    hero: {
        badge: 'La alternativa humana a la crisis de vivienda',
        headline: ['Vive digno.', 'Vive seguro.', 'Vive acompañado.'],
        description: 'En España alquilar en solitario se ha vuelto un lujo. En MoOn compartes hogar con personas compatibles para reducir gastos, sumar apoyos y sentirte en casa desde el primer día.',
        secondary: 'Cada habitación vacía es una oportunidad: activamos viviendas infrautilizadas con matching empático, contratos transparentes y acompañamiento cercano para que cuides tu presente sin renunciar a tu dignidad.',
        ctas: { search: 'Buscar compañeros', howItWorks: 'Ver cómo funciona' },
        benefits: [
            { key: 'contracts', label: 'Contratos y seguros claros' },
            { key: 'matching', label: 'Matching de hábitos y valores' },
            { key: 'support', label: 'Acompañamiento humano continuo' },
        ],
        compatibility: {
            badge: 'Compatibilidad 92%',
            trio: 'Luna • Clara • Río',
            profile: {
                name: 'Laura, 28',
                matchLabel: '92% match',
                summary: 'Busco compañer@ para alquilar piso juntos',
                traits: ['Rutina madrugadora', 'Cocina mediterránea', 'Yoga y pilates', 'Trabaja remoto'],
                values: 'Respeto, orden, horarios similares',
                extraMatches: '+3 coincidencias',
                actions: { reject: 'No', accept: 'Sí' },
            },
            footnote: 'Sneak peek del Discover de MoOn.',
            detail: {
                title: 'Detalle de compatibilidad',
                score: '66%',
                person: { name: 'Marc, 29', description: 'Diseñador UX • Barcelona' },
                breakdown: [
                    { label: 'Intereses', value: 20, total: 40, colorClass: 'bg-orange-400' },
                    { label: 'Edad', value: 6, total: 20, colorClass: 'bg-orange-400' },
                    { label: 'Nivel de ruido', value: 20, total: 20, colorClass: 'bg-emerald-400' },
                    { label: 'Estilo de vida', value: 20, total: 20, colorClass: 'bg-emerald-400' },
                ],
                footnote: 'Esta puntuación es una guía para ayudarte a encontrar personas con tu estilo de vida.',
            },
        },
    },
    cohorts: {
        title: 'Unimos generaciones y oportunidades',
        subtitle: 'Creamos puentes entre quienes buscan un hogar, quienes abren sus puertas y quienes quieren seguir viviendo acompañados.',
        cards: [
            { label: 'Mooner', description: 'Estudiantes y jóvenes profesionales que desean convivencias auténticas y seguras.', cta: 'Encuentra tu lugar' },
            { label: 'Propietario', description: 'Propietarios y anfitriones que buscan personas compatibles y procesos sin fricción.', cta: 'Publica tu habitación' },
            { label: 'Silver', description: 'Personas senior que quieren compartir su hogar y mantener una vida activa en compañía.', cta: 'Vive acompañado' },
        ],
    },
    features: {
        title: '¿Por qué MoOn?',
        cards: [
            { title: 'Match por Compatibilidad', description: 'Nuestro algoritmo avanzado analiza tu estilo de vida, hábitos e intereses para encontrar los compañeros de piso más compatibles.' },
            { title: 'Propiedades Verificadas', description: 'Explora un listado curado de pisos y habitaciones. Cada propiedad es revisada por nuestro equipo para garantizar calidad y seguridad.' },
            { title: 'Búsqueda Inteligente', description: 'Filtra por ubicación, precio, servicios y hasta por el ambiente que buscas en tu nuevo hogar. Tu casa ideal está a solo unos clics.' },
        ],
    },
    howItWorks: {
        title: 'Cómo Funciona para Inquilinos',
        steps: [
            { title: 'Crea tu Perfil', description: 'Define tu estilo de vida, hábitos e intereses. Nuestro algoritmo usa esta información para encontrar tu match perfecto.' },
            { title: 'Descubre y Conecta', description: 'Explora perfiles de compañeros y propiedades compatibles. Envía “me gusta” y haz match con tus favoritos.' },
            { title: 'Firma y Múdate', description: 'Chatea con tus matches, organiza visitas y formaliza el acuerdo. Tu nuevo hogar te espera.' },
        ],
    },
    testimonials: {
        title: 'Historias reales, convivencias felices',
        subtitle: 'Lo que cuentan quienes ya encontraron hogar y tribu en MoOn.',
        aria: { previous: 'Anterior testimonio', next: 'Siguiente testimonio' },
        items: [
            {
                quote: 'Encontré a mi compañera de piso y un apartamento increíble en menos de una semana. La compatibilidad era del 92% y ¡realmente se nota! MoOn hizo que todo el proceso fuera súper fácil y divertido.',
                author: 'Elena Rodríguez',
                details: 'Estudiante de Diseño, Madrid',
                img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&fit=crop',
            },
            {
                quote: 'Después de mi divorcio, la idea de vivir solo era abrumadora. En MoOn no solo encontré a alguien con quien compartir gastos, sino a un gran amigo. Alquilamos un piso juntos y ha sido la mejor decisión.',
                author: 'Carlos V.',
                details: 'Profesional divorciado, Barcelona',
                img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop',
            },
            {
                quote: 'Se nos fue un compañero de piso y no sabíamos a quién meter. Publicamos la habitación en MoOn y en tres días encontramos a la persona perfecta, ¡y con una compatibilidad del 95%! Nos salvó.',
                author: 'Sofía M. y amigos',
                details: 'Grupo de piso, Valencia',
                img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop',
            },
            {
                quote: 'Como estudiante, encontrar un piso asequible cerca de la universidad era una pesadilla. MoOn me conectó con otros estudiantes en mi misma situación y ahora compartimos un piso genial.',
                author: 'David L.',
                details: 'Estudiante de Ingeniería, Sevilla',
                img: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&h=200&fit=crop',
            },
            {
                quote: 'Trabajo desde casa y necesitaba un compañero de piso tranquilo y con horarios similares. El filtro de “Estilo de Vida” fue clave. ¡He encontrado la paz que necesitaba!',
                author: 'Ana P.',
                details: 'Freelance, Madrid',
                img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop',
            },
        ],
    },
    faq: {
        title: 'Preguntas Frecuentes',
        subtitle: '¿Tienes dudas? Aquí resolvemos las más comunes.',
        items: [
            {
                question: '¿Cómo garantiza MoOn la seguridad de mi vivienda?',
                answerHtml: '<p>Todos los inquilinos pasan por un filtro híbrido: comprobamos identidad, ingresos, referencias y hábitos antes de presentarles tu piso. También puedes activar seguro de impago y contratos digitales con validez legal.</p>',
            },
            {
                question: '¿Qué servicios recibo si publico con vosotros?',
                answerHtml: '<p>Redactamos tu anuncio, hacemos home staging digital, coordinamos visitas, filtramos candidatos compatibles y gestionamos la firma. Tú decides siempre quién entra.</p>',
            },
            {
                question: '¿Qué ocurre si un inquilino deja de pagar?',
                answerHtml: '<p>Activamos protocolo MoOn: mediación inmediata, seguro de impago opcional y reactivamos la captación para minimizar la vacancia. Todo sin comisiones sorpresa.</p>',
            },
            {
                question: '¿Cómo funciona el programa Silver?',
                answerHtml: '<p>Diseñamos convivencias +55 a medida: escuchamos necesidades de salud, buscamos compañeros afines, redactamos acuerdos claros y coordinamos apoyos (limpieza, asistencia) compartidos.</p>',
            },
            {
                question: '¿Qué adaptaciones recomendáis antes de compartir mi casa?',
                answerHtml: '<p>Realizamos un diagnóstico Silver: iluminación con sensores, barras de apoyo, muebles accesibles y zonas comunes cálidas. Te entregamos un checklist para dejarlo listo en 15 días.</p>',
            },
            {
                question: '¿Cómo involucráis a mi familia si me uno a Silver?',
                answerHtml: '<p>Organizamos llamadas informativas, compartimos plan financiero y creamos un canal directo con nuestro equipo para resolver dudas de tus familiares siempre que lo necesiten.</p>',
            },
            {
                question: '¿Qué soporte tengo durante la convivencia?',
                answerHtml: '<p>Dispones de un advisor MoOn 24/7, revisiones trimestrales, canal para incidencias y mediación si surge algún conflicto. Nuestra prioridad es que la convivencia sea estable y humana.</p>',
            },
            {
                question: '¿Qué costes tiene MoOn para propietarios y Silver?',
                answerHtml: '<p>Publicar es gratis y sin exclusividad. Cobranos solo si activas servicios premium (contratos, seguros, gestión de cobros). El diagnóstico Silver es gratuito y el plan se personaliza según apoyos necesarios.</p>',
            },
        ],
    },
};

const DEFAULT_GUIDED_SEARCH_COPY: HomeGuidedSearchCopy = {
    title: 'Empecemos tu búsqueda',
    subtitle: 'Dinos qué necesitas para encontrar tu match perfecto.',
    closeAria: 'Cerrar modal',
    validation: 'Por favor, completa todos los campos para continuar.',
    submit: 'Continuar',
    steps: {
        goal: {
            label: '1. ¿Cuál es tu objetivo?',
            placeholder: 'Busco...',
            options: {
                findRoommatesAndApartment: 'Compañeros y piso',
                findRoom: 'Habitación en piso',
                both: 'Ambas opciones',
            },
        },
        city: {
            label: '2. ¿Dónde quieres vivir?',
            placeholder: 'Ciudad',
        },
        locality: {
            placeholder: 'Localidad',
        },
    },
};

const COHORT_CARD_META: Array<{ emoji: string; image: string; action: CohortAction }> = [
    {
        emoji: '👨\u200d🎓',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
        action: 'register',
    },
    {
        emoji: '🏡',
        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop',
        action: 'owners',
    },
    {
        emoji: '👵',
        image: silverCohortImage,
        action: 'silver',
    },
];

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <GlassCard className="bg-white/5 border-white/15 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-700/30">
        <div className="mx-auto mb-4">
            <div className="relative h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 shadow-lg shadow-indigo-900/40">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    {icon}
                </div>
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/75">{children}</p>
    </GlassCard>
);
const GuidedSearchModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rentalGoal: RentalGoal; city: string; locality: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [rentalGoal, setRentalGoal] = useState<RentalGoal | ''>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedLocality, setSelectedLocality] = useState<string>('');
    const [localities, setLocalities] = useState<string[]>([]);
    const { scope } = useI18n();
    const localizedModalCopy = scope<HomeGuidedSearchCopy>('home.guidedSearch');
    const modalCopy: HomeGuidedSearchCopy = {
        ...DEFAULT_GUIDED_SEARCH_COPY,
        ...localizedModalCopy,
        steps: {
            goal: {
                ...DEFAULT_GUIDED_SEARCH_COPY.steps.goal,
                ...(localizedModalCopy?.steps?.goal ?? {}),
                options: {
                    ...DEFAULT_GUIDED_SEARCH_COPY.steps.goal.options,
                    ...(localizedModalCopy?.steps?.goal?.options ?? {}),
                },
            },
            city: {
                ...DEFAULT_GUIDED_SEARCH_COPY.steps.city,
                ...(localizedModalCopy?.steps?.city ?? {}),
            },
            locality: {
                ...DEFAULT_GUIDED_SEARCH_COPY.steps.locality,
                ...(localizedModalCopy?.steps?.locality ?? {}),
            },
        },
    };

    useEffect(() => {
        if (selectedCity && CITIES_DATA[selectedCity]) {
            const cityLocalities = CITIES_DATA[selectedCity];
            setLocalities(cityLocalities);
            setSelectedLocality('');
        } else {
            setLocalities([]);
            setSelectedLocality('');
        }
    }, [selectedCity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rentalGoal || !selectedCity || !selectedLocality) {
            alert(modalCopy.validation);
            return;
        }
        onSubmit({ rentalGoal, city: selectedCity, locality: selectedLocality });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-down">
            <GlassCard className="w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white" aria-label={modalCopy.closeAria}>
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{modalCopy.title}</h2>
                    <p className="text-white/70 mt-1">{modalCopy.subtitle}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="rentalGoal" className="block text-sm font-medium text-white/80 mb-2">{modalCopy.steps.goal.label}</label>
                        <select id="rentalGoal" value={rentalGoal} onChange={(e) => setRentalGoal(e.target.value as RentalGoal)} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${!rentalGoal ? 'text-white/70' : 'text-white'}`}>
                            <option value="" disabled>{modalCopy.steps.goal.placeholder}</option>
                            <option value={RentalGoal.FIND_ROOMMATES_AND_APARTMENT} className="bg-gray-800 text-white">{modalCopy.steps.goal.options.findRoommatesAndApartment}</option>
                            <option value={RentalGoal.FIND_ROOM_WITH_ROOMMATES} className="bg-gray-800 text-white">{modalCopy.steps.goal.options.findRoom}</option>
                            <option value={RentalGoal.BOTH} className="bg-gray-800 text-white">{modalCopy.steps.goal.options.both}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="city" className="block text-sm font-medium text-white/80 mb-2">{modalCopy.steps.city.label}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select id="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${!selectedCity ? 'text-white/70' : 'text-white'}`}>
                                <option value="" disabled>{modalCopy.steps.city.placeholder}</option>
                                {Object.keys(CITIES_DATA).map(city => <option key={city} value={city} className="bg-gray-800 text-white">{city}</option>)}
                            </select>
                            <select id="locality" value={selectedLocality} onChange={(e) => setSelectedLocality(e.target.value)} disabled={!selectedCity} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 ${!selectedLocality ? 'text-white/70' : 'text-white'}`}>
                                <option value="" disabled>{modalCopy.steps.locality.placeholder}</option>
                                {localities.map(loc => <option key={loc} value={loc} className="bg-gray-800 text-white">{loc}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-purple-500/50">
                        <SearchIcon className="w-5 h-5" />
                        <span>{modalCopy.submit}</span>
                    </button>
                </form>
            </GlassCard>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({
    onLoginClick,
    onRegisterClick,
    onStartRegistration,
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
    onOpenDiscoverProfile,
}) => {
    const { scope } = useI18n();
    const localizedCopy = scope<HomeCopy>('home');
    const heroCopy = localizedCopy.hero ?? DEFAULT_HOME_COPY.hero;
    const compatibilityCopy = heroCopy.compatibility ?? DEFAULT_HOME_COPY.hero.compatibility;
    const heroBenefits = heroCopy.benefits ?? DEFAULT_HOME_COPY.hero.benefits;
    const cohortsCopy = localizedCopy.cohorts ?? DEFAULT_HOME_COPY.cohorts;
    const featuresCopy = localizedCopy.features ?? DEFAULT_HOME_COPY.features;
    const howItWorksCopy = localizedCopy.howItWorks ?? DEFAULT_HOME_COPY.howItWorks;
    const testimonialsCopy = localizedCopy.testimonials ?? DEFAULT_HOME_COPY.testimonials;
    const faqCopy = localizedCopy.faq ?? DEFAULT_HOME_COPY.faq;
    const testimonials = testimonialsCopy.items ?? DEFAULT_HOME_COPY.testimonials.items;
    const faqs = faqCopy.items ?? DEFAULT_HOME_COPY.faq.items;
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const nextTestimonial = () => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const cohortCards = COHORT_CARD_META.map((meta, index) => {
        const cardText = cohortsCopy.cards[index] ?? DEFAULT_HOME_COPY.cohorts.cards[index];
        const handleAction = () => {
            switch (meta.action) {
                case 'register':
                    if (onRegisterClick) {
                        onRegisterClick();
                    } else {
                        setIsSearchModalOpen(true);
                    }
                    break;
                case 'owners':
                    onOwnersClick?.();
                    break;
                case 'silver':
                    onSilverClick?.();
                    break;
                default:
                    break;
            }
        };
        return {
            ...meta,
            ...cardText,
            onClick: handleAction,
        };
    });

    const benefitIconMap: Record<HomeHeroBenefitKey, JSX.Element> = {
        contracts: <CheckCircleIcon className="w-5 h-5 text-emerald-300" />,
        matching: <SparklesIcon className="w-5 h-5 text-yellow-300" />,
        support: <ShieldCheckIcon className="w-5 h-5 text-sky-300" />,
    };

    const featureIcons = [UsersIcon, BuildingIcon, CompassIcon] as const;
    const howItWorksIcons = [PencilIcon, SearchIcon, SignatureIcon] as const;
    const howItWorksGradients = ['from-sky-400 to-violet-500', 'from-cyan-400 to-sky-500', 'from-emerald-400 to-lime-400'] as const;

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col relative">
            <Header
                reserveSpace={false}
                onLoginClick={onLoginClick}
                onRegisterClick={onRegisterClick}
                onHomeClick={() => {
                    if (typeof window === 'undefined') return;
                    const element = document.getElementById('hero');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
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
                {/* Hero Section */}
                <section id="hero" className="relative overflow-hidden">
                    <GlowBackground />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="text-center lg:text-left space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/80 mx-auto lg:mx-0">
                                    {heroCopy.badge}
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-[52px] font-black leading-tight space-y-2">
                                    {heroCopy.headline.map((line, index) => {
                                        const isEmphasized = index === heroCopy.headline.length - 1;
                                        return (
                                            <span
                                                key={`${line}-${index}`}
                                                className={`block ${isEmphasized ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400' : ''}`}
                                            >
                                                {line}
                                            </span>
                                        );
                                    })}
                                </h1>
                                <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
                                    {heroCopy.description}
                                </p>
                                <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto lg:mx-0">
                                    {heroCopy.secondary}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                    <button onClick={() => setIsSearchModalOpen(true)} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-7 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-indigo-500/50">
                                        {heroCopy.ctas.search}
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                                    >
                                        {heroCopy.ctas.howItWorks}
                                    </button>
                                </div>
                                <div className="pt-2 flex flex-col sm:flex-row sm:flex-nowrap gap-3 sm:gap-6 text-sm text-white/75 justify-center lg:justify-start">
                                    {heroBenefits.map(({ key, label }) => (
                                        <div key={key} className="flex items-center gap-2 whitespace-nowrap">
                                            {benefitIconMap[key] ?? null}
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compatibility widget */}
                            <div className="w-full flex flex-col items-center lg:items-end gap-6">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm mx-auto lg:mx-0">
                                    <h3 className="text-lg font-extrabold text-orange-300">{compatibilityCopy.badge}</h3>
                                    <p className="mt-1 text-sm text-white/70">{compatibilityCopy.trio}</p>
                                    <div className="mt-6 bg-white/8 border border-white/15 rounded-2xl p-4 sm:p-5">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop"
                                                alt={compatibilityCopy.profile.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-white">{compatibilityCopy.profile.name}</p>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/40 text-white/80">{compatibilityCopy.profile.matchLabel}</span>
                                                </div>
                                                <p className="text-xs text-white/70">{compatibilityCopy.profile.summary}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
                                            {compatibilityCopy.profile.traits.map(trait => (
                                                <span key={trait} className="bg-white/10 border border-white/15 rounded-lg px-3 py-2">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                                            <p>{compatibilityCopy.profile.values}</p>
                                            <span className="text-xs text-white/50">{compatibilityCopy.profile.extraMatches}</span>
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 font-semibold py-2 rounded-full transition-colors">
                                                {compatibilityCopy.profile.actions.reject}
                                            </button>
                                            <button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold py-2 rounded-full transition-colors">
                                                {compatibilityCopy.profile.actions.accept}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-6 text-center lg:text-left text-xs text-white/60">{compatibilityCopy.footnote}</p>
                                <div className="w-full max-w-xs bg-white/6 border border-white/15 rounded-3xl p-5 backdrop-blur-xl shadow-lg lg:hidden">
                                    <div className="flex items-center justify-between">
                                        <span className="uppercase text-xs tracking-wide text-white/70">{compatibilityCopy.detail.title}</span>
                                        <span className="text-emerald-300 font-semibold text-lg">{compatibilityCopy.detail.score}</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                            <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop" alt={compatibilityCopy.detail.person.name} className="w-12 h-12 rounded-full object-cover" />
                                        <div className="flex-1 text-xs text-white/70">
                                            <p className="font-semibold text-white">{compatibilityCopy.detail.person.name}</p>
                                            <p>{compatibilityCopy.detail.person.description}</p>
                                        </div>
                                        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop" alt={compatibilityCopy.profile.name} className="w-12 h-12 rounded-full object-cover" />
                                    </div>
                                    <div className="mt-4 space-y-3 text-xs text-white/70">
                                        {compatibilityCopy.detail.breakdown.map(({ label, value, total, colorClass }) => {
                                            const percent = Math.round((value / total) * 100);
                                            return (
                                                <div key={label}>
                                                    <div className="flex justify-between mb-1">
                                                        <span>{label}</span>
                                                        <span className="text-white/60">{value} / {total} pts</span>
                                                    </div>
                                                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                                                        <div className={`h-full ${colorClass}`} style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-4 text-[11px] text-white/50 text-center">
                                        {compatibilityCopy.detail.footnote}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cohorts Section */}
                <section className="relative py-16 sm:py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <GlassCard className="bg-white/5 border-white/15 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{cohortsCopy.title}</h2>
                                <p className="mt-3 text-white/70 max-w-2xl mx-auto">{cohortsCopy.subtitle}</p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                {cohortCards.map(({ label, description, cta, emoji, image, onClick }) => (
                    <div key={label} className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-2xl">
                        <div className="absolute inset-0">
                            <img src={image} alt={label} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220]/40 via-[#0b1220]/20 to-[#221a3e]/70 mix-blend-multiply" />
                        </div>
                        <div className="relative p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                                    <span>{emoji}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{label}</h3>
                            </div>
                            <p className="mt-4 text-sm text-white/75 flex-1">{description}</p>
                            <button
                                type="button"
                                onClick={onClick}
                                className="mt-6 w-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold py-2.5 rounded-full transition-colors text-sm"
                            >
                                {cta}
                            </button>
                        </div>
                    </div>
                ))}
                            </div>
                        </GlassCard>
                    </div>
                </section>

                {/* Features Section */}
                <section id="como-funciona" className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-extrabold text-center mb-12 tracking-tight">{featuresCopy.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {featuresCopy.cards.map((card, index) => {
                                const Icon = featureIcons[index] ?? UsersIcon;
                                return (
                                    <Feature key={card.title} icon={<Icon className="w-7 h-7" />} title={card.title}>
                                        {card.description}
                                    </Feature>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="como-funciona" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-extrabold text-center mb-12">{howItWorksCopy.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {howItWorksCopy.steps.map((step, index) => {
                                const Icon = howItWorksIcons[index] ?? PencilIcon;
                                const gradient = howItWorksGradients[index] ?? 'from-sky-400 to-violet-500';
                                const isLast = index === howItWorksCopy.steps.length - 1;
                                return (
                                    <GlassCard key={step.title} className="relative text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 bg-white/5 border-white/15">
                                        <span className="absolute top-4 right-4 text-5xl font-bold text-white/10">{index + 1}</span>
                                        <div className={`relative h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
                                            <div className={`absolute inset-0 flex items-center justify-center ${isLast ? 'text-slate-900' : 'text-white'}`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                        <p className="text-white/70">{step.description}</p>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </div>
                </section>
                
                {/* Testimonial Carousel Section */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 space-y-2">
                            <h2 className="text-4xl font-extrabold">{testimonialsCopy.title}</h2>
                            <p className="text-lg text-white/70 max-w-2xl mx-auto">
                                {testimonialsCopy.subtitle}
                            </p>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <button
                                onClick={prevTestimonial}
                                className="hidden md:flex absolute left-0 -translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition"
                                aria-label={testimonialsCopy.aria.previous}
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                {[-1, 0, 1].map(offset => {
                                    const index = (currentTestimonial + offset + testimonials.length) % testimonials.length;
                                    const testimonial = testimonials[index];
                                    const isCenter = offset === 0;
                                    return (
                                        <GlassCard
                                            key={`${testimonial.author}-${offset}`}
                                            className={`bg-white/5 border-white/15 transition-all duration-300 ${
                                                isCenter ? 'scale-100 opacity-100' : 'hidden md:block scale-90 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <img
                                                    src={testimonial.img}
                                                    alt={testimonial.author}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-bold text-white">{testimonial.author}</p>
                                                    <p className="text-sm text-white/70">{testimonial.details}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm md:text-base italic text-white/85 leading-relaxed">"{testimonial.quote}"</p>
                                        </GlassCard>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextTestimonial}
                                className="hidden md:flex absolute right-0 translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition"
                                aria-label={testimonialsCopy.aria.next}
                            >
                                <ChevronLeftIcon className="w-6 h-6 rotate-180" />
                            </button>
                        </div>

                        <div className="flex md:hidden justify-center gap-8 mt-8">
                            <button
                                onClick={prevTestimonial}
                                className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"
                                aria-label={testimonialsCopy.aria.previous}
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"
                                aria-label={testimonialsCopy.aria.next}
                            >
                                <ChevronLeftIcon className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-2">{faqCopy.title}</h2>
                        <p className="text-center text-white/70 mb-10">{faqCopy.subtitle}</p>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <GlassCard key={index} className="!p-0 overflow-hidden bg-white/5 border-white/15">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex justify-between items-center text-left p-6"
                                    >
                                        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                                        <ChevronDownIcon className={`w-6 h-6 text-white/70 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="p-6 pt-0 text-white/80 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <Footer 
                onBlogClick={onBlogClick} 
                onAboutClick={onAboutClick}
                onPrivacyClick={onPrivacyClick}
                onTermsClick={onTermsClick}
                onContactClick={onContactClick}
                onOwnersClick={onOwnersClick}
                onSilverClick={onSilverClick}
                onAmbassadorsClick={onAmbassadorsClick}
                onReferFriendsClick={onReferFriendsClick}
                onBlueprintClick={onBlueprintClick}
            />

            <GuidedSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSubmit={onStartRegistration}
            />
        </div>
    );
};

export default HomePage;
