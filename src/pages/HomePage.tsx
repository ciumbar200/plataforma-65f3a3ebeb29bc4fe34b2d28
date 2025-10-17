import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import { CompassIcon, UsersIcon, BuildingIcon, ChevronDownIcon, PencilIcon, SearchIcon, SignatureIcon, ChevronLeftIcon, CheckCircleIcon, SparklesIcon, ShieldCheckIcon, XIcon } from '../components/icons';
import GlassCard from '../components/GlassCard';
import { RentalGoal } from '../types';
import { CITIES_DATA, getSupabaseUrl } from '../constants';

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
}

const testimonials = [
    {
        quote: "Encontré a mi compañera de piso y un apartamento increíble en menos de una semana. La compatibilidad era del 92% y ¡realmente se nota! MoOn hizo que todo el proceso fuera súper fácil y divertido.",
        author: "Elena Rodríguez",
        details: "Estudiante de Diseño, Madrid",
        img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&fit=crop'
    },
    {
        quote: "Después de mi divorcio, la idea de vivir solo era abrumadora. En MoOn no solo encontré a alguien con quien compartir gastos, sino a un gran amigo. Alquilamos un piso juntos y ha sido la mejor decisión.",
        author: "Carlos V.",
        details: "Profesional divorciado, Barcelona",
        img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop'
    },
    {
        quote: "Se nos fue un compañero de piso y no sabíamos a quién meter. Publicamos la habitación en MoOn y en tres días encontramos a la persona perfecta, ¡y con una compatibilidad del 95%! Nos salvó.",
        author: "Sofía M. y amigos",
        details: "Grupo de piso, Valencia",
        img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop'
    },
    {
        quote: "Como estudiante, encontrar un piso asequible cerca de la universidad era una pesadilla. MoOn me conectó con otros estudiantes en mi misma situación y ahora compartimos un piso genial.",
        author: "David L.",
        details: "Estudiante de Ingeniería, Sevilla",
        img: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&h=200&fit=crop'
    },
    {
        quote: "Trabajo desde casa y necesitaba un compañero de piso tranquilo y con horarios similares. El filtro de 'Estilo de Vida' fue clave. ¡He encontrado la paz que necesitaba!",
        author: "Ana P.",
        details: "Freelance, Madrid",
        img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop'
    }
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

const faqs = [
    {
        question: '¿Qué es MoOn?',
        answer: '<p>MoOn es una plataforma de matching inteligente que conecta personas con valores y estilos de vida compatibles para compartir piso de forma segura, justa y sin especulación.</p>',
    },
    {
        question: '¿Cómo funciona el “Matching Inteligente”?',
        answer: "<p>Cuando te registras, completas un perfil con tus hábitos y preferencias. Nuestro algoritmo analiza tu información para sugerirte dos caminos:</p><ul class='list-disc list-inside mt-2 space-y-1'><li><strong>Buscar \"Compañeros y Piso\":</strong> Primero encuentras personas compatibles, formáis un grupo y luego buscáis juntos una propiedad para alquilar desde cero.</li><li><strong>Buscar \"Habitación en Piso\":</strong> Te unes a un piso que ya está formado y tiene una habitación libre.</li></ul><p class='mt-2'>Así reducimos el riesgo de conflictos y creamos comunidades más felices.</p>",
    },
    {
        question: '¿Cuánto cuesta usar MoOn?',
        answer: "<ul class='list-disc list-inside space-y-1'><li><strong>Registro y creación de perfil:</strong> Gratis.</li><li><strong>Suscripción Premium:</strong> 10 €/mes, que incluye contratos legales, scoring antifraude, seguro y comunidad exclusiva.</li></ul><p class='text-sm mt-2 text-white/60'>(En la mayoría de ciudades, es menos de lo que pagarías en comisiones de una agencia tradicional).</p>",
    },
    {
        question: '¿Qué seguridad tengo al alquilar?',
        answer: "<ul class='list-disc list-inside space-y-1'><li>Contratos legales y verificados.</li><li>Seguro de impago, robo y reubicación.</li><li>Scoring antifraude de inquilinos y propietarios.</li><li>Pagos transparentes y digitales.</li></ul>",
    },
    {
        question: '¿Cómo funciona el contrato?',
        answer: "<ul class='list-disc list-inside space-y-1'><li>Cada contrato está adaptado a la ley local.</li><li>Los gastos comunes se reparten según metros cuadrados ocupados, para evitar especulación.</li><li>Cada inquilino firma con el propietario, garantizando legalidad y transparencia.</li></ul>",
    },
    {
        question: '¿Los gastos (agua, luz, gas, internet) están incluidos?',
        answer: "<p>Depende del propietario. En cada anuncio verás claramente:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Piso con gastos incluidos.</li><li>Piso donde los gastos se reparten entre los inquilinos.</li></ul>",
    },
    {
        question: '¿Puedo elegir con quién voy a vivir?',
        answer: "<p>¡Sí! Antes de cerrar un contrato, puedes:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Ver perfiles verificados de tus futuros compañeros.</li><li>Revisar su porcentaje de compatibilidad contigo.</li><li>Decidir si quieres convivir con ellos.</li></ul>",
    },
    {
        question: '¿Necesito pagar comisión a una agencia?',
        answer: "<p>No. MoOn elimina las comisiones abusivas:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Trato directo con el propietario.</li><li>Sin intermediarios innecesarios.</li><li>Solo pagas tu suscripción a MoOn.</li></ul>",
    },
    {
        question: '¿Soy estudiante, puedo usar MoOn?',
        answer: "<p>Claro. MoOn está diseñado para:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Estudiantes universitarios.</li><li>Jóvenes profesionales.</li><li>Personas recién separadas.</li><li>Trabajadores en movilidad laboral.</li></ul>",
    },
    {
        question: '¿Dónde puedo encontrar pisos con MoOn?',
        answer: "<p>Actualmente en:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Barcelona y principales ciudades de España.</li></ul><p class='mt-2'>Próximamente: Francia, Alemania y Reino Unido.</p>",
    },
    {
        question: '¿Cuánto tiempo se tarda en encontrar piso?',
        answer: '<p>En promedio, los usuarios compatibles encuentran piso en menos de 2 semanas, gracias al matching.</p>',
    },
    {
        question: '¿Qué pasa con mis datos?',
        answer: "<p>Tu información personal está protegida con encriptación.</p><ul class='list-disc list-inside mt-2 space-y-1'><li>No compartimos tus datos sin permiso.</li><li>Cumplimos con RGPD en toda Europa.</li></ul>",
    },
    {
        question: '¿Cómo sé que un anuncio es real?',
        answer: "<p>Todos los propietarios pasan por un proceso de verificación. Además:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>MoOn bloquea fraudes y anuncios falsos.</li><li>Ofrecemos soporte si detectas algo sospechoso.</li></ul>",
    },
    {
        question: '¿Qué pasa si no me adapto al piso?',
        answer: "<p>Si la convivencia no funciona:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Seguro de reubicación.</li><li>Te ayudamos a encontrar una nueva vivienda sin perder tu dinero.</li></ul>",
    },
    {
        question: '¿Qué ventajas tengo frente a Idealista, Badi u otras plataformas?',
        answer: "<ul class='list-disc list-inside space-y-1'><li>MoOn no es solo un portal de anuncios.</li><li>Tenemos algoritmo de compatibilidad, seguros y comunidad.</li><li>Cuidamos tanto de inquilinos como de propietarios.</li></ul>",
    },
    {
        question: '¿Puedo alquilar solo una habitación?',
        answer: '<p>Sí. Puedes alquilar una habitación o compartir un piso completo con otros usuarios de MoOn.</p>',
    },
    {
        question: '¿Qué pasa si no pago a tiempo?',
        answer: "<p>El contrato establece plazos claros.</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Con el seguro de impago, el propietario está protegido.</li><li>Tú también puedes evitar penalizaciones si comunicas con anticipación.</li></ul>",
    },
    {
        question: '¿Hay soporte si tengo dudas?',
        answer: "<p>Sí, nuestro equipo te atiende:</p><ul class='list-disc list-inside mt-2 space-y-1'><li>Chat online en la web/app.</li><li>Soporte por email.</li><li>Ayuda 24/7 en incidencias urgentes.</li></ul>",
    },
];


const GuidedSearchModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rentalGoal: RentalGoal; city: string; locality: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [rentalGoal, setRentalGoal] = useState<RentalGoal | ''>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedLocality, setSelectedLocality] = useState<string>('');
    const [localities, setLocalities] = useState<string[]>([]);

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
            alert('Por favor, completa todos los campos para continuar.');
            return;
        }
        onSubmit({ rentalGoal, city: selectedCity, locality: selectedLocality });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-down">
            <GlassCard className="w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white" aria-label="Cerrar modal">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Empecemos tu búsqueda</h2>
                    <p className="text-white/70 mt-1">Dinos qué necesitas para encontrar tu match perfecto.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="rentalGoal" className="block text-sm font-medium text-white/80 mb-2">1. ¿Cuál es tu objetivo?</label>
                        <select id="rentalGoal" value={rentalGoal} onChange={(e) => setRentalGoal(e.target.value as RentalGoal)} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${!rentalGoal ? 'text-white/70' : 'text-white'}`}>
                            <option value="" disabled>Busco...</option>
                            <option value={RentalGoal.FIND_ROOMMATES_AND_APARTMENT} className="bg-gray-800 text-white">Compañeros y piso</option>
                            <option value={RentalGoal.FIND_ROOM_WITH_ROOMMATES} className="bg-gray-800 text-white">Habitación en piso</option>
                            <option value={RentalGoal.BOTH} className="bg-gray-800 text-white">Ambas opciones</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="city" className="block text-sm font-medium text-white/80 mb-2">2. ¿Dónde quieres vivir?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select id="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${!selectedCity ? 'text-white/70' : 'text-white'}`}>
                                <option value="" disabled>Ciudad</option>
                                {Object.keys(CITIES_DATA).map(city => <option key={city} value={city} className="bg-gray-800 text-white">{city}</option>)}
                            </select>
                            <select id="locality" value={selectedLocality} onChange={(e) => setSelectedLocality(e.target.value)} disabled={!selectedCity} className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 ${!selectedLocality ? 'text-white/70' : 'text-white'}`}>
                                <option value="" disabled>Localidad</option>
                                {localities.map(loc => <option key={loc} value={loc} className="bg-gray-800 text-white">{loc}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-purple-500/50">
                        <SearchIcon className="w-5 h-5" />
                        <span>Continuar</span>
                    </button>
                </form>
            </GlassCard>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onRegisterClick, onStartRegistration, onOwnersClick, onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);


    const nextTestimonial = () => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col relative">
            <Header reserveSpace={false} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} onHomeClick={() => {}} onOwnersClick={onOwnersClick} pageContext="inquilino" />
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-36 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
                    <GlowBackground />
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl px-0 pb-0 pt-6 sm:p-10 lg:p-14 overflow-hidden">
                            {/* inner decorative glows */}
                            <div className="absolute right-16 top-16 w-72 h-72 rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 60%)' }} />
                            <div className="absolute right-28 top-40 w-64 h-64 rounded-full blur-3xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.35), transparent 60%)' }} />

                            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
                                <div className="lg:col-span-2 text-center lg:text-left">
                                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm text-white/80 mb-6 mx-auto lg:mx-0">Cuidamos tu convivencia</div>
                                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                                        Tu hogar compartido,
                                        <br className="hidden sm:block" />
                                        tu ritmo, tu gente.
                                    </h1>
                                    <p className="mt-6 text-lg sm:text-xl max-w-2xl text-white/80 mx-auto lg:mx-0">
                                        Conecta con personas compatibles y espacios verificados. Acompañamiento humano + procesos claros, sin estrés.
                                    </p>
                                    <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4">
                                        <button onClick={() => setIsSearchModalOpen(true)} className="col-span-2 sm:col-span-1 w-full sm:w-auto bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-indigo-900/40">
                                            Empezar ahora
                                        </button>
                                        <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="col-span-2 sm:col-span-1 w-full sm:w-auto px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 font-semibold text-white/90">
                                            Ver cómo funciona
                                        </button>
                                    </div>
                                    <div className="mt-8 flex flex-wrap gap-4 sm:gap-6 text-sm text-white/80 justify-center lg:justify-start">
                                        <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-400"/>Perfiles Verificados</div>
                                        <div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-400"/>Matching por Afinidad</div>
                                        <div className="flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5 text-cyan-400"/>Contratos Seguros</div>
                                    </div>
                                </div>

                                {/* Compatibility widget */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl max-w-sm mx-auto lg:mx-0">
                                        <h3 className="text-lg font-extrabold text-orange-300">Compatibilidad 92%</h3>
                                        <p className="mt-1 text-sm text-white/70">Luna • Clara • Río</p>
                                        <div className="mt-6 bg-white/8 border border-white/15 rounded-2xl p-4 sm:p-5">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                                                    alt="Perfil joven"
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white">Laura, 28</p>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/40 text-white/80">92% match</span>
                                                    </div>
                                                    <p className="text-xs text-white/70">Busco compañer@ para alquilar piso juntos</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
                                                <span className="bg-white/10 border border-white/15 rounded-lg px-3 py-2">Rutina madrugadora</span>
                                                <span className="bg-white/10 border border-white/15 rounded-lg px-3 py-2">Cocina mediterránea</span>
                                                <span className="bg-white/10 border border-white/15 rounded-lg px-3 py-2">Yoga y pilates</span>
                                                <span className="bg-white/10 border border-white/15 rounded-lg px-3 py-2">Trabaja remoto</span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                                                <p>Respeto, orden, horarios similares</p>
                                                <span className="text-xs text-white/50">+3 coincidencias</span>
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 font-semibold py-2 rounded-full transition-colors">No</button>
                                                <button className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-semibold py-2 rounded-full transition-colors">Sí</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:hidden relative mt-8" />
                        </div>
                    </div>
                </section>

                {/* Cohorts Section */}
                <section className="relative py-16 sm:py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <GlassCard className="bg-white/5 border-white/15 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Unimos generaciones y oportunidades</h2>
                                <p className="mt-3 text-white/70 max-w-2xl mx-auto">Creamos puentes entre quienes buscan un hogar, quienes abren sus puertas y quienes quieren seguir viviendo acompañados.</p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-3">
                                {[
                                    {
                                        label: 'Mooner',
                                        description: 'Estudiantes y jóvenes profesionales que desean convivencias auténticas y seguras.',
                                        cta: 'Encuentra tu lugar',
                                        emoji: '👨\u200d🎓',
                                        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop'
                                    },
                                    {
                                        label: 'Propietario',
                                        description: 'Propietarios y anfitriones que buscan personas compatibles y procesos sin fricción.',
                                        cta: 'Publica tu habitación',
                                        emoji: '🏡',
                                        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=800&auto=format&fit=crop'
                                    },
                                    {
                                        label: 'Silver',
                                        description: 'Personas senior que quieren compartir su hogar y mantener una vida activa en compañía.',
                                        cta: 'Vive acompañado',
                                        emoji: '👵',
                                        image: 'https://images.unsplash.com/photo-1517248142162-cc02ed3c449c?q=80&w=800&auto=format&fit=crop'
                                    }
                                ].map(({ label, description, cta, emoji, image }) => (
                                    <div key={label} className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-2xl">
                                        <div className="absolute inset-0">
                                            <img src={image} alt={label} className="w-full h-full object-cover opacity-40" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220]/70 to-[#221a3e]/80" />
                                        </div>
                                        <div className="relative p-6 flex flex-col h-full">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
                                                    <span>{emoji}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white">{label}</h3>
                                            </div>
                                            <p className="mt-4 text-sm text-white/75 flex-1">{description}</p>
                                            <button className="mt-6 w-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold py-2.5 rounded-full transition-colors text-sm">
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
                        <h2 className="text-4xl font-extrabold text-center mb-12 tracking-tight">¿Por qué <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">MoOn</span>?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Feature icon={<UsersIcon className="w-7 h-7" />} title="Match por Compatibilidad">
                                Nuestro algoritmo avanzado analiza tu estilo de vida, hábitos e intereses para encontrar los compañeros de piso más compatibles.
                            </Feature>
                            <Feature icon={<BuildingIcon className="w-7 h-7" />} title="Propiedades Verificadas">
                                Explora un listado curado de pisos y habitaciones. Cada propiedad es revisada por nuestro equipo para garantizar calidad y seguridad.
                            </Feature>
                            <Feature icon={<CompassIcon className="w-7 h-7" />} title="Búsqueda Inteligente">
                                Filtra por ubicación, precio, servicios y hasta por el ambiente que buscas en tu nuevo hogar. Tu casa ideal está a solo unos clics.
                            </Feature>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="como-funciona" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-extrabold text-center mb-12">Cómo Funciona para Inquilinos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <GlassCard className="relative text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 bg-white/5 border-white/15">
                                <span className="absolute top-4 right-4 text-5xl font-bold text-white/10">1</span>
                                <div className="relative h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 mb-4">
                                    <div className="absolute inset-0 flex items-center justify-center text-white"><PencilIcon className="w-7 h-7" /></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Crea tu Perfil</h3>
                                <p className="text-white/70">Define tu estilo de vida, hábitos e intereses. Nuestro algoritmo usa esta información para encontrar tu match perfecto.</p>
                            </GlassCard>
                            <GlassCard className="relative text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 bg-white/5 border-white/15">
                                <span className="absolute top-4 right-4 text-5xl font-bold text-white/10">2</span>
                                <div className="relative h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 mb-4">
                                    <div className="absolute inset-0 flex items-center justify-center text-white"><SearchIcon className="w-7 h-7" /></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Descubre y Conecta</h3>
                                <p className="text-white/70">Explora perfiles de compañeros y propiedades compatibles. Envía "me gusta" y haz match con tus favoritos.</p>
                            </GlassCard>
                             <GlassCard className="relative text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 bg-white/5 border-white/15">
                                <span className="absolute top-4 right-4 text-5xl font-bold text-white/10">3</span>
                                <div className="relative h-12 w-12 mx-auto rounded-xl bg-gradient-to-br from-emerald-400 to-lime-400 mb-4">
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-900"><SignatureIcon className="w-7 h-7" /></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Firma y Múdate</h3>
                                <p className="text-white/70">Chatea con tus matches, organiza visitas y formaliza el acuerdo. Tu nuevo hogar te espera.</p>
                            </GlassCard>
                        </div>
                    </div>
                </section>
                
                {/* Testimonial Carousel Section */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-extrabold mb-2">Historias Reales, Conexiones Reales</h2>
                        <p className="text-white/70 mb-10 max-w-2xl mx-auto">
                            Descubre por qué cientos de personas confían en MoOn para encontrar su hogar y sus compañeros de piso ideales.
                        </p>
                        <GlassCard className="!p-8 relative overflow-hidden min-h-[320px] flex items-center justify-center bg-white/5 border-white/15">
                            <div className="relative w-full h-full">
                                {testimonials.map((testimonial, index) => (
                                    <div
                                        key={index}
                                        className={`transition-opacity duration-500 ease-in-out absolute inset-0 flex flex-col justify-center items-center ${index === currentTestimonial ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <img 
                                            src={testimonial.img} 
                                            alt={testimonial.author} 
                                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-400"
                                        />
                                        <blockquote className="text-xl italic text-white/90 max-w-2xl mx-auto">
                                            "{testimonial.quote}"
                                        </blockquote>
                                        <cite className="mt-4 block font-bold not-italic">{testimonial.author}</cite>
                                        <p className="text-sm text-white/70">{testimonial.details}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={prevTestimonial}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                                aria-label="Anterior testimonio"
                            >
                                <ChevronLeftIcon className="w-6 h-6"/>
                            </button>
                            <button 
                                onClick={nextTestimonial}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                                aria-label="Siguiente testimonio"
                            >
                                <ChevronLeftIcon className="w-6 h-6 rotate-180"/>
                            </button>
                            
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {testimonials.map((_, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => setCurrentTestimonial(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${index === currentTestimonial ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                        aria-label={`Ir al testimonio ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-2">Preguntas Frecuentes</h2>
                        <p className="text-center text-white/70 mb-10">¿Tienes dudas? Aquí resolvemos las más comunes.</p>
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
                                        <div className="p-6 pt-0 text-white/80 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />
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
