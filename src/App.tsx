import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import HomePage from './pages/HomePage';
import OwnerLandingPage from './pages/OwnerLandingPage';
import LoginPage, { PostRegisterPage, PostOwnerRegisterPage, PostProfileCompletePage } from './pages/LoginPage';
import TenantDashboard, {
  calculateCompatibilityBreakdown,
  calculateCompatibility,
  DiscoverProfileOpenOptions,
  TenantDashboardView,
  DEFAULT_TENANT_DASHBOARD_COPY,
  TenantDashboardCopy,
} from './dashboards/TenantDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import HostDashboard from './dashboards/HostDashboard';
const AdminDashboard = React.lazy(() => import('./dashboards/AdminDashboard'));
import AccountLayout from './pages/account/AccountLayout';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import Silver from './pages/Silver';
import DiscoverProfilePage from './pages/DiscoverProfile';
import CalculadoraAntiEspeculacion from './pages/CalculadoraAntiEspeculacion';
import AmbassadorsPage from './pages/AmbassadorsPage';
import ReferFriendsPage from './pages/ReferFriendsPage';
import PerfectAppPlanPage from './pages/PerfectAppPlanPage';
import { User, UserRole, RentalGoal, Property, PropertyType, SavedSearch, BlogPost, Notification, NotificationType, HostListing } from './types';
import { MOCK_BLOG_POSTS } from './constants';
import { supabase } from './lib/supabaseClient';
import { syncFluentContact, notifyFluentCrmNewProperty } from './lib/fluentCrm';
import { fetchAllHostListings, createHostListing, updateHostListing, type HostListingInput } from './lib/hostListings';
import AddHostListingModal from './dashboards/components/AddHostListingModal';
import Logo from './components/Logo';
import MatchCelebration from './components/MatchCelebration';
import { useI18n, getPathWithoutLanguage } from './i18n';
import { ProfileQuizWizard } from './features/profileQuiz';
import TenantOnboarding from './onboarding/TenantOnboarding';
import OwnerOnboarding from './onboarding/OwnerOnboarding';
import HostOnboarding from './onboarding/HostOnboarding';
import SkipToContentLink from './components/SkipToContentLink';

type Page =
  | 'home'
  | 'owners'
  | 'login'
  | 'tenant-dashboard'
  | 'owner-dashboard'
  | 'host-dashboard'
  | 'admin-dashboard'
  | 'account'
  | 'blog'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'post-register'
  | 'post-owner-register'
  | 'post-profile-complete'
  | 'silver'
  | 'discover-profile'
  | 'calculadora-anti-especulacion'
  | 'tenant-onboarding'
  | 'owner-onboarding'
  | 'host-onboarding'
  | 'ambassadors'
  | 'refer'
  | 'plan';

const PAGE_PATHS: Partial<Record<Page, string>> = {
  silver: '/silver',
  'calculadora-anti-especulacion': '/calculadora-anti-especulacion',
  ambassadors: '/ambassadors',
  refer: '/refer',
  plan: '/plan',
  'admin-dashboard': '/admin',
};

type RegistrationData = { rentalGoal: RentalGoal; city: string; locality: string };
type PublicationData = { property_type: PropertyType; city: string; locality: string };

type AdminNotificationPayload =
  | {
      type: 'new_tenant';
      tenant: {
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        city?: string | null;
        locality?: string | null;
        rental_goal?: RentalGoal | null;
        budget?: number | null;
        lifestyle?: string[] | null;
        bio?: string | null;
        role?: UserRole | null;
      };
      meta?: {
        profile_url?: string | null;
      };
    }
  | {
      type: 'new_property';
      property: {
        id: number;
        title?: string | null;
        address?: string | null;
        city?: string | null;
        locality?: string | null;
        property_type?: PropertyType | null;
        price?: number | null;
        visibility?: 'Pública' | 'Privada';
        available_from?: string | null;
        status?: 'approved' | 'pending' | 'rejected';
        url?: string | null;
      };
      owner: {
        id: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
      };
    };

function App() {
  const { localizePath, scope, language } = useI18n();
  const [page, setPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');

  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [hostListings, setHostListings] = useState<HostListing[]>([]);
  const [isHostListingModalOpen, setHostListingModalOpen] = useState(false);
  const [hostListingToEdit, setHostListingToEdit] = useState<HostListing | null>(null);
  const [isSavingHostListing, setIsSavingHostListing] = useState(false);
  const [isQuizOpen, setQuizOpen] = useState(false);

  const refreshHostListings = useCallback(async () => {
    const response = await fetchAllHostListings();
    if (response.error) {
      console.error("Error fetching host listings:", response.error.message);
      return;
    }
    if (response.data) {
      setHostListings(response.data as HostListing[]);
    }
  }, []);
  const loadNotifications = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('delivered_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Error fetching notifications:', error.message);
      return;
    }
    setNotifications(data as Notification[]);
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: number) => {
    let shouldSync = false;
    const readTimestamp = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => {
        if (item.id === notificationId && !item.read_at) {
          shouldSync = true;
          return { ...item, read_at: readTimestamp };
        }
        return item;
      }),
    );
    if (!shouldSync) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readTimestamp })
      .eq('id', notificationId);
    if (error) {
      console.error('Error updating notification', error.message);
    }
  }, []);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [matches, setMatches] = useState<{ [key: string]: string[] }>({});
  const [matchCelebration, setMatchCelebration] = useState<{ user: User; compatibility?: number } | null>(null);
  const [tenantViewRequest, setTenantViewRequest] = useState<TenantDashboardView | null>(null);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const QUIZ_SNOOZE_STORAGE_KEY = 'moon.quiz.snooze_until';

  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [publicationData, setPublicationData] = useState<PublicationData | null>(null);
  const [accountInitialTab, setAccountInitialTab] = useState<string>('overview');
  const handleTenantViewConsumed = useCallback(() => setTenantViewRequest(null), []);
  const handleCloseMatchCelebration = useCallback(() => setMatchCelebration(null), []);
  const handleOpenMatchesFromCelebration = useCallback(() => {
    setMatchCelebration(null);
    setTenantViewRequest('matches');
    setPage('tenant-dashboard');
  }, [setPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.sessionStorage.getItem('moon_pending_section');
      if (stored) {
        setPendingSection(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (page !== 'home' || typeof window === 'undefined') return;
    try {
      const stored = window.sessionStorage.getItem('moon_pending_section');
      if (stored) {
        setPendingSection(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, [page]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!currentUser) {
      setQuizOpen(false);
      return;
    }
    if (currentUser.role === UserRole.ADMIN) {
      setQuizOpen(false);
      return;
    }
    if (currentUser.convivencia_quiz_completed) {
      setQuizOpen(false);
      return;
    }
    try {
      const snoozeUntilRaw = window.localStorage.getItem(QUIZ_SNOOZE_STORAGE_KEY);
      if (snoozeUntilRaw) {
        const snoozeUntil = Number(snoozeUntilRaw);
        if (Number.isFinite(snoozeUntil) && Date.now() < snoozeUntil) {
          setQuizOpen(false);
          return;
        }
        window.localStorage.removeItem(QUIZ_SNOOZE_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
    setQuizOpen(true);
  }, [currentUser, QUIZ_SNOOZE_STORAGE_KEY]);

  useEffect(() => {
    if (!pendingSection || typeof window === 'undefined') return;
    let rafId: number;
    const attemptScroll = () => {
      const element = document.getElementById(pendingSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        try {
          window.sessionStorage.removeItem('moon_pending_section');
        } catch {
          // ignore storage errors
        }
        setPendingSection(null);
      } else {
        rafId = window.requestAnimationFrame(attemptScroll);
      }
    };
    rafId = window.requestAnimationFrame(attemptScroll);
    return () => window.cancelAnimationFrame(rafId);
  }, [pendingSection]);

  const tenantCompatibilityLabels = useMemo(() => {
    const tenantMessages = scope<Record<string, any>>('tenantDashboard') || {};
    const labels = tenantMessages?.compatibility?.labels || {};
    const fallback = DEFAULT_TENANT_DASHBOARD_COPY.compatibility.labels;
    return {
      interests: labels.interests ?? fallback.interests,
      age: labels.age ?? fallback.age,
      noiseLevel: labels.noiseLevel ?? fallback.noiseLevel,
      lifestyle: labels.lifestyle ?? fallback.lifestyle,
    };
  }, [language]);

  type DiscoverProfileContext = {
    queue: User[];
    index: number;
    source: 'discover' | 'matches' | 'other';
  };
  const [discoverProfileContext, setDiscoverProfileContext] = useState<DiscoverProfileContext | null>(null);
  
  const exitDiscoverProfile = () => {
    setDiscoverProfileContext(null);
    setPage(currentUser ? 'tenant-dashboard' : 'home');
  };

  const goToNextDiscoverProfile = () => {
    let shouldExit = false;
    setDiscoverProfileContext(prev => {
      if (!prev) return prev;
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.queue.length) {
        shouldExit = true;
        return null;
      }
      return { ...prev, index: nextIndex };
    });
    if (shouldExit) {
      setPage(currentUser ? 'tenant-dashboard' : 'home');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const normalizedPath = getPathWithoutLanguage(window.location.pathname);
    const entry = Object.entries(PAGE_PATHS).find(([, path]) => path === normalizedPath);
    if (entry) {
      setPage(entry[0] as Page);
    }
    // Capture referral code from URL and persist for post-signup attribution
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get('ref');
      if (ref) {
        window.localStorage.setItem('moon_ref_code', ref);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetPath = PAGE_PATHS[page];
    const specialPaths = Object.values(PAGE_PATHS).filter((value): value is string => Boolean(value));
    if (targetPath) {
      window.history.replaceState({}, '', localizePath(targetPath));
    } else {
      const normalizedPath = getPathWithoutLanguage(window.location.pathname);
      if (specialPaths.includes(normalizedPath)) {
        window.history.replaceState({}, '', localizePath('/'));
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [page, localizePath]);
  
  useEffect(() => {
    let isMounted = true;

    const syncAppStateFromSession = async (
        session: Session | null,
        options: { skipLoader?: boolean } = {}
    ) => {
        if (!isMounted) return;

        if (!options.skipLoader) {
            setLoading(true);
        }

        if (!session?.user) {
            setCurrentUser(null);
            setUsers([]);
            setProperties([]);
            setHostListings([]);
            setMatches({});
            setPage('home');
            if (!options.skipLoader && isMounted) {
                setLoading(false);
            }
            return;
        }

        try {
            const [allUsersRes, propertiesRes, hostListingsRes, matchesRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('properties').select('*'),
                fetchAllHostListings(),
                supabase.from('matches').select('*') // Fetch all matches for now for owner dashboard
            ]);

            if (!isMounted) return;

            if (allUsersRes.data) setUsers(allUsersRes.data as User[]);
            if (propertiesRes.data) setProperties(propertiesRes.data as Property[]);
            if (hostListingsRes.error) {
                console.error("Error fetching host listings:", hostListingsRes.error.message);
            } else if (hostListingsRes.data) {
                setHostListings(hostListingsRes.data as HostListing[]);
            }

            if (matchesRes.error) {
                console.error("Error fetching matches:", matchesRes.error.message);
            } else if (matchesRes.data) {
                const allMatches = matchesRes.data;
                const matchesByuser = allMatches.reduce((acc, match) => {
                    if (!acc[match.user_id]) {
                        acc[match.user_id] = [];
                    }
                    acc[match.user_id].push(match.matched_user_id);
                    return acc;
                }, {} as { [key: string]: string[] });
                setMatches(matchesByuser);
            }

            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!isMounted) return;

            if (profileError) {
                console.error("Warning: could not fetch profile:", profileError.message);
            } else if (profile) {
                const typedProfile = profile as User;
                setCurrentUser(typedProfile);
                void loadNotifications(typedProfile.id);

                if (typedProfile.role === UserRole.ADMIN) {
                    setPage('admin-dashboard');
                } else if (typedProfile.onboarding_status !== 'completed') {
                    if (typedProfile.role === UserRole.PROPIETARIO) {
                        setPage('owner-onboarding');
                    } else if (typedProfile.role === UserRole.ANFITRION) {
                        setPage('host-onboarding');
                    } else {
                        setPage('tenant-onboarding');
                    }
                } else if (typedProfile.is_profile_complete) {
                    if (typedProfile.role === UserRole.PROPIETARIO) {
                        setPage('owner-dashboard');
                    } else if (typedProfile.role === UserRole.ANFITRION) {
                        setPage('host-dashboard');
                    } else {
                        setPage('tenant-dashboard');
                    }
                } else {
                    setPage('account');
                }
            }
        } catch (error) {
            console.error("Error during initial data load:", error);
        } finally {
            if (!options.skipLoader && isMounted) {
                setLoading(false);
            }
        }
    };

    const bootstrapSession = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
            console.error("Error fetching initial session:", error.message);
            setLoading(false);
            return;
        }

        await syncAppStateFromSession(data.session);
    };

    void bootstrapSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
        const skipLoader = event === 'TOKEN_REFRESHED';
        void syncAppStateFromSession(session, { skipLoader });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const triggerWelcomeEmail = async (user: User) => {
    if (!user || !user.email || !user.name || !user.role) {
      console.error("DEBUG: Cannot trigger welcome email, user data is incomplete.", user);
      return;
    }
    
    console.log(`DEBUG: Attempting to trigger welcome email for user: ${user.email} with role: ${user.role}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
  
      if (error) {
        // This catches invocation-level errors (e.g., function not found, RLS issues)
        throw error;
      }
  
      console.log("DEBUG: Welcome email function invoked successfully. Response:", data);
    } catch (error) {
      // This catches both invocation errors and network errors
      // Don't block the UI for this, just log it for debugging.
      console.error(
        "DEBUG: Failed to invoke 'send-welcome-email' function. Check the Supabase Edge Function logs for details.",
        error
      );
    }
  };

  const triggerAdminNotification = async (payload: AdminNotificationPayload) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: payload,
      });

      if (error) {
        throw error;
      }

      console.log(`DEBUG: Admin notification '${payload.type}' invoked successfully.`, data);
    } catch (error) {
      console.error(
        "DEBUG: Failed to invoke 'send-admin-notification' function. Check Supabase logs for details.",
        error
      );
    }
  };

  const triggerMutualMatchEmail = async (userA: User, userB: User, compatibility?: number) => {
    if (!userA?.email || !userB?.email) {
      console.warn("DEBUG: Skipping match email because one of the users is missing an email address.", {
        userAEmail: userA?.email,
        userBEmail: userB?.email,
      });
      return;
    }

    const nextStepsUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard?tab=matches`
      : undefined;

    const payload = {
      userA: {
        email: userA.email,
        name: userA.name,
        city: userA.city ?? null,
        avatar_url: userA.avatar_url ?? null,
      },
      userB: {
        email: userB.email,
        name: userB.name,
        city: userB.city ?? null,
        avatar_url: userB.avatar_url ?? null,
      },
      compatibility: compatibility ?? null,
      nextStepsUrl,
    };

    try {
      const { data, error } = await supabase.functions.invoke('send-match-email', {
        body: payload,
      });

      if (error) {
        throw error;
      }

      console.log("DEBUG: Match email function invoked successfully. Response:", data);
    } catch (error) {
      console.error(
        "DEBUG: Failed to invoke 'send-match-email' function. Check the Supabase Edge Function logs for details.",
        error
      );
    }
  };

  const handleLogin = (user: User) => {
    setUsers(prev => prev.find(u => u.id === user.id) ? prev : [...prev, user]);
    setCurrentUser(user);
    setRegistrationData(null);
    setPublicationData(null);
    if (user.role === UserRole.ADMIN) setPage('admin-dashboard');
    else if (user.is_profile_complete === false) {
        setAccountInitialTab('profile');
        setPage('account');
    }
    else if (user.role === UserRole.PROPIETARIO) setPage('owner-dashboard');
    else if (user.role === UserRole.ANFITRION) setPage('host-dashboard');
    else setPage('tenant-dashboard');
  };
  
  const handleRegister = async (userData: Partial<User>, password?: string, role?: UserRole) => {
    if (!password || !userData.email) {
      throw new Error("Email y contraseña son requeridos para el registro.");
    }
    
    const roleToRegister = role || (publicationData ? UserRole.PROPIETARIO : UserRole.INQUILINO);
    const dataForAuth = {
        name: userData.name,
        age: userData.age,
        birth_date: userData.birth_date,
        role: roleToRegister,
        city: publicationData?.city || registrationData?.city,
        locality: publicationData?.locality || registrationData?.locality,
        rental_goal: registrationData?.rentalGoal,
        avatar_url: `https://placehold.co/200x200/9ca3af/1f2937?text=${(userData.name || '?').charAt(0)}`,
    };

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: password,
      options: {
        data: dataForAuth
      }
    });

    if (authError) {
      console.error('Error en el registro de Auth:', authError.message);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Registro completado, pero no se pudo obtener la información del usuario. Por favor, verifica tu email e intenta iniciar sesión.');
    }

    const calculatedAge = (() => {
      if (typeof userData.age === 'number') return userData.age;
      if (userData.birth_date) {
        const birth = new Date(userData.birth_date);
        if (!Number.isNaN(birth.getTime())) {
          const now = new Date();
          let ageYears = now.getFullYear() - birth.getFullYear();
          const monthDiff = now.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
            ageYears -= 1;
          }
          return Math.min(100, Math.max(18, ageYears));
        }
      }
      return 18;
    })();

    const minimalUser: User = {
      id: authData.user.id,
      name: userData.name || userData.email?.split('@')[0] || 'Nuevo usuario',
      email: userData.email,
      age: calculatedAge,
      birth_date: userData.birth_date,
      role: roleToRegister,
      city: dataForAuth.city,
      locality: dataForAuth.locality,
      rental_goal: registrationData?.rentalGoal,
      avatar_url: dataForAuth.avatar_url,
      interests: [],
      lifestyle: [],
      noise_level: 'Medio',
      compatibility: 0,
      bio: '',
    };

    triggerWelcomeEmail(minimalUser);
    void syncFluentContact(minimalUser);

    // Attribute referral if code was present in URL before signup
    try {
      const code = window.localStorage.getItem('moon_ref_code');
      if (code) {
        const { attributeReferral } = await import('./lib/referrals');
        void attributeReferral(code, userData.email || undefined);
        window.localStorage.removeItem('moon_ref_code');
      }
    } catch {}

    setRegistrationData(null);
    setPublicationData(null);
    setPage('post-register');
  };


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error al cerrar sesión:", error.message);
        alert(`Error al cerrar sesión: ${error.message}`);
    }
    // The onAuthStateChange listener will handle the rest:
    // clearing state (setCurrentUser, setMatches) and redirecting (setPage).
  };

  const handleStartRegistration = (data: RegistrationData) => {
    setRegistrationData(data);
    setPublicationData(null);
    setLoginInitialMode('register');
    setPage('login');
  };

  const handleStartPublication = (data: PublicationData) => {
    setPublicationData(data);
    setRegistrationData(null);
    setLoginInitialMode('register');
    setPage('login');
  };

  const openHostListingModal = useCallback((listing?: HostListing | null) => {
    setHostListingToEdit(listing ?? null);
    setHostListingModalOpen(true);
  }, []);

  const closeHostListingModal = useCallback(() => {
    setHostListingModalOpen(false);
    setHostListingToEdit(null);
  }, []);

  const handleHostListingCta = useCallback(() => {
    openHostListingModal(null);
  }, [openHostListingModal]);

  const handleHostDiscoverNavigation = useCallback(() => {
    setTenantViewRequest('discover');
    setPage('tenant-dashboard');
  }, []);
  
  const handleGoToLogin = () => {
    setRegistrationData(null);
    setPublicationData(null);
    setLoginInitialMode('login');
    setPage('login');
  };

  const handleGoToDashboard = () => {
    if (!currentUser) {
      handleGoToLogin();
      return;
    }

    if (!currentUser.is_profile_complete) {
      setAccountInitialTab('overview');
      setPage('account');
      return;
    }

    if (currentUser.role === UserRole.ADMIN) {
      setPage('admin-dashboard');
      return;
    }

    if (currentUser.role === UserRole.PROPIETARIO) {
      setPage('owner-dashboard');
      return;
    }
    if (currentUser.role === UserRole.ANFITRION) {
      setPage('host-dashboard');
      return;
    }
    setPage('tenant-dashboard');
  };
  
  const handleOpenDiscoverProfile = (user: User, options?: DiscoverProfileOpenOptions) => {
    const queue = options?.queue && options.queue.length > 0 ? options.queue : [user];
    let index: number;
    if (typeof options?.index === 'number' && options.index >= 0 && options.index < queue.length) {
      index = options.index;
    } else {
      const foundIndex = queue.findIndex(q => q.id === user.id);
      index = foundIndex >= 0 ? foundIndex : 0;
    }
    setDiscoverProfileContext({
      queue,
      index,
      source: options?.source ?? 'other',
    });
    setPage('discover-profile');
  };

  const currentDiscoverProfile = useMemo(() => {
    if (!discoverProfileContext || !discoverProfileContext.queue.length) return null;
    const { queue, index } = discoverProfileContext;
    const candidate = queue[Math.min(index, queue.length - 1)];
    if (!candidate) return null;
    const fresh = users.find(u => u.id === candidate.id);
    return fresh ? { ...fresh, compatibility: candidate.compatibility ?? fresh.compatibility } : candidate;
  }, [discoverProfileContext, users]);

  const discoverCompatibilityBreakdown = useMemo(() => {
    if (currentUser && currentDiscoverProfile) {
      return calculateCompatibilityBreakdown(currentUser, currentDiscoverProfile, tenantCompatibilityLabels);
    }
    return undefined;
  }, [currentUser, currentDiscoverProfile, tenantCompatibilityLabels]);

  const handleDiscoverSkip = () => {
    goToNextDiscoverProfile();
  };

  const handleDiscoverLike = async (user: User) => {
    await handleAddMatch(user.id);
    goToNextDiscoverProfile();
  };

  const handleGoToAccountSettings = () => {
    setAccountInitialTab('profile');
    setPage('account');
  };

  const handleQuizSkip = () => {
    if (typeof window !== 'undefined') {
      const twelveHours = 12 * 60 * 60 * 1000;
      try {
        window.localStorage.setItem(QUIZ_SNOOZE_STORAGE_KEY, String(Date.now() + twelveHours));
      } catch {
        // ignore storage errors
      }
    }
    setQuizOpen(false);
  };

  const syncUserLocally = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
  }, []);

  const handleQuizCompleted = (updatedUser: User) => {
    syncUserLocally(updatedUser);
    setQuizOpen(false);
  };

  const handleOnboardingFinished = (updatedUser: User) => {
    syncUserLocally(updatedUser);
    if (updatedUser.role === UserRole.PROPIETARIO) {
      setPage('owner-dashboard');
    } else if (updatedUser.role === UserRole.ANFITRION) {
      setPage('host-dashboard');
    } else {
      setPage('tenant-dashboard');
    }
  };

  const handleUpdateUser = async (updatedUser: User): Promise<void> => {
    if (!currentUser) return;
    
    const shouldMarkProfileComplete = !currentUser.is_profile_complete && updatedUser.bio && updatedUser.bio.length >= 100;

    // Optimistic UI update for redirection
    if (shouldMarkProfileComplete) {
        const tempUser = { ...currentUser, ...updatedUser, is_profile_complete: true };
        setCurrentUser(tempUser);
        setUsers(prev => prev.map(u => (u.id === tempUser.id ? tempUser : u)));
        setPage('post-profile-complete');
    }
    
    try {
        const profileDataToUpdate = {
            ...updatedUser,
            is_profile_complete: shouldMarkProfileComplete || currentUser.is_profile_complete,
        };
        
        const { data: finalProfile, error } = await supabase
            .from('profiles')
            .update(profileDataToUpdate)
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) throw error;
        
        const finalUser = finalProfile as User;
        
        // Final, authoritative update
        setCurrentUser(finalUser);
        setUsers(prev => prev.map(u => (u.id === finalUser.id ? finalUser : u)));
        
        if (shouldMarkProfileComplete) {
            // Invoke the welcome email function
            triggerWelcomeEmail(finalUser);

            const isCommunityMember = finalUser.role === UserRole.INQUILINO || finalUser.role === UserRole.ANFITRION;
            if (isCommunityMember) {
                const profileUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}/tenant-dashboard${finalUser.role === UserRole.ANFITRION ? '?view=host' : ''}`
                    : undefined;

                void triggerAdminNotification({
                    type: 'new_tenant',
                    tenant: {
                        id: finalUser.id,
                        name: finalUser.name,
                        email: finalUser.email ?? null,
                        phone: finalUser.phone ?? null,
                        city: finalUser.city ?? null,
                        locality: finalUser.locality ?? null,
                        rental_goal: finalUser.rental_goal ?? null,
                        budget: finalUser.budget ?? null,
                        lifestyle: finalUser.lifestyle ?? null,
                        bio: finalUser.bio ?? null,
                        role: finalUser.role,
                    },
                    meta: profileUrl ? { profile_url: profileUrl } : undefined,
                });
            }

            // Sincroniza el contacto en FluentCRM (no bloquea la UI)
            void syncFluentContact(finalUser);

            if (finalUser.role === UserRole.ANFITRION) {
                const alreadyHasListings = hostListings.some(listing => listing.host_id === finalUser.id);
                if (!alreadyHasListings) {
                    openHostListingModal(null);
                }
            }
        } else {
            alert('Perfil actualizado con éxito');
        }

    } catch (err: any) {
        console.error("Failed to save profile:", err.message);
        alert(`Error al guardar el perfil: ${err.message}`);
        // Here you might want to add logic to revert the optimistic update on failure
    }
};

  const handleSaveProperty = async (propertyData: Omit<Property, 'id' | 'views' | 'compatible_candidates' | 'owner_id' | 'image_urls'> & { id?: number; imageFiles: File[]; image_urls: string[] }) => {
    if (!currentUser) return;

    const hadPreviousPublications = properties.some(p => p.owner_id === currentUser.id);
    let ownerSnapshot = currentUser;
    
    try {
        let uploadedImageUrls: string[] = [];
        if (propertyData.imageFiles && propertyData.imageFiles.length > 0) {
            const uploadPromises = propertyData.imageFiles.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const filePath = `${currentUser.id}/${Date.now()}-${file.name}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('property-media')
                    .upload(filePath, file);

                if (uploadError) {
                    throw new Error(`Error al subir la imagen: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage
                    .from('property-media')
                    .getPublicUrl(filePath);
                
                return urlData.publicUrl;
            });
            uploadedImageUrls = await Promise.all(uploadPromises);
        }

        const finalImageUrls = [...(propertyData.image_urls || []), ...uploadedImageUrls];

        const { imageFiles, ...dbData } = propertyData;
        const dataToSave = {
          ...dbData,
          image_urls: finalImageUrls,
          price: Number(propertyData.price),
        };

        if (propertyData.id) { // Update
            const { id, ...updateData } = dataToSave;
            const { data, error } = await supabase
                .from('properties')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setProperties(prev => prev.map(p => p.id === data.id ? data as Property : p));
                const propertyRecord = data as Property;
                void notifyFluentCrmNewProperty(ownerSnapshot, propertyRecord, false);
            }

        } else { // Insert
            const newPropertyData = {
                ...dataToSave,
                owner_id: currentUser.id,
                views: 0,
                compatible_candidates: 0,
                status: 'approved' as const,
            };
            const { data, error } = await supabase
                .from('properties')
                .insert(newPropertyData)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setProperties(prev => [...prev, data as Property]);
                if (!currentUser.is_profile_complete) {
                    const { data: updatedProfile, error: profileError } = await supabase
                        .from('profiles')
                        .update({ is_profile_complete: true })
                        .eq('id', currentUser.id)
                        .select()
                        .single();

                    if (profileError) throw profileError;
                    if (updatedProfile) {
                        const fullyUpdatedUser = { ...currentUser, ...updatedProfile };
                        ownerSnapshot = fullyUpdatedUser;
                        setCurrentUser(fullyUpdatedUser);
                        setUsers(prev => prev.map(u => u.id === fullyUpdatedUser.id ? fullyUpdatedUser : u));
                        
                        // Invoke el email de bienvenida y sincroniza con FluentCRM
                        triggerWelcomeEmail(fullyUpdatedUser);
                        void syncFluentContact(fullyUpdatedUser);

                        if (fullyUpdatedUser.role === UserRole.PROPIETARIO) {
                            setPage('post-owner-register');
                        }
                    }
                }

                const propertyRecord = data as Property;
                if (propertyRecord.visibility === 'Pública') {
                    const propertyUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/owners?property=${propertyRecord.id}`
                        : undefined;

                    void triggerAdminNotification({
                        type: 'new_property',
                        property: {
                            id: propertyRecord.id,
                            title: propertyRecord.title,
                            address: propertyRecord.address ?? null,
                            city: propertyRecord.city ?? null,
                            locality: propertyRecord.locality ?? null,
                            property_type: propertyRecord.property_type ?? null,
                            price: propertyRecord.price ?? null,
                            visibility: propertyRecord.visibility,
                            available_from: propertyRecord.available_from ?? null,
                            status: propertyRecord.status,
                            url: propertyUrl ?? null,
                        },
                        owner: {
                            id: ownerSnapshot.id,
                            name: ownerSnapshot.name,
                            email: ownerSnapshot.email ?? null,
                            phone: ownerSnapshot.phone ?? null,
                        },
                    });
                }
                void syncFluentContact(ownerSnapshot);
                void notifyFluentCrmNewProperty(ownerSnapshot, propertyRecord, !hadPreviousPublications);
            }
        }
    } catch (error: any) {
        console.error("Error al guardar la propiedad:", error.message);
        alert(`Error al guardar la propiedad: ${error.message}. Asegúrate de que el bucket 'property-media' existe y es público.`);
    }
  };

  const handleSaveHostListing = async (listingPayload: HostListingInput & { id?: number; imageFiles?: File[] }) => {
    if (!currentUser || isSavingHostListing) return;

    setIsSavingHostListing(true);
    try {
      const { imageFiles, ...withoutFiles } = listingPayload;
      const existingUrls = Array.from(new Set(withoutFiles.image_urls || []));
      let finalImageUrls = [...existingUrls];

      if (imageFiles && imageFiles.length) {
        const uploadedUrls = await Promise.all(
          imageFiles.map(async (file, index) => {
            const extension = file.name.split('.').pop();
            const sanitizedName = file.name.trim().replace(/\s+/g, '-').toLowerCase();
            const filePath = `host-listings/${currentUser.id}/${Date.now()}-${index}-${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
              .from('property-media')
              .upload(filePath, file, { upsert: false });
            if (uploadError) {
              throw new Error(uploadError.message);
            }

            const { data } = supabase.storage.from('property-media').getPublicUrl(filePath);
            return data.publicUrl;
          }),
        );
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      const previousStatus = listingPayload.id
        ? hostListings.find(listing => listing.id === listingPayload.id)?.status
        : undefined;

      const payloadToPersist: HostListingInput = {
        ...withoutFiles,
        status: listingPayload.id ? previousStatus ?? 'approved' : 'approved',
        image_urls: finalImageUrls,
      };

      if (listingPayload.id) {
        const { id, ...updatePayload } = payloadToPersist;
        const { error } = await updateHostListing(id, updatePayload);
        if (error) throw new Error(error.message);
      } else {
        const { id: _ignored, ...createPayload } = payloadToPersist;
        const { error } = await createHostListing(currentUser.id, createPayload);
        if (error) throw new Error(error.message);
      }

      await refreshHostListings();
      closeHostListingModal();
      if (typeof window !== 'undefined') {
        window.alert(listingPayload.id ? 'Habitación actualizada con éxito.' : 'Habitación publicada al instante.');
      }
    } catch (error: any) {
      console.error('Error al guardar la habitación:', error?.message || error);
      if (typeof window !== 'undefined') {
        window.alert(`No pudimos guardar la habitación: ${error?.message || error}`);
      }
    } finally {
      setIsSavingHostListing(false);
    }
  };

  const handleAddMatch = async (matchedUserId: string) => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const previousMatches = { ...matches };
    const currentMatches = previousMatches[userId] || [];

    if (currentMatches.includes(matchedUserId)) return;

    const matchedUser = users.find(u => u.id === matchedUserId) || null;

    if (!matchedUser) {
      console.warn('DEBUG: Intento de match con usuario inexistente.', { matchedUserId });
      return;
    }

    if (currentUser.role === UserRole.PROPIETARIO || matchedUser.role === UserRole.PROPIETARIO) {
      console.warn('DEBUG: Los propietarios no participan en matches directos.', {
        currentUserRole: currentUser.role,
        matchedUserRole: matchedUser.role,
      });
      return;
    }

    if (currentUser.role === UserRole.ANFITRION && matchedUser.role !== UserRole.INQUILINO) {
      console.warn('DEBUG: Un anfitrión solo puede hacer match con inquilinos.', {
        matchedUserRole: matchedUser.role,
      });
      return;
    }

    const isMutualMatch = (matches[matchedUserId] || []).includes(userId);

    // Optimistic UI update
    const newMatchesForUser = [...currentMatches, matchedUserId];
    setMatches(prev => ({ ...prev, [userId]: newMatchesForUser }));

    // Persist to database
    try {
      const { error } = await supabase
        .from('matches')
        .insert({ user_id: userId, matched_user_id: matchedUserId });

      if (error) {
        console.error('Error guardando el match:', error.message);
        // Revert optimistic update on failure
        setMatches(previousMatches); 
        alert(`No se pudo guardar el match: ${error.message}`);
        return;
      }

      if (isMutualMatch && matchedUser) {
        const compatibility = calculateCompatibility(currentUser, matchedUser);
        setMatchCelebration({ user: matchedUser, compatibility });

        setNotifications(prev => {
          const nextId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1;
          const shortName = matchedUser.name.split(' ')[0] || matchedUser.name;
          const notification: Notification = {
            id: nextId,
            user_id: userId,
            type: NotificationType.NEW_MATCH,
            message: `¡Nuevo match con ${shortName}!`,
            timestamp: new Date().toISOString(),
            read: false,
          };
          return [notification, ...prev];
        });

        void triggerMutualMatchEmail(currentUser, matchedUser, compatibility);
      }
    } catch (err: any) {
      console.error("Error inesperado al guardar el match:", err.message);
      setMatches(previousMatches); // Revert on unexpected errors
      alert('Ocurrió un error inesperado al guardar el match.');
    }
  };
  
  const handleDeleteProperty = async (propertyId: number) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) {
      console.error('Error al eliminar la propiedad:', error);
    } else {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  const handleSetUserBanStatus = async (userId: string, isBanned: boolean) => {
    const originalUsers = [...users];
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, is_banned: isBanned } : u)));

    const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
    if (error) {
      console.error('Error al actualizar el estado de baneo del usuario:', error.message);
      setUsers(originalUsers); // Revert on error
    }
  };

  const handleSaveBlogPost = (postData: Omit<BlogPost, 'id'> & { id?: number }) => {
    setBlogPosts(prev => {
        if (postData.id) {
            return prev.map(p => p.id === postData.id ? { ...p, ...postData } as BlogPost : p);
        } else {
            const newPost: BlogPost = {
                ...postData,
                id: Math.max(0, ...prev.map(p => p.id)) + 1,
                slug: postData.title.toLowerCase().replace(/\s+/g, '-'),
                author: currentUser?.name || 'Admin',
                author_image_url: currentUser?.avatar_url || '',
                publish_date: new Date().toISOString(),
            };
            return [newPost, ...prev];
        }
    });
  };

  const handleDeleteBlogPost = (postId: number) => {
    setBlogPosts(prev => prev.filter(p => p.id !== postId));
  };

  const pageNavigationProps = {
    onHomeClick: () => setPage('home'),
    onOwnersClick: () => setPage('owners'),
    onLoginClick: handleGoToLogin,
    onBlogClick: () => setPage('blog'),
    onCalculadoraClick: () => setPage('calculadora-anti-especulacion'),
    onAboutClick: () => setPage('about'),
    onPrivacyClick: () => setPage('privacy'),
    onTermsClick: () => setPage('terms'),
    onContactClick: () => setPage('contact'),
    onSilverClick: () => setPage('silver'),
    onAmbassadorsClick: () => setPage('ambassadors'),
    onReferFriendsClick: () => setPage('refer'),
    onBlueprintClick: () => setPage('plan'),
  };
  
  if (loading) {
    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] flex flex-col items-center justify-center text-white">
            <div className="animate-pulse">
                <Logo showText={false} size={56} />
            </div>
            <p className="mt-4 text-lg text-white/80">Cargando MoOn...</p>
        </div>
    );
  }

  if (currentUser && !currentUser.is_profile_complete) {
    if (currentUser.role === UserRole.INQUILINO) {
        return <AccountLayout 
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onBack={() => {}} 
            isMandatory={true}
            initialTab="profile"
            {...pageNavigationProps}
        />;
    }
    if (currentUser.role === UserRole.PROPIETARIO) {
        return <OwnerDashboard 
            user={currentUser}
            properties={properties.filter(p => p.owner_id === currentUser.id)}
            onSaveProperty={handleSaveProperty}
            forceAddProperty={true}
            initialPropertyData={publicationData}
            onClearInitialPropertyData={() => setPublicationData(null)}
            allUsers={users}
            matches={matches}
            onLogout={handleLogout}
            onGoToAccountSettings={handleGoToAccountSettings}
            onUpdateUser={handleUpdateUser}
        />;
    }
    if (currentUser.role === UserRole.ANFITRION) {
        return <AccountLayout
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onBack={() => {}}
            isMandatory={true}
            initialTab="profile"
            {...pageNavigationProps}
        />;
    }
  }

  const renderPage = () => {
    const loginPageProps = { ...pageNavigationProps, onRegisterClick: () => { setLoginInitialMode('register'); setPage('login'); } };
    
    switch (page) {
      case 'home': return <HomePage onStartRegistration={handleStartRegistration} {...pageNavigationProps} onRegisterClick={loginPageProps.onRegisterClick} />;
      case 'owners': return <OwnerLandingPage onStartPublication={handleStartPublication} onLoginClick={handleGoToLogin} onHomeClick={() => setPage('home')} {...pageNavigationProps} />;
      case 'login': return <LoginPage onLogin={handleLogin} onRegister={handleRegister} registrationData={registrationData} publicationData={publicationData} initialMode={loginInitialMode} {...loginPageProps} />;
      case 'post-register': return <PostRegisterPage onGoToLogin={handleGoToLogin} />;
      case 'post-owner-register': return <PostOwnerRegisterPage onGoToDashboard={() => setPage('owner-dashboard')} />;
      case 'post-profile-complete': {
        const role = currentUser?.role || UserRole.INQUILINO;
        const nextPage = role === UserRole.PROPIETARIO ? 'owner-dashboard' : role === UserRole.ANFITRION ? 'host-dashboard' : 'tenant-dashboard';
        return <PostProfileCompletePage role={role} onProceed={() => setPage(nextPage)} />;
      }
      case 'blog': return <BlogPage posts={blogPosts} {...loginPageProps} />;
      case 'about': return <AboutPage {...loginPageProps} />;
      case 'privacy': return <PrivacyPolicyPage {...loginPageProps} />;
      case 'terms': return <TermsPage {...loginPageProps} />;
      case 'contact': return <ContactPage {...loginPageProps} />;
      case 'calculadora-anti-especulacion': return <CalculadoraAntiEspeculacion {...loginPageProps} />;
      case 'silver': return <Silver {...loginPageProps} />;
      case 'ambassadors': return <AmbassadorsPage {...loginPageProps} />;
      case 'refer': {
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        const initial = currentUser.role === UserRole.INQUILINO ? 'referrals' : 'overview';
        const backTo = currentUser.role === UserRole.INQUILINO ? 'tenant-dashboard' : (currentUser.role === UserRole.PROPIETARIO ? 'owner-dashboard' : 'host-dashboard');
        return (
          <AccountLayout
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onBack={() => setPage(backTo)}
            initialTab={initial}
            {...pageNavigationProps}
          />
        );
      }
      case 'plan': {
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        if (currentUser.role !== UserRole.ADMIN) return <HomePage onStartRegistration={handleStartRegistration} {...pageNavigationProps} onRegisterClick={loginPageProps.onRegisterClick} />;
        return <PerfectAppPlanPage {...loginPageProps} />;
      }
      case 'discover-profile':
        if (!currentDiscoverProfile) {
          exitDiscoverProfile();
          return null;
        }
        const hostListingsForProfile = hostListings.filter(listing => listing.host_id === currentDiscoverProfile.id);
        return (
          <DiscoverProfilePage
            onBack={exitDiscoverProfile}
            onSkip={handleDiscoverSkip}
            onLike={handleDiscoverLike}
            onLoginClick={handleGoToLogin}
            onRegisterClick={loginPageProps.onRegisterClick}
            onAccountClick={handleGoToDashboard}
            onAccountSettings={handleGoToAccountSettings}
            onLogout={handleLogout}
            isAuthenticated={!!currentUser}
            profile={currentDiscoverProfile}
            hostListings={hostListingsForProfile}
            viewer={currentUser}
            compatibilityBreakdown={discoverCompatibilityBreakdown}
            {...pageNavigationProps}
          />
        );
      case 'tenant-onboarding':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return <TenantOnboarding user={currentUser} onFinish={handleOnboardingFinished} />;
      case 'owner-onboarding':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return <OwnerOnboarding user={currentUser} onFinish={handleOnboardingFinished} />;
      case 'host-onboarding':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return <HostOnboarding user={currentUser} onFinish={handleOnboardingFinished} />;
      case 'tenant-dashboard':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        const mutualMatchesForCurrentUser = (matches[currentUser.id] || []).filter(matchId => (matches[matchId] || []).includes(currentUser.id));
        return <TenantDashboard 
            user={currentUser} 
            allUsers={users}
            properties={properties.filter(p => p.status === 'approved')}
            onSendInterest={() => alert('Interés enviado (simulación)')}
            savedSearches={savedSearches}
            onSaveSearch={(search) => setSavedSearches(prev => [...prev, {...search, id: Date.now(), user_id: currentUser.id}])}
            onDeleteSearch={(id) => setSavedSearches(prev => prev.filter(s => s.id !== id))}
            userMatches={mutualMatchesForCurrentUser}
            requestedView={tenantViewRequest}
            onConsumeRequestedView={handleTenantViewConsumed}
            onAddMatch={handleAddMatch}
            onGoToAccountSettings={handleGoToAccountSettings}
            onLogout={handleLogout}
            onOpenDiscoverProfile={handleOpenDiscoverProfile}
            notifications={notifications}
            onNotificationRead={markNotificationAsRead}
            onNotificationsOpened={() => currentUser && loadNotifications(currentUser.id)}
            onOpenQuiz={() => setQuizOpen(true)}
        />;
      case 'host-dashboard':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return (
          <HostDashboard
            user={currentUser}
            listings={hostListings.filter(listing => listing.host_id === currentUser.id)}
            onCreateListing={handleHostListingCta}
            onEditListing={openHostListingModal}
            onGoToDiscover={handleHostDiscoverNavigation}
            onGoToAccountSettings={handleGoToAccountSettings}
            onLogout={handleLogout}
            notifications={notifications}
            onNotificationRead={markNotificationAsRead}
            onNotificationsOpened={() => currentUser && loadNotifications(currentUser.id)}
            onResumeOnboarding={() => setPage('host-onboarding')}
          />
        );
     case 'owner-dashboard':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps}/>;
        return <OwnerDashboard 
            user={currentUser}
            properties={properties.filter(p => p.owner_id === currentUser.id)}
            onSaveProperty={handleSaveProperty}
            initialPropertyData={publicationData}
            onClearInitialPropertyData={() => setPublicationData(null)}
            allUsers={users}
            matches={matches}
            onLogout={handleLogout}
            onGoToAccountSettings={handleGoToAccountSettings}
            onUpdateUser={handleUpdateUser}
            notifications={notifications}
            onNotificationRead={markNotificationAsRead}
            onNotificationsOpened={() => currentUser && loadNotifications(currentUser.id)}
            onResumeOnboarding={() => setPage('owner-onboarding')}
        />;
      case 'admin-dashboard':
        if (!currentUser || currentUser.role !== UserRole.ADMIN) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        // Inicializar la pestaña según ?tab= en la URL (ej: /admin?tab=crm)
        const initialAdminTab = (() => {
          if (typeof window === 'undefined') return undefined;
          const t = new URLSearchParams(window.location.search).get('tab');
          const allowed = ['dashboard','users','properties','blog','growth','crm','plan','settings'] as const;
          return (allowed.includes((t as any)) ? (t as any) : undefined);
        })();
        return (
          <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-white">Cargando panel de administración…</div>}>
            <AdminDashboard 
              users={users}
              properties={properties}
              blogPosts={blogPosts}
              matches={matches}
              onDeleteProperty={handleDeleteProperty}
              onSetUserBanStatus={handleSetUserBanStatus}
              onSaveBlogPost={handleSaveBlogPost}
              onDeleteBlogPost={handleDeleteBlogPost}
              onLogout={handleLogout}
              initialTab={initialAdminTab}
            />
          </React.Suspense>
        );
      case 'account':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        const backPage = currentUser.is_profile_complete 
            ? (currentUser.role === UserRole.INQUILINO
                ? 'tenant-dashboard'
                : currentUser.role === UserRole.PROPIETARIO
                ? 'owner-dashboard'
                : 'host-dashboard')
            : 'account';
        return <AccountLayout 
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onBack={() => setPage(backPage)}
            initialTab={accountInitialTab}
            {...pageNavigationProps}
        />
      default: return <HomePage onStartRegistration={handleStartRegistration} {...pageNavigationProps} onRegisterClick={loginPageProps.onRegisterClick} />;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative">
      {renderPage()}
      {currentUser && matchCelebration && (
        <MatchCelebration
          currentUser={currentUser}
          matchedUser={matchCelebration.user}
          compatibility={matchCelebration.compatibility}
          onClose={handleCloseMatchCelebration}
          onViewMatches={handleOpenMatchesFromCelebration}
        />
      )}
      <AddHostListingModal
        isOpen={isHostListingModalOpen}
        onClose={closeHostListingModal}
        listingToEdit={hostListingToEdit}
        onSave={handleSaveHostListing}
        isSaving={isSavingHostListing}
      />
      {currentUser && (
        <ProfileQuizWizard
          user={currentUser}
          isOpen={isQuizOpen}
          onSkip={handleQuizSkip}
          onUserUpdate={syncUserLocally}
          onCompleted={handleQuizCompleted}
        />
      )}
    </div>
  );
}

export default App;
