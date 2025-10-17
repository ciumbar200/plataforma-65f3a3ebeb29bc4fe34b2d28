



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
    ChevronLeftIcon
} from '../components/icons';
import { PropertyType } from '../types';
import { CITIES_DATA, getSupabaseUrl } from '../constants';


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

const OwnerLandingPage: React.FC<OwnerLandingPageProps> = ({ onStartPublication, onHomeClick, onLoginClick, onOwnersClick, onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick }) => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
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
        if (!propertyType || !selectedCity || !selectedLocality) {
            alert('Por favor, completa todos los campos para continuar.');
            return;
        }
        onStartPublication({ property_type: propertyType, city: selectedCity, locality: selectedLocality });
    };

    const nextTestimonial = () => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
            <Header reserveSpace={false} onLoginClick={onLoginClick} onHomeClick={onHomeClick} onOwnersClick={onHomeClick} pageContext="propietario" />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <GlowBackground />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl" />
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="text-center lg:text-left space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl text-sm text-white/80 mx-auto lg:mx-0">Publicar es gratis y sin exclusividad</div>
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                                        Consigue inquilinos fiables sin estrés
                                    </h1>
                                    <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
                                        Verificamos identidad, filtramos candidatos y te acompañamos con procesos claros para convivencias felices.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                                        <button onClick={() => setPropertyType(PropertyType.ROOM)} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-8 py-3 font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] hover:shadow-indigo-500/50">
                                            Empieza gratis
                                        </button>
                                        <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white/85 hover:bg-white/10">
                                            Ver cómo funciona
                                        </button>
                                    </div>
                                    <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-white/75">
                                        <div className="flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5 text-emerald-300" />Verificación antifraude</div>
                                        <div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-300" />Matches compatibles</div>
                                        <div className="flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-sky-300" />Contratos claros</div>
                                    </div>
                                </div>
                            <div className="w-full">
                                    <GlassCard className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left">
                                            <div>
                                                <label htmlFor="propertyType" className="text-xs text-white/70">Tipo de Propiedad</label>
                                                <select id="propertyType" value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)} className={`w-full bg-transparent font-semibold focus:outline-none ${!propertyType ? 'text-white/60' : 'text-white'}`}>
                                                    <option value="" disabled>Tipo de propiedad</option>
                                                    {Object.values(PropertyType).map((type: PropertyType) => <option key={type} value={type} className="bg-gray-800 text-white">{type}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="text-xs text-white/70">Ciudad</label>
                                                <select id="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={`w-full bg-transparent font-semibold focus:outline-none ${!selectedCity ? 'text-white/60' : 'text-white'}`}>
                                                    <option value="" disabled>Ciudad</option>
                                                    {Object.keys(CITIES_DATA).map(city => <option key={city} value={city} className="bg-gray-800 text-white">{city}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="locality" className="text-xs text-white/70">Localidad</label>
                                                <select id="locality" value={selectedLocality} onChange={(e) => setSelectedLocality(e.target.value)} disabled={!selectedCity} className={`w-full bg-transparent font-semibold focus:outline-none disabled:cursor-not-allowed ${!selectedLocality ? 'text-white/60' : 'text-white'}`}>
                                                    <option value="" disabled>Localidad</option>
                                                    {localities.map(loc => <option key={loc} value={loc} className="bg-gray-800 text-white">{loc}</option>)}
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 hover:scale-[1.02] text-slate-900 font-semibold py-3 px-6 rounded-full transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">Empezar a publicar</button>
                                        </form>
                                    </GlassCard>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold">Todo lo que un propietario necesita</h2>
                            <p className="text-lg text-white/70 mt-2">Servicio completo, limpio, rápido y transparente.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard icon={<DocumentTextIcon className="w-7 h-7" />} title="Publicación en 2 minutos">Sube fotos, define renta y reglas de la casa. Nosotros nos encargamos del resto.</FeatureCard>
                            <FeatureCard icon={<ShieldCheckIcon className="w-7 h-7" />} title="Verificación y scoring">Comprobación de identidad e ingresos, filtros anti-fraude y perfiles compatibles.</FeatureCard>
                            <FeatureCard icon={<SparklesIcon className="w-7 h-7" />} title="Match inteligente">Algoritmo que prioriza convivencia: hábitos, horarios, aficiones y compatibilidad.</FeatureCard>
                            <FeatureCard icon={<SignatureIcon className="w-7 h-7" />} title="Contrato y firma online">Plantillas legales y firma electrónica. Opcional: seguro de impago y depósito digital.</FeatureCard>
                        </div>
                    </div>
                </section>
                
                {/* How it works */}
                <section id="como-funciona" className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold">Cómo funciona</h2>
                            <p className="text-lg text-white/70 mt-2">Un flujo sencillo para alquilar rápido y seguro.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">1</span><h3 className="text-xl font-bold mb-2">Publica tu vivienda</h3><p className="text-white/70">Gratis y sin exclusividad. Cuéntanos condiciones y preferencias.</p></GlassCard>
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">2</span><h3 className="text-xl font-bold mb-2">Recibe candidatos verificados</h3><p className="text-white/70">Te enviamos perfiles con verificación y compatibilidad.</p></GlassCard>
                            <GlassCard className="relative bg-white/5 border-white/15"><span className="absolute top-4 right-4 text-3xl font-bold text-white/20">3</span><h3 className="text-xl font-bold mb-2">Firma y cobra</h3><p className="text-white/70">Contrato digital, opción de seguro y cobro mensual automatizado.</p></GlassCard>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold">Propietarios que ya confían</h2>
                            <p className="text-lg text-white/70 mt-2">Historias reales de cierres rápidos y buena convivencia.</p>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <button onClick={prevTestimonial} className="absolute left-0 -translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hidden md:block" aria-label="Anterior testimonio"><ChevronLeftIcon className="w-6 h-6"/></button>
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
                            <button onClick={nextTestimonial} className="absolute right-0 translate-x-12 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors hidden md:block" aria-label="Siguiente testimonio"><ChevronLeftIcon className="w-6 h-6 rotate-180"/></button>
                        </div>
                         <div className="flex md:hidden justify-center gap-8 mt-8">
                            <button onClick={prevTestimonial} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Anterior testimonio"><ChevronLeftIcon className="w-6 h-6"/></button>
                            <button onClick={nextTestimonial} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Siguiente testimonio"><ChevronLeftIcon className="w-6 h-6 rotate-180"/></button>
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
                onSilverClick={onSilverClick}
            />
        </div>
    );
};

export default OwnerLandingPage;
