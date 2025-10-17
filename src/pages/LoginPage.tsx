import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import { User, UserRole, RentalGoal, PropertyType } from '../types';
import { GoogleIcon, FacebookIcon, UsersIcon, BuildingIcon, MailIcon, CheckCircleIcon, SparklesIcon } from '../components/icons';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabaseClient';
import Logo from '../components/Logo';
import loginCompanions from '../assets/login-companions.svg';
import registerHarmony from '../assets/register-harmony.svg';

interface PostRegisterPageProps {
    onGoToLogin: () => void;
}

export const PostRegisterPage: React.FC<PostRegisterPageProps> = ({ onGoToLogin }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <div className="flex justify-center">
                    <Logo showText={false} size={44} />
                </div>
                <h2 className="text-3xl font-bold mt-4 text-white">¡Un último paso!</h2>
                <p className="text-white/80 mt-2">
                    Hemos enviado un enlace de verificación a tu correo electrónico.
                    Por favor, haz clic en el enlace para activar tu cuenta y poder iniciar sesión.
                </p>
                <div className="my-8">
                    <MailIcon className="w-16 h-16 mx-auto text-cyan-400" />
                </div>
                <p className="text-sm text-white/70">
                    ¿No has recibido el correo? Revisa tu carpeta de spam.
                </p>
                <button
                    onClick={onGoToLogin}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Ir a Iniciar Sesión
                </button>
            </GlassCard>
        </div>
    );
};

export const PostOwnerRegisterPage: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-green-400" />
                <h2 className="text-3xl font-bold mt-4 text-white">¡Felicidades!</h2>
                <p className="text-white/80 mt-2">
                    Tu propiedad ha sido publicada y tu perfil de propietario está completo.
                </p>
                <div className="my-8">
                    <BuildingIcon className="w-16 h-16 mx-auto text-cyan-400" />
                </div>
                <p className="text-sm text-white/70">
                    Ya puedes acceder a tu panel para gestionar tus propiedades y ver candidatos.
                </p>
                <button
                    onClick={onGoToDashboard}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Ir a mi panel
                </button>
            </GlassCard>
        </div>
    );
};

export const PostProfileCompletePage: React.FC<{ onProceed: () => void; role: UserRole }>
 = ({ onProceed, role }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md text-center animate-fade-in-up">
                <SparklesIcon className="w-16 h-16 mx-auto text-yellow-300" />
                <h2 className="text-3xl font-extrabold mt-4 text-white">¡Bienvenid@ a MoOn!</h2>
                <p className="text-white/80 mt-2">
                    Tu perfil está completo y listo. {role === UserRole.INQUILINO ? 'Empieza a descubrir personas y espacios compatibles.' : 'Ya puedes gestionar tu vivienda y ver candidatos.'}
                </p>
                <div className="my-6">
                    <img src="/assets/auth-illustration.svg" alt="Bienvenida MoOn" className="w-full h-40 object-cover rounded-lg opacity-90" />
                </div>
                <button
                    onClick={onProceed}
                    className="mt-2 w-full bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
                >
                    {role === UserRole.INQUILINO ? 'Ir a Descubrir' : 'Ir a mi Panel'}
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
}

const LoginPage: React.FC<LoginPageProps> = (props) => {
  const { onLogin, onRegister, onHomeClick, onOwnersClick, registrationData, publicationData, initialMode, ...footerProps } = props;
  
  const isGuidedRegisterMode = !!registrationData || !!publicationData;
  
  const [mode, setMode] = useState(isGuidedRegisterMode ? 'register' : initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INQUILINO);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [roleSelectedForSocial, setRoleSelectedForSocial] = useState(false);


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

  const validateField = (name: string, value: string) => {
    let fieldError: string | null = null;
    switch (name) {
      case 'name':
        if (!value) fieldError = 'El nombre es obligatorio.';
        else if (value.length < 3) fieldError = 'El nombre debe tener al menos 3 caracteres.';
        break;
      case 'age':
        if (!value) fieldError = 'La edad es obligatoria.';
        else if (isNaN(Number(value)) || Number(value) < 18 || Number(value) > 120) {
          fieldError = 'Debes tener entre 18 y 120 años.';
        }
        break;
      case 'email':
        if (!value) fieldError = 'El email es obligatorio.';
        else if (!/\S+@\S+\.\S+/.test(value)) fieldError = 'El formato del email es inválido.';
        break;
      case 'password':
        if (!value) fieldError = 'La contraseña es obligatoria.';
        else if (value.length < 6) fieldError = 'La contraseña debe tener al menos 6 caracteres.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (mode === 'register') {
        validateField('name', name);
        validateField('age', age);
        validateField('email', email);
        validateField('password', password);
        // Re-check after setting errors
        if (!name || name.length < 3 || !age || Number(age) < 18 || !email || !/\S+@\S+\.\S+/.test(email) || !password || password.length < 6) {
            return false;
        }
    } else {
        validateField('email', email);
        validateField('password', password);
        if (!email || !/\S+@\S+\.\S+/.test(email) || !password) {
            return false;
        }
    }
    return Object.values(errors).every(e => e === null);
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
            await onRegister({ email, name, age: parseInt(age, 10) }, password, selectedRole);
        } catch (err: any) {
            console.error("Error de registro:", err);
            if (err.message && err.message.toLowerCase().includes('user already registered')) {
                setError('Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.');
                setMode('login'); // Switch to login mode
            } else {
                setError(err.message || 'Ocurrió un error desconocido durante el registro.');
            }
        }
    } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (signInError) {
            setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
        } else if (authData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            if (profileData && !(profileData as User).is_banned) {
                onLogin(profileData as User);
            } else if (profileData && (profileData as User).is_banned) {
                setError('Esta cuenta ha sido suspendida.');
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
                    setError(`Hubo un error al reparar tu cuenta: ${newProfileError.message}`);
                    await supabase.auth.signOut();
                } else if (newProfileData) {
                    onLogin(newProfileData as User);
                }
            } else {
                setError(profileError?.message || "No se pudo encontrar el perfil de usuario asociado a esta cuenta.");
                await supabase.auth.signOut();
            }
        }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (mode === 'register' && !isGuidedRegisterMode && !roleSelectedForSocial) {
      setError('Por favor, selecciona si eres Inquilino o Propietario antes de continuar.');
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
      setError(`Error al iniciar sesión con Google: ${error.message}`);
      setLoading(false);
    }
  };

  const getSubtitle = () => {
    if (mode === 'register') {
        if(publicationData) return `Estás a un paso de publicar tu ${publicationData.property_type.toLowerCase()} en ${publicationData.locality}.`;
        if(registrationData) return `Crea tu cuenta para empezar a buscar en ${registrationData.locality}.`
        return 'Únete a MoOn para encontrar tu match perfecto.';
    }
    return 'Inicia sesión para continuar en tu espacio.';
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
      <Header onLoginClick={() => setMode('login')} onRegisterClick={() => setMode('register')} onHomeClick={onHomeClick} onOwnersClick={onOwnersClick} pageContext={publicationData ? 'propietario' : 'inquilino'} />
      <main className="relative flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
        <GlowBackground />
        <div className="relative w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
            {/* Illustration side */}
            <div
              className="hidden md:flex relative p-8 items-end"
              style={{
                backgroundImage: `url(${mode === 'register' ? registerHarmony : loginCompanions})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b1220]/65" />
              <div className="relative z-10 text-left max-w-sm">
                <h3 className="text-2xl font-extrabold leading-tight">Convive con gente compatible</h3>
                <p className="text-white/75 mt-2">Perfiles verificados, procesos claros y soporte humano.</p>
              </div>
            </div>
            {/* Form side */}
            <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="flex justify-center">
                  <Logo showText={false} size={40} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">{mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
                <p className="text-white/70 mt-1">{getSubtitle()}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {!isGuidedRegisterMode && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Quiero registrarme como:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => { setSelectedRole(UserRole.INQUILINO); setRoleSelectedForSocial(true); }} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedRole === UserRole.INQUILINO ? 'bg-indigo-500/30 border-indigo-400' : 'bg-white/10 border-transparent hover:border-white/30'}`}>
                        <UsersIcon className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Inquilino</span>
                      </button>
                      <button type="button" onClick={() => { setSelectedRole(UserRole.PROPIETARIO); setRoleSelectedForSocial(true); }} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${selectedRole === UserRole.PROPIETARIO ? 'bg-indigo-500/30 border-indigo-400' : 'bg-white/10 border-transparent hover:border-white/30'}`}>
                        <BuildingIcon className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Propietario</span>
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nombre Completo</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} onBlur={(e) => validateField('name', e.target.value)} className={`w-full bg-white/10 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-white/20'}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                 <div>
                  <label htmlFor="age" className="block text-sm font-medium text-white/80 mb-1">Edad</label>
                  <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} onBlur={(e) => validateField('age', e.target.value)} className={`w-full bg-white/10 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.age ? 'border-red-500' : 'border-white/20'}`} />
                  {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={(e) => validateField('email', e.target.value)} className={`w-full bg-white/10 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-white/20'}`} placeholder="tu@email.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">Contraseña</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={(e) => validateField('password', e.target.value)} className={`w-full bg-white/10 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? 'border-red-500' : 'border-white/20'}`} placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg">
              {loading ? 'Cargando...' : mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
            
            <div className="text-center text-sm">
                {mode === 'login' ? (
                    <p className="text-white/70">¿No tienes cuenta? <button type="button" onClick={() => { setMode('register'); setError(''); setErrors({}); }} className="font-semibold text-indigo-400 hover:underline">Regístrate</button></p>
                ) : (
                    <p className="text-white/70">¿Ya tienes cuenta? <button type="button" onClick={() => { setMode('login'); setError(''); setErrors({}); }} className="font-semibold text-indigo-400 hover:underline">Inicia sesión</button></p>
                )}
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/20"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-transparent text-white/70">O continúa con</span></div>
            </div>

            {mode === 'register' && !isGuidedRegisterMode && !roleSelectedForSocial && (
                <p className="text-center text-xs text-yellow-400 -mt-2 mb-2">
                    Por favor, selecciona un rol para registrarte con redes sociales.
                </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={handleGoogleLogin} disabled={mode === 'register' && !isGuidedRegisterMode && !roleSelectedForSocial} className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <GoogleIcon className="w-5 h-5" /><span>Google</span>
              </button>
               <button type="button" disabled={mode === 'register' && !isGuidedRegisterMode && !roleSelectedForSocial} className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <FacebookIcon className="w-5 h-5" /><span>Facebook</span>
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      </main>
      <Footer {...props} />
    </div>
  );
};

export default LoginPage;
