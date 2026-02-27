
import React, { useState, useEffect } from 'react';
import { ViewType, User } from './types';
import Dashboard from './components/Dashboard';
import Community from './components/Community';
import ChatView from './components/ChatView';
import ProfileView from './components/ProfileView';
import AuthView from './components/AuthView';
import Onboarding from './components/Onboarding';
import VerifyEmail from './components/VerifyEmail';
import AcceptInvitation from './components/AcceptInvitation';
import Navigation from './components/Navigation';
import { Compass, MessageCircle, User as UserIcon, Map, Loader } from 'lucide-react';

// Use empty string for same-origin requests (Vite proxy handles /api/* routes)
import { API_BASE_URL } from './lib/api';


const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  // Check for verification token or invitation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const invitation = urlParams.get('invitationId');
    
    if (token) {
      setVerificationToken(token);
      setIsLoading(false);
      return;
    }

    if (invitation) {
      setInvitationId(invitation);
      setIsLoading(false);
      return;
    }
    
    // If no verification token or invitation, check auth status
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            const user = data.data.user;
            const normalizedUser: User = {
              id: user.id || user._id || '',
              name: user.name || '',
              avatar: user.avatar || '',
              bio: user.bio || '',
              interests: user.interests || [],
            };
            
            setCurrentUser(normalizedUser);
            localStorage.setItem('dayla_user', JSON.stringify(normalizedUser));

            // Check onboarding status
            const onboardingComplete = user.onboardingCompleted || localStorage.getItem('dayla_onboarding_complete');
            if (!onboardingComplete) {
              setShowOnboarding(true);
            }
            setView('dashboard');
          }
        }
      } catch (error) {
        console.log('No active session found');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (user: User) => {
    // Ensure user has an id (map from _id if needed from backend)
    const normalizedUser: User = {
      id: user.id || (user as any)._id || '',
      name: user.name || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
      interests: user.interests || [],
    };
    
    setCurrentUser(normalizedUser);
    localStorage.setItem('dayla_user', JSON.stringify(normalizedUser));

    // Check for pending invitation after login
    const pendingInvitationId = sessionStorage.getItem('pendingInvitationId');
    if (pendingInvitationId) {
      sessionStorage.removeItem('pendingInvitationId');
      setInvitationId(pendingInvitationId);
      setIsLoading(false);
      return;
    }

    // Check if user has completed onboarding (from user data or localStorage)
    const onboardingComplete = (user as any).onboardingCompleted || localStorage.getItem('dayla_onboarding_complete');
    
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
    
    // IMPORTANT: Always set view to dashboard to exit auth flow
    // The showOnboarding check will display onboarding if needed
    setView('dashboard');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear the cookie server-side
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    setShowOnboarding(false);
    localStorage.removeItem('dayla_user');
    // Don't remove onboarding completion so returning users don't see it again
    setView('auth');
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#3a5a40] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white/70 text-sm">Loading...</p>
      </div>
    );
  }

  // Show email verification view if token is present
  if (verificationToken) {
    return (
      <VerifyEmail 
        token={verificationToken} 
        onComplete={() => {
          setVerificationToken(null);
          // Clear token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setView('auth');
        }} 
      />
    );
  }

  // Show invitation acceptance view if invitationId is present
  if (invitationId) {
    return (
      <AcceptInvitation 
        invitationId={invitationId}
        user={currentUser}
        onLoginRequired={() => {
          // Store invitation ID in session storage to redirect back after login
          sessionStorage.setItem('pendingInvitationId', invitationId);
          setInvitationId(null);
          window.history.replaceState({}, document.title, window.location.pathname);
          setView('auth');
        }}
        onComplete={() => {
          setInvitationId(null);
          // Clear invitationId from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setView('dashboard');
        }} 
      />
    );
  }

  if (view === 'auth') {
    return <AuthView onLogin={handleLogin} />;
  }

  if (showOnboarding && currentUser) {
    return <Onboarding user={currentUser} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f7f3ee] max-w-md mx-auto shadow-2xl relative overflow-hidden border-x border-stone-200">
      <main className="flex-1 overflow-hidden relative">
        {view === 'dashboard' && <Dashboard user={currentUser!} />}
        {view === 'community' && <Community user={currentUser!} />}
        {view === 'chat' && <ChatView user={currentUser!} />}
        {view === 'profile' && <ProfileView user={currentUser!} onLogout={handleLogout} />}
      </main>

      <Navigation currentView={view} setView={setView} />
    </div>
  );
};

export default App;
