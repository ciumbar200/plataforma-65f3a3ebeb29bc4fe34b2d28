import React from 'react';
import { MoonIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from './icons';

interface FooterProps {
    onBlogClick?: () => void;
    onAboutClick?: () => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onContactClick?: () => void;
    onOwnersClick?: () => void;
    onSilverClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onOwnersClick, onSilverClick }) => {
    return (
        <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 text-white w-full">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center flex-col sm:flex-row gap-y-6">
                    <div className="flex items-center gap-2">
                        <MoonIcon className="w-7 h-7" />
                        <span className="text-xl font-bold">MoOn</span>
                    </div>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-center">
                        {onOwnersClick && <a href="#" onClick={(e) => { e.preventDefault(); onOwnersClick(); }} className="md:hidden text-sm text-white/70 hover:text-white transition-colors">Propietarios</a>}
                        <a
                            href="/silver"
                            onClick={(e) => {
                                if (!onSilverClick) return;
                                e.preventDefault();
                                onSilverClick();
                            }}
                            className="text-sm text-white/70 hover:text-white transition-colors"
                        >
                            Silver
                        </a>
                        {onAboutClick && <a href="#" onClick={(e) => { e.preventDefault(); onAboutClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">Sobre Nosotros</a>}
                        {onBlogClick && <a href="#" onClick={(e) => { e.preventDefault(); onBlogClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">Blog</a>}
                        {onContactClick && <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">Contacto</a>}
                        {onPrivacyClick && <a href="#" onClick={(e) => { e.preventDefault(); onPrivacyClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">Política de Privacidad</a>}
                        {onTermsClick && <a href="#" onClick={(e) => { e.preventDefault(); onTermsClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">Términos de Servicio</a>}
                    </nav>
                    <div className="flex gap-5">
                        <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors"><TwitterIcon className="w-5 h-5" /></a>
                        <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors"><InstagramIcon className="w-5 h-5" /></a>
                        <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
                    &copy; {new Date().getFullYear()} MoOn. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
