import React from 'react';
import { User } from '../../types';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';

type CompatibilityBreakdown = {
    name: string;
    score: number;
    maxScore: number;
}

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  otherUser: User | null;
  breakdown: CompatibilityBreakdown[];
}

const ProgressBar: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    let colorClass = 'bg-orange-500';
    if (percentage > 85) colorClass = 'bg-green-500';
    else if (percentage > 70) colorClass = 'bg-yellow-500';
    
    return (
        <div className="w-full bg-white/10 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const CompatibilityModal: React.FC<CompatibilityModalProps> = ({ isOpen, onClose, currentUser, otherUser, breakdown }) => {
  if (!isOpen || !otherUser) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-md text-white relative !p-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Detalle de Compatibilidad</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Cerrar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
            <div className="flex items-center justify-center gap-4 mb-6">
                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400"/>
                <span className="text-4xl font-bold text-green-400">{otherUser.compatibility}%</span>
                <img src={otherUser.avatar_url} alt={otherUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"/>
            </div>
            <div className="space-y-4">
                {breakdown.map(item => (
                    <div key={item.name}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-white/70">{Math.round(item.score)} / {item.maxScore} pts</span>
                        </div>
                        <ProgressBar value={item.score} max={item.maxScore} />
                    </div>
                ))}
            </div>
             <p className="text-xs text-center text-white/60 mt-6">
                Esta puntuación es una guía para ayudarte a encontrar personas con un estilo de vida similar.
            </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default CompatibilityModal;
