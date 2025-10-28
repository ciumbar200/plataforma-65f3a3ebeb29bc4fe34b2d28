



import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { 
    DocumentTextIcon, 
    ShieldCheckIcon, 
    SparklesIcon, 
    SignatureIcon,
    ChevronLeftIcon,
    XIcon
} from '../components/icons';
import { PropertyType } from '../types';
import { CITIES_DATA, getSupabaseUrl } from '../constants';
import { useI18n } from '../i18n';


interface OwnerLandingPageProps {
    onStartPublication: (data: { property_type: PropertyType; city: string; locality: string }) => void;
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

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <GlassCard className="bg-white/5 border-white/15">
        <div className="flex-shrink-0 mb-4">
            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    {icon}
                </div>
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/75">{children}</p>
    </GlassCard>
);

const OwnerQuickStartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { property_type: PropertyType; city: string; locality: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedLocality, setSelectedLocality] = useState<string>('');
    const [localities, setLocalities] = useState<string[]>([]);
    const { scope } = useI18n();
    const modal = scope<any>('owners.modal') || {};

    useEffect(() => {
        if (selectedCity && CITIES_DATA[selectedCity]) {
            setLocalities(CITIES_DATA[selectedCity]);
            setSelectedLocality('');
        } else {
            setLocalities([]);
            setSelectedLocality('');
        }
    }, [selectedCity]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!propertyType || !selectedCity || !selectedLocality) {
            alert(modal.validation || 'Por favor, completa todos los campos para continuar.');
            return;
        }
        onSubmit({
            property_type: propertyType,
            city: selectedCity,
            locality: selectedLocality,
        });
        setPropertyType('');
        setSelectedCity('');
        setSelectedLocality('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <GlassCard className="relative w-full max-w-lg">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                    aria-label={modal.closeAria || 'Cerrar'}
                >
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{modal.title || 'Vamos a preparar tu anuncio'}</h2>
                    <p className="mt-2 text-white/70">{modal.subtitle || 'Cuéntanos qué tipo de propiedad, ciudad y zona vas a publicar.'}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
                    <div>
                        <label htmlFor="owner-property-type" className="block text-sm font-semibold text-white/80 mb-2">{modal.fields?.type?.label || '1. ¿Qué tipo de propiedad quieres publicar?'}</label>
                        <select
                            id="owner-property-type"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                            className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                                !propertyType ? 'text-white/70' : 'text-white'
                            }`}
                        >
                            <option value="" disabled>{modal.fields?.type?.placeholder || 'Elige el tipo de propiedad'}</option>
                            {Object.values(PropertyType).map((type) => (
                                <option key={type} value={type} className="bg-gray-800 text-white">
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="owner-city" className="block text-sm font-semibold text-white/80 mb-2">{modal.fields?.city?.label || '2. ¿En qué ciudad está la vivienda?'}</label>
                        <select
                            id="owner-city"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                                !selectedCity ? 'text-white/70' : 'text-white'
                            }`}
                        >
                            <option value="" disabled>{modal.fields?.city?.placeholder || 'Selecciona ciudad'}</option>
                            {Object.keys(CITIES_DATA).map((city) => (
                                <option key={city} value={city} className="bg-gray-800 text-white">
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="owner-locality" className="block text-sm font-semibold text-white/80 mb-2">{modal.fields?.locality?.label || '3. ¿En qué barrio o zona?'}</label>
                        <select
                            id="owner-locality"
                            value={selectedLocality}
                            onChange={(e) => setSelectedLocality(e.target.value)}
                            disabled={!selectedCity}
                            className={`w-full appearance-none bg-white/10 border border-white/20 rounded-lg p-3 pr-10 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 ${
                                !selectedLocality ? 'text-white/70' : 'text-white'
                            }`}
                        >
                            <option value="" disabled>{modal.fields?.locality?.placeholder || 'Selecciona barrio o municipio'}</option>
                            {localities.map((loc) => (
                                <option key={loc} value={loc} className="bg-gray-800 text-white">
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 hover:from-indigo-500 hover:to-blue-500 text-slate-900 font-semibold py-3 px-6 rounded-full transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                    >
                        <span>{modal.submit || 'Continuar'}</span>
                    </button>
                </form>
            </GlassCard>
        </div>
    );
};

const testimonials = [
    {
        quote: "Publiqué un viernes y el domingo ya tenía visitas programadas. Firmamos en una semana.",
        author: "María G.",
        details: "Barcelona - Piso 3 hab.",
        img: getSupabaseUrl('avatars', 'testimonial01.webp')
    },
    {
        quote: "Me encantó el filtro de compatibilidad. Menos ruido, mejores candidatos.",
        author: "Jordi R.",
        details: "Valencia - Ático 2 hab.",
        img: getSupabaseUrl('avatars', 'testimonial02.webp')
    },
    {
        quote: "Proceso claro y digital. Contrato, depósito y pagos sin papel.",
        author: "Ana L.",
        details: "Madrid - Loft",
        img: getSupabaseUrl('avatars', 'testimonial03.webp')
    }
];

const OwnerLandingPage: React.FC<OwnerLandingPageProps> = ({
    onStartPublication,
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
    const { scope } = useI18n();
    const owners = scope<any>('owners') || {};
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

    const handleQuickStartSubmit = (data: { property_type: PropertyType; city: string; locality: string }) => {
        onStartPublication(data);
        setIsQuickStartOpen(false);
    };
    
    const handleTalkToAdvisor = () => {
        if (onContactClick) {
            onContactClick();
        } else if (onOwnersClick) {
            onOwnersClick();
        }
    };

    const nextTestimonial = () => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
            <Header
                reserveSpace={false}
                onLoginClick={onLoginClick}
                onHomeClick={onHomeClick}
                onOwnersClick={onHomeClick}
                onBlogClick={onBlogClick}
                onSilverClick={onSilverClick}
                onCalculadoraClick={onCalculadoraClick}
                onAmbassadorsClick={onAmbassadorsClick}
                onReferFriendsClick={onReferFriendsClick}
                onBlueprintClick={onBlueprintClick}
                pageContext="propietario"
            />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <GlowBackground />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-10 items-center">
                            <div className="space-y-6 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/80 mx-auto lg:mx-0">
                                    {owners.hero?.badge || 'Publicar es gratis y sin exclusividad'}
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                                    {owners.hero?.title || 'Consigue inquilinos fiables sin estrés'}
                                </h1>
                                <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
                                    {owners.hero?.subtitle || 'Verificamos identidad, filtramos candidatos y te acompañamos con procesos claros para convivencias felices.'}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsQuickStartOpen(true)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-8 py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50"
                                    >
                                        {owners.hero?.ctaStart || 'Empezar ahora'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTalkToAdvisor}
                                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white/85 hover:bg-white/10"
                                    >
                                        {owners.hero?.ctaAdvisor || 'Hablar con un advisor'}
                                    </button>
                                </div>
                                <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-white/75">
                                    <div className="flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5 text-emerald-300" />{owners.hero?.benefits?.[0] || 'Verificación antifraude'}</div>
                                    <div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-300" />{owners.hero?.benefits?.[1] || 'Matches compatibles'}</div>
                                    <div className="flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-sky-300" />{owners.hero?.benefits?.[2] || 'Contratos claros'}</div>
                                </div>
                            </div>

                            <GlassCard className="relative overflow-hidden border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-0">
                                <img
                                    src="https://images.pexels.com/photos/8090358/pexels-photo-8090358.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200"
                                    alt="Propietario dando la bienvenida a inquilinos en un piso acogedor"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/85 to-transparent p-6">
                                    <p className="text-sm text-white/80">{owners.hero?.quote || '“Con MoOn publiqué en dos días, recibí candidatos filtrados y firmamos contrato digital sin papeleo.”'}</p>
                                    <p className="mt-3 text-xs uppercase tracking-wide text-white/50">{owners.hero?.quoteBy || 'Ana, anfitriona en Sevilla'}</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold">{owners.features?.title || 'Todo lo que un propietario necesita'}</h2>
                            <p className="text-lg text-white/70 mt-2">{owners.features?.subtitle || 'Servicio completo, limpio, rápido y transparente.'}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard icon={<DocumentTextIcon className="w-7 h-7" />} title={(owners.features?.cards?.[0]?.title) || 'Publicación en 2 minutos'}>{(owners.features?.cards?.[0]?.description) || 'Sube fotos, define renta y reglas de la casa. Nosotros nos encargamos del resto.'}</FeatureCard>
                            <FeatureCard icon={<ShieldCheckIcon className="w-7 h-7" />} title={(owners.features?.cards?.[1]?.title) || 'Verificación y scoring'}>{(owners.features?.cards?.[1]?.description) || 'Comprobación de identidad e ingresos, filtros anti-fraude y perfiles compatibles.'}</FeatureCard>
                            <FeatureCard icon={<SparklesIcon className="w-7 h-7" />} title={(owners.features?.cards?.[2]?.title) || 'Match inteligente'}>{(owners.features?.cards?.[2]?.description) || 'Algoritmo que prioriza convivencia: hábitos, horarios, aficiones y compatibilidad.'}</FeatureCard>
                            <FeatureCard icon={<SignatureIcon className="w-7 h-7" />} title={(owners.features?.cards?.[3]?.title) || 'Contrato y firma online'}>{(owners.features?.cards?.[3]?.description) || 'Plantillas legales y firma electrónica. Opcional: seguro de impago y depósito digital.'}</FeatureCard>
                        </div>
                    </div>
                </section>
                
                {/* How it works */}
                <section id="como-funciona" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold">{owners.how?.title || 'Cómo funciona'}</h2>
                            <p className="text-lg text-white/70 mt-2">{owners.how?.subtitle || 'Un flujo sencillo para alquilar rápido y seguro.'}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">1</span><h3 className="text-xl font-bold mb-2">{owners.how?.steps?.[0]?.title || 'Publica tu vivienda'}</h3><p className="text-white/70">{owners.how?.steps?.[0]?.description || 'Gratis y sin exclusividad. Cuéntanos condiciones y preferencias.'}</p></GlassCard>
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">2</span><h3 className="text-xl font-bold mb-2">{owners.how?.steps?.[1]?.title || 'Recibe candidatos verificados'}</h3><p className="text-white/70">{owners.how?.steps?.[1]?.description || 'Te enviamos perfiles con verificación y compatibilidad.'}</p></GlassCard>
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">3</span><h3 className="text-xl font-bold mb-2">{owners.how?.steps?.[2]?.title || 'Firma y cobra'}</h3><p className="text-white/70">{owners.how?.steps?.[2]?.description || 'Contrato digital, opción de seguro y cobro mensual automatizado.'}</p></GlassCard>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold">{owners.testimonials?.title || 'Propietarios que ya confían'}</h2>
                            <p className="text-lg text-white/70 mt-2">{owners.testimonials?.subtitle || 'Historias reales de cierres rápidos y buena convivencia.'}</p>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <button onClick={prevTestimonial} className="absolute left-0 -translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hidden md:block" aria-label={owners.testimonials?.ariaPrev || 'Anterior testimonio'}><ChevronLeftIcon className="w-6 h-6"/></button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[-1, 0, 1].map(offset => {
                                    const index = (currentTestimonial + offset + testimonials.length) % testimonials.length;
                                    const testimonial = testimonials[index];
                                    const isCenter = offset === 0;
                                    return (
                                        <GlassCard key={index} className={`bg-white/5 border-white/15 transition-all duration-300 ${isCenter ? 'scale-100 opacity-100' : 'scale-90 opacity-60 hidden md:block'}`}>
                                            <p className="italic mb-4">"{testimonial.quote}"</p>
                                            <div className="flex items-center gap-3">
                                                <img src={testimonial.img} alt={testimonial.author} className="w-10 h-10 rounded-full object-cover"/>
                                                <div>
                                                    <p className="font-bold">{testimonial.author}</p>
                                                    <p className="text-sm text-white/70">{testimonial.details}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                            <button onClick={nextTestimonial} className="absolute right-0 translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hidden md:block" aria-label={owners.testimonials?.ariaNext || 'Siguiente testimonio'}><ChevronLeftIcon className="w-6 h-6 rotate-180"/></button>
                        </div>
                         <div className="flex md:hidden justify-center gap-8 mt-8">
                            <button onClick={prevTestimonial} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label={owners.testimonials?.ariaPrev || 'Anterior testimonio'}><ChevronLeftIcon className="w-6 h-6"/></button>
                            <button onClick={nextTestimonial} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label={owners.testimonials?.ariaNext || 'Siguiente testimonio'}><ChevronLeftIcon className="w-6 h-6 rotate-180"/></button>
                        </div>
                    </div>
                </section>
            </main>
            <OwnerQuickStartModal
                isOpen={isQuickStartOpen}
                onClose={() => setIsQuickStartOpen(false)}
                onSubmit={handleQuickStartSubmit}
            />
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
        </div>
    );
};

export default OwnerLandingPage;
