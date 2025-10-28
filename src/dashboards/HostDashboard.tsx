import React, { useMemo, useState, useCallback, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { HostListing, User, Notification } from '../types';
import { PlusIcon, HomeIcon, UserCircleIcon, LogoutIcon, CompassIcon, PencilIcon, XIcon, ChevronLeftIcon } from '../components/icons';
import { useI18n } from '../i18n';
import NotificationBell from '../components/NotificationBell';

interface HostDashboardProps {
    user: User;
    listings: HostListing[];
    onCreateListing: () => void;
    onEditListing: (listing: HostListing) => void;
    onGoToDiscover: () => void;
    onGoToAccountSettings: () => void;
    onLogout: () => void;
    notifications: Notification[];
    onNotificationRead?: (id: number) => void;
    onNotificationsOpened?: () => void;
    onResumeOnboarding?: () => void;
}

const FALLBACK_GALLERIES: string[][] = [
    [
        'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1464131065363-9e30be8892b4?auto=format&fit=crop&w=1200&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522156373667-4c7234bbd804?auto=format&fit=crop&w=1200&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    ],
];

const BottomNavBar = ({
    onCreateListing,
    onGoToDiscover,
    onGoToAccountSettings,
    primaryLabel,
    discoverLabel,
    profileLabel,
}: {
    onCreateListing: () => void;
    onGoToDiscover: () => void;
    onGoToAccountSettings: () => void;
    primaryLabel: string;
    discoverLabel: string;
    profileLabel: string;
}) => (
    <div className="fixed inset-x-0 bottom-0 z-40 grid h-20 grid-cols-4 items-center border-t border-white/15 bg-black/80 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:px-10">
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-white/80 transition-colors hover:text-white"
        >
            <HomeIcon className="h-6 w-6" />
            <span>{primaryLabel}</span>
        </button>
        <button
            onClick={onCreateListing}
            className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-white transition-colors hover:text-indigo-200"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-indigo-400 bg-indigo-600 shadow-lg">
                <PlusIcon className="h-7 w-7" />
            </div>
            <span>Nuevo</span>
        </button>
        <button
            onClick={onGoToDiscover}
            className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-white/80 transition-colors hover:text-white"
        >
            <CompassIcon className="h-6 w-6" />
            <span>{discoverLabel}</span>
        </button>
        <button
            onClick={onGoToAccountSettings}
            className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-white/80 transition-colors hover:text-white"
        >
            <UserCircleIcon className="h-6 w-6" />
            <span>{profileLabel}</span>
        </button>
    </div>
);

const HostDashboard: React.FC<HostDashboardProps> = ({
    user,
    listings,
    onCreateListing,
    onEditListing,
    onGoToDiscover,
    onGoToAccountSettings,
    onLogout,
    notifications,
    onNotificationRead,
    onNotificationsOpened,
    onResumeOnboarding,
}) => {
    const { scope } = useI18n();
    const copy = scope<any>('hostDashboard') || {};
    const header = copy.header || {};
    const empty = copy.empty || {};
    const listCopy = copy.list || {};
    const firstName = user.name?.split(' ')[0] || user.name;

    const hasListings = listings.length > 0;

    const hostNextSteps = useMemo(() => {
        const steps: Array<{ id: string; title: string; description: string; actionLabel: string; onAction: () => void }> = [];
        if (user.onboarding_status !== 'completed' && onResumeOnboarding) {
            steps.push({
                id: 'host-onboarding',
                title: 'Termina tu onboarding de anfitrión',
                description: 'Nos ayuda a mostrar tu espacio a las personas adecuadas.',
                actionLabel: 'Retomar onboarding',
                onAction: onResumeOnboarding,
            });
        }
        if (!hasListings) {
            steps.push({
                id: 'create-listing',
                title: 'Crea tu primera habitación',
                description: 'Publica fotos y condiciones para empezar a recibir interesados.',
                actionLabel: 'Crear habitación',
                onAction: onCreateListing,
            });
        } else {
            const pending = listings.filter((listing) => listing.status !== 'approved');
            if (pending.length > 0) {
                steps.push({
                    id: 'listing-review',
                    title: 'Habitaciones en revisión',
                    description: `${pending.length} anuncio${pending.length === 1 ? '' : 's'} está${pending.length === 1 ? '' : 'n'} pendiente${pending.length === 1 ? '' : 's'} de aprobación.` ,
                    actionLabel: 'Ver habitaciones',
                    onAction: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                });
            }
        }
        const unread = notifications.filter((notification) => !notification.read_at).length;
        if (unread > 0) {
            steps.push({
                id: 'host-notifications',
                title: 'Novedades pendientes',
                description: `${unread} notificación${unread === 1 ? '' : 'es'} sin revisar.`,
                actionLabel: 'Abrir centro',
                onAction: () => onNotificationsOpened?.(),
            });
        }
        return steps;
    }, [user.onboarding_status, onResumeOnboarding, hasListings, listings, notifications, onNotificationsOpened, onCreateListing]);
    const [preview, setPreview] = useState<{ listing: HostListing; index: number; images: string[] } | null>(null);

    useEffect(() => {
        if (preview) {
            const original = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = original;
            };
        }
        return undefined;
    }, [preview]);

    const getGalleryImages = useCallback((listing: HostListing) => {
        if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
            return listing.image_urls;
        }
        const index =
            typeof listing.id === 'number'
                ? Math.abs(listing.id) % FALLBACK_GALLERIES.length
                : 0;
        return FALLBACK_GALLERIES[index];
    }, []);

    const openPreview = (listing: HostListing, startIndex: number) => {
        const images = getGalleryImages(listing);
        setPreview({ listing, index: startIndex, images });
    };

    const closePreview = () => setPreview(null);

    const showPrevious = () => {
        if (!preview) return;
        setPreview((prev) =>
            prev
                ? {
                      ...prev,
                      index: (prev.index - 1 + prev.images.length) % prev.images.length,
                  }
                : prev,
        );
    };

    const showNext = () => {
        if (!preview) return;
        setPreview((prev) =>
            prev
                ? {
                      ...prev,
                      index: (prev.index + 1) % prev.images.length,
                  }
                : prev,
        );
    };

    return (
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#1a1f3f] to-[#2b1d47] text-white">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-lg">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">
                            {header.badge || 'Modo anfitrión'}
                        </p>
                        <h1 className="text-3xl font-extrabold">
                            {(header.title && header.title.replace('{name}', firstName)) || `Hola, ${firstName}`}
                        </h1>
                        <p className="max-w-2xl text-white/70">
                            {header.subtitle || 'Comparte tu hogar publicando habitaciones y conecta con inquilinos compatibles.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <NotificationBell
                            notifications={notifications}
                            onMarkAsRead={onNotificationRead}
                            onOpenCenter={onNotificationsOpened}
                        />
                        <button
                            onClick={onCreateListing}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold shadow-lg transition-colors hover:bg-indigo-500"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>{header.actions?.create || 'Crear habitación'}</span>
                        </button>
                        <button
                            onClick={onGoToDiscover}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 font-semibold transition-colors hover:bg-white/20"
                        >
                            <CompassIcon className="h-5 w-5" />
                            <span>{header.actions?.discover || 'Descubrir inquilinos'}</span>
                        </button>
                        <button
                            onClick={onGoToAccountSettings}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 font-semibold transition-colors hover:bg-white/20"
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            <span>{header.actions?.profile || 'Editar perfil'}</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold transition-colors hover:bg-white/10"
                        >
                            <LogoutIcon className="h-5 w-5" />
                            <span>{header.actions?.logout || 'Cerrar sesión'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-[7.5rem] pt-8 md:px-6 md:pb-[6rem] md:pt-10">
                    {hostNextSteps.length > 0 && (
                        <GlassCard className="border-white/10 bg-white/5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Próximos pasos</p>
                                    <h3 className="text-lg font-semibold text-white">Optimiza tu anuncio</h3>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {hostNextSteps.map((task) => (
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
                    {hasListings ? (
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{listCopy.title || 'Mis habitaciones'}</h2>
                                <button
                                    onClick={onCreateListing}
                                    className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/20 md:inline-flex"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    <span>{header.actions?.create || 'Crear habitación'}</span>
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {listings.map((listing) => (
                                    <GlassCard key={listing.id} className="border-white/10 bg-white/5">
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => openPreview(listing, 0)}
                                                className="relative block overflow-hidden rounded-2xl border border-white/10 bg-black/20 transition hover:border-indigo-300/60"
                                                aria-label={`Ver galería de ${listing.title}`}
                                            >
                                                <img
                                                    src={getGalleryImages(listing)[0]}
                                                    alt={listing.title}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-between rounded-full border border-white/20 bg-black/55 px-4 py-1 text-xs font-semibold text-white/90">
                                                    <span>{listCopy.previewLabel || 'Ver galería'}</span>
                                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-white/70">
                                                        {getGalleryImages(listing).length} fotos
                                                    </span>
                                                </span>
                                            </button>
                                            {getGalleryImages(listing).length > 1 && (
                                                <div className="flex gap-2 overflow-x-auto pb-1">
                                                    {getGalleryImages(listing).map((image, idx) => (
                                                        <button
                                                            key={image + idx}
                                                            type="button"
                                                            onClick={() => openPreview(listing, idx)}
                                                            className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30 transition hover:border-indigo-300/60"
                                                            aria-label={`Ver imagen ${idx + 1} de ${listing.title}`}
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${listing.title} miniatura ${idx + 1}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold">{listing.title}</h3>
                                                <p className="text-sm text-white/60">
                                                    {[listing.city, listing.locality].filter(Boolean).join(' · ')}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold">
                                                {listCopy.status?.[listing.status] || listing.status}
                                            </span>
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm text-white/70">
                                            <p>
                                                <strong>{listCopy.priceLabel || 'Precio'}:</strong>{' '}
                                                {typeof listing.price === 'number'
                                                    ? `${listing.price} €/mes`
                                                    : listCopy.priceUnknown || '—'}
                                            </p>
                                            {listing.available_from && (
                                                <p>
                                                    <strong>{listCopy.availableFrom || 'Disponible desde'}:</strong>{' '}
                                                    {listing.available_from}
                                                </p>
                                            )}
                                            <p>
                                                <strong>{listCopy.visibilityLabel || 'Visibilidad'}:</strong>{' '}
                                                {listCopy.visibility?.[listing.visibility] || listing.visibility}
                                            </p>
                                            {listing.conditions && (
                                                <p className="text-white/60">{listing.conditions}</p>
                                            )}
                                        </div>
                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xs text-white/40">
                                                {listCopy.note || 'Pronto podrás editar y publicar tu habitación desde aquí.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => onEditListing(listing)}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/20"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                                {listCopy.edit || 'Editar habitación'}
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <GlassCard className="space-y-4 border-white/10 bg-white/5 py-12 text-center">
                            <div className="flex justify-center">
                                <HomeIcon className="h-12 w-12 text-indigo-300" />
                            </div>
                            <h2 className="text-2xl font-semibold">
                                {empty.title || 'Todavía no has publicado ninguna habitación.'}
                            </h2>
                            <p className="mx-auto max-w-xl text-white/70">
                                {empty.description ||
                                    'Muy pronto podrás crear tu primera publicación con fotos, amenities y reglas. Estamos ultimando la experiencia.'}
                            </p>
                            <button
                                onClick={onCreateListing}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold shadow-md transition-colors hover:bg-indigo-500"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>{empty.action || 'Crear mi primera habitación'}</span>
                            </button>
                            <button
                                onClick={onGoToDiscover}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold transition-colors hover:bg-white/20"
                            >
                                <CompassIcon className="h-5 w-5" />
                                <span>{copy.discoverCta || 'Buscar inquilinos compatibles'}</span>
                            </button>
                            <p className="text-xs text-white/40">
                                {copy.comingSoon || 'Mientras tanto, completa tu perfil y define tus preferencias de convivencia.'}
                            </p>
                        </GlassCard>
                    )}
                </div>
            </main>
            <BottomNavBar
                onCreateListing={onCreateListing}
                onGoToDiscover={onGoToDiscover}
                onGoToAccountSettings={onGoToAccountSettings}
                primaryLabel={listCopy.title || 'Mis habitaciones'}
                discoverLabel={header.actions?.discover || 'Descubrir'}
                profileLabel={header.actions?.profile || 'Perfil'}
            />
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur">
                    <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl">
                        <button
                            type="button"
                            onClick={closePreview}
                            aria-label="Cerrar galería"
                            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                        <div className="relative">
                            <img
                                src={preview.images[preview.index]}
                                alt={`${preview.listing.title} imagen ${preview.index + 1}`}
                                className="h-[48vh] w-full object-cover md:h-[60vh]"
                            />
                            {preview.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white transition hover:bg-black/60"
                                        aria-label="Imagen anterior"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white transition hover:bg-black/60"
                                        aria-label="Imagen siguiente"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5 rotate-180" />
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold text-white/80">
                                {preview.index + 1} / {preview.images.length}
                            </div>
                        </div>
                        <div className="grid gap-6 px-6 py-6 md:grid-cols-[2fr,1fr]">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-semibold">{preview.listing.title}</h3>
                                    <p className="text-sm text-white/70">
                                        {[preview.listing.address, preview.listing.locality, preview.listing.city]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                                {preview.listing.description && (
                                    <p className="text-sm text-white/75 leading-relaxed">{preview.listing.description}</p>
                                )}
                                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80">
                                    <p>
                                        <strong>{listCopy.priceLabel || 'Precio'}:</strong>{' '}
                                        {typeof preview.listing.price === 'number'
                                            ? `${preview.listing.price} €/mes`
                                            : listCopy.priceUnknown || '—'}
                                    </p>
                                    {preview.listing.available_from && (
                                        <p>
                                            <strong>{listCopy.availableFrom || 'Disponible desde'}:</strong>{' '}
                                            {preview.listing.available_from}
                                        </p>
                                    )}
                                    <p>
                                        <strong>{listCopy.visibilityLabel || 'Visibilidad'}:</strong>{' '}
                                        {listCopy.visibility?.[preview.listing.visibility] || preview.listing.visibility}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {preview.listing.conditions && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
                                        <h4 className="mb-2 text-sm font-semibold text-white">
                                            {listCopy.conditionsLabel || 'Condiciones'}
                                        </h4>
                                        <p className="whitespace-pre-line">{preview.listing.conditions}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onEditListing(preview.listing);
                                        closePreview();
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                                >
                                    {copy.modal?.detailCta || 'Ver detalle de la propiedad'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostDashboard;
