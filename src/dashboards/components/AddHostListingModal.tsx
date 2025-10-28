import React, { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { XIcon } from '../../components/icons';
import { HostListing, PropertyFeatures } from '../../types';
import { CITIES_DATA } from '../../constants';
import { AVAILABLE_AMENITIES } from '../../components/icons';
import type { HostListingInput } from '../../lib/hostListings';

const ROOM_TYPES = [
    'Habitación individual',
    'Habitación doble',
    'Suite privada',
    'Habitación compartida',
    'Estudio integrado',
] as const;

type VisibilityOption = 'Pública' | 'Privada';

interface AddHostListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: HostListingInput & { id?: number; imageFiles?: File[] }) => void;
    listingToEdit?: HostListing | null;
    isSaving?: boolean;
}

const DEFAULT_CITY = 'Madrid';
const MAX_IMAGES = 8;

const AddHostListingModal: React.FC<AddHostListingModalProps> = ({
    isOpen,
    onClose,
    onSave,
    listingToEdit,
    isSaving = false,
}) => {
    const [formState, setFormState] = useState({
        title: '',
        room_type: ROOM_TYPES[0],
        price: '',
        city: DEFAULT_CITY,
        locality: '',
        available_from: '',
        description: '',
        conditions: '',
        visibility: 'Pública' as VisibilityOption,
        amenities: {} as PropertyFeatures,
    });
    const [localities, setLocalities] = useState<string[]>(CITIES_DATA[DEFAULT_CITY] || []);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<Array<{ file: File; preview: string }>>([]);

    useEffect(() => {
        if (!isOpen) return;

        const selectedCity = listingToEdit?.city || DEFAULT_CITY;
        const nextLocalities = CITIES_DATA[selectedCity] || [];
        setLocalities(nextLocalities);

        if (listingToEdit) {
            setFormState({
                title: listingToEdit.title || '',
                room_type: (listingToEdit.room_type as typeof ROOM_TYPES[number]) || ROOM_TYPES[0],
                price: listingToEdit.price ? String(listingToEdit.price) : '',
                city: selectedCity,
                locality:
                    listingToEdit.locality && nextLocalities.includes(listingToEdit.locality)
                        ? listingToEdit.locality
                        : nextLocalities[0] || '',
                available_from: listingToEdit.available_from || '',
                description: listingToEdit.description || '',
                conditions: listingToEdit.conditions || '',
                visibility: listingToEdit.visibility as VisibilityOption,
                amenities: listingToEdit.amenities || {},
            });
            setExistingImages(listingToEdit.image_urls || []);
        } else {
            setFormState({
                title: '',
                room_type: ROOM_TYPES[0],
                price: '',
                city: DEFAULT_CITY,
                locality: nextLocalities[0] || '',
                available_from: '',
                description: '',
                conditions: '',
                visibility: 'Pública',
                amenities: {},
            });
            setExistingImages([]);
        }

        setNewImages(prev => {
            prev.forEach(image => URL.revokeObjectURL(image.preview));
            return [];
        });
        setErrors({});
    }, [isOpen, listingToEdit]);

    useEffect(() => {
        return () => {
            newImages.forEach(image => URL.revokeObjectURL(image.preview));
        };
    }, [newImages]);

    const hasAmenities = useMemo(() => Object.values(formState.amenities).some(Boolean), [formState.amenities]);

    const handleFieldChange = (name: string, value: string) => {
        setFormState(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCityChange = (value: string) => {
        const nextLocalities = CITIES_DATA[value] || [];
        setLocalities(nextLocalities);
        setFormState(prev => ({
            ...prev,
            city: value,
            locality: nextLocalities.includes(prev.locality) ? prev.locality : nextLocalities[0] || '',
        }));
    };

    const toggleAmenity = (amenityId: keyof PropertyFeatures) => {
        setFormState(prev => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [amenityId]: !prev.amenities?.[amenityId],
            },
        }));
    };

    const currentImageCount = existingImages.length + newImages.length;

    const handleFilesSelected = (fileList: FileList | null) => {
        if (!fileList) return;
        const availableSlots = MAX_IMAGES - currentImageCount;
        if (availableSlots <= 0) {
            setErrors(prev => ({
                ...prev,
                images: `Puedes subir un máximo de ${MAX_IMAGES} imágenes.`,
            }));
            return;
        }

        const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
        const limitedFiles = files.slice(0, availableSlots);
        if (!limitedFiles.length) return;

        const nextImages = limitedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setNewImages(prev => [...prev, ...nextImages]);
        setErrors(prev => ({ ...prev, images: null }));
    };

    const removeExistingImage = (url: string) => {
        setExistingImages(prev => prev.filter(item => item !== url));
    };

    const removeNewImage = (preview: string) => {
        setNewImages(prev => {
            const toRemove = prev.find(item => item.preview === preview);
            if (toRemove) {
                URL.revokeObjectURL(toRemove.preview);
            }
            return prev.filter(item => item.preview !== preview);
        });
    };

    const validateForm = () => {
        const nextErrors: Record<string, string | null> = {};

        if (!formState.title.trim()) {
            nextErrors.title = 'El título es obligatorio.';
        } else if (formState.title.trim().length < 4) {
            nextErrors.title = 'El título debe tener al menos 4 caracteres.';
        }

        if (!formState.price.trim()) {
            nextErrors.price = 'El precio es obligatorio.';
        } else if (Number.isNaN(Number(formState.price)) || Number(formState.price) <= 0) {
            nextErrors.price = 'Introduce un precio válido mayor que cero.';
        }

        if (!formState.city) {
            nextErrors.city = 'Selecciona una ciudad.';
        }

        if (!formState.room_type) {
            nextErrors.room_type = 'Selecciona un tipo de habitación.';
        }

        if (currentImageCount === 0) {
            nextErrors.images = 'Añade al menos una imagen de la habitación.';
        }

        setErrors(nextErrors);
        return Object.values(nextErrors).every(value => value == null);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateForm()) return;

        const payload: HostListingInput & { id?: number; imageFiles?: File[] } = {
            id: listingToEdit?.id,
            title: formState.title.trim(),
            room_type: formState.room_type,
            price: Number(formState.price),
            city: formState.city || undefined,
            locality: formState.locality || undefined,
            available_from: formState.available_from || undefined,
            description: formState.description.trim() || undefined,
            conditions: formState.conditions.trim() || undefined,
            visibility: formState.visibility,
            amenities: hasAmenities ? formState.amenities : undefined,
            image_urls: existingImages,
            imageFiles: newImages.length ? newImages.map(item => item.file) : undefined,
        };

        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-10">
            <GlassCard className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto text-white">
                <button
                    type="button"
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                    aria-label="Cerrar"
                    onClick={onClose}
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <header className="space-y-2 pr-10">
                        <h2 className="text-2xl font-bold">
                            {listingToEdit ? 'Editar habitación disponible' : 'Crear nueva habitación'}
                        </h2>
                        <p className="text-white/70 text-sm">
                            Añade detalles claros sobre tu habitación disponible para que los inquilinos compatibles puedan
                            encontrarte.
                        </p>
                    </header>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-white/80 mb-1">Título *</label>
                            <input
                                type="text"
                                value={formState.title}
                                onChange={e => handleFieldChange('title', e.target.value)}
                                className={`w-full rounded-xl bg-white/10 border p-3 outline-none focus:ring-2 focus:ring-indigo-400 ${
                                    errors.title ? 'border-red-500' : 'border-white/20'
                                }`}
                                placeholder="Ej. Habitación luminosa con baño privado en Malasaña"
                            />
                            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Tipo de habitación *</label>
                            <select
                                value={formState.room_type}
                                onChange={e => handleFieldChange('room_type', e.target.value)}
                                className={`w-full rounded-xl bg-white/10 border p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white ${
                                    errors.room_type ? 'border-red-500' : 'border-white/20'
                                }`}
                            >
                                {ROOM_TYPES.map(type => (
                                    <option key={type} value={type} className="bg-gray-900 text-white">
                                        {type}
                                    </option>
                                ))}
                            </select>
                            {errors.room_type && <p className="text-xs text-red-400 mt-1">{errors.room_type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Precio mensual (€) *</label>
                            <input
                                type="number"
                                min="0"
                                value={formState.price}
                                onChange={e => handleFieldChange('price', e.target.value)}
                                className={`w-full rounded-xl bg-white/10 border p-3 outline-none focus:ring-2 focus:ring-indigo-400 ${
                                    errors.price ? 'border-red-500' : 'border-white/20'
                                }`}
                                placeholder="Ej. 550"
                            />
                            {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Ciudad *</label>
                            <select
                                value={formState.city}
                                onChange={e => handleCityChange(e.target.value)}
                                className="w-full rounded-xl bg-white/10 border border-white/20 p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                            >
                                {Object.keys(CITIES_DATA).map(city => (
                                    <option key={city} value={city} className="bg-gray-900 text-white">
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Localidad</label>
                            <select
                                value={formState.locality}
                                onChange={e => handleFieldChange('locality', e.target.value)}
                                className="w-full rounded-xl bg-white/10 border border-white/20 p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                            >
                                {localities.map(locality => (
                                    <option key={locality} value={locality} className="bg-gray-900 text-white">
                                        {locality}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white/80 mb-1">Fecha disponible</label>
                            <input
                                type="date"
                                value={formState.available_from}
                                onChange={e => handleFieldChange('available_from', e.target.value)}
                                className="w-full rounded-xl bg-white/10 border border-white/20 p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white placeholder:text-white/40"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-sm font-semibold text-white/80">
                                Fotografías de la habitación *
                            </label>
                            <p className="text-xs text-white/60">
                                Sube hasta {MAX_IMAGES} imágenes en formato JPG o PNG. Las guardaremos en tu galería para
                                mostrarlas a los inquilinos interesados.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {existingImages.map(url => (
                                    <div
                                        key={url}
                                        className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5"
                                    >
                                        <img src={url} alt="Foto existente" className="h-32 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(url)}
                                            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white/80 opacity-0 transition group-hover:opacity-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}

                                {newImages.map(image => (
                                    <div
                                        key={image.preview}
                                        className="group relative overflow-hidden rounded-2xl border border-dashed border-indigo-300/60 bg-indigo-500/10"
                                    >
                                        <img src={image.preview} alt="Foto nueva" className="h-32 w-full object-cover" />
                                        <span className="absolute left-2 top-2 rounded-full bg-indigo-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-950">
                                            Nuevo
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(image.preview)}
                                            className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white/80 opacity-0 transition group-hover:opacity-100"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ))}

                                {currentImageCount < MAX_IMAGES && (
                                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/5 text-center text-sm text-white/70 transition hover:border-indigo-300/60 hover:bg-indigo-500/10">
                                        <span className="text-lg font-semibold">Añadir imágenes</span>
                                        <span className="text-xs text-white/50">PNG o JPG · Máx. {MAX_IMAGES} fotos</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={event => handleFilesSelected(event.target.files)}
                                        />
                                    </label>
                                )}
                            </div>
                            {errors.images && <p className="text-xs text-red-400">{errors.images}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-white/80 mb-1">Descripción</label>
                            <textarea
                                rows={4}
                                value={formState.description}
                                onChange={e => handleFieldChange('description', e.target.value)}
                                className="w-full rounded-xl bg-white/10 border border-white/20 p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                                placeholder="Cuenta cómo es la convivencia, quiénes viven en casa y qué ofreces."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-white/80 mb-1">Condiciones destacadas</label>
                            <textarea
                                value={formState.conditions}
                                onChange={e => handleFieldChange('conditions', e.target.value)}
                                className="w-full min-h-[110px] rounded-xl bg-white/10 border border-white/20 p-3 outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                                placeholder="Normas de convivencia, duración mínima, gastos incluidos..."
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-white/80">Comodidades</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_AMENITIES.map(amenity => (
                                <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity.id)}
                                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                        formState.amenities?.[amenity.id]
                                            ? 'bg-indigo-500/30 border-indigo-300 text-indigo-100'
                                            : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                                    }`}
                                >
                                    {React.cloneElement(amenity.icon, { className: 'w-4 h-4' })}
                                    {amenity.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-white/80">Visibilidad</label>
                        <div className="flex gap-3">
                            {(['Pública', 'Privada'] as VisibilityOption[]).map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleFieldChange('visibility', option)}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                        formState.visibility === option
                                            ? 'bg-indigo-500/30 border-indigo-300 text-indigo-100'
                                            : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-white/60">
                            Las publicaciones públicas se activan al instante y quedan visibles en Discover y en la landing de habitaciones.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving
                                ? 'Guardando...'
                                : listingToEdit
                                ? 'Guardar cambios'
                                : 'Crear habitación'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AddHostListingModal;
