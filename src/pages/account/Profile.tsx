import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import GlassCard from '../../components/GlassCard';
import { CITIES_DATA, COUNTRIES } from '../../constants';
import { CameraIcon } from '../../components/icons';
import VerifyIdentity from '../../components/VerifyIdentity';

interface ProfileProps {
  user: User;
  onSave: (updatedUser: User) => Promise<void>;
}

const ALL_INTERESTS = ['Yoga', 'Cocina Vegana', 'Viajar', 'Fotografía', 'Senderismo', 'Música Indie', 'Música en vivo', 'Cine', 'Salir de tapas', 'Arte Urbano', 'Videojuegos', 'Lectura', 'Teatro', 'Museos', 'Brunch', 'Deportes', 'Series', 'Fitness', 'Cocinar'];
const ALL_LIFESTYLES = ['Diurno', 'Nocturno', 'Deportista', 'Creativo', 'Social', 'Intelectual', 'Eco-friendly', 'Tranquilo'];
const MONTH_OPTIONS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const Profile: React.FC<ProfileProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [localities, setLocalities] = useState<string[]>(CITIES_DATA[user.city || 'Madrid'] || []);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  
  useEffect(() => {
    setFormData(user);
    if (user.city) {
        setLocalities(CITIES_DATA[user.city] || []);
    }
    if (user.birth_date) {
        const [year, month, day] = user.birth_date.split('-');
        const safeYear = year || '';
        const safeMonth = month ? String(Number(month)) : '';
        const safeDay = day ? String(Number(day)) : '';
        setBirthYear(safeYear);
        setBirthMonth(safeMonth);
        setBirthDay(safeDay);
        if (safeYear && safeMonth && safeDay) {
            updateBirthDate(safeYear, safeMonth, safeDay);
        }
    } else {
        setBirthYear('');
        setBirthMonth('');
        setBirthDay('');
    }
  }, [user]);

  const validateField = (name: string, value: string) => {
    let fieldError: string | null = null;
    switch (name) {
      case 'phone':
        if (!value.trim()) fieldError = 'El teléfono es obligatorio para coordinar verificaciones.';
        else if (!/^\+?[0-9\s-()]{7,20}$/.test(value.trim())) fieldError = 'Introduce un teléfono válido (incluye el prefijo si es internacional).';
        break;
      case 'birth_country':
        if (!value) fieldError = 'Selecciona tu país de nacimiento.';
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

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(() => {
    const maxYear = currentYear - 18;
    const minYear = currentYear - 100;
    const years: string[] = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      years.push(String(year));
    }
    return years;
  }, [currentYear]);

  const getDaysInMonth = (year: number, month: number) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };

  const daysOptions = useMemo(() => {
    const month = Number(birthMonth);
    const year = Number(birthYear);
    const totalDays = getDaysInMonth(year, month || 1);
    return Array.from({ length: totalDays }, (_, index) => String(index + 1));
  }, [birthMonth, birthYear]);

  const calculateAge = (year: number, month: number, day: number) => {
    if (!year || !month || !day) return null;
    const today = new Date();
    const birthDateObj = new Date(year, month - 1, day);
    if (Number.isNaN(birthDateObj.getTime())) return null;
    let ageYears = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      ageYears -= 1;
    }
    return ageYears;
  };

  const updateBirthDate = (nextYear: string, nextMonth: string, nextDay: string) => {
    let day = nextDay;
    let month = nextMonth;
    let year = nextYear;

    const numericYear = Number(year);
    const numericMonth = Number(month);
    const daysInMonth = getDaysInMonth(numericYear, numericMonth || 1);
    if (day && Number(day) > daysInMonth) {
      day = String(daysInMonth);
    }

    setBirthYear(year);
    setBirthMonth(month);
    setBirthDay(day);

    let errorMessage: string | null = null;
    if (year && month && day) {
      const numericDay = Number(day);
      const ageValue = calculateAge(numericYear, numericMonth, numericDay);
      if (ageValue === null) {
        errorMessage = 'La fecha seleccionada no es válida.';
      } else if (ageValue < 18) {
        errorMessage = 'Necesitas ser mayor de 18 años para usar MoOn.';
      } else if (ageValue > 100) {
        errorMessage = 'Por favor, revisa tu fecha de nacimiento.';
      } else {
        const iso = `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, birth_date: iso, age: ageValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, birth_date: undefined, age: prev.age }));
      errorMessage = 'Selecciona día, mes y año.';
    }

    setErrors(prev => ({ ...prev, birth_date: errorMessage }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { ...formData };
    let hasBlockingError = false;

    if (!birthYear || !birthMonth || !birthDay) {
      setErrors(prev => ({ ...prev, birth_date: 'Selecciona tu fecha de nacimiento.' }));
      hasBlockingError = true;
    } else {
      const numericYear = Number(birthYear);
      const numericMonth = Number(birthMonth);
      const numericDay = Number(birthDay);
      const ageValue = calculateAge(numericYear, numericMonth, numericDay);
      if (ageValue === null || ageValue < 18) {
        setErrors(prev => ({ ...prev, birth_date: 'Fecha de nacimiento inválida.' }));
        hasBlockingError = true;
      } else {
        updatedData.birth_date = `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`;
        updatedData.age = ageValue;
      }
    }

    if (!updatedData.phone) {
      setErrors(prev => ({ ...prev, phone: 'Añade un teléfono para que podamos contactarte si surge alguna incidencia.' }));
      hasBlockingError = true;
    }

    if (!updatedData.birth_country) {
      setErrors(prev => ({ ...prev, birth_country: 'Selecciona tu país de nacimiento.' }));
      hasBlockingError = true;
    }

    if (hasBlockingError) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(updatedData);
      setFormData(updatedData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>

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
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Ej. Marta López" className="w-full bg-white/10 border border-white/20 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-white/80">Fecha de nacimiento</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={birthDay}
                onChange={(event) => updateBirthDate(birthYear, birthMonth, event.target.value)}
                className="rounded-xl bg-white/10 border border-white/20 p-3 text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled hidden className="bg-gray-900">Día</option>
                {daysOptions.map(day => (
                  <option key={day} value={day} className="bg-gray-900">
                    {day}
                  </option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(event) => updateBirthDate(birthYear, event.target.value, birthDay)}
                className="rounded-xl bg-white/10 border border-white/20 p-3 text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled hidden className="bg-gray-900">Mes</option>
                {MONTH_OPTIONS.map(month => (
                  <option key={month.value} value={month.value} className="bg-gray-900">
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(event) => updateBirthDate(event.target.value, birthMonth, birthDay)}
                className="rounded-xl bg-white/10 border border-white/20 p-3 text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled hidden className="bg-gray-900">Año</option>
                {yearOptions.map(year => (
                  <option key={year} value={year} className="bg-gray-900">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {errors.birth_date && <span className="text-xs text-red-400">{errors.birth_date}</span>}
            {!errors.birth_date && formData.age && (
              <span className="text-xs text-white/60">Edad calculada: {formData.age} años</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">
                Teléfono
                <span className="text-xs text-white/60 ml-2">(Solo para uso interno, nunca será público)</span>
              </label>
              <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} onBlur={(e) => validateField('phone', e.target.value)} required placeholder="Ej. +34 612 345 678" className={`w-full bg-white/10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-white/20'}`} />
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
          <textarea
            name="bio"
            id="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            placeholder="Escribe cómo vives, horarios, lo que te hace buen conviviente y qué buscas. Ej: 'Trabajo remoto, me gusta cocinar los domingos y busco gente ordenada.'"
            className={`w-full bg-white/10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.bio ? 'border-red-500' : 'border-white/20'}`}
          ></textarea>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-white/60">Sugerencia: 60+ caracteres nos ayudan a introducir tu vibra.</p>
            <p className={`text-xs ${ (formData.bio?.length || 0) < 60 ? 'text-white/60' : 'text-green-400'}`}>Caracteres: {formData.bio?.length || 0}</p>
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
                placeholder="https://tu-video.com/intro (máx. 20 segundos)"
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

      <div className="mt-10">
        <VerifyIdentity
          user={user}
          onStatusChange={(status) => {
            setFormData((prev) => ({
              ...prev,
              verification_status: status,
              is_verified: status === 'approved',
            }));
          }}
        />
      </div>
    </GlassCard>
  );
};

export default Profile;
