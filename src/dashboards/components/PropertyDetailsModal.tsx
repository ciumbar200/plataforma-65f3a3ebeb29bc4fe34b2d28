import React from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon, EyeIcon, UsersIcon, CalendarIcon } from '../../components/icons';
import { Property } from '../../types';
import { AVAILABLE_AMENITIES } from '../../components/icons';
import GoogleMap from './GoogleMap';
import { getCozyGallery } from '../../lib/propertyImages';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ isOpen, onClose, property }) => {
  if (!isOpen || !property) return null;

  const availableAmenities = AVAILABLE_AMENITIES.filter(amenity => property.features && property.features[amenity.id]);
  const gallery = property.image_urls && property.image_urls.length > 0
    ? property.image_urls
    : getCozyGallery(property);
  let formattedDate: string | null = null;
  if (property.available_from) {
    const parsedDate = new Date(property.available_from);
    if (!Number.isNaN(parsedDate.getTime())) {
      formattedDate = parsedDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
  const views = typeof property.views === 'number' ? property.views : Number(property.views ?? 0);
  const candidates = typeof property.compatible_candidates === 'number'
    ? property.compatible_candidates
    : Number(property.compatible_candidates ?? 0);
  const fullAddress = [property.address, property.locality, property.city, property.postal_code].filter(Boolean).join(', ');

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <GlassCard className="w-full max-w-4xl text-white relative !p-0" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Detalles de la Propiedad (Borrador)</h2>
            <p className="text-white/70">{property.title}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Cerrar modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <div className="space-y-4">
                {gallery.map((url, index) => (
                  <img key={index} src={url} alt={`Vista de la propiedad ${index + 1}`} className="w-full h-auto object-cover rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold">{property.title}</h3>
              <p className="text-lg text-white/80">{fullAddress}</p>
              <p className="text-4xl font-bold text-indigo-300">€{property.price}<span className="text-lg font-normal text-white/70">/mes</span></p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80 border-t border-white/20 pt-4 text-center">
                  <div className="flex items-center justify-center gap-2"><EyeIcon className="w-5 h-5" /><span>{Number.isFinite(views) ? views.toLocaleString() : '0'} visitas</span></div>
                  <div className="flex items-center justify-center gap-2"><UsersIcon className="w-5 h-5" /><span>{Number.isFinite(candidates) ? candidates.toLocaleString() : '0'} candidatos</span></div>
                  <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{formattedDate ? `Disponible: ${formattedDate}` : 'Fecha de disponibilidad a confirmar'}</span>
                  </div>
              </div>

              {availableAmenities.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold mb-3">Comodidades</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {availableAmenities.map(amenity => (
                      <div key={amenity.id} className="flex items-center gap-2 text-white/90">
                        {React.cloneElement(amenity.icon, { className: 'w-5 h-5 text-indigo-300' })}
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.conditions && (
                <div>
                  <h4 className="text-xl font-bold mb-3">Condiciones</h4>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{property.conditions}</p>
                </div>
              )}

              {property.lat != null && property.lng != null && (
                <div>
                  <h4 className="text-xl font-bold mb-3">Ubicación</h4>
                  <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                    <GoogleMap lat={property.lat} lng={property.lng} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PropertyDetailsModal;
