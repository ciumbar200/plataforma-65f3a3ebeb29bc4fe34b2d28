import React, { useState } from 'react';
import { User, RentalGoal } from '../../types';
import GlassCard from '../../components/GlassCard';
import { PlayIcon } from '../../components/icons';
import VideoPlayerModal from './VideoPlayerModal';

interface UserProfileCardProps {
  user: User;
  onCompatibilityClick?: () => void;
}

const rentalGoalTextMap: { [key in RentalGoal]?: string } = {
    [RentalGoal.FIND_ROOMMATES_AND_APARTMENT]: 'Busca compañeros y piso',
    [RentalGoal.FIND_ROOM_WITH_ROOMMATES]: 'Busca habitación',
    [RentalGoal.BOTH]: 'Busca compañero o habitación',
};


const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onCompatibilityClick }) => {
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    
    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user.video_url) {
            setIsPlayerOpen(true);
        }
    };
    
    const compatibilityColor = user.compatibility > 85 ? 'text-green-400' : user.compatibility > 70 ? 'text-yellow-400' : 'text-orange-400';

    return (
        <>
            <GlassCard className="!p-0 w-full overflow-hidden flex flex-col">
                <div className="relative h-96">
                    {/* FIX: Corrected property name from 'profile_picture' to 'avatar_url' to match the User type definition. */}
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    {user.video_url && (
                        <button
                            type="button" 
                            className="absolute inset-0 w-full h-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer group"
                            onClick={handlePlayClick}
                            aria-label="Reproducir vídeo de presentación"
                        >
                             <div 
                                className="bg-white/30 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/40 group-focus:bg-white/40 transition-colors"
                             >
                               <PlayIcon className="w-10 h-10 text-white" />
                            </div>
                        </button>
                    )}

                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold">{user.name}, {user.age}</h3>
                        <p className="text-sm text-white/80">{user.locality}, {user.city}</p>
                    </div>
                </div>
                <div className="p-4 flex flex-col">
                     {user.rental_goal && rentalGoalTextMap[user.rental_goal] && <p className="text-xs font-semibold bg-indigo-500/50 text-indigo-200 px-2 py-1 rounded-full self-start mb-2">{rentalGoalTextMap[user.rental_goal]}</p>}
                    
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-white/70">Compatibilidad</span>
                        <button 
                            onClick={onCompatibilityClick} 
                            className={`text-2xl font-bold ${compatibilityColor} ${onCompatibilityClick ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                            disabled={!onCompatibilityClick}
                        >
                            {user.compatibility}%
                        </button>
                    </div>
                    
                    <div className="mb-3">
                        <h4 className="text-xs font-semibold text-white/60 mb-1">Intereses</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {(user.interests || []).slice(0, 4).map(interest => (
                                <span key={interest} className="bg-white/10 text-xs text-white/80 px-2 py-1 rounded-full">{interest}</span>
                            ))}
                        </div>
                    </div>

                    {user.lifestyle && user.lifestyle.length > 0 && (
                        <div className="mb-3">
                            <h4 className="text-xs font-semibold text-white/60 mb-1">Estilo de Vida</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {(user.lifestyle).slice(0, 4).map(style => (
                                    <span key={style} className="bg-purple-500/30 text-xs text-purple-200 px-2 py-1 rounded-full">{style}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-white/10 text-left">
                        <p className="text-sm text-white/80 italic">{user.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
                    </div>
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