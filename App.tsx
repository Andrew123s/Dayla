
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
import { Loader, X, Check, UserPlus, Bell, Heart, MessageCircle, Layout, UserCheck } from 'lucide-react';
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

interface AppNotification {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  type: 'like' | 'comment' | 'friend_request' | 'friend_accepted' | 'board_join' | 'board_invite';
  post?: { _id: string; content?: string };
  dashboard?: { _id: string; name?: string };
  message: string;
  read: boolean;
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
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
    setNotifications([]);
    setUnreadNotifCount(0);
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

  // Fetch all notifications (likes, comments, etc.)
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/notifications`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications || []);
          setUnreadNotifCount(data.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchAllNotifications = useCallback(async () => {
    await Promise.all([fetchPendingFriendRequests(), fetchNotifications()]);
  }, [fetchPendingFriendRequests, fetchNotifications]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (currentUser && view !== 'auth') {
      fetchAllNotifications();
    }
  }, [currentUser, view, fetchAllNotifications]);

  // Listen for real-time notification events
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;

    const handleFriendRequestReceived = (data: any) => {
      if (data.toUserId === currentUser.id) {
        fetchPendingFriendRequests();
        fetchNotifications();
      }
    };

    const handleFriendRequestAccepted = () => {
      fetchPendingFriendRequests();
      fetchNotifications();
    };

    const handleNewNotification = (data: any) => {
      if (data.recipientId === currentUser.id) {
        fetchNotifications();
      }
    };

    socket.on('friend:request_sent', handleFriendRequestReceived);
    socket.on('friend:request_accepted', handleFriendRequestAccepted);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('friend:request_sent', handleFriendRequestReceived);
      socket.off('friend:request_accepted', handleFriendRequestAccepted);
      socket.off('notification:new', handleNewNotification);
    };
  }, [currentUser, fetchPendingFriendRequests, fetchNotifications]);

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

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (unreadNotifCount > 0) {
      try {
        await authFetch(`${API_BASE_URL}/api/auth/notifications/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        setUnreadNotifCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
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
        notificationCount={pendingFriendRequests.length + unreadNotifCount}
        onNotificationClick={handleOpenNotifications}
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
                    {pendingFriendRequests.length + notifications.length === 0
                      ? 'All caught up'
                      : `${pendingFriendRequests.length + notifications.length} notification${(pendingFriendRequests.length + notifications.length) > 1 ? 's' : ''}`
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
              {pendingFriendRequests.length === 0 && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                    <Bell size={28} className="text-stone-400" />
                  </div>
                  <p className="text-stone-500 font-medium">All caught up</p>
                  <p className="text-stone-400 text-sm mt-1">New activity will appear here</p>
                </div>
              ) : (
                <>
                  {/* Friend Requests */}
                  {pendingFriendRequests.map((request) => (
                    <div
                      key={`fr-${request._id}`}
                      className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100"
                    >
                      {request.from.avatar ? (
                        <img
                          src={request.from.avatar}
                          alt={request.from.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#a3b18a] flex items-center justify-center shrink-0">
                          <span className="text-base font-bold text-white">
                            {request.from.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm truncate">{request.from.name}</p>
                        <p className="text-xs text-stone-500">Wants to be your friend</p>
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
                  ))}

                  {/* All Notifications */}
                  {notifications.map((notif) => {
                    let IconComponent = Heart;
                    let iconColor = 'text-red-500';
                    let fillIcon = true;

                    if (notif.type === 'like') {
                      IconComponent = Heart; iconColor = 'text-red-500'; fillIcon = true;
                    } else if (notif.type === 'comment') {
                      IconComponent = MessageCircle; iconColor = 'text-[#3a5a40]'; fillIcon = false;
                    } else if (notif.type === 'friend_request') {
                      IconComponent = UserPlus; iconColor = 'text-blue-500'; fillIcon = false;
                    } else if (notif.type === 'friend_accepted') {
                      IconComponent = UserCheck; iconColor = 'text-green-500'; fillIcon = false;
                    } else if (notif.type === 'board_join' || notif.type === 'board_invite') {
                      IconComponent = Layout; iconColor = 'text-purple-500'; fillIcon = false;
                    }

                    const bgColor = notif.read ? 'bg-stone-50' : 'bg-amber-50';
                    const borderColor = notif.read ? 'border-stone-100' : 'border-amber-100';

                    const timeAgo = (() => {
                      const diff = Date.now() - new Date(notif.createdAt).getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 1) return 'Just now';
                      if (mins < 60) return `${mins}m ago`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs}h ago`;
                      const days = Math.floor(hrs / 24);
                      if (days < 7) return `${days}d ago`;
                      return new Date(notif.createdAt).toLocaleDateString();
                    })();

                    const handleNotifClick = () => {
                      setShowNotifications(false);
                      if (notif.type === 'like' || notif.type === 'comment') {
                        setView('community');
                      } else if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
                        setView('chat');
                      } else if (notif.type === 'board_join' || notif.type === 'board_invite') {
                        setView('dashboard');
                      }
                    };

                    return (
                      <button
                        key={`n-${notif._id}`}
                        onClick={handleNotifClick}
                        className={`${bgColor} rounded-2xl p-4 flex items-center gap-3 border ${borderColor} w-full text-left hover:brightness-95 transition-all active:scale-[0.98]`}
                      >
                        <div className="relative shrink-0">
                          {notif.sender?.avatar ? (
                            <img
                              src={notif.sender.avatar}
                              alt={notif.sender.name}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#a3b18a] flex items-center justify-center">
                              <span className="text-base font-bold text-white">
                                {notif.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <IconComponent size={12} className={iconColor} fill={fillIcon ? 'currentColor' : 'none'} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-700">{notif.message}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{timeAgo}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[#3a5a40] shrink-0"></div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
