
import React, { useState, useEffect, useCallback } from 'react';
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
import { Loader, X, Check, UserPlus, Bell } from 'lucide-react';
import { initializeSocket, getSocket } from './lib/socket';

import { API_BASE_URL, authFetch, clearAuthToken } from './lib/api';

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  status: string;
  createdAt: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  // Notification state
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Check for verification token or invitation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const token = urlParams.get('token');
    const invitation = urlParams.get('invitationId');
    
    if (token || path === '/verify-email') {
      if (token) setVerificationToken(token);
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
        const response = await authFetch(`${API_BASE_URL}/api/auth/check`);

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
      await authFetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    setShowOnboarding(false);
    setPendingFriendRequests([]);
    setShowNotifications(false);
    localStorage.removeItem('dayla_user');
    clearAuthToken();
    setView('auth');
  };

  // Fetch pending friend requests
  const fetchPendingFriendRequests = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/friend-requests/pending`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingFriendRequests(data.data.requests || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  }, []);

  // Fetch friend requests when user is authenticated
  useEffect(() => {
    if (currentUser && view !== 'auth') {
      fetchPendingFriendRequests();
    }
  }, [currentUser, view, fetchPendingFriendRequests]);

  // Listen for real-time friend request events
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;

    const handleFriendRequestReceived = (data: any) => {
      if (data.toUserId === currentUser.id) {
        fetchPendingFriendRequests();
      }
    };

    const handleFriendRequestAccepted = () => {
      fetchPendingFriendRequests();
    };

    socket.on('friend:request_sent', handleFriendRequestReceived);
    socket.on('friend:request_accepted', handleFriendRequestAccepted);

    return () => {
      socket.off('friend:request_sent', handleFriendRequestReceived);
      socket.off('friend:request_accepted', handleFriendRequestAccepted);
    };
  }, [currentUser, fetchPendingFriendRequests]);

  const handleAcceptFriendRequest = async (userId: string) => {
    setProcessingRequestId(userId);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/friend-request/${userId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setPendingFriendRequests(prev => prev.filter(r => r.from._id !== userId));
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineFriendRequest = async (userId: string) => {
    setProcessingRequestId(userId);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/friend-request/${userId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setPendingFriendRequests(prev => prev.filter(r => r.from._id !== userId));
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="w-full bg-[#3a5a40] flex flex-col items-center justify-center" style={{ height: 'var(--app-height, 100dvh)' }}>
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
    <div className="flex flex-col w-full bg-[#f7f3ee] max-w-md mx-auto shadow-2xl relative overflow-hidden border-x border-stone-200" style={{ height: 'var(--app-height, 100dvh)' }}>
      <main className="flex-1 overflow-hidden relative">
        {view === 'dashboard' && <Dashboard user={currentUser!} />}
        {view === 'community' && <Community user={currentUser!} onFriendRequestSent={fetchPendingFriendRequests} />}
        {view === 'chat' && <ChatView user={currentUser!} />}
        {view === 'profile' && <ProfileView user={currentUser!} onLogout={handleLogout} />}
      </main>

      <Navigation
        currentView={view}
        setView={setView}
        notificationCount={pendingFriendRequests.length}
        onNotificationClick={() => setShowNotifications(true)}
      />

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute inset-0 z-[100] flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
          <div className="relative mt-auto bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3a5a40]/10 rounded-xl">
                  <Bell size={20} className="text-[#3a5a40]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Notifications</h2>
                  <p className="text-xs text-stone-500">
                    {pendingFriendRequests.length === 0
                      ? 'No pending requests'
                      : `${pendingFriendRequests.length} pending request${pendingFriendRequests.length > 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pendingFriendRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                    <UserPlus size={28} className="text-stone-400" />
                  </div>
                  <p className="text-stone-500 font-medium">No pending requests</p>
                  <p className="text-stone-400 text-sm mt-1">Friend requests will appear here</p>
                </div>
              ) : (
                pendingFriendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-stone-50 rounded-2xl p-4 flex items-center gap-3 border border-stone-100"
                  >
                    {request.from.avatar ? (
                      <img
                        src={request.from.avatar}
                        alt={request.from.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#a3b18a] flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-white">
                          {request.from.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-800 text-sm truncate">{request.from.name}</p>
                      <p className="text-xs text-stone-500 truncate">Wants to be your friend</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAcceptFriendRequest(request.from._id)}
                        disabled={processingRequestId === request.from._id}
                        className="p-2 bg-[#3a5a40] text-white rounded-xl hover:bg-[#588157] transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {processingRequestId === request.from._id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeclineFriendRequest(request.from._id)}
                        disabled={processingRequestId === request.from._id}
                        className="p-2 bg-stone-200 text-stone-600 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
