import React from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon, AlertTriangleIcon } from '../../components/icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  color?: 'red' | 'yellow';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  Icon = AlertTriangleIcon,
  color = 'red',
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700',
    },
    yellow: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <GlassCard className="w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${selectedColor.bg} sm:mx-0 sm:h-10 sm:w-10`}>
            <Icon className={`h-6 w-6 ${selectedColor.text}`} aria-hidden="true" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg leading-6 font-bold text-white">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-white/80">{description}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors ${selectedColor.button}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md bg-white/10 px-4 py-2 text-base font-medium text-white/80 shadow-sm hover:bg-white/20 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ConfirmationModal;
