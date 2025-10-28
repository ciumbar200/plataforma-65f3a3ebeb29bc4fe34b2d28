import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon } from './icons';
import Logo from './Logo';
import { useI18n } from '../i18n';
import HighContrastToggle from './HighContrastToggle';

interface HeaderProps {
    onLoginClick: () => void;
    onRegisterClick?: () => void;
    onAccountClick?: () => void;
    onAccountSettings?: () => void;
    onLogout?: () => void;
    onHomeClick: () => void;
    onOwnersClick?: () => void;
    onBlogClick?: () => void;
    onSilverClick?: () => void;
    onCalculadoraClick?: () => void;
    onAmbassadorsClick?: () => void;
    onReferFriendsClick?: () => void;
    onBlueprintClick?: () => void;
    pageContext: 'inquilino' | 'propietario';
    reserveSpace?: boolean; // add vertical spacer below header to avoid overlap
    isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    onLoginClick,
    onRegisterClick,
    onAccountClick,
    onAccountSettings,
    onLogout,
    onHomeClick,
    onOwnersClick,
    onBlogClick,
    onSilverClick,
    onCalculadoraClick,
    onAmbassadorsClick,
    onReferFriendsClick,
    onBlueprintClick,
    pageContext,
    reserveSpace = true,
    isAuthenticated = false,
}) => {
    const { t } = useI18n();
    const isTenantContext = pageContext === 'inquilino';
    const switchText = isTenantContext ? t('header.switch.toOwners') : t('header.switch.toTenants');
    const switchAction = isTenantContext ? onOwnersClick : onHomeClick;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const desktopMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const closeMenus = useCallback(() => {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            if (desktopMenuRef.current?.contains(targetNode)) {
                return;
            }
            if (mobileMenuRef.current?.contains(targetNode)) {
                return;
            }
            closeMenus();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeMenus]);

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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                closeMenus();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [closeMenus]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeMenus]);
    
    const execute = (fn?: () => void) => {
        if (fn) {
            fn();
            closeMenus();
        }
    };

    const guestMenuItems = [
        {
            label: t('header.menu.login'),
            action: onLoginClick,
        },
        ...(!onRegisterClick ? [] : [{
            label: t('header.menu.register'),
            action: onRegisterClick,
        }]),
    ];

    const authMenuItems = [
        ...(onAccountClick ? [{ label: t('header.menu.goToDashboard'), action: onAccountClick }] : []),
        ...(onAccountSettings ? [{ label: t('header.menu.accountSettings'), action: onAccountSettings }] : []),
        ...(onLogout ? [{ label: t('header.menu.logout'), action: onLogout }] : []),
    ];

    const desktopMenuItems = isAuthenticated ? authMenuItems : guestMenuItems;
    
    const headerClasses = `
        z-50 text-white w-full transition-all duration-300 ${isScrolled ? 'sticky top-0' : 'absolute top-3'}
    `;

    type HeaderLink = { label: string; onClick: () => void; eyebrow?: string };

    const storePendingSection = (section: string) => {
        if (typeof window === 'undefined') return;
        try {
            window.sessionStorage.setItem('moon_pending_section', section);
        } catch {
            // ignore storage errors
        }
    };

    const scrollToSection = (section: string) => {
        if (typeof window === 'undefined') return;
        const attemptScroll = () => {
            const element = document.getElementById(section);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                try {
                    window.sessionStorage.removeItem('moon_pending_section');
                } catch {
                    // ignore
                }
                return;
            }
            window.requestAnimationFrame(attemptScroll);
        };
        window.requestAnimationFrame(attemptScroll);
    };

    const handleSectionNavigation = useCallback((section: string) => {
        closeMenus();
        if (typeof window === 'undefined') return;
        storePendingSection(section);
        if (window.location.pathname !== '/') {
            onHomeClick();
            return;
        }
        scrollToSection(section);
    }, [closeMenus, onHomeClick]);

    const desktopLinks: HeaderLink[] = [
        ...(onCalculadoraClick
            ? [
                {
                    label: t('header.nav.calculator'),
                    onClick: () => {
                        onCalculadoraClick();
                        closeMenus();
                    },
                    eyebrow: t('header.nav.calculatorEyebrow'),
                } satisfies HeaderLink,
            ]
            : []),
        ...(onSilverClick
            ? [
                {
                    label: t('header.nav.silver'),
                    onClick: () => {
                        onSilverClick();
                        closeMenus();
                    },
                    eyebrow: t('header.nav.silverEyebrow'),
                } satisfies HeaderLink,
            ]
            : []),
        ...(onBlogClick
            ? [
                {
                    label: t('header.nav.blog'),
                    onClick: () => {
                        onBlogClick();
                        closeMenus();
                    },
                    eyebrow: t('header.nav.blogEyebrow'),
                } satisfies HeaderLink,
            ]
            : []),
        // Ambassadors and Referrals hidden from public navigation
        { label: t('header.nav.howItWorks'), onClick: () => handleSectionNavigation('como-funciona'), eyebrow: t('header.nav.howItWorksEyebrow') },
        { label: t('header.nav.faq'), onClick: () => handleSectionNavigation('faq'), eyebrow: t('header.nav.faqEyebrow') },
    ];

    const mobileLinks: HeaderLink[] = [
        ...(onCalculadoraClick
            ? [
                {
                    label: t('header.nav.calculator'),
                    onClick: () => {
                        onCalculadoraClick();
                        closeMenus();
                    },
                    eyebrow: t('header.nav.calculatorEyebrow'),
                } satisfies HeaderLink,
            ]
            : []),
        ...(onSilverClick ? [{ label: t('header.nav.silver'), onClick: () => { onSilverClick(); closeMenus(); }, eyebrow: t('header.nav.silverEyebrow') }] : []),
        ...(onBlogClick ? [{ label: t('header.nav.blog'), onClick: () => { onBlogClick(); closeMenus(); }, eyebrow: t('header.nav.blogEyebrow') }] : []),
        // Ambassadors and Referrals hidden from public navigation
        { label: t('header.nav.howItWorks'), onClick: () => handleSectionNavigation('como-funciona'), eyebrow: t('header.nav.howItWorksEyebrow') },
        { label: t('header.nav.faq'), onClick: () => handleSectionNavigation('faq'), eyebrow: t('header.nav.faqEyebrow') },
    ];

    const headerEl = (
        <header className={headerClasses.trim()}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`
                    h-[60px] sm:h-14 flex items-center justify-between gap-4
                    rounded-[24px] border transition-all duration-300 px-4 sm:px-6
                    ${isScrolled
                        ? 'bg-slate-900/70 backdrop-blur-xl border-white/15 shadow-lg'
                        : 'bg-transparent border-transparent shadow-none'}
                `}>
                    <div className="flex-1 flex justify-start">
                        <button className="cursor-pointer" onClick={() => { onHomeClick(); closeMenus(); }}>
                            <Logo />
                        </button>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        {desktopLinks.map((link) => (
                            <button
                                key={link.label}
                                type="button"
                                onClick={link.onClick}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex-1 flex justify-end">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {switchAction && (
                                <button
                                    onClick={() => { switchAction(); closeMenus(); }}
                                    className="hidden md:flex text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/10"
                                >
                                   {switchText}
                                </button>
                            )}
                            <div className="relative hidden md:block" ref={desktopMenuRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 sm:px-5 py-2 text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2 shadow-inner"
                                >
                                    {t('header.menu.account')}
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && desktopMenuItems.length > 0 && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/85 backdrop-blur-2xl border border-white/20 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in-down">
                                        <div className="p-2 space-y-1">
                                            {desktopMenuItems.map(item => (
                                                <button
                                                    key={item.label}
                                                    onClick={() => execute(item.action)}
                                                    className="w-full text-left px-4 py-2 text-sm rounded-md text-white/85 hover:bg-white/10 transition-colors"
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative md:hidden" ref={mobileMenuRef}>
                                <button
                                    type="button"
                                    aria-label={t('header.accessibility.openMainMenu')}
                                    aria-expanded={isMobileMenuOpen}
                                    aria-controls="mobile-header-menu"
                                    onClick={() => setIsMobileMenuOpen(prev => !prev)}
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg transition-all duration-300 ${
                                        isMobileMenuOpen ? 'shadow-indigo-500/40 border-white/30' : 'hover:bg-white/15'
                                    }`}
                                >
                                    <span className="sr-only">{t('header.accessibility.openMenu')}</span>
                                    <span className="relative flex h-5 w-6 flex-col items-center justify-between">
                                        <span
                                            className={`block h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 transition-transform duration-300 ${
                                                isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''
                                            }`}
                                        />
                                        <span
                                            className={`block h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 transition-all duration-300 ${
                                                isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''
                                            }`}
                                        />
                                        <span
                                            className={`block h-0.5 w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 transition-transform duration-300 ${
                                                isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''
                                            }`}
                                        />
                                    </span>
                                </button>

                                {isMobileMenuOpen && (
                                    <div className="absolute top-[calc(100%+16px)] right-0 left-auto">
                                        <div
                                            id="mobile-header-menu"
                                            className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-white/15 bg-slate-950/90 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-70" />
                                                <div className="absolute -top-16 right-16 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
                                                <div className="absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-sky-500/20 blur-2xl" />
                                            </div>
                                            <div className="relative z-10 space-y-4 p-5">
                                                {desktopMenuItems.map(item => (
                                                    <button
                                                        key={item.label}
                                                        onClick={() => execute(item.action)}
                                                        className="w-full rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-5 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition-transform duration-200 hover:scale-[1.02] hover:shadow-indigo-500/40"
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                                                    <nav className="space-y-3 text-sm font-medium text-white/80">
                                                        {mobileLinks.map((link) => (
                                                            'href' in link ? (
                                                                <a
                                                                    key={link.label}
                                                                    href={link.href}
                                                                    onClick={() => closeMenus()}
                                                                    className="block rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                                                                >
                                                                    <span className="block font-semibold">{link.label}</span>
                                                                    {link.eyebrow && (
                                                                        <span className="text-xs text-white/45">{link.eyebrow}</span>
                                                                    )}
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    key={link.label}
                                                                    type="button"
                                                                    onClick={link.onClick}
                                                                    className="block w-full rounded-xl bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                                                                >
                                                                    <span className="block font-semibold">{link.label}</span>
                                                                    {link.eyebrow && (
                                                                        <span className="text-xs text-white/45">{link.eyebrow}</span>
                                                                    )}
                                                                </button>
                                                            )
                                                        ))}
                                                        {switchAction && (
                                                            <button
                                                                onClick={() => {
                                                                    switchAction();
                                                                    closeMenus();
                                                                }}
                                                                className="block w-full rounded-xl bg-transparent px-4 py-3 text-left text-white transition-colors hover:bg-white/10"
                                                            >
                                                                <span className="block font-semibold">{switchText}</span>
                                                                <span className="text-xs text-white/45">{t('header.switch.helper')}</span>
                                                            </button>
                                                        )}
                                                    </nav>
                                                </div>
                                            </div>
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
