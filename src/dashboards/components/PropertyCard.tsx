import React, { useState } from 'react';
import { Property } from '../../types';
import { EyeIcon, UsersIcon, PlayIcon, PencilIcon, CalendarIcon } from '../../components/icons';
import VideoPlayerModal from './VideoPlayerModal';

interface PropertyCardProps {
    property: Property;
    onEdit?: (property: Property) => void;
    onCardClick?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onCardClick }) => {
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const visibilityClass = property.visibility === 'Pública' ? 'bg-green-500' : 'bg-yellow-500';
    
    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (property.video_url) {
            setIsPlayerOpen(true);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(property);
    };

    const mainImageUrl = property.image_urls && property.image_urls.length > 0
        ? property.image_urls[0]
        : 'https://placehold.co/800x600/1e1b4b/ffffff?text=Sin+Imagen';

    const formattedDate = new Date(property.available_from + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
    });
    
    const fullAddress = [property.address, property.locality, property.city].filter(Boolean).join(', ');

    return (
        <>
            <div 
                className={`bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden text-white transition-transform hover:scale-105 ${onCardClick ? 'cursor-pointer' : ''}`}
                onClick={() => onCardClick?.(property)}
            >
                <div className="relative">
                    <img src={mainImageUrl} alt={property.title} className="w-full h-48 object-cover" />
                    {property.video_url && (
                        <div 
                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity group"
                        >
                             <button
                                type="button"
                                className="bg-white/30 backdrop-blur-sm rounded-full p-4 hover:bg-white/40 focus:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                onClick={handlePlayClick}
                                aria-label="Reproducir vídeo de la propiedad"
                             >
                               <PlayIcon className="w-10 h-10 text-white" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-bold mb-1 flex-grow">{property.title}</h3>
                        <div className="flex items-center flex-shrink-0 gap-2">
                            {onEdit && (
                                <button onClick={handleEditClick} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10" aria-label="Editar propiedad">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${visibilityClass}`}>
                                {property.visibility}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                        <span className="font-semibold text-indigo-300">{property.property_type}</span>
                        <span className="text-white/50">|</span>
                        <span className="truncate">{fullAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-300 mb-3 font-semibold">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Disponible a partir del {formattedDate}</span>
                    </div>
                    <p className="text-xl font-bold mb-4">€{property.price}<span className="text-sm font-normal text-white/70">/mes</span></p>
                    <div className="flex justify-between text-sm text-white/80 border-t border-white/20 pt-2">
                        <div className="flex items-center gap-2">
                            <EyeIcon className="w-5 h-5" />
                            <span>{property.views.toLocaleString()} visitas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-5 h-5" />
                            <span>{property.compatible_candidates} candidatos</span>
                        </div>
                    </div>
                </div>
            </div>

            {property.video_url && (
                <VideoPlayerModal 
                    isOpen={isPlayerOpen}
                    onClose={() => setIsPlayerOpen(false)}
                    videoUrl={property.video_url}
                />
            )}
        </>
    );
};

export default PropertyCard;