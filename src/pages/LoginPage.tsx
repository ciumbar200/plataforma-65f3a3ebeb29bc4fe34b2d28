import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import { User, UserRole, RentalGoal, PropertyType } from '../types';
import {
  GoogleIcon,
  FacebookIcon,
  UsersIcon,
  BuildingIcon,
  HomeIcon,
  MailIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '../components/icons';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';
import { useI18n } from '../i18n';

const LOGIN_IMAGE_URL = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';
const REGISTER_IMAGE_URL = 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80';

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

const MIN_AGE = 18;
const MAX_AGE = 100;

interface PostRegisterPageProps {
    onGoToLogin: () => void;
}

export const PostRegisterPage: React.FC<PostRegisterPageProps> = ({ onGoToLogin }) => {
    const { scope } = useI18n();
    const copy = scope<any>('auth.postRegister') || {};
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <div className="flex justify-center">
                    <Logo showText={false} size={44} />
                </div>
                <h2 className="text-3xl font-bold mt-4 text-white">{copy.title || '¡Un último paso!'}</h2>
                <p className="text-white/80 mt-2">{copy.message || 'Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, haz clic en el enlace para activar tu cuenta y poder iniciar sesión.'}</p>
                <div className="my-8">
                    <MailIcon className="w-16 h-16 mx-auto text-cyan-400" />
                </div>
                <p className="text-sm text-white/70">{copy.spamNote || '¿No has recibido el correo? Revisa tu carpeta de spam.'}</p>
                <button
                    onClick={onGoToLogin}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {copy.toLogin || 'Ir a Iniciar Sesión'}
                </button>
            </GlassCard>
        </div>
    );
};

export const PostOwnerRegisterPage: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => {
    const { scope } = useI18n();
    const copy = scope<any>('auth.postOwner') || {};
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-green-400" />
                <h2 className="text-3xl font-bold mt-4 text-white">{copy.title || '¡Felicidades!'}</h2>
                <p className="text-white/80 mt-2">{copy.message || 'Tu propiedad ha sido publicada y tu perfil de propietario está completo.'}</p>
                <div className="my-8">
                    <BuildingIcon className="w-16 h-16 mx-auto text-cyan-400" />
                </div>
                <p className="text-sm text-white/70">{copy.note || 'Ya puedes acceder a tu panel para gestionar tus propiedades y ver candidatos.'}</p>
                <button
                    onClick={onGoToDashboard}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {copy.toDashboard || 'Ir a mi panel'}
                </button>
            </GlassCard>
        </div>
    );
};

export const PostProfileCompletePage: React.FC<{ onProceed: () => void; role: UserRole }>
 = ({ onProceed, role }) => {
    const { scope } = useI18n();
    const copy = scope<any>('auth.welcome') || {};
    const description = role === UserRole.INQUILINO
        ? (copy.descTenant || 'Empieza a descubrir personas y espacios compatibles.')
        : role === UserRole.PROPIETARIO
        ? (copy.descOwner || 'Ya puedes gestionar tu vivienda y ver candidatos.')
        : (copy.descHost || 'Tu perfil está listo. Comparte tu hogar con la comunidad MoOn.');
    const ctaLabel = role === UserRole.INQUILINO
        ? (copy.ctaTenant || 'Ir a Descubrir')
        : role === UserRole.PROPIETARIO
        ? (copy.ctaOwner || 'Ir a mi Panel')
        : (copy.ctaHost || 'Configurar mi espacio');
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <SparklesIcon className="w-16 h-16 mx-auto text-yellow-300" />
                <h2 className="text-3xl font-extrabold mt-4 text-white">{copy.title || '¡Bienvenid@ a MoOn!'}</h2>
                <p className="text-white/80 mt-2">{description}</p>
                <div className="my-6">
                    <img src="/assets/auth-illustration.svg" alt={copy.imageAlt || 'Bienvenida MoOn'} className="w-full h-40 object-cover rounded-lg opacity-90" />
                </div>
                <button
                    onClick={onProceed}
                    className="mt-2 w-full bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
                >
                    {ctaLabel}
                </button>
            </GlassCard>
        </div>
    );
};

type RegistrationData = { rentalGoal: RentalGoal; city: string; locality: string };
type PublicationData = { property_type: PropertyType; city: string; locality: string };

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: (userData: Partial<User>, password?: string, role?: UserRole) => Promise<void>;
  onHomeClick: () => void;
  onOwnersClick: () => void;
  registrationData?: RegistrationData | null;
  publicationData?: PublicationData | null;
  initialMode: 'login' | 'register';
  onBlogClick: () => void;
  onAboutClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onContactClick: () => void;
  onRegisterClick: () => void;
  onSilverClick?: () => void;
  onCalculadoraClick?: () => void;
  onAmbassadorsClick?: () => void;
  onReferFriendsClick?: () => void;
  onBlueprintClick?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = (props) => {
  const {
    onLogin,
    onRegister,
    onHomeClick,
    onOwnersClick,
    registrationData,
    publicationData,
    initialMode,
    onBlogClick,
    onAboutClick,
    onPrivacyClick,
    onTermsClick,
    onContactClick,
    onRegisterClick,
    onSilverClick,
    onCalculadoraClick,
    onAmbassadorsClick,
    onReferFriendsClick,
    onBlueprintClick,
  } = props;
  const footerProps = {
    onBlogClick,
    onAboutClick,
    onPrivacyClick,
    onTermsClick,
    onContactClick,
    onOwnersClick,
    onSilverClick,
    onAmbassadorsClick,
    onReferFriendsClick,
    onBlueprintClick,
  };
  const { scope } = useI18n();
  const auth = scope<any>('auth') || {};
  
  const isGuidedRegisterMode = !!registrationData || !!publicationData;
  
  const [mode, setMode] = useState(isGuidedRegisterMode ? 'register' : initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INQUILINO);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [roleSelectedForSocial, setRoleSelectedForSocial] = useState(false);
  const [activeRoleHighlight, setActiveRoleHighlight] = useState<UserRole | null>(null);


  useEffect(() => {
    setMode(isGuidedRegisterMode ? 'register' : initialMode);
    setErrors({});
  }, [initialMode, isGuidedRegisterMode]);

  useEffect(() => {
    if (isGuidedRegisterMode) {
      setSelectedRole(publicationData ? UserRole.PROPIETARIO : UserRole.INQUILINO);
      setRoleSelectedForSocial(true);
    }
  }, [isGuidedRegisterMode, publicationData]);

  useEffect(() => {
    setActiveRoleHighlight(selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (mode !== 'register') {
      setBirthDay('');
      setBirthMonth('');
      setBirthYear('');
      setBirthDate('');
      setAge('');
      setErrors(prev => ({ ...prev, birth_date: null }));
    }
  }, [mode]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(() => {
    const maxYear = currentYear - MIN_AGE;
    const minYear = currentYear - MAX_AGE;
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

  const calculateAgeFromParts = (year: number, month: number, day: number) => {
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

  const validateBirthDate = (year: string, month: string, day: string) => {
    let errorMessage: string | null = null;
    if (!year || !month || !day) {
      errorMessage = 'Selecciona día, mes y año de nacimiento.';
    } else {
      const numericYear = Number(year);
      const numericMonth = Number(month);
      const numericDay = Number(day);
      const ageYears = calculateAgeFromParts(numericYear, numericMonth, numericDay);
      if (ageYears === null) {
        errorMessage = 'La fecha seleccionada no es válida.';
      } else if (ageYears < MIN_AGE) {
        errorMessage = `Debes ser mayor de ${MIN_AGE} años para registrarte.`;
      } else if (ageYears > MAX_AGE) {
        errorMessage = `¿Seguro? Indícanos una fecha realista (máx. ${MAX_AGE} años).`;
      } else {
        const iso = `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`;
        setBirthDate(iso);
        setAge(String(ageYears));
      }
    }

    if (errorMessage) {
      setBirthDate('');
      setAge('');
    }

    setErrors(prev => ({ ...prev, birth_date: errorMessage }));
    return errorMessage;
  };

  const handleBirthChange = (part: 'day' | 'month' | 'year', value: string) => {
    let nextDay = birthDay;
    let nextMonth = birthMonth;
    let nextYear = birthYear;

    if (part === 'day') nextDay = value;
    if (part === 'month') nextMonth = value;
    if (part === 'year') nextYear = value;

    const numericYear = Number(nextYear);
    const numericMonth = Number(nextMonth);
    const daysInMonth = getDaysInMonth(numericYear, numericMonth || 1);
    if (nextDay && Number(nextDay) > daysInMonth) {
      nextDay = String(daysInMonth);
    }

    setBirthDay(nextDay);
    setBirthMonth(nextMonth);
    setBirthYear(nextYear);

    validateBirthDate(nextYear, nextMonth, nextDay);
  };

  const validateField = (name: string, value: string): string | null => {
    let fieldError: string | null = null;
    switch (name) {
      case 'name':
        if (!value) fieldError = auth.errors?.nameRequired || 'El nombre es obligatorio.';
        else if (value.length < 3) fieldError = auth.errors?.nameTooShort || 'El nombre debe tener al menos 3 caracteres.';
        break;
      case 'email':
        if (!value) fieldError = auth.errors?.emailRequired || 'El email es obligatorio.';
        else if (!/\S+@\S+\.\S+/.test(value)) fieldError = auth.errors?.emailInvalid || 'El formato del email es inválido.';
        break;
      case 'password':
        if (!value) fieldError = auth.errors?.passwordRequired || 'La contraseña es obligatoria.';
        else if (value.length < 6) fieldError = auth.errors?.passwordTooShort || 'La contraseña debe tener al menos 6 caracteres.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: fieldError }));
    return fieldError;
  };

  const validateForm = () => {
    let isValid = true;
    if (mode === 'register') {
        if (validateField('name', name)) isValid = false;
        if (validateField('email', email)) isValid = false;
        if (validateField('password', password)) isValid = false;
        if (validateBirthDate(birthYear, birthMonth, birthDay)) isValid = false;
    } else {
        if (validateField('email', email)) isValid = false;
        if (validateField('password', password)) isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    setError('');
    setLoading(true);

    if (mode === 'register') {
        try {
            await onRegister({ email, name, age: parseInt(age, 10), birth_date: birthDate }, password, selectedRole);
        } catch (err: any) {
            console.error("Error de registro:", err);
            if (err.message && err.message.toLowerCase().includes('user already registered')) {
                setError(auth.errors?.emailRegistered || 'Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.');
                setMode('login'); // Switch to login mode
            } else {
                setError(err.message || auth.errors?.unknownRegister || 'Ocurrió un error desconocido durante el registro.');
            }
        }
    } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (signInError) {
            setError(auth.errors?.invalidCredentials || 'Credenciales inválidas. Por favor, inténtalo de nuevo.');
        } else if (authData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            if (profileData && !(profileData as User).is_banned) {
                onLogin(profileData as User);
            } else if (profileData && (profileData as User).is_banned) {
                setError(auth.errors?.accountSuspended || 'Esta cuenta ha sido suspendida.');
                await supabase.auth.signOut();
            } else if (profileError && profileError.code === 'PGRST116') {
                // Self-healing: Profile does not exist, but auth user does. Create a minimal profile.
                console.warn("User profile not found, attempting to create one for existing auth user.");
                const newProfile = {
                    id: authData.user.id,
                    name: authData.user.email?.split('@')[0] || 'Nuevo Usuario',
                    age: 18,
                    role: UserRole.INQUILINO,
                    avatar_url: `https://placehold.co/200x200/9ca3af/1f2937?text=${(authData.user.email || '?').charAt(0)}`,
                    interests: [],
                    lifestyle: [],
                    noise_level: 'Medio' as const,
                    bio: '',
                };
                
                const { data: newProfileData, error: newProfileError } = await supabase
                    .from('profiles')
                    .insert(newProfile)
                    .select()
                    .single();

                if (newProfileError) {
                    setError(`${auth.errors?.selfHealFailed || 'Hubo un error al reparar tu cuenta:'} ${newProfileError.message}`);
                    await supabase.auth.signOut();
                } else if (newProfileData) {
                    onLogin(newProfileData as User);
                }
            } else {
                setError(profileError?.message || auth.errors?.profileNotFound || 'No se pudo encontrar el perfil de usuario asociado a esta cuenta.');
                await supabase.auth.signOut();
            }
        }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (mode === 'register' && !isGuidedRegisterMode && !roleSelectedForSocial) {
      setError(auth.errors?.chooseRoleSocial || 'Por favor, selecciona si eres Inquilino o Propietario antes de continuar.');
      return;
    }
    
    setLoading(true);
    // FIX: The `data` property is valid for passing user metadata with OAuth in
    // recent versions of `supabase-js`, but the TypeScript types in this project
    // may be outdated. Casting to `any` to bypass the type check and allow
    // the 'role' to be passed to the user creation trigger.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        data: {
          role: selectedRole,
        },
      } as any,
    });

    if (error) {
      setError(`${auth.errors?.googleLoginPrefix || 'Error al iniciar sesión con Google:'} ${error.message}`);
      setLoading(false);
    }
  };

    const getSubtitle = () => {
    if (mode === 'register') {
        if(publicationData) {
            const locationCopy = publicationData.locality?.trim() ? ` ${auth.subtitles?.in || 'en'} ${publicationData.locality}` : '';
            const base = auth.subtitles?.registerWithPublication || 'Estás a un paso de publicar tu {property}{location}.';
            return base.replace('{property}', publicationData.property_type.toLowerCase()).replace('{location}', locationCopy);
        }
        if(registrationData) {
            const base = auth.subtitles?.registerWithRegistration || 'Crea tu cuenta para empezar a buscar en {locality}.';
            return base.replace('{locality}', registrationData.locality);
        }
        return auth.subtitles?.register || 'Únete a MoOn para encontrar tu match perfecto.';
    }
    return auth.subtitles?.login || 'Inicia sesión para continuar en tu espacio.';
  }

  const roleCards: Array<{
    role: UserRole;
    label: string;
    description: string;
    icon: JSX.Element;
  }> = [
    {
      role: UserRole.INQUILINO,
      label: 'Inquilino',
      description: 'Encuentra compañer@s compatibles y pisos verificados para reducir gastos.',
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      role: UserRole.PROPIETARIO,
      label: 'Propietario',
      description: 'Publica tu vivienda con seguridad, contratos claros y acompañamiento.',
      icon: <BuildingIcon className="w-6 h-6" />,
    },
    {
      role: UserRole.ANFITRION,
      label: 'Anfitrión',
      description: 'Comparte una habitación libre con apoyo humano y matches guiados.',
      icon: <HomeIcon className="w-6 h-6" />,
    },
  ];

  const renderRoleSelector = () => (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-white/70 uppercase tracking-[0.25em]">
        Quiero registrarme como
      </label>
      <div className="flex flex-col gap-3">
        {roleCards.map(card => {
          const isActive = selectedRole === card.role;
          const isHovered = activeRoleHighlight === card.role;
          return (
            <button
              key={card.role}
              type="button"
              onClick={() => {
                setSelectedRole(card.role);
                setRoleSelectedForSocial(true);
              }}
              onMouseEnter={() => setActiveRoleHighlight(card.role)}
              onMouseLeave={() => setActiveRoleHighlight(null)}
              className={`w-full rounded-3xl border px-5 py-5 text-left transition-all duration-200 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/10 backdrop-blur-md ${
                isActive
                  ? 'border-indigo-500/70 shadow-lg shadow-indigo-500/20'
                  : 'border-white/15 hover:border-indigo-400/50 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${
                    isActive ? 'bg-indigo-500/90 shadow-lg shadow-indigo-500/40' : 'bg-white/10'
                  }`}
                >
                  {card.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-white">{card.label}</span>
                  <span className={`text-sm leading-snug ${isActive || isHovered ? 'text-white/80' : 'text-white/60'}`}>
                    {card.description}
                  </span>
                </div>
              </div>
              {isActive && (
                <span className="text-xs font-semibold text-indigo-100 rounded-full bg-indigo-500/30 px-2 py-1 uppercase tracking-[0.2em]">
                  Seleccionado
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6 max-w-lg mx-auto md:mx-0"
    >
      <div className="space-y-3">
        <p className="text-sm text-white/70 text-center md:text-left">
          También puedes crear tu cuenta al instante con tus redes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!isGuidedRegisterMode && !roleSelectedForSocial}
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Google</span>
          </button>
          <button
            type="button"
            disabled={!isGuidedRegisterMode && !roleSelectedForSocial}
            className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FacebookIcon className="w-5 h-5" />
            <span>Facebook</span>
          </button>
        </div>
        {!isGuidedRegisterMode && !roleSelectedForSocial && (
          <p className="text-center text-xs text-yellow-300">
            {auth.errors?.chooseRoleSocial || 'Selecciona un rol para registrarte con redes sociales.'}
          </p>
        )}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/15"></div>
          </div>
          <div className="relative flex justify-center text-xs text-white/60">
            <span className="bg-transparent px-3">o completa tus datos manualmente</span>
          </div>
        </div>
      </div>
      {!isGuidedRegisterMode && renderRoleSelector()}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Nombre completo
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={(event) => validateField('name', event.target.value)}
            placeholder="Ej. Laura Campos"
            className={`rounded-2xl border bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${errors.name ? 'border-red-500' : 'border-white/20'}`}
          />
          {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
        </label>
        <div className="flex flex-col gap-2 text-sm text-white/80">
          Fecha de nacimiento
          <div className="grid grid-cols-3 gap-3">
            <select
              value={birthDay}
              onChange={(event) => handleBirthChange('day', event.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="" className="bg-slate-900" disabled hidden>
                Día
              </option>
              {daysOptions.map(day => (
                <option key={day} value={day} className="bg-slate-900">
                  {day}
                </option>
              ))}
            </select>
            <select
              value={birthMonth}
              onChange={(event) => handleBirthChange('month', event.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="" className="bg-slate-900" disabled hidden>
                Mes
              </option>
              {MONTH_OPTIONS.map(month => (
                <option key={month.value} value={month.value} className="bg-slate-900">
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(event) => handleBirthChange('year', event.target.value)}
              className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="" className="bg-slate-900" disabled hidden>
                Año
              </option>
              {yearOptions.map(year => (
                <option key={year} value={year} className="bg-slate-900">
                  {year}
                </option>
              ))}
            </select>
          </div>
          {errors.birth_date && <span className="text-xs text-red-400">{errors.birth_date}</span>}
          {!errors.birth_date && age && (
            <span className="text-xs text-white/60">Edad calculada: {age} años</span>
          )}
        </div>
      </div>
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Email personal
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={(event) => validateField('email', event.target.value)}
          placeholder="tuemail@gmail.com"
          className={`rounded-2xl border bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${errors.email ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Crea una contraseña segura
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={(event) => validateField('password', event.target.value)}
          placeholder="Mínimo 6 caracteres, mezcla texto y números"
          className={`rounded-2xl border bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${errors.password ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
      </label>

      <p className="text-xs text-white/60">
        Al crear tu cuenta aceptas nuestros{' '}
        <button type="button" onClick={onTermsClick} className="underline text-indigo-300">
          Términos de servicio
        </button>{' '}
        y la{' '}
        <button type="button" onClick={onPrivacyClick} className="underline text-indigo-300">
          Política de privacidad
        </button>.
      </p>

      {error && <span className="block text-center text-sm text-red-400">{error}</span>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta MoOn'}
      </button>
    </form>
  );

  const renderLoginForm = () => (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 max-w-md mx-auto md:mx-0"
    >
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={(event) => validateField('email', event.target.value)}
          placeholder="Introduce tu email de acceso"
          className={`rounded-2xl border bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${errors.email ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
      </label>
      <label className="flex flex-col gap-2 text-sm text-white/80">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={(event) => validateField('password', event.target.value)}
          placeholder="Tu contraseña segura"
          className={`rounded-2xl border bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${errors.password ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
      </label>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? auth.loading || 'Cargando...' : auth.form?.submitLogin || 'Iniciar sesión'}
      </button>
    </form>
  );


  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
      <Header
        onLoginClick={() => setMode('login')}
        onRegisterClick={() => setMode('register')}
        onHomeClick={onHomeClick}
        onOwnersClick={onOwnersClick}
        onBlogClick={footerProps.onBlogClick}
        onSilverClick={footerProps.onSilverClick}
        onCalculadoraClick={onCalculadoraClick}
        onAmbassadorsClick={onAmbassadorsClick}
        onReferFriendsClick={onReferFriendsClick}
        onBlueprintClick={onBlueprintClick}
        pageContext={publicationData ? 'propietario' : 'inquilino'}
      />
      <main className="relative flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
        <GlowBackground />
        <div className="relative w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-[46%_54%] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl backdrop-blur-xl">
            <div
              className="hidden md:flex relative p-10 items-end"
              style={{
                backgroundImage: `url(${mode === 'register' ? REGISTER_IMAGE_URL : LOGIN_IMAGE_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1220]/40 to-[#0b1220]/80" />
              <div className="relative z-10 max-w-sm space-y-3">
                <h3 className="text-3xl font-extrabold leading-tight">
                  {auth.illustration?.headline || 'Convive con gente compatible'}
                </h3>
                <p className="text-white/75 text-sm">
                  {auth.illustration?.subtitle || 'Perfiles verificados, procesos claros y soporte humano.'}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-2xl px-6 py-8 sm:px-10 sm:py-10">
              <div className="text-center space-y-3 mb-6">
                <div className="flex justify-center">
                  <Logo showText={false} size={44} />
                </div>
                <h2 className="text-3xl font-extrabold">
                  {mode === 'register' ? auth.form?.titleRegister || 'Crea tu cuenta' : auth.form?.titleLogin || 'Bienvenido de nuevo'}
                </h2>
                <p className="text-white/70 text-sm">{getSubtitle()}</p>
              </div>

              <div className="space-y-6">
                {mode === 'register' ? (
                  <>
                    {renderRegisterForm()}
                    <div className="text-center text-sm text-white/70">
                      {auth.toggle?.haveAccount || '¿Ya tienes cuenta?'}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setError('');
                          setErrors({});
                        }}
                        className="font-semibold text-indigo-300 hover:underline"
                      >
                        {auth.toggle?.goLogin || 'Inicia sesión'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {renderLoginForm()}
                    <div className="text-center text-sm text-white/70">
                      {auth.toggle?.noAccount || '¿No tienes cuenta?'}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setError('');
                          setErrors({});
                        }}
                        className="font-semibold text-indigo-300 hover:underline"
                      >
                        {auth.toggle?.goRegister || 'Regístrate'}
                      </button>
                    </div>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-transparent text-white/70">
                          {auth.orContinueWith || 'O continúa con'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                      >
                        <GoogleIcon className="w-5 h-5" />
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                      >
                        <FacebookIcon className="w-5 h-5" />
                        <span>Facebook</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer {...footerProps} />
    </div>
  );
};

export default LoginPage;
