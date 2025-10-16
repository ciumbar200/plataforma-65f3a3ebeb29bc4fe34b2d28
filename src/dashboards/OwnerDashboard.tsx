import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './components/StatCard';
import { BuildingIcon, ChartBarIcon, EyeIcon, UsersIcon, UserCircleIcon, PlusIcon, ChevronLeftIcon, MoonIcon } from '../components/icons';
import PropertyCard from './components/PropertyCard';
import AddPropertyModal from './components/AddPropertyModal';
import { Property, User, PropertyType, OwnerStats, UserRole, RentalGoal } from '../types';
import GlassCard from '../components/GlassCard';
import CandidateGroupCard from './components/CandidateGroupCard';
import ProfileDropdown from './components/ProfileDropdown';
import Profile from '../pages/account/Profile';

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
}

const navItems = [
    { id: 'dashboard', icon: <ChartBarIcon className="w-7 h-7" />, label: 'Panel' },
    { id: 'properties', icon: <BuildingIcon className="w-7 h-7" />, label: 'Propiedades' },
    { id: 'candidates', icon: <UsersIcon className="w-7 h-7" />, label: 'Candidatos' },
] as const;

type View = typeof navItems[number]['id'] | 'propertyDetail';

const BottomNavBar = ({ activeView, setView, onAddNew, onGoToAccountSettings }: { activeView: View; setView: (view: View) => void; onAddNew: () => void; onGoToAccountSettings: () => void; }) => (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/30 backdrop-blur-xl border-t border-white/20 z-30 grid grid-cols-5 items-center md:hidden">
        {navItems.map(item => (
             <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${activeView === item.id ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}
            >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
            </button>
        ))}
         <button
            onClick={onAddNew}
            className="flex flex-col items-center justify-center gap-1 transition-colors text-white"
            aria-label="Añadir nueva propiedad"
        >
            <div className="bg-indigo-600 h-12 w-12 rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-400">
                <PlusIcon className="w-7 h-7" />
            </div>
        </button>
         <button
            onClick={onGoToAccountSettings}
            className={`flex flex-col items-center justify-center gap-1 transition-colors text-white/70 hover:text-white`}
        >
            <UserCircleIcon className="w-7 h-7" />
            <span className="text-xs font-medium">Mi Perfil</span>
        </button>
    </div>
);

const BackButton = ({ onClick, text }: { onClick: () => void; text: string; }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 mb-4">
      <ChevronLeftIcon className="w-5 h-5" />
      <span>{text}</span>
    </button>
);

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, properties, onSaveProperty, initialPropertyData, onClearInitialPropertyData, allUsers, matches, onLogout, onGoToAccountSettings, onUpdateUser, forceAddProperty = false }) => {
    const [view, setView] = useState<View>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [invitedGroups, setInvitedGroups] = useState<string[]>([]);

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
        alert(`Grupo de ${group.map(u => u.name).join(', ')} ha sido notificado sobre la propiedad "${property.title}".`);
    };
    
    const realStats = useMemo(() => ({
      totalRevenue: properties.reduce((sum, prop) => sum + prop.price, 0),
      totalProperties: properties.length,
      totalViews: properties.reduce((sum, prop) => sum + prop.views, 0),
      totalCandidates: properties.reduce((sum, prop) => sum + prop.compatible_candidates, 0),
    }), [properties]);


    const renderDashboardView = () => (
        <>
            <h2 className="text-3xl font-bold mb-6">Panel General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={<ChartBarIcon className="w-7 h-7 text-white" />}
                    title="Ingresos Mensuales Potenciales"
                    value={`€${realStats.totalRevenue.toLocaleString()}`}
                    color="green"
                />
                <StatCard 
                    icon={<BuildingIcon className="w-7 h-7 text-white" />}
                    title="Propiedades Listadas"
                    value={realStats.totalProperties.toString()}
                    color="indigo"
                />
                <StatCard 
                    icon={<EyeIcon className="w-7 h-7 text-white" />}
                    title="Visitas Totales"
                    value={realStats.totalViews.toLocaleString()}
                    color="blue"
                />
                <StatCard 
                    icon={<UsersIcon className="w-7 h-7 text-white" />}
                    title="Candidatos Totales"
                    value={realStats.totalCandidates.toLocaleString()}
                    color="purple"
                />
            </div>
             <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Rendimiento Mensual (Simulado)</h3>
                <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_MONTHLY_EARNINGS_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                            <Bar dataKey="earnings" name="Ingresos" fill="rgba(139, 92, 246, 0.8)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );

    const renderPropertiesView = () => (
         <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Mis Propiedades</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length > 0 ? (
                    properties.map(prop => (
                        <PropertyCard key={prop.id} property={prop} onEdit={handleEdit} onCardClick={handlePropertyClick} />
                    ))
                ) : (
                    <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">Aún no has añadido ninguna propiedad.</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderCandidatesView = () => (
        <>
            <h2 className="text-3xl font-bold mb-6">Grupos de Candidatos Compatibles</h2>
            <p className="text-white/70 mb-6 max-w-3xl">Aquí se muestran grupos de inquilinos que han hecho match entre sí y buscan una propiedad. Revisa tus propiedades privadas para invitarlos.</p>
            <div className="space-y-4">
                {tenantGroups.length > 0 ? (
                    tenantGroups.map((group) => {
                        const groupId = group.map(u => u.id).sort().join('-');
                        return (
                            <CandidateGroupCard
                                key={groupId}
                                group={group}
                                onInvite={() => alert(`Para invitar a este grupo, ve a una de tus propiedades privadas y haz clic en "Liberar propiedad".`)}
                                isInvited={false} // This is generic, no property context
                            />
                        );
                    })
                ) : (
                    <GlassCard className="min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">No hay grupos de candidatos compatibles en este momento.</p>
                    </GlassCard>
                )}
            </div>
        </>
    );
    
    const renderPropertyDetailView = () => {
        if (!selectedProperty) return null;

        return (
            <div>
                <BackButton onClick={() => setView('properties')} text="Volver a mis Propiedades" />
                <GlassCard>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{selectedProperty.title}</h2>
                            <p className="text-white/70 mb-4">{selectedProperty.address}</p>
                            <img src={selectedProperty.image_urls[0]} alt={selectedProperty.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-bold mb-2">Condiciones</h3>
                            <p className="text-base text-white/80 whitespace-pre-wrap">{selectedProperty.conditions || 'No se especificaron condiciones.'}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Grupos de Candidatos</h3>
                            {selectedProperty.visibility === 'Pública' ? (
                                <div className="text-center p-6 bg-black/20 rounded-lg">
                                    <p className="text-white/80">Esta propiedad es pública. Los candidatos pueden mostrar interés directamente.</p>
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
                                            <p className="text-white/80">No se han encontrado grupos de inquilinos compatibles por ahora.</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                 <h2 className="text-2xl font-bold">¡Bienvenido a MoOn, Propietario!</h2>
                 <p className="text-white/80 mt-2">Para empezar a encontrar inquilinos, por favor, añade tu primera propiedad.</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col">
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-2 px-6 flex justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <MoonIcon className="w-7 h-7" />
                    <span className="text-xl font-bold">Panel de Propietario</span>
                </div>
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${view === item.id ? 'bg-purple-500/50 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                     <button 
                        onClick={handleAddNew} 
                        className="hidden md:flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        aria-label="Añadir nueva propiedad"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Añadir Propiedad</span>
                    </button>
                    <ProfileDropdown user={user} onLogout={onLogout} onAccountSettings={onGoToAccountSettings} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                 <div className="p-6 md:pb-6 pb-24">
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
            <BottomNavBar activeView={view} setView={setView} onAddNew={handleAddNew} onGoToAccountSettings={onGoToAccountSettings}/>
        </div>
    );
};

export default OwnerDashboard;