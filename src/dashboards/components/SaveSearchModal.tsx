
import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';

interface SaveSearchModalCopy {
  title: string;
  description: string;
  nameLabel: string;
  placeholder: string;
  cancel: string;
  save: string;
}

const DEFAULT_SAVE_SEARCH_COPY: SaveSearchModalCopy = {
  title: 'Guardar Búsqueda',
  description: 'Dale un nombre a tu configuración de filtros actual para acceder a ella más tarde y recibir notificaciones.',
  nameLabel: 'Nombre de la Búsqueda',
  placeholder: 'Ej: Apartamento en Madrid Centro',
  cancel: 'Cancelar',
  save: 'Guardar',
};

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  copy?: SaveSearchModalCopy;
}

const SaveSearchModal: React.FC<SaveSearchModalProps> = ({ isOpen, onClose, onSave, copy }) => {
  const [name, setName] = useState('');
  const texts = copy ?? DEFAULT_SAVE_SEARCH_COPY;

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-sm text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-4">{texts.title}</h3>
        <p className="text-sm text-white/80 mb-4">{texts.description}</p>
        <div>
          <label htmlFor="searchName" className="block text-sm font-medium text-white/80 mb-1">{texts.nameLabel}</label>
          <input
            id="searchName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={texts.placeholder}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-semibold transition-colors">{texts.cancel}</button>
          <button type="button" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-semibold transition-colors">{texts.save}</button>
        </div>
      </GlassCard>
    </div>
  );
};

export default SaveSearchModal;
