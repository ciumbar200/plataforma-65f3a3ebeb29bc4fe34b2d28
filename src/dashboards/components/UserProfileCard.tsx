import React, { useState } from 'react';
import { User, RentalGoal, UserRole } from '../../types';
import GlassCard from '../../components/GlassCard';
import { PlayIcon } from '../../components/icons';
import VideoPlayerModal from './VideoPlayerModal';
import { useI18n } from '../../i18n';

interface UserProfileCardProps {
  user: User;
  onCompatibilityClick?: () => void;
  onViewProfile?: () => void;
  variant?: 'default' | 'compact';
  actions?: React.ReactNode;
}

const rentalGoalTextMap: { [key in RentalGoal]?: string } = {
    [RentalGoal.FIND_ROOMMATES_AND_APARTMENT]: 'Busca compañeros y piso',
    [RentalGoal.FIND_ROOM_WITH_ROOMMATES]: 'Busca habitación',
    [RentalGoal.BOTH]: 'Busca compañero o habitación',
};


const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onCompatibilityClick, onViewProfile, variant = 'default', actions }) => {
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const { language } = useI18n();
    const isCompact = variant === 'compact';
    
    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user.video_url) {
            setIsPlayerOpen(true);
        }
    };
    
    const compatibilityColor = user.compatibility > 85 ? 'text-green-400' : user.compatibility > 70 ? 'text-yellow-400' : 'text-orange-400';

    return (
        <>
            <GlassCard className={`relative overflow-hidden bg-white/10 border-white/15 backdrop-blur-xl ${isCompact ? 'p-0 bg-gradient-to-br from-[#1d1540] via-[#281f5b] to-[#1a1f3f]' : ''}`}>
                <div className={`relative ${isCompact ? 'h-60 sm:h-64' : 'h-56'}`}>
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        style={isCompact ? { objectPosition: 'center 20%' } : undefined}
                    />
                    <div className={`absolute inset-0 ${isCompact ? 'bg-gradient-to-t from-[#0c041f]/90 via-[#0c041f]/40 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'}`}></div>

                    {user.is_verified && (
                        <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-3 py-1 text-xs font-semibold text-emerald-950 shadow">
                            <span aria-hidden>✔</span> Verificado
                        </span>
                    )}

                    {user.video_url && !isCompact && (
                        <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                            onClick={handlePlayClick}
                            aria-label="Reproducir vídeo de presentación"
                        >
                            <div className="bg-white/30 backdrop-blur-sm rounded-full p-4">
                                <PlayIcon className="w-10 h-10 text-white" />
                            </div>
                        </button>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="text-white">
                            <h3 className="text-2xl font-bold drop-shadow-lg">{user.name}, {user.age}</h3>
                            <p className="text-sm text-white/80">{[user.locality, user.city].filter(Boolean).join(' · ')}</p>
                            {user.role === UserRole.ANFITRION && (
                                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-300/90 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm">
                                    {language === 'en'
                                        ? 'Host · Room available'
                                        : language === 'ca'
                                        ? 'Amfitrió · Habitació disponible'
                                        : 'Anfitrión · Habitación disponible'}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onCompatibilityClick}
                            className={`text-xl font-semibold px-3 py-1 rounded-full border border-white/30 bg-white/15 ${onCompatibilityClick ? 'hover:bg-white/25 transition-colors' : 'cursor-default'} ${compatibilityColor}`}
                            disabled={!onCompatibilityClick}
                        >
                            {user.compatibility}%
                        </button>
                    </div>
                </div>

                <div className={`p-5 ${isCompact ? 'space-y-3' : 'space-y-4'}`}>
                    {user.rental_goal && rentalGoalTextMap[user.rental_goal] && (
                        <span className={`inline-flex items-center gap-2 text-xs font-semibold ${isCompact ? 'bg-indigo-500/25 text-indigo-100 px-3 py-1 rounded-full' : 'bg-indigo-500/30 text-indigo-100 px-3 py-1 rounded-full'}`}>
                            {rentalGoalTextMap[user.rental_goal]}
                        </span>
                    )}

                    <p className={`text-sm text-white/80 leading-relaxed ${isCompact ? 'line-clamp-3' : ''}`}>
                        {user.bio || 'Este usuario aún no ha añadido una biografía.'}
                    </p>

                    {!isCompact && (user.interests && user.interests.length > 0) && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Intereses principales</h4>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.slice(0, 4).map(interest => (
                                    <span key={interest} className="bg-white/10 border border-white/15 text-xs text-white/80 px-3 py-1 rounded-full">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isCompact && (user.lifestyle && user.lifestyle.length > 0) && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide">Estilo de vida</h4>
                            <div className="flex flex-wrap gap-2">
                                {user.lifestyle.slice(0, 3).map(item => (
                                    <span key={item} className="bg-purple-500/20 text-xs text-purple-100 px-3 py-1 rounded-full">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {isCompact ? (
                        <>
                            <div className="flex flex-wrap gap-2 text-xs text-white/70">
                                {user.budget && (
                                    <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1">
                                        Presupuesto: €{user.budget}
                                    </span>
                                )}
                                {user.noise_level && (
                                    <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1">
                                        Prefiere ruido {user.noise_level.toLowerCase()}
                                    </span>
                                )}
                            </div>
                            {actions && (
                                <div className="pt-2">{actions}</div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {user.video_url && (
                                <button
                                    type="button"
                                    onClick={handlePlayClick}
                                    className="flex-1 rounded-full border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/15 transition"
                                >
                                    Ver vídeo
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onViewProfile}
                                className="flex-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition"
                                disabled={!onViewProfile}
                            >
                                Ver perfil completo
                            </button>
                            {actions && !user.video_url && !onViewProfile && (
                                <div>{actions}</div>
                            )}
                        </div>
                    )}
                </div>
            </GlassCard>

            {user.video_url && (
                <VideoPlayerModal
                    isOpen={isPlayerOpen}
                    onClose={() => setIsPlayerOpen(false)}
                    videoUrl={user.video_url}
                />
            )}
        </>
    );
};

export default UserProfileCard;
