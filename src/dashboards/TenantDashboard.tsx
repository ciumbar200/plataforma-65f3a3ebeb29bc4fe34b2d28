import React, { useState, useMemo, useEffect } from 'react';
import { User, Property, SavedSearch, UserRole, PropertyType, AmenityId, RentalGoal } from '../types';
import { CompassIcon, BuildingIcon, SparklesIcon, UserCircleIcon, MoonIcon, XIcon, ChevronLeftIcon, PaperAirplaneIcon, CheckIcon } from '../components/icons';
import UserProfileCard from './components/UserProfileCard';
import PropertyCard from './components/PropertyCard';
import SaveSearchModal from './components/SaveSearchModal';
import ProfileDropdown from './components/ProfileDropdown';
import GlassCard from '../components/GlassCard';
import { CITIES_DATA, RELIGIONS, SEXUAL_ORIENTATIONS } from '../constants';
import { AVAILABLE_AMENITIES } from '../components/icons';
import CompatibilityModal from './components/CompatibilityModal';
import GoogleMap from './components/GoogleMap';


export const calculateCompatibilityBreakdown = (userA: User, userB: User): { name: string, score: number, maxScore: number }[] => {
    const breakdown: { name: string, score: number, maxScore: number }[] = [];

    // Interests
    const interestsA = new Set(userA.interests || []);
    const interestsB = new Set(userB.interests || []);
    if (interestsA.size > 0 || interestsB.size > 0) {
        const sharedInterests = [...interestsA].filter(interest => interestsB.has(interest));
        const smallerInterestSetSize = Math.max(1, Math.min(interestsA.size, interestsB.size));
        breakdown.push({
            name: 'Intereses',
            score: (sharedInterests.length / smallerInterestSetSize) * 40,
            maxScore: 40
        });
    }
    
    // Age
    const ageDiff = Math.abs(userA.age - userB.age);
    breakdown.push({
        name: 'Edad',
        score: Math.max(0, 20 - ageDiff * 2),
        maxScore: 20
    });

    // Noise Level
    const noiseMap = { 'Bajo': 1, 'Medio': 2, 'Alto': 3 };
    if (userA.noise_level && userB.noise_level) {
        const noiseDiff = Math.abs(noiseMap[userA.noise_level] - noiseMap[userB.noise_level]);
        let noiseScore = 0;
        if (noiseDiff === 0) noiseScore = 20;
        else if (noiseDiff === 1) noiseScore = 10;
        breakdown.push({
            name: 'Nivel de Ruido',
            score: noiseScore,
            maxScore: 20
        });
    }

    // Lifestyle
    const lifestyleA = new Set(userA.lifestyle || []);
    const lifestyleB = new Set(userB.lifestyle || []);
    if (lifestyleA.size > 0 || lifestyleB.size > 0) {
        const sharedLifestyle = [...lifestyleA].filter(style => lifestyleB.has(style));
        const smallerLifestyleSetSize = Math.max(1, Math.min(lifestyleA.size, lifestyleB.size));
        breakdown.push({
            name: 'Estilo de Vida',
            score: (sharedLifestyle.length / smallerLifestyleSetSize) * 20,
            maxScore: 20
        });
    }

    return breakdown;
};

export const calculateCompatibility = (userA: User, userB: User): number => {
    const breakdown = calculateCompatibilityBreakdown(userA, userB);
    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);
    const maxTotalScore = breakdown.reduce((sum, item) => sum + item.maxScore, 0);

    if (maxTotalScore === 0) return 50;
    
    return Math.min(99, Math.round((totalScore / maxTotalScore) * 100));
};

interface TenantDashboardProps {
    user: User;
    allUsers: User[];
    properties: Property[];
    onSendInterest: (propertyId: number) => void;
    savedSearches: SavedSearch[];
    onSaveSearch: (searchData: Omit<SavedSearch, 'id' | 'user_id'>) => void;
    onDeleteSearch: (id: number) => void;
    userMatches: string[];
    onAddMatch: (matchedUserId: string) => void;
    onGoToAccountSettings: () => void;
    onLogout: () => void;
}

const navItems = [
    { id: 'discover', icon: <CompassIcon className="w-7 h-7" />, label: 'Descubrir' },
    { id: 'properties', icon: <BuildingIcon className="w-7 h-7" />, label: 'Propiedades' },
    { id: 'matches', icon: <SparklesIcon className="w-7 h-7" />, label: 'Matches' },
] as const;

type View = typeof navItems[number]['id'] | 'propertyDetail';

const BottomNavBar = ({ activeView, setView, onGoToAccountSettings }: { activeView: View; setView: (view: View) => void; onGoToAccountSettings: () => void; }) => (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/30 backdrop-blur-xl border-t border-white/20 z-30 grid grid-cols-4 items-center md:hidden">
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

const TenantDashboard: React.FC<TenantDashboardProps> = ({ user, allUsers, properties, onSendInterest, savedSearches, onSaveSearch, onDeleteSearch, userMatches, onAddMatch, onGoToAccountSettings, onLogout }) => {
    const [view, setView] = useState<View>('discover');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
    const [compatibilityUser, setCompatibilityUser] = useState<User | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [interestSent, setInterestSent] = useState(false);

    // State for property filters
    const [cityFilter, setCityFilter] = useState(user.city || '');
    const [localitiesForFilter, setLocalitiesForFilter] = useState<string[]>(CITIES_DATA[user.city || ''] || []);
    const [localityFilter, setLocalityFilter] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | ''>('');
    const [bathroomsFilter, setBathroomsFilter] = useState('');
    const [amenitiesFilter, setAmenitiesFilter] = useState<AmenityId[]>([]);

    // State for discover (roommate) filters
    const [discoverCityFilter, setDiscoverCityFilter] = useState('');
    const [localitiesForDiscoverFilter, setLocalitiesForDiscoverFilter] = useState<string[]>([]);
    const [discoverLocalityFilter, setDiscoverLocalityFilter] = useState('');
    const [discoverRentalGoalFilter, setDiscoverRentalGoalFilter] = useState<RentalGoal | ''>('');
    const [discoverBudgetFilter, setDiscoverBudgetFilter] = useState('');
    
    useEffect(() => {
      const newLocalities = CITIES_DATA[cityFilter] || [];
      setLocalitiesForFilter(newLocalities);
      if (!newLocalities.includes(localityFilter)) {
        setLocalityFilter('');
      }
    }, [cityFilter]);

    useEffect(() => {
      const newLocalities = CITIES_DATA[discoverCityFilter] || [];
      setLocalitiesForDiscoverFilter(newLocalities);
       if (!newLocalities.includes(discoverLocalityFilter)) {
        setDiscoverLocalityFilter('');
      }
    }, [discoverCityFilter]);


    const potentialRoommates = useMemo(() => {
        return allUsers
            .filter(u => {
                // Basic exclusion criteria
                if (u.id === user.id || u.role !== UserRole.INQUILINO || u.is_banned) {
                    return false;
                }

                // User-applied filters
                if (discoverCityFilter && u.city !== discoverCityFilter) return false;
                if (discoverLocalityFilter && u.locality !== discoverLocalityFilter) return false;
                if (discoverRentalGoalFilter && u.rental_goal !== discoverRentalGoalFilter) return false;
                if (discoverBudgetFilter && (!u.budget || u.budget > Number(discoverBudgetFilter))) return false;
                
                return true;
            })
            .map(u => ({...u, compatibility: calculateCompatibility(user, u)}))
            .sort((a, b) => b.compatibility - a.compatibility);
    }, [allUsers, user, discoverCityFilter, discoverLocalityFilter, discoverRentalGoalFilter, discoverBudgetFilter]);

    // Reset card index when filters change
    useEffect(() => {
        setCurrentIndex(0);
    }, [potentialRoommates]);


    const usersById = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);

    const mutualMatches = useMemo(() => {
        return userMatches
            .map(id => usersById.get(id))
            .filter((u): u is User => !!u)
            .map(u => ({...u, compatibility: calculateCompatibility(user, u)}));
    }, [userMatches, usersById, user]);

    const filteredProperties = useMemo(() => {
        return properties.filter(prop => {
            const minPrice = minPriceFilter ? Number(minPriceFilter) : 0;
            const maxPrice = maxPriceFilter ? Number(maxPriceFilter) : Infinity;

            if (prop.price < minPrice || prop.price > maxPrice) return false;
            if (cityFilter && prop.city !== cityFilter) return false;
            if (localityFilter && localityFilter !== 'Todas las localidades' && prop.locality !== localityFilter) return false;
            if (propertyTypeFilter && prop.property_type !== propertyTypeFilter) return false;
            if (bathroomsFilter && prop.bathrooms !== Number(bathroomsFilter)) return false;

            if (amenitiesFilter.length > 0) {
                for (const amenity of amenitiesFilter) {
                    if (!prop.features?.[amenity]) return false;
                }
            }
            return true;
        });
    }, [properties, cityFilter, localityFilter, minPriceFilter, maxPriceFilter, propertyTypeFilter, bathroomsFilter, amenitiesFilter]);
    
    const handleLike = () => {
        if (currentIndex < potentialRoommates.length) {
            onAddMatch(potentialRoommates[currentIndex].id);
            setCurrentIndex(currentIndex + 1);
        }
    };
    
    const handleDislike = () => {
        setCurrentIndex(currentIndex + 1);
    };

    const handleSaveSearch = (name: string) => {
      const filters: SavedSearch['filters'] = {};
      if (cityFilter) filters.city = cityFilter;
      if (localityFilter) filters.locality = localityFilter;
      if (minPriceFilter) filters.min_price = Number(minPriceFilter);
      if (maxPriceFilter) filters.max_price = Number(maxPriceFilter);
      if (propertyTypeFilter) filters.property_type = propertyTypeFilter;
      if (bathroomsFilter) filters.bathrooms = Number(bathroomsFilter);
      if (amenitiesFilter.length > 0) filters.amenities = amenitiesFilter;
      
      onSaveSearch({ name, filters });
    };
    
     const handleAmenityToggle = (amenityId: AmenityId) => {
        setAmenitiesFilter(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        );
    };
    
    const handleShowCompatibility = (userToShow: User) => {
        setCompatibilityUser(userToShow);
    };

    const handleCloseCompatibility = () => {
        setCompatibilityUser(null);
    };

    const handlePropertyClick = (property: Property) => {
        setSelectedProperty(property);
        setInterestSent(false); // Reset interest sent status
        setView('propertyDetail');
    };

    const resetPropertyFilters = () => {
        setCityFilter(user.city || '');
        setLocalityFilter('');
        setMinPriceFilter('');
        setMaxPriceFilter('');
        setPropertyTypeFilter('');
        setBathroomsFilter('');
        setAmenitiesFilter([]);
    };

    const resetDiscoverFilters = () => {
        setDiscoverCityFilter('');
        setDiscoverLocalityFilter('');
        setDiscoverRentalGoalFilter('');
        setDiscoverBudgetFilter('');
    };

    const renderDiscoverView = () => (
        <>
            <h2 className="text-3xl font-bold mb-4 text-center text-white">Encuentra tu compañero ideal</h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto mb-6">Usa los filtros para encontrar personas en tu ciudad actual o en la ciudad a la que planeas mudarte.</p>
            
            {/* Discover Filters */}
            <GlassCard className="mb-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="discoverCityFilter" className="block text-xs font-medium text-white/70 mb-1">Ciudad</label>
                        <select id="discoverCityFilter" value={discoverCityFilter} onChange={e => setDiscoverCityFilter(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">Cualquier ciudad</option>{Object.keys(CITIES_DATA).map(c => <option key={c} value={c} className="bg-gray-800 text-white">{c}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="discoverLocalityFilter" className="block text-xs font-medium text-white/70 mb-1">Localidad</label>
                        <select id="discoverLocalityFilter" value={discoverLocalityFilter} onChange={e => setDiscoverLocalityFilter(e.target.value)} disabled={!discoverCityFilter} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none disabled:opacity-50 text-white"><option value="" className="bg-gray-800 text-white">Cualquier localidad</option>{localitiesForDiscoverFilter.map(l => <option key={l} value={l} className="bg-gray-800 text-white">{l}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="discoverRentalGoalFilter" className="block text-xs font-medium text-white/70 mb-1">Busca</label>
                        <select id="discoverRentalGoalFilter" value={discoverRentalGoalFilter} onChange={e => setDiscoverRentalGoalFilter(e.target.value as RentalGoal)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white">
                            <option value="" className="bg-gray-800 text-white">Cualquier objetivo</option>
                            <option value={RentalGoal.FIND_ROOMMATES_AND_APARTMENT} className="bg-gray-800 text-white">Compañeros y piso</option>
                            <option value={RentalGoal.FIND_ROOM_WITH_ROOMMATES} className="bg-gray-800 text-white">Habitación en piso</option>
                            <option value={RentalGoal.BOTH} className="bg-gray-800 text-white">Ambas opciones</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="discoverBudgetFilter" className="block text-xs font-medium text-white/70 mb-1">Presupuesto Máx (€)</label>
                        <input 
                            type="number" 
                            id="discoverBudgetFilter" 
                            value={discoverBudgetFilter} 
                            onChange={e => setDiscoverBudgetFilter(e.target.value)} 
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60"
                            placeholder="Ej: 500"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={resetDiscoverFilters} className="text-sm text-indigo-300 hover:underline">Limpiar filtros de búsqueda</button>
                </div>
            </GlassCard>

            <div className="flex flex-col items-center justify-start min-h-[70vh]">
                {potentialRoommates.length > 0 ? (
                    currentIndex < potentialRoommates.length ? (
                        <>
                            <div className="w-full max-w-sm mb-6">
                                <UserProfileCard 
                                    user={potentialRoommates[currentIndex]} 
                                    onCompatibilityClick={() => handleShowCompatibility(potentialRoommates[currentIndex])}
                                />
                            </div>
                            <div className="flex gap-8 z-20 flex-shrink-0">
                                <button onClick={handleDislike} aria-label="No me gusta" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-5 text-red-400 hover:bg-red-500/20 transition-transform hover:scale-110">
                                    <XIcon className="w-8 h-8" />
                                </button>
                                <button onClick={handleLike} aria-label="Match" className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-5 text-green-400 hover:bg-green-500/20 transition-transform hover:scale-110">
                                    <SparklesIcon className="w-8 h-8" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center flex-grow">
                            <GlassCard>
                                <p className="text-center text-white/70">Has visto todos los perfiles de esta búsqueda. ¡Prueba con otros filtros!</p>
                            </GlassCard>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center flex-grow">
                        <GlassCard>
                            <p className="text-center text-white/70">No se encontraron perfiles con los filtros seleccionados.</p>
                        </GlassCard>
                    </div>
                )}
            </div>
        </>
    );

    const renderPropertiesView = () => (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">Propiedades Disponibles</h2>
                <button onClick={() => setSaveSearchModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Guardar Búsqueda Actual</button>
            </div>
            
            {/* Filters */}
            <GlassCard className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="cityFilter" className="block text-xs font-medium text-white/70 mb-1">Ciudad</label>
                        <select id="cityFilter" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">Cualquier ciudad</option>{Object.keys(CITIES_DATA).map(c => <option key={c} value={c} className="bg-gray-800 text-white">{c}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="localityFilter" className="block text-xs font-medium text-white/70 mb-1">Localidad</label>
                        <select id="localityFilter" value={localityFilter} onChange={e => setLocalityFilter(e.target.value)} disabled={!cityFilter} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none disabled:opacity-50 text-white"><option value="" className="bg-gray-800 text-white">Cualquier localidad</option>{localitiesForFilter.map(l => <option key={l} value={l} className="bg-gray-800 text-white">{l}</option>)}</select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Precio (€)</label>
                        <div className="flex gap-2">
                           <input type="number" placeholder="Min" value={minPriceFilter} onChange={e => setMinPriceFilter(e.target.value)} className="w-1/2 bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60" />
                           <input type="number" placeholder="Max" value={maxPriceFilter} onChange={e => setMaxPriceFilter(e.target.value)} className="w-1/2 bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="propertyTypeFilter" className="block text-xs font-medium text-white/70 mb-1">Tipo</label>
                        <select id="propertyTypeFilter" value={propertyTypeFilter} onChange={e => setPropertyTypeFilter(e.target.value as PropertyType)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">Cualquier tipo</option>{Object.values(PropertyType).map(t => <option key={t} value={t} className="bg-gray-800 text-white">{t}</option>)}</select>
                    </div>
                </div>
                 <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="block text-xs font-medium text-white/70 mb-2">Comodidades</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_AMENITIES.slice(0, 6).map(amenity => (
                             <button key={amenity.id} type="button" onClick={() => handleAmenityToggle(amenity.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors border ${amenitiesFilter.includes(amenity.id) ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-transparent hover:bg-white/20'}`}>{React.cloneElement(amenity.icon, {className: 'w-4 h-4'})}<span>{amenity.label}</span></button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={resetPropertyFilters} className="text-sm text-indigo-300 hover:underline">Limpiar filtros</button>
                </div>
            </GlassCard>

            {savedSearches.length > 0 && <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white">Búsquedas Guardadas</h3>
                <div className="flex flex-wrap gap-2">
                    {savedSearches.map(s => (
                        <div key={s.id} className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                            <span>{s.name}</span>
                            <button onClick={() => onDeleteSearch(s.id)} className="text-white/50 hover:text-white" aria-label={`Eliminar búsqueda ${s.name}`}><XIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.length > 0 ? (
                    filteredProperties.map(prop => <PropertyCard key={prop.id} property={prop} onCardClick={handlePropertyClick} />)
                ) : (
                    <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">No se encontraron propiedades con los filtros seleccionados.</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderMatchesView = () => (
         <>
            <h2 className="text-3xl font-bold mb-6 text-white">Tus Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mutualMatches.length > 0 ? mutualMatches.map(u => (
                    <UserProfileCard 
                        key={u.id} 
                        user={u}
                        onCompatibilityClick={() => handleShowCompatibility(u)}
                    />
                )) : (
                     <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">Aún no tienes matches. ¡Sigue descubriendo!</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderPropertyDetailView = () => {
        if (!selectedProperty) return null;

        const handleSendInterest = () => {
            onSendInterest(selectedProperty.id);
            setInterestSent(true);
        };
        
        const availableAmenities = AVAILABLE_AMENITIES.filter(amenity => selectedProperty.features && selectedProperty.features[amenity.id]);
        const fullAddress = [selectedProperty.address, selectedProperty.locality, selectedProperty.city, selectedProperty.postal_code].filter(Boolean).join(', ');

        return (
            <div>
                <BackButton onClick={() => setView('properties')} text="Volver a Propiedades" />
                <GlassCard className="!p-0 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-2">
                            <img src={selectedProperty.image_urls[0]} alt={selectedProperty.title} className="w-full h-auto object-cover rounded-lg" />
                             {selectedProperty.image_urls.length > 1 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {selectedProperty.image_urls.slice(1, 4).map((url, index) => (
                                        <img key={index} src={url} alt={`${selectedProperty.title} ${index + 2}`} className="w-full h-24 object-cover rounded-md" />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col">
                            <h2 className="text-3xl font-bold mb-2 text-white">{selectedProperty.title}</h2>
                            <p className="text-white/70 mb-4">{fullAddress}</p>
                            
                            <p className="text-4xl font-bold text-indigo-300 mb-4">
                                €{selectedProperty.price}
                                <span className="text-lg font-normal text-white/70">/mes</span>
                            </p>
                            
                            <button 
                                onClick={handleSendInterest}
                                disabled={interestSent}
                                className={`w-full py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 ${interestSent ? 'bg-green-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {interestSent ? <><CheckIcon className="w-6 h-6"/> Interés Enviado</> : <><PaperAirplaneIcon className="w-6 h-6"/> Mostrar Interés</>}
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-6 border-t border-white/20">
                         {availableAmenities.length > 0 && (
                            <div>
                                <h4 className="text-xl font-bold mb-3 text-white">Comodidades</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {availableAmenities.map(amenity => (
                                        <div key={amenity.id} className="flex items-center gap-3 text-white/90">
                                            {React.cloneElement(amenity.icon, { className: 'w-6 h-6 text-indigo-300 flex-shrink-0' })}
                                            <span className="text-sm">{amenity.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProperty.conditions && (
                            <div>
                                <h4 className="text-xl font-bold mb-3 text-white">Condiciones del Propietario</h4>
                                <p className="text-sm text-white/80 whitespace-pre-wrap bg-black/20 p-4 rounded-lg">{selectedProperty.conditions}</p>
                            </div>
                        )}

                        {selectedProperty.lat != null && selectedProperty.lng != null && (
                            <div>
                                <h4 className="text-xl font-bold mb-3 text-white">Ubicación</h4>
                                <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                                    <GoogleMap lat={selectedProperty.lat} lng={selectedProperty.lng} />
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        );
    };

    const renderContent = () => {
        switch(view) {
            case 'discover': return renderDiscoverView();
            case 'properties': return renderPropertiesView();
            case 'matches': return renderMatchesView();
            case 'propertyDetail': return renderPropertyDetailView();
            default: return renderDiscoverView();
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-2 px-6 flex justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <MoonIcon className="w-7 h-7 text-white" />
                    <span className="text-xl font-bold text-white">Panel de Inquilino</span>
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
                    <ProfileDropdown user={user} onLogout={onLogout} onAccountSettings={onGoToAccountSettings} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                 <div className="p-6 md:pb-6 pb-24">
                    {renderContent()}
                </div>
            </main>
            
            <CompatibilityModal 
                isOpen={!!compatibilityUser}
                onClose={handleCloseCompatibility}
                currentUser={user}
                otherUser={compatibilityUser}
                breakdown={compatibilityUser ? calculateCompatibilityBreakdown(user, compatibilityUser) : []}
            />

            <SaveSearchModal isOpen={isSaveSearchModalOpen} onClose={() => setSaveSearchModalOpen(false)} onSave={handleSaveSearch} />
            <BottomNavBar activeView={view} setView={setView} onGoToAccountSettings={onGoToAccountSettings} />
        </div>
    );
};

export default TenantDashboard;