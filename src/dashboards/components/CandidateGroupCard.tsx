import React from 'react';
import { User } from '../../types';
import { CheckIcon } from '../../components/icons';
import GlassCard from '../../components/GlassCard';

interface CandidateGroupCardProps {
  group: User[];
  onInvite: () => void;
  isInvited: boolean;
}

const CandidateGroupCard: React.FC<CandidateGroupCardProps> = ({ group, onInvite, isInvited }) => {

  return (
    <GlassCard className="!p-4 mb-4 !bg-black/20">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-grow w-full">
          <h4 className="font-bold text-lg">Grupo de {group.length} personas</h4>
          <div className="flex items-center -space-x-2 my-2">
            {group.map(user => (
              <img
                key={user.id}
                src={user.avatar_url}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-800"
                title={user.name}
              />
            ))}
            <div className="pl-4 text-sm text-white/90 font-medium truncate">
              {group.map(user => user.name).join(', ')}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center w-full sm:w-auto">
          <button
            onClick={onInvite}
            disabled={isInvited}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isInvited
                ? 'bg-green-500/50 text-green-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isInvited ? <><CheckIcon className="w-5 h-5" /> Liberado</> : 'Liberar propiedad'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default CandidateGroupCard;
