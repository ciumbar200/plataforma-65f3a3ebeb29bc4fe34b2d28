import React from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { MailIcon, PhoneIcon, BuildingIcon } from '../components/icons';

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
}

const ContactInfoItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-indigo-500/30 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <div className="text-white/80">{children}</div>
        </div>
    </div>
);


const ContactPage: React.FC<PageProps> = (props) => {
    
    const footerProps = { 
        onBlogClick: props.onBlogClick, 
        onAboutClick: props.onAboutClick, 
        onPrivacyClick: props.onPrivacyClick, 
        onTermsClick: props.onTermsClick,
        onContactClick: props.onContactClick,
        onSilverClick: props.onSilverClick,
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('¡Mensaje enviado! Gracias por contactarnos (esto es una simulación).');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
            <Header onLoginClick={props.onLoginClick} onHomeClick={props.onHomeClick} onOwnersClick={props.onOwnersClick} pageContext="inquilino" />
            
            <main className="flex-grow">
                <section className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-extrabold text-white">Ponte en Contacto</h1>
                            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">¿Tienes dudas, sugerencias o simplemente quieres saludar? Estamos aquí para ayudarte.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Contact Info */}
                            <GlassCard className="bg-white/5 border-white/15">
                                <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
                                <div className="space-y-6">
                                    <ContactInfoItem icon={<MailIcon className="w-6 h-6 text-indigo-300" />} title="Email">
                                        <a href="mailto:hello@moonsharedliving.com" className="hover:underline">hello@moonsharedliving.com</a>
                                        <p className="text-sm text-white/60">Para consultas generales y soporte.</p>
                                    </ContactInfoItem>
                                     <ContactInfoItem icon={<PhoneIcon className="w-6 h-6 text-indigo-300" />} title="WhatsApp">
                                        <p>+34 617 135 406</p>
                                        <p className="text-sm text-white/60">Soporte rápido de L-V de 9h a 18h.</p>
                                    </ContactInfoItem>
                                     <ContactInfoItem icon={<BuildingIcon className="w-6 h-6 text-indigo-300" />} title="Oficina Central">
                                        <p>Passeig de Gràcia 50<br/>08007 Barcelona, España</p>
                                        <p className="text-sm text-white/60">Visitas solo con cita previa.</p>
                                    </ContactInfoItem>
                                </div>
                            </GlassCard>

                            {/* Contact Form */}
                            <GlassCard className="bg-white/5 border-white/15">
                                 <h3 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h3>
                                 <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nombre</label>
                                        <input type="text" name="name" id="name" required className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                     <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email</label>
                                        <input type="email" name="email" id="email" required className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-1">Mensaje</label>
                                        <textarea name="message" id="message" rows={5} required className="w-full bg-white/10 border border-white/20 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
                                            Enviar Mensaje
                                        </button>
                                    </div>
                                 </form>
                            </GlassCard>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer {...footerProps} />
        </div>
    );
};

export default ContactPage;
