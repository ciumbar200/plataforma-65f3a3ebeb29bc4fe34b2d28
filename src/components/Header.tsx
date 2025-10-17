import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from './icons';
import Logo from './Logo';

interface HeaderProps {
    onLoginClick: () => void;
    onRegisterClick?: () => void;
    onHomeClick: () => void;
    onOwnersClick?: () => void;
    pageContext: 'inquilino' | 'propietario';
    reserveSpace?: boolean; // add vertical spacer below header to avoid overlap
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick, onHomeClick, onOwnersClick, pageContext, reserveSpace = true }) => {
    const isTenantContext = pageContext === 'inquilino';
    const switchText = isTenantContext ? 'Propietarios' : 'Inquilinos';
    const switchAction = isTenantContext ? onOwnersClick : onHomeClick;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    const handleRegister = () => {
        onRegisterClick?.();
        setIsDropdownOpen(false);
    }

    const handleLogin = () => {
        onLoginClick();
        setIsDropdownOpen(false);
    }
    
    const headerClasses = `
        z-50 text-white w-full transition-all duration-300 ${isScrolled ? 'sticky top-0' : 'absolute top-4'}
    `;

    const headerEl = (
        <header className={headerClasses.trim()}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`
                    h-[60px] sm:h-14 flex items-center justify-between gap-4
                    rounded-[22px] border border-white/15 shadow-lg
                    ${isScrolled ? 'bg-slate-900/70 backdrop-blur-xl mt-0' : 'bg-white/10 backdrop-blur-2xl mt-3 sm:mt-2'}
                    px-4 sm:px-5
                `}>
                    <div className="flex-1 flex justify-start">
                        <button className="cursor-pointer" onClick={onHomeClick}>
                            <Logo />
                        </button>
                    </div>

                    <nav className="hidden md:flex gap-8">
                        <a href="#como-funciona" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Cómo funciona</a>
                        <a href="#faq" className="text-sm font-medium text-white/80 hover:text-white transition-colors">FAQ</a>
                    </nav>

                    <div className="flex-1 flex justify-end">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {switchAction && (
                                <button
                                    onClick={switchAction}
                                    className="hidden md:flex text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/10"
                                >
                                   {switchText}
                                </button>
                            )}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 sm:px-5 py-2 text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2 shadow-inner"
                                >
                                    Mi Cuenta
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900/80 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-down">
                                        <div className="p-2">
                                            <button
                                                onClick={handleLogin}
                                                className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                                            >
                                                Iniciar Sesión
                                            </button>
                                            {onRegisterClick && (
                                                <button
                                                    onClick={handleRegister}
                                                    className="w-full text-left px-4 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                                                >
                                                    Registrarse
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );

    // Optionally render a spacer to prevent content underlap when the header is sticky/fixed.
    // On pages with custom hero spacing, use reserveSpace={false}.
    return (
        <>
            {headerEl}
            {reserveSpace && <div aria-hidden className="h-[72px] sm:h-[72px]" />}
        </>
    );
};

export default Header;
