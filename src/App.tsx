import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import OwnerLandingPage from './pages/OwnerLandingPage';
import LoginPage, { PostRegisterPage, PostOwnerRegisterPage } from './pages/LoginPage';
import TenantDashboard from './dashboards/TenantDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import AccountLayout from './pages/account/AccountLayout';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import Silver from './pages/Silver';
import { User, UserRole, RentalGoal, Property, PropertyType, SavedSearch, BlogPost, Notification } from './types';
import { MOCK_SAVED_SEARCHES, MOCK_BLOG_POSTS, MOCK_NOTIFICATIONS } from './constants';
import { supabase } from './lib/supabaseClient';
import { MoonIcon } from './components/icons';

type Page = 'home' | 'owners' | 'login' | 'tenant-dashboard' | 'owner-dashboard' | 'admin-dashboard' | 'account' | 'blog' | 'about' | 'privacy' | 'terms' | 'contact' | 'post-register' | 'post-owner-register' | 'silver';

type RegistrationData = { rentalGoal: RentalGoal; city: string; locality: string };
type PublicationData = { property_type: PropertyType; city: string; locality: string };

function App() {
  const [page, setPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');

  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(MOCK_SAVED_SEARCHES);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [matches, setMatches] = useState<{ [key: string]: string[] }>({});

  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [publicationData, setPublicationData] = useState<PublicationData | null>(null);
  const [accountInitialTab, setAccountInitialTab] = useState<string>('overview');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/silver') {
        setPage('silver');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (page === 'silver') {
        window.history.replaceState({}, '', '/silver');
    } else if (window.location.pathname === '/silver') {
        window.history.replaceState({}, '', '/');
    }
  }, [page]);
  
  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
            setCurrentUser(null);
            setUsers([]);
            setProperties([]);
            setMatches({});
            setPage('home');
            setLoading(false);
            return;
        }

        try {
            const [allUsersRes, propertiesRes, matchesRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('properties').select('*'),
                supabase.from('matches').select('*') // Fetch all matches for now for owner dashboard
            ]);
            
            if (allUsersRes.data) setUsers(allUsersRes.data as User[]);
            if (propertiesRes.data) setProperties(propertiesRes.data as Property[]);
            
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

            if (profileError && profileError.code === 'PGRST116') {
                console.error("CRITICAL: Profile not found for an authenticated user. The DB trigger might be missing or failed. Signing out.");
                await supabase.auth.signOut();
            } else if (profileError) {
                console.error("Error fetching profile:", profileError.message);
                await supabase.auth.signOut();
            } else if (profile) {
                setCurrentUser(profile as User);
                if (profile.role === UserRole.ADMIN) {
                    setPage('admin-dashboard');
                } else if (profile.is_profile_complete) {
                    setPage(profile.role === UserRole.PROPIETARIO ? 'owner-dashboard' : 'tenant-dashboard');
                }
            }
        } catch (error) {
            console.error("Error during initial data load:", error);
            // Handle error, maybe show an error screen or log out the user
        } finally {
            setLoading(false);
        }
    });

    return () => {
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

  const handleLogin = (user: User) => {
    setUsers(prev => prev.find(u => u.id === user.id) ? prev : [...prev, user]);
    setCurrentUser(user);
    setRegistrationData(null);
    setPublicationData(null);
    if (user.role === UserRole.ADMIN) setPage('admin-dashboard');
    else if (user.is_profile_complete === false) {
    }
    else if (user.role === UserRole.PROPIETARIO) setPage('owner-dashboard');
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
  
  const handleGoToLogin = () => {
    setRegistrationData(null);
    setPublicationData(null);
    setLoginInitialMode('login');
    setPage('login');
  };
  
  const handleGoToAccountSettings = () => {
    setAccountInitialTab('profile');
    setPage('account');
  };

  const handleUpdateUser = async (updatedUser: User): Promise<void> => {
    if (!currentUser) return;
    
    const shouldMarkProfileComplete = !currentUser.is_profile_complete && updatedUser.bio && updatedUser.bio.length >= 100;

    // Optimistic UI update for redirection
    if (shouldMarkProfileComplete) {
        const newPage = updatedUser.role === UserRole.INQUILINO ? 'tenant-dashboard' : 'owner-dashboard';
        const tempUser = { ...currentUser, ...updatedUser, is_profile_complete: true };
        setCurrentUser(tempUser);
        setUsers(prev => prev.map(u => (u.id === tempUser.id ? tempUser : u)));
        setPage(newPage);
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

            // Defer CRM sync to run after UI updates, preventing blocking.
            setTimeout(() => {
                if (finalUser.role === UserRole.INQUILINO) {
                    console.log("Invoking CRM sync for tenant...");
                    supabase.functions.invoke('sync-tenant-to-fluentcrm', { body: finalUser })
                        .then(({ error: invokeError }) => {
                            if (invokeError) console.error("CRM sync error:", invokeError.message);
                            else console.log("CRM sync initiated successfully.");
                        });
                }
            }, 500);
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
            if (data) setProperties(prev => prev.map(p => p.id === data.id ? data as Property : p));

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
                        setCurrentUser(fullyUpdatedUser);
                        setUsers(prev => prev.map(u => u.id === fullyUpdatedUser.id ? fullyUpdatedUser : u));
                        
                        // Invoke the welcome email function
                        triggerWelcomeEmail(fullyUpdatedUser);

                        if (fullyUpdatedUser.role === UserRole.PROPIETARIO) {
                            setPage('post-owner-register');
                        }
                    }
                }
            }
        }
    } catch (error: any) {
        console.error("Error al guardar la propiedad:", error.message);
        alert(`Error al guardar la propiedad: ${error.message}. Asegúrate de que el bucket 'property-media' existe y es público.`);
    }
  };

  const handleAddMatch = async (matchedUserId: string) => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const previousMatches = { ...matches };
    const currentMatches = previousMatches[userId] || [];

    if (currentMatches.includes(matchedUserId)) return;

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
    onAboutClick: () => setPage('about'),
    onPrivacyClick: () => setPage('privacy'),
    onTermsClick: () => setPage('terms'),
    onContactClick: () => setPage('contact'),
    onSilverClick: () => setPage('silver'),
  };
  
  if (loading) {
    return (
        <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <MoonIcon className="w-16 h-16 animate-pulse text-indigo-400" />
            <p className="mt-4 text-lg">Cargando MoOn...</p>
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
  }

  const renderPage = () => {
    const loginPageProps = { ...pageNavigationProps, onRegisterClick: () => { setLoginInitialMode('register'); setPage('login'); } };
    
    switch (page) {
      case 'home': return <HomePage onStartRegistration={handleStartRegistration} {...pageNavigationProps} onRegisterClick={loginPageProps.onRegisterClick} />;
      case 'owners': return <OwnerLandingPage onStartPublication={handleStartPublication} onLoginClick={handleGoToLogin} onHomeClick={() => setPage('home')} {...pageNavigationProps} />;
      case 'login': return <LoginPage onLogin={handleLogin} onRegister={handleRegister} registrationData={registrationData} publicationData={publicationData} initialMode={loginInitialMode} {...loginPageProps} />;
      case 'post-register': return <PostRegisterPage onGoToLogin={handleGoToLogin} />;
      case 'post-owner-register': return <PostOwnerRegisterPage onGoToDashboard={() => setPage('owner-dashboard')} />;
      case 'blog': return <BlogPage posts={blogPosts} {...loginPageProps} />;
      case 'about': return <AboutPage {...loginPageProps} />;
      case 'privacy': return <PrivacyPolicyPage {...loginPageProps} />;
      case 'terms': return <TermsPage {...loginPageProps} />;
      case 'contact': return <ContactPage {...loginPageProps} />;
      case 'silver': return <Silver {...loginPageProps} />;
      case 'tenant-dashboard':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return <TenantDashboard 
            user={currentUser} 
            allUsers={users}
            properties={properties.filter(p => p.status === 'approved')}
            onSendInterest={() => alert('Interés enviado (simulación)')}
            savedSearches={savedSearches}
            onSaveSearch={(search) => setSavedSearches(prev => [...prev, {...search, id: Date.now(), user_id: currentUser.id}])}
            onDeleteSearch={(id) => setSavedSearches(prev => prev.filter(s => s.id !== id))}
            userMatches={matches[currentUser.id] || []}
            onAddMatch={handleAddMatch}
            onGoToAccountSettings={handleGoToAccountSettings}
            onLogout={handleLogout}
        />;
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
        />;
      case 'admin-dashboard':
        if (!currentUser || currentUser.role !== UserRole.ADMIN) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        return <AdminDashboard 
            users={users}
            properties={properties}
            blogPosts={blogPosts}
            matches={matches}
            onDeleteProperty={handleDeleteProperty}
            onSetUserBanStatus={handleSetUserBanStatus}
            onSaveBlogPost={handleSaveBlogPost}
            onDeleteBlogPost={handleDeleteBlogPost}
            onLogout={handleLogout}
        />;
      case 'account':
        if (!currentUser) return <LoginPage onLogin={handleLogin} onRegister={handleRegister} initialMode="login" {...loginPageProps} />;
        const backPage = currentUser.is_profile_complete 
            ? (currentUser.role === UserRole.INQUILINO ? 'tenant-dashboard' : 'owner-dashboard')
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

  return <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">{renderPage()}</div>;
}

export default App;
