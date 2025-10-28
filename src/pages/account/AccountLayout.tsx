import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { ChevronLeftIcon, UserCircleIcon, ShieldLockIcon, BellIcon, HeartIcon } from '../../components/icons';
import Footer from '../../components/Footer';
import GlassCard from '../../components/GlassCard';
import Logo from '../../components/Logo';
import { useI18n } from '../../i18n';

// Account Sub-pages
import Overview from './Overview';
import Profile from './Profile';
import Security from './Security';
import Notifications from './Notifications';
import Privacy from './Privacy';
import Help from './Help';
import Referrals from './Referrals';

// A placeholder for the missing icon
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );

interface AccountLayoutProps {
  user: User;
  onUpdateUser: (updatedUser: User) => Promise<void>;
  onLogout: () => void;
  onBack: () => void;
  onBlogClick: () => void;
  onAboutClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onContactClick: () => void;
  onSilverClick?: () => void;
  initialTab?: string;
  isMandatory?: boolean;
}

type AccountCopy = {
    title: string;
    back: { mobile: string; desktop: string };
    logout: string;
    mandatory: { title: string; message: string };
    nav: {
        overview: string;
        profile: string;
        security: string;
        notifications: string;
        privacy: string;
        help: string;
        referrals?: string;
    };
};

const DEFAULT_ACCOUNT_COPY: AccountCopy = {
    title: 'Mi cuenta',
    back: { mobile: 'Atrás', desktop: 'Volver al Panel' },
    logout: 'Cerrar sesión',
    mandatory: {
        title: '¡Bienvenido a MoOn!',
        message: 'Para empezar a conectar, completa tu perfil. Una biografía detallada te ayuda a encontrar el match perfecto.',
    },
    nav: {
        overview: 'Resumen',
        profile: 'Editar perfil',
        security: 'Seguridad',
        notifications: 'Notificaciones',
        privacy: 'Privacidad',
        help: 'Ayuda',
        referrals: 'Referidos',
    },
};

const AccountLayout: React.FC<AccountLayoutProps> = ({ user, onUpdateUser, onLogout, onBack, onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick, initialTab, isMandatory = false }) => {
    const { scope } = useI18n();
    const [activeTab, setActiveTab] = useState(initialTab || 'overview');

    const copy = scope<AccountCopy>('account') || DEFAULT_ACCOUNT_COPY;

    const navItems = useMemo(() => (
        [
            { id: 'overview', label: copy.nav.overview, icon: <UserCircleIcon className="w-5 h-5" /> },
            { id: 'profile', label: copy.nav.profile, icon: <UserCircleIcon className="w-5 h-5" /> },
            { id: 'security', label: copy.nav.security, icon: <ShieldLockIcon className="w-5 h-5" /> },
            { id: 'notifications', label: copy.nav.notifications, icon: <BellIcon className="w-5 h-5" /> },
            { id: 'privacy', label: copy.nav.privacy, icon: <HeartIcon className="w-5 h-5" /> },
            ...(user.role === UserRole.INQUILINO ? [{ id: 'referrals', label: copy.nav.referrals || 'Referidos', icon: <HeartIcon className="w-5 h-5" /> }] : []),
            { id: 'help', label: copy.nav.help, icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
        ]
    ), [copy.nav, user.role]);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview />;
            case 'profile': return <Profile user={user} onSave={onUpdateUser} />;
            case 'security': return <Security />;
            case 'notifications': return <Notifications />;
            case 'privacy': return <Privacy user={user} onSave={onUpdateUser} />;
            case 'referrals': return <Referrals />;
            case 'help': return <Help />;
            default: return <Overview />;
        }
    };

    const showBackButton = !isMandatory;

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col">
            <header className="sticky top-0 z-50 bg-black/25 backdrop-blur-xl border-b border-white/10 text-white w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:flex-nowrap sm:gap-6 sm:py-4">
                        <div className="flex items-center gap-3 min-w-0">
                            {showBackButton && (
                                <button
                                    onClick={onBack}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                    <span className="sm:hidden">{copy.back.mobile}</span>
                                    <span className="hidden sm:inline">{copy.back.desktop}</span>
                                </button>
                            )}
                            <div className="flex items-center gap-2 min-w-0">
                                <Logo showText={false} size={32} className="shrink-0" />
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-white/60 sm:hidden">
                                        MoOn
                                    </span>
                                    <h1 className="text-base font-semibold text-white/90 truncate sm:text-lg sm:font-bold">
                                        {copy.title}
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="inline-flex items-center justify-center rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40"
                        >
                            {copy.logout}
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    {isMandatory && (
                        <GlassCard className="mb-8 text-center bg-indigo-500/20 border-indigo-400">
                            <h2 className="text-xl font-bold">{copy.mandatory.title}</h2>
                            <p className="text-white/80 mt-2">{copy.mandatory.message}</p>
                        </GlassCard>
                    )}
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="w-full md:w-1/4 lg:w-1/5">
                            <GlassCard className="p-0 bg-white/5 border-white/15 overflow-hidden">
                                <div className="bg-white/5 px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white text-lg font-semibold">
                                            {user.name?.charAt(0) ?? 'M'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-white/60 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {navItems.map(item => {
                                        const disabled = isMandatory && item.id !== 'profile';
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => !disabled && setActiveTab(item.id)}
                                                disabled={disabled}
                                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm transition ${
                                                    isActive
                                                        ? 'bg-indigo-500/40 text-white'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                                                    {item.label}
                                                </span>
                                                <ChevronLeftIcon className="w-4 h-4 -rotate-180 text-white/40" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        </aside>
                        <div className="w-full md:w-3/4 lg:w-4/5">
                           {renderContent()}
                        </div>
                    </div>
                </div>
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

export default AccountLayout;
