
import React from 'react';
import { XIcon } from '../../components/icons';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-black/50 border border-white/20 rounded-2xl p-4 relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 bg-white/20 rounded-full p-2 text-white hover:bg-white/30 z-10"
          aria-label="Cerrar reproductor de video"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className="aspect-video">
            <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
            >
                Tu navegador no soporta la etiqueta de video.
            </video>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
