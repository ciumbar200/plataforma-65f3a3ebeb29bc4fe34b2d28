import React, { useMemo } from 'react';
import { User } from '../../types';
import GlassCard from '../../components/GlassCard';
import { XIcon, HeartIcon } from '../../components/icons';
import { calculateCompatibility } from '../TenantDashboard';

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  matches: { [key: string]: string[] };
}

type MutualMatch = {
    userA: User;
    userB: User;
    compatibility: number;
}

const MatchesModal: React.FC<MatchesModalProps> = ({ isOpen, onClose, users, matches }) => {
  
  const mutualMatches = useMemo((): MutualMatch[] => {
    const result: MutualMatch[] = [];
    const processedPairs = new Set<string>();
    // FIX: Explicitly set the Map's generic types to ensure correct type inference for `usersById`.
    // This resolves an issue where the compiler failed to infer `User` as the value type,
    // leading to errors when using `usersById.get()`.
    const usersById = new Map<string, User>(users.map(u => [u.id, u]));

    for (const userId1 in matches) {
      const user1Matches = matches[userId1] || [];
      for (const userId2 of user1Matches) {
        // Ensure we don't process the same pair twice (e.g., A-B and B-A)
        const pairKey = [userId1, userId2].sort().join('-');
        if (processedPairs.has(pairKey)) {
          continue;
        }

        const user2Matches = matches[userId2] || [];
        if (user2Matches.includes(userId1)) {
          const userA = usersById.get(userId1);
          const userB = usersById.get(userId2);
          
          if (userA && userB) {
            result.push({
              userA,
              userB,
              compatibility: calculateCompatibility(userA, userB),
            });
          }
        }
        processedPairs.add(pairKey);
      }
    }
    return result;
  }, [users, matches]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-2xl text-white relative !p-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Coincidencias Activas</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
            aria-label="Cerrar modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {mutualMatches.length > 0 ? (
            <ul className="space-y-4">
              {mutualMatches.map(({ userA, userB, compatibility }, index) => (
                <li key={index} className="bg-black/20 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={userA.avatar_url} alt={userA.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <span className="font-semibold truncate">{userA.name}</span>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <HeartIcon className="w-6 h-6 text-pink-400" />
                    <span className="text-sm font-bold text-pink-300 mt-1">{compatibility}%</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className="font-semibold truncate text-right">{userB.name}</span>
                    <img src={userB.avatar_url} alt={userB.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70">No hay coincidencias activas en este momento.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default MatchesModal;
