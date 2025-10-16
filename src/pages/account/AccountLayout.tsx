import React, { useState } from 'react';
import { User } from '../../types';
import { ChevronLeftIcon, UserCircleIcon, ShieldLockIcon, BellIcon, HeartIcon } from '../../components/icons';
import Footer from '../../components/Footer';
import GlassCard from '../../components/GlassCard';
import Logo from '../../components/Logo';

// Account Sub-pages
import Overview from './Overview';
import Profile from './Profile';
import Security from './Security';
import Notifications from './Notifications';
import Privacy from './Privacy';
import Help from './Help';

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

const AccountLayout: React.FC<AccountLayoutProps> = ({ user, onUpdateUser, onLogout, onBack, onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick, initialTab, isMandatory = false }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'overview');

    const navItems = [
        { id: 'overview', label: 'Resumen', icon: <UserCircleIcon className="w-5 h-5"/> },
        { id: 'profile', label: 'Editar Perfil', icon: <UserCircleIcon className="w-5 h-5"/> },
        { id: 'security', label: 'Seguridad', icon: <ShieldLockIcon className="w-5 h-5"/> },
        { id: 'notifications', label: 'Notificaciones', icon: <BellIcon className="w-5 h-5"/> },
        { id: 'privacy', label: 'Privacidad', icon: <HeartIcon className="w-5 h-5"/> },
        { id: 'help', label: 'Ayuda', icon: <QuestionMarkCircleIcon className="w-5 h-5"/> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview />;
            case 'profile': return <Profile user={user} onSave={onUpdateUser} />;
            case 'security': return <Security />;
            case 'notifications': return <Notifications />;
            case 'privacy': return <Privacy user={user} onSave={onUpdateUser} />;
            case 'help': return <Help />;
            default: return <Overview />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col">
            <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10 text-white w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {!isMandatory ? (
                            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span>Volver al Panel</span>
                            </button>
                        ) : (
                           <Logo />
                        )}
                         <h1 className="text-xl font-bold">Ajustes de Cuenta</h1>
                        <div className="w-40 text-right"> 
                           <button onClick={onLogout} className="text-sm font-medium text-red-400 hover:underline">Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    {isMandatory && (
                        <GlassCard className="mb-8 text-center bg-indigo-500/20 border-indigo-400">
                            <h2 className="text-xl font-bold">¡Bienvenido a MoOn!</h2>
                            <p className="text-white/80 mt-2">Para empezar a conectar, por favor completa tu perfil. Una buena biografía es clave para encontrar el match perfecto.</p>
                        </GlassCard>
                    )}
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="w-full md:w-1/4 lg:w-1/5">
                             {/* Mobile dropdown */}
                            <div className="md:hidden mb-4">
                                <select 
                                    value={activeTab} 
                                    onChange={(e) => setActiveTab(e.target.value)}
                                    disabled={isMandatory}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {navItems.map(item => (
                                        <option key={item.id} value={item.id} className="bg-gray-800">{item.label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Desktop sidebar */}
                            <nav className="hidden md:block space-y-2">
                               {navItems.map(item => (
                                   <button 
                                        key={item.id} 
                                        onClick={() => setActiveTab(item.id)}
                                        disabled={isMandatory && item.id !== 'profile'}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg text-left transition-colors ${
                                            activeTab === item.id 
                                            ? 'bg-indigo-500/50 text-white' 
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        } ${isMandatory && item.id !== 'profile' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                       {item.icon}
                                       <span>{item.label}</span>
                                   </button>
                               ))}
                            </nav>
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
