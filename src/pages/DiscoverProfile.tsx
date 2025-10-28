import React, { useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { SparklesIcon, ShieldCheckIcon, CompassIcon, AVAILABLE_AMENITIES } from '../components/icons';
import { User, RentalGoal, UserRole, HostListing } from '../types';

type BreakdownItem = { name: string; score: number; maxScore: number };

interface DiscoverProfilePageProps {
    onBack: () => void;
    onLoginClick: () => void;
    onRegisterClick?: () => void;
    onOwnersClick: () => void;
    onBlogClick: () => void;
    onAboutClick: () => void;
    onPrivacyClick: () => void;
    onTermsClick: () => void;
    onContactClick: () => void;
    onSilverClick?: () => void;
    onCalculadoraClick?: () => void;
    onAmbassadorsClick?: () => void;
    onReferFriendsClick?: () => void;
    onBlueprintClick?: () => void;
    profile?: User | null;
    hostListings?: HostListing[];
    viewer?: User | null;
    compatibilityBreakdown?: BreakdownItem[];
    onSkip?: () => void;
    onLike?: (user: User) => Promise<void> | void;
    isAuthenticated?: boolean;
    onAccountClick?: () => void;
    onAccountSettings?: () => void;
    onLogout?: () => void;
}

const rentalGoalMap: { [key in RentalGoal]?: string } = {
    [RentalGoal.FIND_ROOMMATES_AND_APARTMENT]: 'Busca compañeros y piso',
    [RentalGoal.FIND_ROOM_WITH_ROOMMATES]: 'Busca habitación',
    [RentalGoal.BOTH]: 'Busca compañero o habitación',
};

const AMENITY_LABEL_LOOKUP: Record<string, string> = AVAILABLE_AMENITIES.reduce(
    (acc, amenity) => ({
        ...acc,
        [amenity.id]: amenity.label,
    }),
    {} as Record<string, string>,
);

const fallbackProfile = {
    name: 'Laura Campos',
    age: 28,
    city: 'Barcelona',
    roleLine: 'Investigadora UX · Barcelona',
    biography:
        'Diseñadora de productos digitales y yogui de mañanas. Busco un hogar luminoso con personas respetuosas, que valoren los espacios tranquilos y las sobremesas improvisadas.',
    highlights: ['Mañanera', 'Veggie friendly', 'Trabajo remoto', 'Niveles de ruido bajos'],
    lifestyle: [
        { label: 'Orden y limpieza', value: 'Compartimos calendario semanal de tareas, sin dramas.' },
        { label: 'Social', value: 'Cena conjunta los miércoles + peli o paseo.' },
        { label: 'Convivencia', value: 'Amantes de las plantas, terrazas y el café recién molido.' },
    ],
    compatibility: [
        { name: 'Hábitos y rutinas', score: 23, maxScore: 30 },
        { name: 'Horarios', score: 18, maxScore: 20 },
        { name: 'Estilo social', score: 15, maxScore: 20 },
        { name: 'Valores', score: 18, maxScore: 20 },
    ] as BreakdownItem[],
    gallery: [
        'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=480',
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=480',
        'https://images.pexels.com/photos/2649403/pexels-photo-2649403.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=480',
    ],
    preferences: [
        { label: 'Presupuesto', value: 'Hasta 750 € / mes' },
        { label: 'Estancia', value: 'Mínimo 12 meses' },
        { label: 'Mudanza', value: 'Flexible a partir de Abril' },
        { label: 'Busca', value: 'Piso compartido con 2 personas como máximo' },
    ],
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DiscoverProfilePage: React.FC<DiscoverProfilePageProps> = ({
    profile,
    hostListings = [],
    viewer,
    compatibilityBreakdown,
    onSkip,
    onLike,
    isAuthenticated,
    onAccountClick,
    onAccountSettings,
    onLogout,
    ...props
}) => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [profile?.id]);

    const isHostProfile = profile?.role === UserRole.ANFITRION;

    const activeHostListings = useMemo(() => {
        if (!isHostProfile || !profile?.id) return [];
        return hostListings
            .filter(listing => listing.host_id === profile.id)
            .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime());
    }, [hostListings, isHostProfile, profile?.id]);

    const primaryListing = activeHostListings[0] ?? null;
    const secondaryListings = activeHostListings.slice(1);

    const gallerySources = useMemo(() => {
        if (!isHostProfile) return fallbackProfile.gallery;
        const unique = new Set<string>();
        activeHostListings.forEach(listing => {
            listing.image_urls?.forEach(url => {
                if (url) unique.add(url);
            });
        });
        if (unique.size === 0) return fallbackProfile.gallery;
        return Array.from(unique);
    }, [activeHostListings, isHostProfile]);

    const hostAmenities = useMemo(() => {
        if (!primaryListing?.amenities) return [];
        return Object.entries(primaryListing.amenities)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => AMENITY_LABEL_LOOKUP[key] ?? key);
    }, [primaryListing?.amenities]);

    const hostAvailabilityLabel = primaryListing?.available_from ? formatDate(primaryListing.available_from) : undefined;
    const hostLocation = primaryListing
        ? [primaryListing.locality, primaryListing.city].filter(Boolean).join(' · ')
        : undefined;

    const cityLine = useMemo(() => {
        if (!profile) return `${fallbackProfile.city}`;
        const parts = [profile.locality, profile.city].filter(Boolean);
        return parts.length ? parts.join(' · ') : profile.city || fallbackProfile.city;
    }, [profile]);

    const rentalGoalLabel = profile?.rental_goal ? rentalGoalMap[profile.rental_goal] : undefined;

    const summaryItems = useMemo(() => {
        const items: string[] = [];
        items.push(cityLine);
        if (profile?.age) items.push(`${profile.age} años`);
        if (rentalGoalLabel && !isHostProfile) items.push(rentalGoalLabel);
        if (profile?.budget) items.push(`Presupuesto máx: ${profile.budget.toLocaleString()} € / mes`);
        if (profile?.noise_level) items.push(`Nivel de ruido: ${profile.noise_level}`);
        if (profile?.lifestyle?.length) items.push(`Estilo de vida: ${profile.lifestyle.slice(0, 3).join(', ')}`);

        if (isHostProfile && primaryListing) {
            if (primaryListing.room_type) items.push(primaryListing.room_type);
            if (primaryListing.price) items.push(`Habitación · ${formatCurrency(primaryListing.price)}`);
            if (hostAvailabilityLabel) items.push(`Disponible ${hostAvailabilityLabel}`);
            if (hostLocation) items.push(`Ubicación: ${hostLocation}`);
        }

        return items.filter(Boolean);
    }, [profile, cityLine, rentalGoalLabel, isHostProfile, primaryListing, hostAvailabilityLabel, hostLocation]);

    const highlightChips = useMemo(() => {
        const chips = new Set<string>();
        if (rentalGoalLabel && !isHostProfile) chips.add(rentalGoalLabel);
        if (profile?.budget) chips.add(`Presupuesto: ${formatCurrency(profile.budget)}`);
        if (profile?.noise_level) chips.add(`Prefiere ruido ${profile.noise_level.toLowerCase()}`);
        profile?.lifestyle?.slice(0, 3).forEach(item => chips.add(item));
        profile?.interests?.slice(0, 3).forEach(item => chips.add(item));
        if (isHostProfile && primaryListing) {
            if (primaryListing.price) chips.add(`Alquiler ${formatCurrency(primaryListing.price)}`);
            if (primaryListing.room_type) chips.add(primaryListing.room_type);
            if (hostAvailabilityLabel) chips.add(`Disponible ${hostAvailabilityLabel}`);
        }
        if (chips.size === 0) {
            fallbackProfile.highlights.forEach(item => chips.add(item));
        }
        return Array.from(chips);
    }, [profile, rentalGoalLabel, isHostProfile, primaryListing, hostAvailabilityLabel]);

    const lifestyleCards = useMemo(() => {
        if (profile?.lifestyle?.length) {
            return profile.lifestyle.slice(0, 3).map(item => ({
                label: item,
                value: 'Afinidad alta en este hábito cotidiano.',
            }));
        }
        return fallbackProfile.lifestyle;
    }, [profile?.lifestyle]);

    const interestTags = useMemo(() => {
        if (profile?.interests?.length) {
            return profile.interests.slice(0, 6);
        }
        return ['Cocina en casa', 'Yoga', 'Trabajo híbrido', 'Arte & Diseño', 'Naturaleza'];
    }, [profile?.interests]);

    const preferences = useMemo(() => {
        const prefs: Array<{ label: string; value: string }> = [];
        if (profile?.budget && !isHostProfile) prefs.push({ label: 'Presupuesto', value: `Hasta ${formatCurrency(profile.budget)}` });
        if (rentalGoalLabel && !isHostProfile) prefs.push({ label: 'Busca', value: rentalGoalLabel });
        if (cityLine) prefs.push({ label: 'Zona objetivo', value: cityLine });
        if (profile?.rental_goal === RentalGoal.BOTH) {
            prefs.push({ label: 'Flexibilidad', value: 'Está abierto a diferentes formatos de convivencia.' });
        }
        if (profile?.bio?.length) {
            prefs.push({ label: 'Biografía', value: `${profile.bio.length} caracteres de historia personal.` });
        }
        if (isHostProfile && primaryListing) {
            prefs.push({ label: 'Tipo de habitación', value: primaryListing.room_type });
            if (primaryListing.price) prefs.push({ label: 'Precio mensual', value: formatCurrency(primaryListing.price) });
            if (hostLocation) prefs.push({ label: 'Ubicación', value: hostLocation });
            if (hostAvailabilityLabel) prefs.push({ label: 'Disponibilidad', value: hostAvailabilityLabel });
            if (primaryListing.conditions) prefs.push({ label: 'Condiciones', value: primaryListing.conditions });
        }
        if (!prefs.length) {
            return fallbackProfile.preferences;
        }
        return prefs;
    }, [profile, rentalGoalLabel, cityLine, isHostProfile, primaryListing, hostAvailabilityLabel, hostLocation]);

    const biography = profile?.bio?.trim() || fallbackProfile.biography;

    const baseBreakdown = useMemo<BreakdownItem[]>(() => {
        if (compatibilityBreakdown?.length) {
            return compatibilityBreakdown.map(item => ({ ...item }));
        }
        return fallbackProfile.compatibility;
    }, [compatibilityBreakdown]);

    const breakdown = useMemo(() => {
        const items = [...baseBreakdown];
        if (profile?.bio?.trim()) {
            const bioScore = Math.min(20, Math.round(Math.min(profile.bio.length, 400) / 400 * 20));
            items.push({ name: 'Biografía y convivencia', score: bioScore, maxScore: 20 });
        }
        if (isHostProfile && primaryListing?.description) {
            items.push({ name: 'Detalles del hogar', score: 18, maxScore: 20 });
        }
        return items;
    }, [baseBreakdown, profile?.bio, isHostProfile, primaryListing?.description]);

    const compatibilityPercent = useMemo(() => {
        if (typeof profile?.compatibility === 'number') {
            return profile.compatibility;
        }
        const total = breakdown.reduce((sum, item) => sum + item.score, 0);
        const max = breakdown.reduce((sum, item) => sum + item.maxScore, 0);
        return max > 0 ? Math.min(99, Math.round((total / max) * 100)) : 90;
    }, [profile?.compatibility, breakdown]);

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            props.onBack();
        }
    };

    const handleLike = () => {
        if (profile && onLike) {
            void Promise.resolve(onLike(profile));
        } else {
            props.onBack();
        }
    };

    const headerAuthenticated = isAuthenticated ?? !!viewer;

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
            <Header
                reserveSpace={false}
                onLoginClick={props.onLoginClick}
                onRegisterClick={props.onRegisterClick}
                onHomeClick={props.onBack}
                onOwnersClick={props.onOwnersClick}
                onBlogClick={props.onBlogClick}
                onSilverClick={props.onSilverClick}
                onCalculadoraClick={props.onCalculadoraClick}
                onAmbassadorsClick={props.onAmbassadorsClick}
                onReferFriendsClick={props.onReferFriendsClick}
                onBlueprintClick={props.onBlueprintClick}
                onAccountClick={onAccountClick}
                onAccountSettings={onAccountSettings}
                onLogout={onLogout}
                isAuthenticated={headerAuthenticated}
                pageContext="inquilino"
            />

            <main className="flex-grow">
                <section className="relative py-16 sm:py-20 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    </div>

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <button
                            type="button"
                            onClick={props.onBack}
                            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm"
                        >
                            ← Volver al Discover
                        </button>

                        <GlassCard className="space-y-8 border-white/20 bg-white/10 p-5 sm:p-8 lg:p-10 backdrop-blur-xl">
                            <div className="flex flex-col xl:flex-row gap-10 items-start">
                                <div className="w-full xl:w-1/3 space-y-6">
                                    {isHostProfile && primaryListing && (
                                        <div className="space-y-3 rounded-3xl border border-white/15 bg-black/20 p-5">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                                        Habitación disponible
                                                    </p>
                                                    <h3 className="mt-1 text-2xl font-semibold text-white leading-tight">
                                                        {primaryListing.title}
                                                    </h3>
                                                    <p className="text-sm text-white/70">
                                                        {primaryListing.room_type}
                                                        {hostLocation ? ` · ${hostLocation}` : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-start sm:items-end gap-1">
                                                    {primaryListing.price && (
                                                        <span className="text-2xl font-bold text-white">
                                                            {formatCurrency(primaryListing.price)}
                                                        </span>
                                                    )}
                                                    {hostAvailabilityLabel && (
                                                        <span className="text-xs text-white/60">
                                                            Disponible desde {hostAvailabilityLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {primaryListing.description && (
                                                <p className="text-sm text-white/75 leading-relaxed">
                                                    {primaryListing.description}
                                                </p>
                                            )}
                                            {hostAmenities.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {hostAmenities.map(amenity => (
                                                        <span
                                                            key={amenity}
                                                            className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100 border border-indigo-400/40"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative sm:pb-10">
                                        <img
                                            src={profile?.avatar_url || fallbackProfile.gallery[0]}
                                            alt={profile?.name || fallbackProfile.name}
                                            className="w-full rounded-3xl object-cover shadow-2xl border border-white/10"
                                        />
                                        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-3 py-1 text-sm font-semibold text-emerald-950 shadow">
                                            <ShieldCheckIcon className="w-4 h-4" />
                                            Perfil verificado
                                        </span>
                                        <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-xl sm:absolute sm:-bottom-6 sm:right-6 sm:mt-0">
                                            {compatibilityPercent}% compatibilidad
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-white leading-tight">
                                                {profile?.name || fallbackProfile.name}{' '}
                                                <span className="text-white/70 font-light">
                                                    · {profile?.age || fallbackProfile.age}
                                                </span>
                                            </h2>
                                            <p className="mt-2 text-white/70 text-sm flex items-center gap-2">
                                                <CompassIcon className="w-4 h-4" />
                                                {summaryItems[0]}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {highlightChips.map(chip => (
                                                <span
                                                    key={chip}
                                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 border border-white/15"
                                                >
                                                    <SparklesIcon className="w-4 h-4 text-indigo-200" />
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="space-y-2 text-sm text-white/80 bg-white/5 border border-white/10 rounded-3xl p-5">
                                            <h3 className="text-white font-semibold">Resumen rápido</h3>
                                            <ul className="space-y-1">
                                                {summaryItems.slice(1).map(item => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
                                                Intereses
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {interestTags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="bg-indigo-500/20 text-indigo-100 text-xs font-medium px-3 py-1 rounded-full border border-indigo-400/30"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {isHostProfile && gallerySources.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                                                    Galería de la habitación
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {gallerySources.map((url, index) => (
                                                        <div
                                                            key={`${url}-${index}`}
                                                            className={`overflow-hidden rounded-2xl border border-white/10 bg-black/20 ${index === 0 ? 'col-span-2 sm:col-span-2' : ''
                                                                }`}
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Foto habitación ${index + 1}`}
                                                                className="h-32 w-full object-cover sm:h-36"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                                            {viewer ? 'Así podría ser vuestra convivencia' : 'Sobre Laura'}
                                        </h3>
                                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                                            {biography}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {lifestyleCards.map(({ label, value }) => (
                                            <GlassCard key={label} className="bg-white/10 border-white/20 p-5 space-y-2">
                                                <div className="flex items-center gap-3 text-white">
                                                    <SparklesIcon className="w-5 h-5 text-indigo-300" />
                                                    <span className="font-semibold">{label}</span>
                                                </div>
                                                <p className="text-sm text-white/75">{value}</p>
                                            </GlassCard>
                                        ))}
                                    </div>

                                    <div className="bg-white/10 border border-white/20 rounded-3xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Compatibilidad desglosada</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {breakdown.map(({ name, score, maxScore }) => {
                                                const percent = Math.round((score / maxScore) * 100);
                                                return (
                                                    <div key={name} className="space-y-2">
                                                        <div className="flex justify-between text-sm text-white/80">
                                                            <span>{name}</span>
                                                            <span>{percent}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-white/10 border border-white/20 rounded-3xl p-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-white">Preferencias clave</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {preferences.map(pref => (
                                                <div
                                                    key={`${pref.label}-${pref.value}`}
                                                    className="rounded-2xl border border-white/10 bg-black/15 p-4"
                                                >
                                                    <span className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">
                                                        {pref.label}
                                                    </span>
                                                    <p className="mt-2 text-sm text-white/80">{pref.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {isHostProfile && secondaryListings.length > 0 && (
                                        <div className="rounded-3xl border border-white/15 bg-white/5 p-5 space-y-3">
                                            <h3 className="text-lg font-semibold text-white">Otras habitaciones del anfitrión</h3>
                                            <div className="space-y-3">
                                                {secondaryListings.map(listing => (
                                                    <div
                                                        key={listing.id}
                                                        className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-white leading-tight">{listing.title}</p>
                                                            <p className="text-xs text-white/60">
                                                                {listing.room_type}
                                                                {listing.available_from
                                                                    ? ` · Disponible ${formatDate(listing.available_from)}`
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        {listing.price && (
                                                            <span className="text-sm font-semibold text-white/80">
                                                                {formatCurrency(listing.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleSkip}
                                            className="flex-1 rounded-full border border-white/20 bg-white/10 py-3 text-sm font-semibold text-white/80 hover:bg-white/20 transition"
                                        >
                                            Pasar a la siguiente
                                        </button>
                                        <button
                                            onClick={handleLike}
                                            className="flex-1 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition"
                                        >
                                            Me interesa convivir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </section>
            </main>

            <Footer
                onBlogClick={props.onBlogClick}
                onAboutClick={props.onAboutClick}
                onPrivacyClick={props.onPrivacyClick}
                onTermsClick={props.onTermsClick}
                onContactClick={props.onContactClick}
                onSilverClick={props.onSilverClick}
                onOwnersClick={props.onOwnersClick}
                onAmbassadorsClick={props.onAmbassadorsClick}
                onReferFriendsClick={props.onReferFriendsClick}
                onBlueprintClick={props.onBlueprintClick}
            />
        </div>
    );
};

export default DiscoverProfilePage;
