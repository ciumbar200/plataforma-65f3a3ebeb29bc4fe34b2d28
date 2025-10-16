import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../../types';
import GlassCard from '../../components/GlassCard';
import { CITIES_DATA, COUNTRIES } from '../../constants';
import { CameraIcon, ShieldCheckIcon } from '../../components/icons';
import { supabase } from '../../lib/supabaseClient';

interface ProfileProps {
  user: User;
  onSave: (updatedUser: User) => Promise<void>;
}

const ALL_INTERESTS = ['Yoga', 'Cocina Vegana', 'Viajar', 'Fotografía', 'Senderismo', 'Música Indie', 'Música en vivo', 'Cine', 'Salir de tapas', 'Arte Urbano', 'Videojuegos', 'Lectura', 'Teatro', 'Museos', 'Brunch', 'Deportes', 'Series', 'Fitness', 'Cocinar'];
const ALL_LIFESTYLES = ['Diurno', 'Nocturno', 'Deportista', 'Creativo', 'Social', 'Intelectual', 'Eco-friendly', 'Tranquilo'];

const Profile: React.FC<ProfileProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [localities, setLocalities] = useState<string[]>(CITIES_DATA[user.city || 'Madrid'] || []);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const identityTips = [
    'Documento de identidad vigente (DNI, NIE o pasaporte).',
    'Selfie con buena iluminación para la comparación biométrica.',
    'Comprobante de domicilio (factura o certificado de empadronamiento).'
  ];
  
  useEffect(() => {
    setFormData(user);
    if (user.city) {
        setLocalities(CITIES_DATA[user.city] || []);
    }
  }, [user]);

  const validateField = (name: string, value: string) => {
    let fieldError: string | null = null;
    switch (name) {
      case 'bio':
        if (value.length < 100) {
            fieldError = 'La biografía debe tener al menos 100 caracteres.';
        }
        break;
      case 'phone':
        if (!value) fieldError = 'El teléfono es obligatorio.';
        else if (!/^\+?[0-9\s-()]{7,20}$/.test(value)) fieldError = 'El formato del teléfono es inválido.';
        break;
      case 'birth_country':
        if (!value) fieldError = 'El país de nacimiento es obligatorio.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setFormData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
    }
  };
  
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    const newLocalities = CITIES_DATA[city] || [];
    setLocalities(newLocalities);
    setFormData(prev => ({ ...prev, city, locality: newLocalities[0] || '' }));
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = formData.interests || [];
    const interests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    setFormData(prev => ({ ...prev, interests }));
  };
  
  const handleLifestyleToggle = (style: string) => {
    const currentLifestyle = formData.lifestyle || [];
    const lifestyle = currentLifestyle.includes(style)
      ? currentLifestyle.filter(s => s !== style)
      : [...currentLifestyle, style];
    setFormData(prev => ({ ...prev, lifestyle }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'INQUILINO' && (!formData.bio || formData.bio.length < 100)) {
        setErrors(prev => ({ ...prev, bio: 'La biografía debe tener al menos 100 caracteres para continuar.'}));
        return;
    }
    
    if (!formData.phone || !formData.birth_country) {
        alert('Por favor, completa los campos de teléfono y país de nacimiento.');
        return;
    }

    setIsSaving(true);
    onSave(formData);
  };

  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>

      <div className="mb-8 bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Verifica tu identidad (recomendado)</h3>
          <p className="text-sm text-white/70 mt-2">
            {user.role === UserRole.PROPIETARIO
              ? 'Refuerza la confianza de tus futuros inquilinos y agiliza la publicación de tus espacios.'
              : 'Suma puntos de compatibilidad y acelera las conversaciones con propietarios verificados.'}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-white/70 list-disc list-inside">
            {identityTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-auto">
          <button
            type="button"
            className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition-colors"
          >
            Verificar identidad
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
            <div className="relative">
                <img src={formData.avatar_url} alt="Foto de perfil" className="w-40 h-40 rounded-full object-cover border-4 border-indigo-400" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleProfilePictureChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm rounded-full p-3 text-white hover:bg-slate-700/80 transition-colors"
                  aria-label="Cambiar foto de perfil"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nombre</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-white/80 mb-1">Edad</label>
            <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">
                Teléfono
                <span className="text-xs text-white/60 ml-2">(Solo para uso interno, nunca será público)</span>
              </label>
              <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} onBlur={(e) => validateField('phone', e.target.value)} required className={`w-full bg-white/10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-white/20'}`} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="birth_country" className="block text-sm font-medium text-white/80 mb-1">País de Nacimiento</label>
              <select name="birth_country" id="birth_country" value={formData.birth_country || ''} onChange={handleChange} onBlur={(e) => validateField('birth_country', e.target.value)} required className={`w-full bg-white/10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.birth_country ? 'border-red-500' : 'border-white/20'}`}>
                  <option value="" disabled className="bg-gray-800">Selecciona un país</option>
                  {COUNTRIES.map(country => <option key={country} value={country} className="bg-gray-800">{country}</option>)}
              </select>
              {errors.birth_country && <p className="text-red-400 text-xs mt-1">{errors.birth_country}</p>}
            </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-1">Biografía</label>
          <textarea name="bio" id="bio" value={formData.bio || ''} onChange={handleChange} rows={4} className={`w-full bg-white/10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.bio ? 'border-red-500' : 'border-white/20'}`}></textarea>
          <div className="flex justify-between items-center mt-1">
            {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
            <p className={`text-xs ml-auto ${ (formData.bio?.length || 0) < 100 ? 'text-white/60' : 'text-green-400'}`}>Caracteres: {formData.bio?.length || 0} / 100</p>
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-white/80 mb-1">Ciudad</label>
              <select name="city" id="city" value={formData.city} onChange={handleCityChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                  {Object.keys(CITIES_DATA).map(city => <option key={city} value={city} className="bg-gray-800">{city}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="locality" className="block text-sm font-medium text-white/80 mb-1">Localidad</label>
              <select name="locality" id="locality" value={formData.locality} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                  {localities.map(loc => <option key={loc} value={loc} className="bg-gray-800">{loc}</option>)}
              </select>
            </div>
        </div>
        
        <>
            <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-white/80 mb-1">
                URL de Vídeo de Presentación (Opcional)
                </label>
                <input 
                type="url" 
                name="video_url" 
                id="video_url" 
                value={formData.video_url || ''} 
                onChange={handleChange} 
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://... (máx. 20 segundos)"
                />
                <p className="text-xs text-white/60 mt-1">
                Un vídeo corto aumenta tus posibilidades de encontrar un match.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                    {ALL_INTERESTS.map(interest => (
                        <button key={interest} type="button" onClick={() => handleInterestToggle(interest)} className={`px-3 py-1 text-sm rounded-full transition-colors border ${(formData.interests || []).includes(interest) ? 'bg-indigo-500 border-indigo-400 text-white font-semibold' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'}`}>
                            {interest}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-3">Estilo de vida</h3>
                <div className="flex flex-wrap gap-2">
                    {ALL_LIFESTYLES.map(style => (
                        <button key={style} type="button" onClick={() => handleLifestyleToggle(style)} className={`px-3 py-1 text-sm rounded-full transition-colors border ${(formData.lifestyle || []).includes(style) ? 'bg-purple-500 border-purple-400 text-white font-semibold' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'}`}>
                            {style}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="noise_level" className="block text-sm font-medium text-white/80 mb-1">Nivel de ruido preferido</label>
                    <select name="noise_level" id="noise_level" value={formData.noise_level} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="Bajo" className="bg-gray-800">Bajo</option>
                        <option value="Medio" className="bg-gray-800">Medio</option>
                        <option value="Alto" className="bg-gray-800">Alto</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-white/80 mb-1">Presupuesto Mensual Máx. (€)</label>
                    <input type="number" name="budget" id="budget" value={formData.budget || ''} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: 500" />
                </div>
                <div>
                    <label htmlFor="commute_distance" className="block text-sm font-medium text-white/80 mb-1">Distancia máx. de búsqueda (min)</label>
                    <input type="number" name="commute_distance" id="commute_distance" value={formData.commute_distance || ''} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>
        </>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </GlassCard>
  );
};

export default Profile;
