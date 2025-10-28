import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './components/StatCard';
import { BuildingIcon, ChartBarIcon, EyeIcon, UsersIcon, UserCircleIcon, PlusIcon, ChevronLeftIcon, MoonIcon } from '../components/icons';
import PropertyCard from './components/PropertyCard';
import AddPropertyModal from './components/AddPropertyModal';
import { Property, User, PropertyType, OwnerStats, UserRole, RentalGoal, Notification } from '../types';
import GlassCard from '../components/GlassCard';
import CandidateGroupCard from './components/CandidateGroupCard';
import ProfileDropdown from './components/ProfileDropdown';
import VerifyProperty from '../components/VerifyProperty';
import { useI18n } from '../i18n';
import NotificationBell from '../components/NotificationBell';

const MOCK_MONTHLY_EARNINGS_DATA = [
    { name: 'Ene', earnings: 0 }, { name: 'Feb', earnings: 0 }, { name: 'Mar', earnings: 0 },
    { name: 'Abr', earnings: 0 }, { name: 'May', earnings: 0 }, { name: 'Jun', earnings: 0 },
    { name: 'Jul', earnings: 0 }, { name: 'Ago', earnings: 0 }, { name: 'Sep', earnings: 0 },
    { name: 'Oct', earnings: 0 }, { name: 'Nov', earnings: 0 }, { name: 'Dic', earnings: 0 },
];

type InitialPropertyData = { property_type: PropertyType; city: string; locality: string };

interface OwnerDashboardProps {
    user: User;
    properties: Property[];
    onSaveProperty: (propertyData: Omit<Property, 'id' | 'views' | 'compatible_candidates' | 'owner_id' | 'image_urls'> & { id?: number; imageFiles: File[]; image_urls: string[] }) => void;
    initialPropertyData: InitialPropertyData | null;
    onClearInitialPropertyData: () => void;
    allUsers: User[];
    matches: { [key: string]: string[] };
    onLogout: () => void;
    onGoToAccountSettings: () => void;
    onUpdateUser: (updatedUser: User) => Promise<void>;
    forceAddProperty?: boolean;
    notifications: Notification[];
    onNotificationRead?: (id: number) => void;
    onNotificationsOpened?: () => void;
    onResumeOnboarding?: () => void;
}

const NAV_ORDER = ['dashboard', 'properties', 'candidates'] as const;
type View = typeof NAV_ORDER[number] | 'propertyDetail';

type NavItem = { id: View; icon: React.ReactElement; label: string };

const NAV_ICONS: Record<typeof NAV_ORDER[number], React.ReactElement> = {
    dashboard: <ChartBarIcon className="w-7 h-7" />,
    properties: <BuildingIcon className="w-7 h-7" />,
    candidates: <UsersIcon className="w-7 h-7" />,
};

const DEFAULT_NAV_LABELS: Record<typeof NAV_ORDER[number], string> = {
    dashboard: 'Panel',
    properties: 'Propiedades',
    candidates: 'Candidatos',
};

const DEFAULT_PROFILE_LABEL = 'Mi Perfil';
const DEFAULT_ADD_ARIA = 'Añadir nueva propiedad';

const BottomNavBar = ({ navItems, activeView, setView, onAddNew, onGoToAccountSettings, addAriaLabel, profileLabel }: { navItems: NavItem[]; activeView: View; setView: (view: View) => void; onAddNew: () => void; onGoToAccountSettings: () => void; addAriaLabel: string; profileLabel: string; }) => (
    <div className="fixed inset-x-0 bottom-0 z-40 grid h-20 grid-cols-5 items-center border-t border-white/15 bg-black/80 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:px-10">
        {navItems.map(item => (
            <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors ${activeView === item.id ? 'text-purple-300' : 'text-white/70 hover:text-white'}`}
            >
                {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                <span>{item.label}</span>
            </button>
        ))}
        <button
            onClick={onAddNew}
            className="flex flex-col items-center justify-center gap-1 transition-colors text-white"
            aria-label={addAriaLabel}
        >
            <div className="bg-indigo-600 h-12 w-12 rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-400">
                <PlusIcon className="w-7 h-7" />
            </div>
        </button>
        <button
            onClick={onGoToAccountSettings}
            className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors text-white/70 hover:text-white"
        >
            <UserCircleIcon className="w-6 h-6" />
            <span>{profileLabel}</span>
        </button>
    </div>
);

const BackButton = ({ onClick, text }: { onClick: () => void; text: string; }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 mb-4">
      <ChevronLeftIcon className="w-5 h-5" />
      <span>{text}</span>
    </button>
);

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, properties, onSaveProperty, initialPropertyData, onClearInitialPropertyData, allUsers, matches, onLogout, onGoToAccountSettings, onUpdateUser, forceAddProperty = false, notifications, onNotificationRead, onNotificationsOpened, onResumeOnboarding }) => {
    const { scope } = useI18n();
    const copy = scope('ownerDashboard') || {};
    const navItems: NavItem[] = NAV_ORDER.map((id) => ({
        id,
        icon: NAV_ICONS[id],
        label: copy.nav?.[id] || DEFAULT_NAV_LABELS[id],
    }));
    const bottomProfileLabel = copy.nav?.profile || DEFAULT_PROFILE_LABEL;
    const addPropertyAria = copy.header?.addAria || DEFAULT_ADD_ARIA;
    const addPropertyLabel = copy.header?.addButton || 'Añadir Propiedad';
    const headerTitle = copy.header?.title || 'Panel de Propietario';
    const [view, setView] = useState<View>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [invitedGroups, setInvitedGroups] = useState<string[]>([]);

    const ownerNextSteps = useMemo(() => {
        const tasks: Array<{ id: string; title: string; description: string; actionLabel: string; onAction: () => void }> = [];
        if (user.onboarding_status !== 'completed' && onResumeOnboarding) {
            tasks.push({
                id: 'owner-onboarding',
                title: 'Finaliza tu onboarding',
                description: 'Completarlo prioriza candidatos alineados a tus requisitos.',
                actionLabel: 'Retomar',
                onAction: onResumeOnboarding,
            });
        }
        if (properties.length === 0) {
            tasks.push({
                id: 'publish-first-property',
                title: 'Publica tu primera propiedad',
                description: 'Necesitamos al menos una propiedad para activar tu matching.',
                actionLabel: 'Crear propiedad',
                onAction: () => {
                    setPropertyToEdit(null);
                    setIsModalOpen(true);
                },
            });
        } else {
            const pending = properties.filter((property) => property.status !== 'approved');
            if (pending.length > 0) {
                tasks.push({
                    id: 'review-pending',
                    title: 'Propiedades en revisión',
                    description: `Hay ${pending.length} publicación${pending.length === 1 ? '' : 'es'} esperando validación.`,
                    actionLabel: 'Ver pendientes',
                    onAction: () => setView('properties'),
                });
            }
        }
        const unread = notifications.filter((notification) => !notification.read_at).length;
        if (unread > 0) {
            tasks.push({
                id: 'owner-notifications',
                title: 'Revisa novedades',
                description: `${unread} notificación${unread === 1 ? '' : 'es'} sin leer.`,
                actionLabel: 'Abrir centro',
                onAction: () => onNotificationsOpened?.(),
            });
        }
        return tasks;
    }, [user.onboarding_status, onResumeOnboarding, properties, notifications, onNotificationsOpened, setView]);

    const statsCopy = {
        heading: copy.stats?.heading || 'Panel General',
        cards: {
            revenue: copy.stats?.cards?.revenue || 'Ingresos Mensuales Potenciales',
            properties: copy.stats?.cards?.properties || 'Propiedades Listadas',
            views: copy.stats?.cards?.views || 'Visitas Totales',
            candidates: copy.stats?.cards?.candidates || 'Candidatos Totales',
        },
        chartTitle: copy.stats?.chart?.title || 'Rendimiento Mensual (Simulado)',
        chartLegend: copy.stats?.chart?.legend || 'Ingresos',
        chartMonths: copy.stats?.chart?.months || MOCK_MONTHLY_EARNINGS_DATA.map(item => item.name),
    };

    const monthlyData = MOCK_MONTHLY_EARNINGS_DATA.map((item, index) => ({
        ...item,
        name: statsCopy.chartMonths[index] ?? item.name,
    }));

    const propertiesCopy = {
        title: copy.properties?.title || 'Mis Propiedades',
        empty: copy.properties?.empty || 'Aún no has añadido ninguna propiedad.',
    };

    const candidatesCopy = {
        title: copy.candidates?.title || 'Grupos de Candidatos Compatibles',
        description: copy.candidates?.description || 'Aquí se muestran grupos de inquilinos que han hecho match entre sí y buscan una propiedad. Revisa tus propiedades privadas para invitarlos.',
        empty: copy.candidates?.empty || 'No hay grupos de candidatos compatibles en este momento.',
        inviteAlert: copy.alerts?.inviteFromProperties || 'Para invitar a este grupo, ve a una de tus propiedades privadas y haz clic en "Liberar propiedad".',
        publicInfo: copy.candidates?.publicInfo || 'Esta propiedad es pública. Los candidatos pueden mostrar interés directamente.',
    };

    const propertyDetailCopy = {
        back: copy.propertyDetail?.back || 'Volver a mis Propiedades',
        conditionsTitle: copy.propertyDetail?.conditionsTitle || 'Condiciones',
        noConditions: copy.propertyDetail?.noConditions || 'No se especificaron condiciones.',
        groupsTitle: copy.propertyDetail?.groupsTitle || 'Grupos de Candidatos',
        publicInfo: copy.propertyDetail?.publicInfo || 'Esta propiedad es pública. Los candidatos pueden mostrar interés directamente.',
        noGroups: copy.propertyDetail?.noGroups || 'No se han encontrado grupos de inquilinos compatibles por ahora.',
    };

    const forcedCopy = {
        title: copy.forceAdd?.title || '¡Bienvenido a MoOn, Propietario!',
        description: copy.forceAdd?.description || 'Para empezar a encontrar inquilinos, por favor, añade tu primera propiedad.',
    };

    const groupInvitedTemplate = copy.alerts?.groupInvited || 'El grupo {names} ha sido notificado sobre la propiedad "{property}".';

    useEffect(() => {
        if (initialPropertyData || forceAddProperty) {
            setPropertyToEdit(null);
            setIsModalOpen(true);
        }
    }, [initialPropertyData, forceAddProperty]);

    const handleAddNew = () => {
        setPropertyToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (property: Property) => {
        setPropertyToEdit(property);
        setIsModalOpen(true);
    };
    
    const handlePropertyClick = (property: Property) => {
        setSelectedProperty(property);
        setInvitedGroups([]); // Reset invitations when viewing a new property
        setView('propertyDetail');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPropertyToEdit(null);
        if (initialPropertyData) {
            onClearInitialPropertyData();
        }
    };

    const handleSaveAndClose = (propertyData: Omit<Property, 'id' | 'views' | 'compatible_candidates' | 'owner_id' | 'image_urls'> & { id?: number; imageFiles: File[]; image_urls: string[] }) => {
        onSaveProperty(propertyData);
        handleCloseModal();
    };

    const tenantGroups = useMemo(() => {
        const tenants = allUsers.filter(u => u.role === UserRole.INQUILINO && (u.rental_goal === RentalGoal.FIND_ROOMMATES_AND_APARTMENT || u.rental_goal === RentalGoal.BOTH));
        
        const isMutualMatch = (id1: string, id2: string) => {
            const matches1 = matches[id1] || [];
            const matches2 = matches[id2] || [];
            return matches1.includes(id2) && matches2.includes(id1);
        };

        const groups: User[][] = [];
        const processedUsers = new Set<string>();

        // Find groups of 3
        for (let i = 0; i < tenants.length; i++) {
            const userA = tenants[i];
            if (processedUsers.has(userA.id)) continue;

            for (let j = i + 1; j < tenants.length; j++) {
                const userB = tenants[j];
                if (processedUsers.has(userB.id)) continue;
                
                if (isMutualMatch(userA.id, userB.id)) {
                    for (let k = j + 1; k < tenants.length; k++) {
                        const userC = tenants[k];
                        if (processedUsers.has(userC.id)) continue;

                        if (isMutualMatch(userA.id, userC.id) && isMutualMatch(userB.id, userC.id)) {
                            groups.push([userA, userB, userC]);
                            processedUsers.add(userA.id);
                            processedUsers.add(userB.id);
                            processedUsers.add(userC.id);
                            break; 
                        }
                    }
                }
                if (processedUsers.has(userA.id)) break;
            }
        }
        
        // Find groups of 2 from remaining users
        for (let i = 0; i < tenants.length; i++) {
            const userA = tenants[i];
            if (processedUsers.has(userA.id)) continue;
            
            for (let j = i + 1; j < tenants.length; j++) {
                const userB = tenants[j];
                if (processedUsers.has(userB.id)) continue;

                if (isMutualMatch(userA.id, userB.id)) {
                    groups.push([userA, userB]);
                    processedUsers.add(userA.id);
                    processedUsers.add(userB.id);
                    break;
                }
            }
        }
        return groups;
    }, [allUsers, matches]);

    const handleInviteGroup = (group: User[], property: Property) => {
        const groupId = group.map(u => u.id).sort().join('-');
        const invitationKey = `${property.id}-${groupId}`;
        setInvitedGroups(prev => [...prev, invitationKey]);
        const names = group.map(u => u.name).join(', ');
        const message = groupInvitedTemplate.replace('{names}', names).replace('{property}', property.title);
        alert(message);
    };
    
    const realStats = useMemo(() => ({
      totalRevenue: properties.reduce((sum, prop) => sum + prop.price, 0),
      totalProperties: properties.length,
      totalViews: properties.reduce((sum, prop) => sum + prop.views, 0),
      totalCandidates: properties.reduce((sum, prop) => sum + prop.compatible_candidates, 0),
    }), [properties]);


    const renderDashboardView = () => (
        <>
            {ownerNextSteps.length > 0 && (
                <GlassCard className="mb-6 border-white/10 bg-white/5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Próximos pasos</p>
                            <h3 className="text-lg font-semibold text-white">Mantén tu publicación preparada</h3>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {ownerNextSteps.map((task) => (
                            <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                                        <p className="text-xs text-white/60">{task.description}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={task.onAction}
                                        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
                                    >
                                        {task.actionLabel}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
            <h2 className="text-3xl font-bold mb-6">{statsCopy.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={<ChartBarIcon className="w-7 h-7 text-white" />}
                    title={statsCopy.cards.revenue}
                    value={`€${realStats.totalRevenue.toLocaleString()}`}
                    color="green"
                />
                <StatCard 
                    icon={<BuildingIcon className="w-7 h-7 text-white" />}
                    title={statsCopy.cards.properties}
                    value={realStats.totalProperties.toString()}
                    color="indigo"
                />
                <StatCard 
                    icon={<EyeIcon className="w-7 h-7 text-white" />}
                    title={statsCopy.cards.views}
                    value={realStats.totalViews.toLocaleString()}
                    color="blue"
                />
                <StatCard 
                    icon={<UsersIcon className="w-7 h-7 text-white" />}
                    title={statsCopy.cards.candidates}
                    value={realStats.totalCandidates.toLocaleString()}
                    color="purple"
                />
            </div>
             <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">{statsCopy.chartTitle}</h3>
                <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.7)" />
                            <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '0.75rem'
                                }}
                                cursor={{fill: 'rgba(124, 58, 237, 0.2)'}}
                            />
                            <Legend wrapperStyle={{color: '#fff'}}/>
                            <Bar dataKey="earnings" name={statsCopy.chartLegend} fill="rgba(139, 92, 246, 0.8)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );

    const renderPropertiesView = () => (
         <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{propertiesCopy.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length > 0 ? (
                    properties.map(prop => (
                        <PropertyCard key={prop.id} property={prop} onEdit={handleEdit} onCardClick={handlePropertyClick} />
                    ))
                ) : (
                    <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">{propertiesCopy.empty}</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderCandidatesView = () => (
        <>
            <h2 className="text-3xl font-bold mb-6">{candidatesCopy.title}</h2>
            <p className="text-white/70 mb-6 max-w-3xl">{candidatesCopy.description}</p>
            <div className="space-y-4">
                {tenantGroups.length > 0 ? (
                    tenantGroups.map((group) => {
                        const groupId = group.map(u => u.id).sort().join('-');
                        return (
                            <CandidateGroupCard
                                key={groupId}
                                group={group}
                                onInvite={() => alert(candidatesCopy.inviteAlert)}
                                isInvited={false} // This is generic, no property context
                            />
                        );
                    })
                ) : (
                    <GlassCard className="min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">{candidatesCopy.empty}</p>
                    </GlassCard>
                )}
            </div>
        </>
    );
    
    const renderPropertyDetailView = () => {
        if (!selectedProperty) return null;

        return (
            <div>
                <BackButton onClick={() => setView('properties')} text={propertyDetailCopy.back} />
                <GlassCard>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{selectedProperty.title}</h2>
                            <p className="text-white/70 mb-4">{selectedProperty.address}</p>
                            <img src={selectedProperty.image_urls[0]} alt={selectedProperty.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-bold mb-2">{propertyDetailCopy.conditionsTitle}</h3>
                            <p className="text-base text-white/80 whitespace-pre-wrap">{selectedProperty.conditions || propertyDetailCopy.noConditions}</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">{propertyDetailCopy.groupsTitle}</h3>
                                {selectedProperty.visibility === 'Pública' ? (
                                    <div className="text-center p-6 bg-black/20 rounded-lg">
                                        <p className="text-white/80">{propertyDetailCopy.publicInfo}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {tenantGroups.length > 0 ? (
                                            tenantGroups.map((group) => {
                                                const groupId = group.map(u => u.id).sort().join('-');
                                                const invitationKey = `${selectedProperty.id}-${groupId}`;
                                                return (
                                                    <CandidateGroupCard
                                                        key={groupId}
                                                        group={group}
                                                        onInvite={() => handleInviteGroup(group, selectedProperty)}
                                                        isInvited={invitedGroups.includes(invitationKey)}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="text-center p-6 bg-black/20 rounded-lg">
                                                <p className="text-white/80">{propertyDetailCopy.noGroups}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <VerifyProperty user={user} property={selectedProperty} />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        )
    };

    const renderContent = () => {
        switch(view) {
            case 'dashboard': return renderDashboardView();
            case 'properties': return renderPropertiesView();
            case 'candidates': return renderCandidatesView();
            case 'propertyDetail': return renderPropertyDetailView();
            default: return renderDashboardView();
        }
    };
    
    if (forceAddProperty) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
                 <AddPropertyModal 
                    isOpen={isModalOpen}
                    onClose={() => {}} // No-op close
                    isMandatory={true}
                    onSave={handleSaveAndClose}
                    propertyToEdit={propertyToEdit}
                    initialData={propertyToEdit ? null : initialPropertyData}
                />
                 <MoonIcon className="w-16 h-16 text-indigo-400 mb-4" />
                 <h2 className="text-2xl font-bold">{forcedCopy.title}</h2>
                 <p className="text-white/80 mt-2">{forcedCopy.description}</p>
            </div>
        )
    }

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-900">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-lg md:px-6">
                <div className="flex items-center gap-2">
                    <MoonIcon className="w-7 h-7" />
                    <span className="text-xl font-bold">{headerTitle}</span>
                </div>
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${view === item.id ? 'bg-purple-500/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                     <NotificationBell notifications={notifications} onMarkAsRead={onNotificationRead} onOpenCenter={onNotificationsOpened} />
                     <button 
                        onClick={handleAddNew} 
                        className="hidden md:flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        aria-label={addPropertyAria}
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>{addPropertyLabel}</span>
                    </button>
                    <ProfileDropdown user={user} onLogout={onLogout} onAccountSettings={onGoToAccountSettings} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                 <div className="relative z-10 px-4 pb-[7.5rem] pt-6 md:px-6 md:pb-[6rem] md:pt-8">
                    {renderContent()}
                </div>
            </main>
            <AddPropertyModal 
                isOpen={isModalOpen && !forceAddProperty}
                onClose={handleCloseModal}
                onSave={handleSaveAndClose}
                propertyToEdit={propertyToEdit}
                initialData={propertyToEdit ? null : initialPropertyData}
                isMandatory={false}
            />
            <BottomNavBar
                navItems={navItems}
                activeView={view}
                setView={setView}
                onAddNew={handleAddNew}
                onGoToAccountSettings={onGoToAccountSettings}
                addAriaLabel={addPropertyAria}
                profileLabel={bottomProfileLabel}
            />
        </div>
    );
};

export default OwnerDashboard;
