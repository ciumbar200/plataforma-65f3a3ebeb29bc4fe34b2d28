import React, { useState, useMemo, useEffect } from 'react';
import { User, Property, SavedSearch, UserRole, PropertyType, AmenityId, RentalGoal, Notification } from '../types';
import { CompassIcon, BuildingIcon, SparklesIcon, UserCircleIcon, MoonIcon, XIcon, ChevronLeftIcon, PaperAirplaneIcon, CheckIcon } from '../components/icons';
import UserProfileCard from './components/UserProfileCard';
import PropertyCard from './components/PropertyCard';
import SaveSearchModal from './components/SaveSearchModal';
import ProfileDropdown from './components/ProfileDropdown';
import GlassCard from '../components/GlassCard';
import { CITIES_DATA } from '../constants';
import { AVAILABLE_AMENITIES } from '../components/icons';
import CompatibilityModal from './components/CompatibilityModal';
import GoogleMap from './components/GoogleMap';
import { useI18n } from '../i18n';
import { getCozyGallery } from '../lib/propertyImages';
import DrawAreaModal from './components/DrawAreaModal';
import NotificationBell from '../components/NotificationBell';

export type TenantDashboardCopy = {
    nav: {
        discover: string;
        properties: string;
        matches: string;
        profile: string;
    };
    header: { title: string };
    discover: {
        heroTitle: string;
        heroSubtitle: string;
        compactTitle: string;
        compactSubtitle: string;
        toggleHide: string;
        toggleShow: string;
        reset: string;
        filters: {
            cityLabel: string;
            cityAny: string;
            localityLabel: string;
            localityAny: string;
            rentalGoalLabel: string;
            rentalGoalAny: string;
            rentalGoalOptions: {
                findRoommatesAndApartment: string;
                findRoom: string;
                both: string;
            };
            budgetLabel: string;
            budgetPlaceholder: string;
            resetFilters: string;
            apply: string;
        };
        actions: {
            dislikeAria: string;
            viewLabel: string;
            likeAria: string;
            discardLabel: string;
            connectLabel: string;
            next: string;
            allSeen: string;
            noResults: string;
        };
    };
    propertiesSection: {
        title: string;
        subtitle: string;
        saveSearch: string;
        toggleHide: string;
        toggleShow: string;
        reset: string;
        filters: {
            cityLabel: string;
            cityAny: string;
            localityLabel: string;
            localityAny: string;
            priceLabel: string;
            minPlaceholder: string;
            maxPlaceholder: string;
            typeLabel: string;
            typeAny: string;
            amenitiesLabel: string;
        };
        resetFilters: string;
        apply: string;
        noResults: string;
        saved: {
            title: string;
            deleteAria: string;
        };
        savedEmpty: string;
    };
    matches: {
        title: string;
        empty: string;
    };
    propertyDetail: {
        back: string;
        photoPrev: string;
        photoNext: string;
        bathroomLabel: string;
        availablePrefix: string;
        availableUnknown: string;
        sendInterest: string;
        interestSent: string;
        ownerConditions: string;
        amenitiesTitle: string;
        summaryTitle: string;
        summary: {
            visibility: string;
            status: string;
            statusValues: {
                approved: string;
            };
            candidates: string;
        };
        locationTitle: string;
        priceSuffix: string;
        imageAltTemplate: string;
    };
    forceAdd: {
        title: string;
        description: string;
    };
    compatibility: {
        labels: {
            interests: string;
            age: string;
            noiseLevel: string;
            lifestyle: string;
        };
        modal: {
            title: string;
            closeAria: string;
            footnote: string;
        };
    };
    saveSearchModal: {
        title: string;
        description: string;
        nameLabel: string;
        placeholder: string;
        cancel: string;
        save: string;
    };
};

export const DEFAULT_TENANT_DASHBOARD_COPY: TenantDashboardCopy = {
    nav: {
        discover: 'Descubrir',
        properties: 'Propiedades',
        matches: 'Matches',
        profile: 'Mi Perfil',
    },
    header: {
        title: 'Panel de Inquilino',
    },
    discover: {
        heroTitle: 'Encuentra tu compañero ideal',
        heroSubtitle: 'Usa los filtros para encontrar personas en tu ciudad actual o en la ciudad a la que planeas mudarte.',
        compactTitle: 'Personas compatibles',
        compactSubtitle: 'Puedes ajustar los filtros cuando quieras.',
        toggleHide: 'Ocultar filtros',
        toggleShow: 'Editar filtros',
        reset: 'Reiniciar',
        filters: {
            cityLabel: 'Ciudad',
            cityAny: 'Cualquier ciudad',
            localityLabel: 'Localidad',
            localityAny: 'Cualquier localidad',
            rentalGoalLabel: 'Busca',
            rentalGoalAny: 'Cualquier objetivo',
            rentalGoalOptions: {
                findRoommatesAndApartment: 'Compañeros y piso',
                findRoom: 'Habitación en piso',
                both: 'Ambas opciones',
            },
            budgetLabel: 'Presupuesto Máx (€)',
            budgetPlaceholder: 'Ej: 500',
            resetFilters: 'Reiniciar filtros',
            apply: 'Aplicar y ver resultados',
        },
        actions: {
            dislikeAria: 'Descartar',
            viewLabel: 'Más detalles',
            likeAria: 'Mostrar interés',
            discardLabel: 'Descartar',
            connectLabel: 'Me interesa convivir',
            next: 'Siguiente',
            allSeen: 'Has visto todos los perfiles de esta búsqueda. ¡Prueba con otros filtros!',
            noResults: 'No se encontraron perfiles con los filtros seleccionados.',
        },
    },
    propertiesSection: {
        title: 'Propiedades Disponibles',
        subtitle: 'Perfectas para tu estilo de vida y presupuesto.',
        saveSearch: 'Guardar búsqueda',
        toggleHide: 'Ocultar filtros',
        toggleShow: 'Editar filtros',
        reset: 'Reiniciar',
        filters: {
            cityLabel: 'Ciudad',
            cityAny: 'Cualquier ciudad',
            localityLabel: 'Localidad',
            localityAny: 'Cualquier localidad',
            priceLabel: 'Precio (€)',
            minPlaceholder: 'Min',
            maxPlaceholder: 'Max',
            typeLabel: 'Tipo',
            typeAny: 'Cualquier tipo',
            amenitiesLabel: 'Comodidades',
        },
        resetFilters: 'Reiniciar filtros',
        apply: 'Aplicar y ver resultados',
        noResults: 'No se encontraron propiedades con los filtros seleccionados.',
        saved: {
            title: 'Búsquedas Guardadas',
            deleteAria: 'Eliminar búsqueda {name}',
        },
        savedEmpty: 'Todavía no has guardado búsquedas.',
    },
    matches: {
        title: 'Tus Matches',
        empty: 'Aún no tienes matches. ¡Sigue descubriendo!',
    },
    propertyDetail: {
        back: 'Volver a Propiedades',
        photoPrev: 'Foto anterior',
        photoNext: 'Foto siguiente',
        bathroomLabel: '{count} baño(s)',
        availablePrefix: 'Disponible desde {date}',
        availableUnknown: 'Consultar',
        sendInterest: 'Quiero visitarla',
        interestSent: 'Interés enviado',
        ownerConditions: 'Condiciones del propietario',
        amenitiesTitle: 'Comodidades destacadas',
        summaryTitle: 'Resumen rápido',
        summary: {
            visibility: 'Visibilidad',
            status: 'Estado',
            statusValues: {
                approved: 'Disponible',
            },
            candidates: 'Candidatos compatibles',
        },
        locationTitle: 'Ubicación',
        priceSuffix: '/mes',
        imageAltTemplate: '{title} imagen {index}',
    },
    forceAdd: {
        title: '¡Bienvenido a MoOn, Inquilino!',
        description: 'Configura tus preferencias para empezar a descubrir matches.',
    },
    compatibility: {
        labels: {
            interests: 'Intereses',
            age: 'Edad',
            noiseLevel: 'Nivel de Ruido',
            lifestyle: 'Estilo de Vida',
        },
        modal: {
            title: 'Detalle de Compatibilidad',
            closeAria: 'Cerrar modal',
            footnote: 'Esta puntuación es una guía para ayudarte a encontrar personas con un estilo de vida similar.',
        },
    },
    saveSearchModal: {
        title: 'Guardar Búsqueda',
        description: 'Dale un nombre a tu configuración de filtros actual para acceder a ella más tarde y recibir notificaciones.',
        nameLabel: 'Nombre de la Búsqueda',
        placeholder: 'Ej: Apartamento en Madrid Centro',
        cancel: 'Cancelar',
        save: 'Guardar',
    },
};

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? T[P]
        : T[P] extends object
            ? DeepPartial<T[P]>
            : T[P];
};

const mergeDeep = <T,>(base: T, override?: DeepPartial<T>): T => {
    if (!override) {
        return Array.isArray(base) ? ([...(base as any[])] as T) : ({ ...base } as T);
    }
    const result: any = Array.isArray(base) ? [...(base as any[])] : { ...base };
    for (const key of Object.keys(override) as Array<keyof T>) {
        const overrideValue = override[key];
        if (overrideValue === undefined) continue;
        const baseValue = (base as any)[key];
        if (
            overrideValue &&
            typeof overrideValue === 'object' &&
            !Array.isArray(overrideValue) &&
            baseValue &&
            typeof baseValue === 'object' &&
            !Array.isArray(baseValue)
        ) {
            result[key] = mergeDeep(baseValue, overrideValue as any);
        } else {
            result[key] = overrideValue;
        }
    }
    return result;
};

export const calculateCompatibilityBreakdown = (
    userA: User,
    userB: User,
    labels: TenantDashboardCopy['compatibility']['labels'] = DEFAULT_TENANT_DASHBOARD_COPY.compatibility.labels
): { name: string, score: number, maxScore: number }[] => {
    const breakdown: { name: string, score: number, maxScore: number }[] = [];

    // Interests
    const interestsA = new Set(userA.interests || []);
    const interestsB = new Set(userB.interests || []);
    if (interestsA.size > 0 || interestsB.size > 0) {
        const sharedInterests = [...interestsA].filter(interest => interestsB.has(interest));
        const smallerInterestSetSize = Math.max(1, Math.min(interestsA.size, interestsB.size));
        breakdown.push({
            name: labels.interests,
            score: (sharedInterests.length / smallerInterestSetSize) * 40,
            maxScore: 40
        });
    }
    
    // Age
    const ageDiff = Math.abs(userA.age - userB.age);
    breakdown.push({
        name: labels.age,
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
            name: labels.noiseLevel,
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
            name: labels.lifestyle,
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
    onOpenDiscoverProfile?: (user: User, options?: DiscoverProfileOpenOptions) => void;
    requestedView?: View | null;
    onConsumeRequestedView?: () => void;
    notifications: Notification[];
    onNotificationRead?: (id: number) => void;
    onNotificationsOpened?: () => void;
    onOpenQuiz?: () => void;
}

export type DiscoverProfileOpenOptions = {
    queue?: User[];
    index?: number;
    source?: 'discover' | 'matches' | 'other';
};

const NAV_ORDER = ['discover', 'properties', 'matches'] as const;
type View = typeof NAV_ORDER[number] | 'propertyDetail';
export type TenantDashboardView = View;

type NavItem = { id: View; icon: React.ReactElement; label: string };

const NAV_ICONS: Record<typeof NAV_ORDER[number], React.ReactElement> = {
    discover: <CompassIcon className="w-7 h-7" />,
    properties: <BuildingIcon className="w-7 h-7" />,
    matches: <SparklesIcon className="w-7 h-7" />,
};

const BottomNavBar = ({ navItems, activeView, setView, onGoToAccountSettings, profileLabel }: { navItems: NavItem[]; activeView: View; setView: (view: View) => void; onGoToAccountSettings: () => void; profileLabel: string; }) => (
    <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="flex items-center justify-between gap-2 bg-black/80 backdrop-blur-xl border-t border-white/15 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:px-8 md:pt-3">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`flex-1 flex flex-col items-center gap-1 text-[0.7rem] font-medium transition-colors ${activeView === item.id ? 'text-sky-300' : 'text-white/70 hover:text-white'}`}
                >
                    {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
                    <span>{item.label}</span>
                </button>
            ))}
            <button
                onClick={onGoToAccountSettings}
                className="flex-1 flex flex-col items-center gap-1 text-[0.7rem] font-medium text-white/70 transition-colors hover:text-white"
            >
                <UserCircleIcon className="w-6 h-6" />
                <span>{profileLabel}</span>
            </button>
        </div>
    </div>
);

const BackButton = ({ onClick, text }: { onClick: () => void; text: string; }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 mb-4">
      <ChevronLeftIcon className="w-5 h-5" />
      <span>{text}</span>
    </button>
);

const TenantDashboard: React.FC<TenantDashboardProps> = ({ user, allUsers, properties, onSendInterest, savedSearches, onSaveSearch, onDeleteSearch, userMatches, onAddMatch, onGoToAccountSettings, onLogout, onOpenDiscoverProfile, requestedView, onConsumeRequestedView, notifications, onNotificationRead, onNotificationsOpened, onOpenQuiz }) => {
    const { scope, language } = useI18n();
    const localizedCopy = scope<DeepPartial<TenantDashboardCopy>>('tenantDashboard');
    const tenantCopy = useMemo(
        () => mergeDeep(DEFAULT_TENANT_DASHBOARD_COPY, localizedCopy),
        [localizedCopy]
    );

    const navItems: NavItem[] = NAV_ORDER.map((id) => ({
        id,
        icon: NAV_ICONS[id],
        label: tenantCopy.nav[id],
    }));
    const bottomProfileLabel = tenantCopy.nav.profile;
    const discoverCopy = tenantCopy.discover;
    const propertiesCopy = tenantCopy.propertiesSection;
    const matchesCopy = tenantCopy.matches;
    const propertyDetailCopy = tenantCopy.propertyDetail;
    const forcedCopy = tenantCopy.forceAdd;
    const compatibilityLabels = tenantCopy.compatibility.labels;
    const compatibilityModalCopy = tenantCopy.compatibility.modal;
    const saveSearchModalCopy = tenantCopy.saveSearchModal;
    const personaProfile = useMemo(() => {
        const persona = user.convivencia_persona as { dominantTags?: string[]; summary?: string } | null | undefined;
        if (!persona) return null;
        const dominantTags = Array.isArray(persona.dominantTags) ? persona.dominantTags.slice(0, 4) : [];
        const summary = typeof persona.summary === 'string' ? persona.summary : null;
        if (!dominantTags.length && !summary) return null;
        return { dominantTags, summary };
    }, [user.convivencia_persona]);

    const baseNextSteps = useMemo(() => {
        const tasks: Array<{ id: string; title: string; description: string; actionLabel: string; onAction: () => void }> = [];
        if (!user.convivencia_quiz_completed && onOpenQuiz) {
            tasks.push({
                id: 'complete-quiz',
                title: 'Completa tu Quiz de Convivencia',
                description: 'Cuéntanos tus preferencias para desbloquear matches precisos.',
                actionLabel: 'Hacer quiz',
                onAction: onOpenQuiz,
            });
        }
        if (!user.is_profile_complete) {
            tasks.push({
                id: 'complete-profile',
                title: 'Termina tu perfil',
                description: 'Añade más detalles en tu biografía y datos personales.',
                actionLabel: 'Ir a mi perfil',
                onAction: () => onGoToAccountSettings(),
            });
        }
        const unread = notifications.filter((item) => !item.read_at).length;
        if (unread > 0) {
            tasks.push({
                id: 'check-notifications',
                title: 'Revisa tus novedades',
                description: `Tienes ${unread} notificación${unread === 1 ? '' : 'es'} pendiente${unread === 1 ? '' : 's'}.`,
                actionLabel: 'Abrir centro',
                onAction: () => onNotificationsOpened?.(),
            });
        }
        return tasks;
    }, [user.convivencia_quiz_completed, user.is_profile_complete, notifications, onGoToAccountSettings, onNotificationsOpened, onOpenQuiz]);

    const localeMap: Record<string, string> = { es: 'es-ES', en: 'en-GB', ca: 'ca-ES' };
    const dateLocale = localeMap[language] || 'es-ES';

    const [view, setView] = useState<View>('discover');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
    const [compatibilityUser, setCompatibilityUser] = useState<User | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [interestSent, setInterestSent] = useState(false);
    const [propertyImageIndex, setPropertyImageIndex] = useState(0);

    // State for property filters
    const [cityFilter, setCityFilter] = useState('');
    const [localitiesForFilter, setLocalitiesForFilter] = useState<string[]>([]);
    const [localityFilter, setLocalityFilter] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | ''>('');
    const [bathroomsFilter, setBathroomsFilter] = useState('');
    const [amenitiesFilter, setAmenitiesFilter] = useState<AmenityId[]>([]);
    const [isDrawAreaOpen, setDrawAreaOpen] = useState(false);
    const [customAreaPath, setCustomAreaPath] = useState<Array<{ lat: number; lng: number }> | null>(null);

    // State for discover (roommate) filters
    const [discoverCityFilter, setDiscoverCityFilter] = useState('');
    const [localitiesForDiscoverFilter, setLocalitiesForDiscoverFilter] = useState<string[]>([]);
    const [discoverLocalityFilter, setDiscoverLocalityFilter] = useState('');
    const [discoverRentalGoalFilter, setDiscoverRentalGoalFilter] = useState<RentalGoal | ''>('');
    const [discoverBudgetFilter, setDiscoverBudgetFilter] = useState('');
    const [showDiscoverFilters, setShowDiscoverFilters] = useState(true);
    const [showPropertyFilters, setShowPropertyFilters] = useState(true);
    
    useEffect(() => {
        if (!requestedView) return;
        setView(requestedView);
        onConsumeRequestedView?.();
    }, [requestedView, onConsumeRequestedView]);

    useEffect(() => {
        setPropertyImageIndex(0);
    }, [selectedProperty?.id]);
    
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
        const viewerIsHost = user.role === UserRole.ANFITRION;
        const viewerIsTenant = user.role === UserRole.INQUILINO;
        return allUsers
            .filter(u => {
                // Basic exclusion criteria
                if (u.id === user.id || u.is_banned) {
                    return false;
                }

                if (viewerIsHost) {
                    if (u.role !== UserRole.INQUILINO) return false;
                } else if (viewerIsTenant) {
                    if (![UserRole.INQUILINO, UserRole.ANFITRION].includes(u.role)) return false;
                } else if (u.role !== UserRole.INQUILINO) {
                    return false;
                }

                // User-applied filters
                if (discoverCityFilter && u.city !== discoverCityFilter) return false;
                if (discoverLocalityFilter && u.locality !== discoverLocalityFilter) return false;
                if (discoverRentalGoalFilter && u.role === UserRole.INQUILINO && u.rental_goal !== discoverRentalGoalFilter) return false;
                if (discoverBudgetFilter) {
                    const maxBudget = Number(discoverBudgetFilter);
                    if (u.role === UserRole.INQUILINO) {
                        if (!u.budget || u.budget > maxBudget) return false;
                    }
                }
                
                return true;
            })
            .map(u => ({...u, compatibility: calculateCompatibility(user, u)}))
            .sort((a, b) => b.compatibility - a.compatibility);
    }, [allUsers, user, discoverCityFilter, discoverLocalityFilter, discoverRentalGoalFilter, discoverBudgetFilter]);

    // Reset card index when filters change
    useEffect(() => {
        setCurrentIndex(0);
    }, [potentialRoommates]);

    // Compose next steps with discover context once potentialRoommates is available
    const nextSteps = useMemo(() => {
        const tasks = [...baseNextSteps];
        if (potentialRoommates.length > 0 && currentIndex >= potentialRoommates.length) {
            tasks.push({
                id: 'refresh-discover',
                title: 'Explora más perfiles',
                description: 'Ajusta filtros o vuelve más tarde para ver nuevas coincidencias.',
                actionLabel: 'Editar filtros',
                onAction: () => setShowDiscoverFilters(true),
            });
        }
        return tasks;
    }, [baseNextSteps, potentialRoommates, currentIndex]);


    const usersById = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);

    const mutualMatches = useMemo(() => {
        return userMatches
            .map(id => usersById.get(id))
            .filter((u): u is User => !!u)
            .map(u => ({...u, compatibility: calculateCompatibility(user, u)}));
    }, [userMatches, usersById, user]);

    const pointInPolygon = (point: { lat: number; lng: number }, polygon: Array<{ lat: number; lng: number }>) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lng;
            const yi = polygon[i].lat;
            const xj = polygon[j].lng;
            const yj = polygon[j].lat;

            const intersects = yi > point.lat !== yj > point.lat &&
                point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi || Number.EPSILON) + xi;
            if (intersects) inside = !inside;
        }
        return inside;
    };

    const filteredProperties = useMemo(() => {
        return properties.filter(prop => {
            const minPrice = minPriceFilter ? Number(minPriceFilter) : 0;
            const maxPrice = maxPriceFilter ? Number(maxPriceFilter) : Infinity;

            if (prop.price < minPrice || prop.price > maxPrice) return false;
            if (cityFilter && prop.city !== cityFilter) return false;
            if (localityFilter && prop.locality !== localityFilter) return false;
            if (propertyTypeFilter && prop.property_type !== propertyTypeFilter) return false;
            if (bathroomsFilter && prop.bathrooms !== Number(bathroomsFilter)) return false;
            if (customAreaPath && customAreaPath.length > 2) {
                if (prop.lat == null || prop.lng == null) return false;
                if (!pointInPolygon({ lat: prop.lat, lng: prop.lng }, customAreaPath)) return false;
            }

            if (amenitiesFilter.length > 0) {
                for (const amenity of amenitiesFilter) {
                    if (!prop.features?.[amenity]) return false;
                }
            }
            return true;
        });
    }, [properties, cityFilter, localityFilter, minPriceFilter, maxPriceFilter, propertyTypeFilter, bathroomsFilter, amenitiesFilter, customAreaPath]);
    
    const handleLike = () => {
        if (currentIndex < potentialRoommates.length) {
            onAddMatch(potentialRoommates[currentIndex].id);
            setCurrentIndex(currentIndex + 1);
        }
    };
    
    const handleNext = () => {
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
        setPropertyImageIndex(0);
        setView('propertyDetail');
    };

    const resetPropertyFilters = () => {
        setCityFilter('');
        setLocalityFilter('');
        setMinPriceFilter('');
        setMaxPriceFilter('');
        setPropertyTypeFilter('');
        setBathroomsFilter('');
        setAmenitiesFilter([]);
        setCustomAreaPath(null);
        setLocalitiesForFilter([]);
    };

    const resetDiscoverFilters = () => {
        setDiscoverCityFilter('');
        setDiscoverLocalityFilter('');
        setDiscoverRentalGoalFilter('');
        setDiscoverBudgetFilter('');
    };

    const renderDiscoverView = () => (
        <>
            {personaProfile && (
                <GlassCard className="mb-6 border-white/10 bg-white/10">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Tu vibra mooner</p>
                            <h3 className="text-xl font-semibold text-white mt-1">Tu hogar ideal está tomando forma</h3>
                            {personaProfile.summary && <p className="text-sm text-white/70 mt-1 max-w-2xl">{personaProfile.summary}</p>}
                        </div>
                        {personaProfile.dominantTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {personaProfile.dominantTags.map((tag) => (
                                    <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}
            {nextSteps.length > 0 && (
                <GlassCard className="mb-6 border-white/10 bg-white/5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Próximos pasos</p>
                            <h3 className="text-lg font-semibold text-white">Sigue construyendo tu perfil</h3>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {nextSteps.map((task) => (
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
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="text-center lg:text-left">
                    {showDiscoverFilters ? (
                        <>
                            <h2 className="text-3xl font-bold text-white">{discoverCopy.heroTitle}</h2>
                            <p className="text-white/70 max-w-2xl mt-2">
                                {discoverCopy.heroSubtitle}
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-white">{discoverCopy.compactTitle}</h2>
                            <p className="text-sm text-white/60 mt-1">{discoverCopy.compactSubtitle}</p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowDiscoverFilters(prev => !prev)}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                    >
                        {showDiscoverFilters ? discoverCopy.toggleHide : discoverCopy.toggleShow}
                    </button>
                    <button
                        onClick={() => {
                            resetDiscoverFilters();
                            setShowDiscoverFilters(true);
                        }}
                        className="hidden sm:inline-flex rounded-full border border-transparent bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/20"
                    >
                        {discoverCopy.reset}
                    </button>
                </div>
            </div>

            {showDiscoverFilters && (
            <GlassCard className="mb-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="discoverCityFilter" className="block text-xs font-medium text-white/70 mb-1">{discoverCopy.filters.cityLabel}</label>
                        <select id="discoverCityFilter" value={discoverCityFilter} onChange={e => setDiscoverCityFilter(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">{discoverCopy.filters.cityAny}</option>{Object.keys(CITIES_DATA).map(c => <option key={c} value={c} className="bg-gray-800 text-white">{c}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="discoverLocalityFilter" className="block text-xs font-medium text-white/70 mb-1">{discoverCopy.filters.localityLabel}</label>
                        <select id="discoverLocalityFilter" value={discoverLocalityFilter} onChange={e => setDiscoverLocalityFilter(e.target.value)} disabled={!discoverCityFilter} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none disabled:opacity-50 text-white"><option value="" className="bg-gray-800 text-white">{discoverCopy.filters.localityAny}</option>{localitiesForDiscoverFilter.map(l => <option key={l} value={l} className="bg-gray-800 text-white">{l}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="discoverRentalGoalFilter" className="block text-xs font-medium text-white/70 mb-1">{discoverCopy.filters.rentalGoalLabel}</label>
                        <select id="discoverRentalGoalFilter" value={discoverRentalGoalFilter} onChange={e => setDiscoverRentalGoalFilter(e.target.value as RentalGoal)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white">
                            <option value="" className="bg-gray-800 text-white">{discoverCopy.filters.rentalGoalAny}</option>
                            <option value={RentalGoal.FIND_ROOMMATES_AND_APARTMENT} className="bg-gray-800 text-white">{discoverCopy.filters.rentalGoalOptions[RentalGoal.FIND_ROOMMATES_AND_APARTMENT]}</option>
                            <option value={RentalGoal.FIND_ROOM_WITH_ROOMMATES} className="bg-gray-800 text-white">{discoverCopy.filters.rentalGoalOptions[RentalGoal.FIND_ROOM_WITH_ROOMMATES]}</option>
                            <option value={RentalGoal.BOTH} className="bg-gray-800 text-white">{discoverCopy.filters.rentalGoalOptions[RentalGoal.BOTH]}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="discoverBudgetFilter" className="block text-xs font-medium text-white/70 mb-1">{discoverCopy.filters.budgetLabel}</label>
                        <input 
                            type="number" 
                            id="discoverBudgetFilter" 
                            value={discoverBudgetFilter} 
                            onChange={e => setDiscoverBudgetFilter(e.target.value)} 
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60"
                            placeholder={discoverCopy.filters.budgetPlaceholder}
                        />
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                        onClick={resetDiscoverFilters}
                        className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20"
                    >
                        {discoverCopy.filters.resetFilters}
                    </button>
                    <button
                        onClick={() => setShowDiscoverFilters(false)}
                        className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50"
                    >
                        {discoverCopy.filters.apply}
                    </button>
                </div>
            </GlassCard>
            )}

            <div className="flex flex-col items-center justify-start gap-6">
                {potentialRoommates.length > 0 ? (
                    currentIndex < potentialRoommates.length ? (
                        <>
                            <div className="w-full max-w-md">
                                <UserProfileCard 
                                    user={potentialRoommates[currentIndex]} 
                                    onCompatibilityClick={() => handleShowCompatibility(potentialRoommates[currentIndex])}
                                    onViewProfile={() => onOpenDiscoverProfile?.(potentialRoommates[currentIndex], { queue: potentialRoommates, index: currentIndex, source: 'discover' })}
                                    variant="compact"
                                    actions={
                                        <div className="flex w-full flex-col gap-3 pt-3 sm:flex-row">
                                            <button
                                                onClick={handleNext}
                                                className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/15 sm:flex-1"
                                            >
                                                {discoverCopy.actions.next ?? 'Siguiente'}
                                            </button>
                                            <button
                                                onClick={() => onOpenDiscoverProfile?.(potentialRoommates[currentIndex], { queue: potentialRoommates, index: currentIndex, source: 'discover' })}
                                                className="w-full rounded-full border border-white/15 bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 sm:flex-1"
                                            >
                                                {discoverCopy.actions.viewLabel}
                                            </button>
                                            <button
                                                onClick={handleLike}
                                                className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 sm:flex-1"
                                            >
                                                {discoverCopy.actions.connectLabel}
                                            </button>
                                        </div>
                                    }
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center flex-grow">
                            <GlassCard>
                                <p className="text-center text-white/70">{discoverCopy.actions.allSeen}</p>
                            </GlassCard>
                        </div>
                    )
                ) : (
                    <div className="flex items-center justify-center flex-grow">
                        <GlassCard>
                            <p className="text-center text-white/70">{discoverCopy.actions.noResults}</p>
                        </GlassCard>
                    </div>
                )}
            </div>
        </>
    );

    const renderPropertiesView = () => (
        <>
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white">{propertiesCopy.title}</h2>
                    <p className="text-white/70 mt-2">{propertiesCopy.subtitle}</p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                    <button onClick={() => setSaveSearchModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">{propertiesCopy.saveSearch}</button>
                    <button
                        onClick={() => setShowPropertyFilters(prev => !prev)}
                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                    >
                        {showPropertyFilters ? propertiesCopy.toggleHide : propertiesCopy.toggleShow}
                    </button>
                    <button
                        onClick={() => {
                            resetPropertyFilters();
                            setShowPropertyFilters(true);
                        }}
                        className="hidden sm:inline-flex rounded-full border border-transparent bg-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/20"
                    >
                        {propertiesCopy.reset}
                    </button>
                </div>
            </div>
            
            {showPropertyFilters && (
            <GlassCard className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="cityFilter" className="block text-xs font-medium text-white/70 mb-1">{propertiesCopy.filters.cityLabel}</label>
                        <select id="cityFilter" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">{propertiesCopy.filters.cityAny}</option>{Object.keys(CITIES_DATA).map(c => <option key={c} value={c} className="bg-gray-800 text-white">{c}</option>)}</select>
                    </div>
                     <div>
                        <label htmlFor="localityFilter" className="block text-xs font-medium text-white/70 mb-1">{propertiesCopy.filters.localityLabel}</label>
                        <select id="localityFilter" value={localityFilter} onChange={e => setLocalityFilter(e.target.value)} disabled={!cityFilter} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none disabled:opacity-50 text-white"><option value="" className="bg-gray-800 text-white">{propertiesCopy.filters.localityAny}</option>{localitiesForFilter.map(l => <option key={l} value={l} className="bg-gray-800 text-white">{l}</option>)}</select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">{propertiesCopy.filters.priceLabel}</label>
                        <div className="flex gap-2">
                           <input type="number" placeholder={propertiesCopy.filters.minPlaceholder} value={minPriceFilter} onChange={e => setMinPriceFilter(e.target.value)} className="w-1/2 bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60" />
                           <input type="number" placeholder={propertiesCopy.filters.maxPlaceholder} value={maxPriceFilter} onChange={e => setMaxPriceFilter(e.target.value)} className="w-1/2 bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white placeholder:text-white/60" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="propertyTypeFilter" className="block text-xs font-medium text-white/70 mb-1">{propertiesCopy.filters.typeLabel}</label>
                        <select id="propertyTypeFilter" value={propertyTypeFilter} onChange={e => setPropertyTypeFilter(e.target.value as PropertyType)} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-sm outline-none text-white"><option value="" className="bg-gray-800 text-white">{propertiesCopy.filters.typeAny}</option>{Object.values(PropertyType).map(t => <option key={t} value={t} className="bg-gray-800 text-white">{t}</option>)}</select>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <label className="block text-xs font-medium text-white/70 mb-2">{propertiesCopy.filters.amenitiesLabel}</label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_AMENITIES.slice(0, 6).map(amenity => (
                             <button key={amenity.id} type="button" onClick={() => handleAmenityToggle(amenity.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors border ${amenitiesFilter.includes(amenity.id) ? 'bg-indigo-500 border-indigo-400' : 'bg-white/10 border-transparent hover:bg-white/20'}`}>{React.cloneElement(amenity.icon, {className: 'w-4 h-4'})}<span>{amenity.label}</span></button>
                        ))}
                    </div>
                </div>
                <div className="mt-8">
                    <GlassCard className="bg-white/5 border-white/15 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3 text-sm text-white/80">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400/70 to-sky-400/70">
                                    <CompassIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-base font-semibold text-white mb-1">Dibuja tu zona de búsqueda</h4>
                                    <p className="text-white/65">
                                        {customAreaPath && customAreaPath.length > 2
                                            ? 'Mostrando solo propiedades dentro de la zona dibujada. Puedes volver a dibujarla o quitarla cuando quieras.'
                                            : 'Elige exactamente el área donde quieres vivir trazando un polígono sobre el mapa. Ideal para barrios o calles concretas.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {customAreaPath && customAreaPath.length > 2 && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/60 px-3 py-1 text-xs text-indigo-100">
                                        Zona personalizada ({customAreaPath.length} puntos)
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setDrawAreaOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/20"
                                >
                                    {customAreaPath && customAreaPath.length > 2 ? 'Redibujar zona' : 'Empezar a dibujar'}
                                </button>
                                {customAreaPath && customAreaPath.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setCustomAreaPath(null)}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/15"
                                    >
                                        Quitar filtro
                                    </button>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button onClick={resetPropertyFilters} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20">
                        {propertiesCopy.resetFilters}
                    </button>
                    <button
                        onClick={() => setShowPropertyFilters(false)}
                        className="rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-indigo-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50"
                    >
                        {propertiesCopy.apply}
                    </button>
                </div>
            </GlassCard>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white">{propertiesCopy.saved.title}</h3>
                {savedSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {savedSearches.map(s => (
                            <div key={s.id} className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                                <span>{s.name}</span>
                                <button onClick={() => onDeleteSearch(s.id)} className="text-white/50 hover:text-white" aria-label={propertiesCopy.saved.deleteAria.replace('{name}', s.name)}><XIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-white/60">{propertiesCopy.savedEmpty}</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.length > 0 ? (
                    filteredProperties.map(prop => <PropertyCard key={prop.id} property={prop} onCardClick={handlePropertyClick} />)
                ) : (
                    <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">{propertiesCopy.noResults}</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderMatchesView = () => (
         <>
            <h2 className="text-3xl font-bold mb-6 text-white">{matchesCopy.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mutualMatches.length > 0 ? mutualMatches.map((u, idx) => (
                    <UserProfileCard 
                        key={u.id} 
                        user={u}
                        onCompatibilityClick={() => handleShowCompatibility(u)}
                        onViewProfile={() => onOpenDiscoverProfile?.(u, { queue: mutualMatches, index: idx, source: 'matches' })}
                    />
                )) : (
                     <GlassCard className="md:col-span-2 lg:col-span-3 min-h-[200px] flex items-center justify-center">
                        <p className="text-center text-white/70">{matchesCopy.empty}</p>
                    </GlassCard>
                )}
            </div>
        </>
    );

    const renderPropertyDetailView = () => {
        if (!selectedProperty) return null;

        const images = (selectedProperty.image_urls && selectedProperty.image_urls.length > 0)
            ? selectedProperty.image_urls
            : getCozyGallery(selectedProperty);
        const totalImages = images.length;
        const currentImage = images[propertyImageIndex % totalImages];
        const formattedAvailableDate = selectedProperty.available_from
            ? new Date(selectedProperty.available_from).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })
            : null;
        const availabilityLabel = formattedAvailableDate
            ? propertyDetailCopy.availablePrefix.replace('{date}', formattedAvailableDate)
            : propertyDetailCopy.availableUnknown;

        const handleSendInterest = () => {
            onSendInterest(selectedProperty.id);
            setInterestSent(true);
        };

        const handlePrevImage = () => {
            setPropertyImageIndex(prev => (prev - 1 + totalImages) % totalImages);
        };

        const handleNextImage = () => {
            setPropertyImageIndex(prev => (prev + 1) % totalImages);
        };
        
        const availableAmenities = AVAILABLE_AMENITIES.filter(amenity => selectedProperty.features && selectedProperty.features[amenity.id]);
        const fullAddress = [selectedProperty.address, selectedProperty.locality, selectedProperty.city, selectedProperty.postal_code].filter(Boolean).join(', ');

        return (
            <div>
                <BackButton onClick={() => setView('properties')} text={propertyDetailCopy.back} />
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="relative rounded-[32px] overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl">
                        <div className="relative h-[260px] sm:h-[360px] md:h-[420px]">
                            <img
                                src={currentImage}
                                alt={propertyDetailCopy.imageAltTemplate
                                    .replace('{title}', selectedProperty.title)
                                    .replace('{index}', String(propertyImageIndex + 1))}
                                className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            {totalImages > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 transition"
                                        aria-label={propertyDetailCopy.photoPrev}
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 transition"
                                        aria-label={propertyDetailCopy.photoNext}
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                {images.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                                            idx === propertyImageIndex ? 'bg-white' : 'bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="absolute bottom-6 left-6 text-white">
                                <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{selectedProperty.title}</h2>
                                <p className="text-sm sm:text-base text-white/80">{fullAddress}</p>
                            </div>
                            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur rounded-full px-4 py-2 text-white text-sm font-semibold">
                                €{selectedProperty.price}{propertyDetailCopy.priceSuffix}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                                        {selectedProperty.property_type}
                                    </span>
                                    {selectedProperty.bathrooms != null && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                                            {propertyDetailCopy.bathroomLabel.replace('{count}', String(selectedProperty.bathrooms))}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                                        {availabilityLabel}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSendInterest}
                                    disabled={interestSent}
                                    className={`inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                                        interestSent
                                            ? 'bg-emerald-500/30 text-emerald-100 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                                    }`}
                                >
                                    {interestSent ? (
                                        <>
                                            <CheckIcon className="w-5 h-5" /> {propertyDetailCopy.interestSent}
                                        </>
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="w-5 h-5" /> {propertyDetailCopy.sendInterest}
                                        </>
                                    )}
                                </button>
                            </div>

                            {selectedProperty.conditions && (
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white">{propertyDetailCopy.ownerConditions}</h3>
                                    <p className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 whitespace-pre-line">
                                        {selectedProperty.conditions}
                                    </p>
                                </div>
                            )}

                            {availableAmenities.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-white">{propertyDetailCopy.amenitiesTitle}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {availableAmenities.map(amenity => (
                                            <div key={amenity.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90">
                                                {React.cloneElement(amenity.icon, { className: 'w-5 h-5 text-indigo-300 flex-shrink-0' })}
                                                <span className="text-sm">{amenity.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <GlassCard className="bg-white/5 border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-2">{propertyDetailCopy.summaryTitle}</h3>
                                    <ul className="space-y-1 text-sm text-white/75">
                                        <li><strong>{propertyDetailCopy.summary.visibility}:</strong> {selectedProperty.visibility}</li>
                                        <li>
                                            <strong>{propertyDetailCopy.summary.status}:</strong>{' '}
                                            {selectedProperty.status === 'approved'
                                                ? propertyDetailCopy.summary.statusValues.approved
                                                : selectedProperty.status}
                                        </li>
                                        <li><strong>{propertyDetailCopy.summary.candidates}:</strong> {selectedProperty.compatible_candidates ?? 0}</li>
                                    </ul>
                                </GlassCard>

                                {selectedProperty.lat != null && selectedProperty.lng != null && (
                                    <GlassCard className="bg-white/5 border-white/10 overflow-hidden">
                                        <h3 className="text-lg font-semibold text-white mb-2">{propertyDetailCopy.locationTitle}</h3>
                                        <div className="rounded-2xl overflow-hidden border border-white/10">
                                            <GoogleMap lat={selectedProperty.lat} lng={selectedProperty.lng} />
                                        </div>
                                    </GlassCard>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
        <div className="relative flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-lg md:px-6">
                <div className="flex items-center gap-2">
                    <MoonIcon className="w-7 h-7 text-white" />
                    <span className="text-xl font-bold text-white">{tenantCopy.header.title}</span>
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
                <div className="flex items-center gap-3">
                    <NotificationBell notifications={notifications} onMarkAsRead={onNotificationRead} onOpenCenter={onNotificationsOpened} />
                    <ProfileDropdown user={user} onLogout={onLogout} onAccountSettings={onGoToAccountSettings} />
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                 <div className="relative z-10 px-4 pb-[7.5rem] pt-6 md:px-6 md:pb-[6rem] md:pt-8">
                    {renderContent()}
                </div>
            </main>
            
            <CompatibilityModal 
                isOpen={!!compatibilityUser}
                onClose={handleCloseCompatibility}
                currentUser={user}
                otherUser={compatibilityUser}
                breakdown={compatibilityUser ? calculateCompatibilityBreakdown(user, compatibilityUser, compatibilityLabels) : []}
                copy={compatibilityModalCopy}
            />

            <SaveSearchModal
                isOpen={isSaveSearchModalOpen}
                onClose={() => setSaveSearchModalOpen(false)}
                onSave={handleSaveSearch}
                copy={saveSearchModalCopy}
            />
            <DrawAreaModal
                isOpen={isDrawAreaOpen}
                onClose={() => setDrawAreaOpen(false)}
                initialPath={customAreaPath || undefined}
                onSave={(path) => setCustomAreaPath(path.length > 2 ? path : null)}
            />
            <BottomNavBar activeView={view} setView={setView} onGoToAccountSettings={onGoToAccountSettings} navItems={navItems} profileLabel={bottomProfileLabel} />
        </div>
    );
};

export default TenantDashboard;
