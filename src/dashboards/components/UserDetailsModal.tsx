import React from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';
import { User, RentalGoal } from '../../types';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const rentalGoalText: { [key in RentalGoal]: string } = {
  [RentalGoal.FIND_ROOMMATES_AND_APARTMENT]: 'Buscar compañeros y piso',
  [RentalGoal.FIND_ROOM_WITH_ROOMMATES]: 'Buscar habitación con compañeros',
  [RentalGoal.BOTH]: 'Ambas opciones',
};

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-indigo-300 font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-lg text-white/90 mt-1">{value || 'No especificado'}</p>
  </div>
);

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <GlassCard 
        className="w-full max-w-2xl text-white relative !p-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
            <div>
                 <h2 className="text-2xl font-bold">Detalles del Usuario</h2>
                 <p className="text-white/70 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white"
                aria-label="Cerrar modal"
            >
                <XIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left mb-6">
                <img src={user.avatar_url} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg flex-shrink-0" />
                <div>
                    <h3 className="text-3xl font-bold">{user.name}, {user.age}</h3>
                    {user.bio && <p className="text-white/80 mt-2 text-md italic">"{user.bio}"</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl mb-6">
                <DetailItem label="Ciudad / Localidad" value={`${user.city || 'N/A'} / ${user.locality || 'N/A'}`} />
                <DetailItem label="Objetivo de Alquiler" value={user.rental_goal ? rentalGoalText[user.rental_goal] : 'N/A'} />
                <DetailItem label="Nivel de Ruido" value={user.noise_level} />
                <DetailItem label="Búsqueda Máxima" value={user.commute_distance ? `${user.commute_distance} min` : 'N/A'} />
                <DetailItem label="Email" value={user.email || 'No especificado'} />
                <DetailItem label="Teléfono" value={user.phone || 'No especificado'} />
            </div>

            {user.interests && user.interests.length > 0 && (
                 <div>
                    <h4 className="text-xl font-bold mb-3">Intereses</h4>
                    <div className="bg-black/20 p-4 rounded-xl">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {user.interests.map(interest => (
                                <span key={interest} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">{interest}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
             {user.lifestyle && user.lifestyle.length > 0 && (
                 <div className="mt-6">
                    <h4 className="text-xl font-bold mb-3">Estilo de Vida</h4>
                    <div className="bg-black/20 p-4 rounded-xl">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {user.lifestyle.map(style => (
                                <span key={style} className="bg-indigo-500/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">{style}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </GlassCard>
    </div>
  );
};

export default UserDetailsModal;