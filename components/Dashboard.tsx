
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  StickyNote, NoteAuthor, User, WeatherDay, WeatherSuggestion, TripDates,
  Expense, Participant, BudgetCategory, SustainabilityImpact, OffsetProject, EcoChallenge,
  Trip, SavedCommunityTrip, TripCategory
} from '../types';
import { API_BASE_URL, authFetch } from '../lib/api';
import {
  Plus, Image as ImageIcon, Mic, Type, Share2, Calendar, Link2, Layout,
  CloudSun, X, MapPin, Wind, Thermometer, CloudRain, Sun, AlertTriangle,
  CheckCircle2, Info, Search, Clock, ChevronLeft, ChevronRight, Wallet,
  CreditCard, PieChart, Users, DollarSign, Filter, Trash2, Leaf, Droplets,
  Trees, Zap, Award, BookOpen, Globe, TrendingDown, Store, Star, Play, Pause, Move, Maximize2, Crop as CropIcon,
  UserPlus, Bell, PenTool, Loader, Cloud, CloudLightning,
  Sparkles, Mountain, Briefcase, Home, Tent, Compass, Heart, Bookmark, Tag, FolderOpen, Package
} from 'lucide-react';
import SmartPacking from './SmartPacking';
import StickyNoteCard from './StickyNoteCard';

interface DashboardProps {
  user: User;
}

const COLORS = ['#faedcd', '#d4a373', '#e9edc9', '#fefae0', '#ccd5ae'];
const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  'Accommodation': '#d4a373',
  'Transportation': '#a3b18a',
  'Food & Dining': '#ccd5ae',
  'Activities': '#3a5a40',
  'Shopping': '#faedcd',
  'Other': '#d1d5db'
};

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'GHC', symbol: '₵' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' }
];

/**
 * InviteForm Component handles inviting new collaborators
 */
const InviteForm: React.FC<{
  onInvite: (email: string) => Promise<void>;
  onClose: () => void;
  sending: boolean;
  error: string;
}> = ({ onInvite, onClose, sending, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !sending) {
      await onInvite(email.trim());
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          className="w-full bg-stone-50 border-stone-200 border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] disabled:opacity-50"
          required
          disabled={sending}
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={sending}
          className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="flex-1 py-4 bg-[#3a5a40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Loader size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Send Invite'
          )}
        </button>
      </div>
    </form>
  );
};

/**
 * VoiceNote Component handles individual audio playback, scrubbing, and duration tracking
 */
const VoiceNote: React.FC<{ note: StickyNote }> = ({ note }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalDuration, setTotalDuration] = useState('--:--');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (note.audioUrl) {
      audioRef.current = new Audio(note.audioUrl);
      const audio = audioRef.current;
      const onTimeUpdate = () => {
        if (audio.duration) {
          const current = Math.floor(audio.currentTime);
          const minutes = Math.floor(current / 60);
          const seconds = (current % 60).toString().padStart(2, '0');
          setCurrentTime(`${minutes}:${seconds}`);
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      const onLoadedMetadata = () => {
        const total = Math.floor(audio.duration);
        const minutes = Math.floor(total / 60);
        const seconds = (total % 60).toString().padStart(2, '0');
        setTotalDuration(`${minutes}:${seconds}`);
      };
      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
      };
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('ended', onEnded);
      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [note.audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleScrub = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = clickedProgress * audioRef.current.duration;
    setProgress(clickedProgress * 100);
  };

  return (
    <div className="w-full h-full bg-white rounded-full border-2 border-[#3a5a40]/10 flex items-center px-4 gap-3 shadow-md hover:border-[#a3b18a] transition-colors overflow-hidden">
      <button onClick={togglePlay} className="w-10 h-10 bg-[#3a5a40] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0">
        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col justify-center min-w-0">
         <div onClick={handleScrub} className="h-2 w-full bg-stone-100 rounded-full overflow-hidden cursor-pointer relative group/progress">
            <div className="h-full bg-[#a3b18a] transition-all duration-100" style={{ width: `${progress}%` }} />
         </div>
         <div className="flex justify-between mt-1">
            <span className="text-[9px] font-black text-[#3a5a40] uppercase tracking-tighter">{currentTime}</span>
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">{totalDuration}</span>
         </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  // Dashboard ID and Trip ID
  const [dashboardId, setDashboardId] = useState<string>('');
  const [tripId, setTripId] = useState<string>('');
  const [tripName, setTripName] = useState<string>(localStorage.getItem('currentTripName') || '');
  const [tripStatus, setTripStatus] = useState<Trip['status']>(
    (localStorage.getItem('currentTripStatus') as Trip['status']) || 'planning'
  );
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [croppingId, setCroppingId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ── Infinite canvas state ────────────────────────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const [zoomDisplay, setZoomDisplay] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const isPanningRef = useRef(false);
  const isSpaceHeldRef = useRef(false);
  const panOriginRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });
  const panRafRef = useRef<number | null>(null);

  // Feature Toggles
  const [showWeather, setShowWeather] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showSusCal, setShowSusCal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTripsPanel, setShowTripsPanel] = useState(false);
  const [showSmartPacking, setShowSmartPacking] = useState(false);

  // Trips & Saved Data
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedCommunityTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsTab, setTripsTab] = useState<'planned' | 'saved'>('planned');
  const [tripsFilter, setTripsFilter] = useState<TripCategory | 'all'>('all');
  const [tripsStatusFilter, setTripsStatusFilter] = useState<Trip['status'] | 'all'>('all');
  const [editingTripCategory, setEditingTripCategory] = useState<string | null>(null);

  // Collaboration Features
  const [activeUsers, setActiveUsers] = useState<User[]>([user]);
  const [collaboratorCount, setCollaboratorCount] = useState(1);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [invitations, setInvitations] = useState<Array<{id: string, email: string, invitedBy: string, timestamp: Date}>>([]);
  const [showAlerts, setShowAlerts] = useState<Array<{id: string, message: string, type: 'info' | 'success' | 'warning', timestamp: Date}>>([]);

  // Trip creation modal
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [createTripError, setCreateTripError] = useState('');

  // Feature Data
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', title: 'Cabin Rental', amount: 450, category: 'Accommodation', date: '2025-06-15', paidById: user.id, splitBetweenIds: [user.id] }
  ]);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: user.id, name: 'You', avatar: user.avatar || '' },
  ]);
  const [tripDates, setTripDates] = useState<TripDates>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newPlanText, setNewPlanText] = useState('');

  // Weather State
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [weatherLocation, setWeatherLocation] = useState('Accra');

  // Fetch weather data from backend
  const fetchWeather = async (location: string) => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/weather?location=${encodeURIComponent(location)}&days=5`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch weather');
      }
      setWeatherData(data.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setWeatherError(err instanceof Error ? err.message : 'Failed to load weather data');
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch weather when modal opens
  useEffect(() => {
    if (showWeather) {
      fetchWeather(weatherLocation);
    }
  }, [showWeather]);

  // Helper to get weather icon component
  const getWeatherIcon = (condition: string, size: number = 24) => {
    switch (condition) {
      case 'Sunny': return <Sun size={size} />;
      case 'Rainy': return <CloudRain size={size} />;
      case 'Cloudy': return <CloudSun size={size} />;
      case 'Windy': return <Wind size={size} />;
      case 'Stormy': return <CloudLightning size={size} />;
      default: return <Sun size={size} />;
    }
  };

  // Eco Tracker State
  const [ecoData, setEcoData] = useState<any>(null);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [ecoError, setEcoError] = useState('');
  const [ecoConfig, setEcoConfig] = useState({
    destination: 'GH',
    transport_mode: 'car',
    distance: 200,
    accommodation_type: 'hotel',
    food_types: ['average_meal'] as string[],
    activities: ['hiking'] as string[],
  });

  // Fetch eco emissions from Climatiq API
  const fetchEcoData = async () => {
    setEcoLoading(true);
    setEcoError('');
    try {
      // Calculate trip duration from dates
      const start = new Date(tripDates.startDate || Date.now());
      const end = new Date(tripDates.endDate || Date.now());
      const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      const response = await authFetch(`${API_BASE_URL}/api/climatiq/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ecoConfig,
          duration,
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response. Please try again later.');
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to calculate emissions');
      }
      setEcoData(data.data);
    } catch (err) {
      console.error('Eco tracker error:', err);
      setEcoError(err instanceof Error ? err.message : 'Failed to load eco data');
      setEcoData(null);
    } finally {
      setEcoLoading(false);
    }
  };

  // Fetch eco data when modal opens
  useEffect(() => {
    if (showSusCal) {
      fetchEcoData();
    }
  }, [showSusCal]);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    title: '',
    amount: 0,
    category: 'Food & Dining',
    paidById: user.id,
    splitBetweenIds: participants.map(p => p.id)
  });

  // Fetch notes and collaborator data from the backend dashboard
  // Returns the recovered tripId (or null if not found)
  const fetchNotes = async (dbId: string): Promise<string | null> => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/boards/${dbId}`);
      if (response.ok) {
        const data = await response.json();
        const dashboard = data.data?.dashboard;
        if (dashboard?.notes && Array.isArray(dashboard.notes)) {
          setNotes(dashboard.notes);
        }
        const tid = dashboard?.tripId?._id || dashboard?.tripId;
        if (tid) {
          const tidStr = typeof tid === 'string' ? tid : tid.toString();
          setTripId(tidStr);
          localStorage.setItem('currentTripId', tidStr);
          // Extract collaborator count: owner (1) + collaborators array
          const collabs = dashboard?.collaborators || [];
          setCollaboratorCount(1 + collabs.length);
          const parts: Participant[] = [
            { id: user.id, name: 'You', avatar: user.avatar || '' },
          ];
          collabs.forEach((c: any) => {
            const cUser = c.user;
            if (cUser) {
              const cId = cUser._id || cUser;
              if (cId.toString() !== user.id) {
                parts.push({
                  id: cId.toString(),
                  name: cUser.name || 'Collaborator',
                  avatar: cUser.avatar || '',
                });
              }
            }
          });
          if (parts.length > 0) setParticipants(parts);
          return tidStr;
        }
        // Extract collaborators even if tripId wasn't found
        const collabs = dashboard?.collaborators || [];
        setCollaboratorCount(1 + collabs.length);
      } else {
        console.warn('Failed to fetch dashboard notes:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
    return null;
  };

  // Initialize or fetch dashboard on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Try to get existing IDs from localStorage
        const storedDashboardId = localStorage.getItem('currentDashboardId');
        const storedTripId = localStorage.getItem('currentTripId');

        if (storedDashboardId && storedTripId) {
          setDashboardId(storedDashboardId);
          setTripId(storedTripId);
          // Restore cached name/status — no extra fetch needed
          setTripName(localStorage.getItem('currentTripName') || '');
          setTripStatus((localStorage.getItem('currentTripStatus') as Trip['status']) || 'planning');
          await fetchNotes(storedDashboardId);
          return;
        }

        // If we have a dashboard but tripId was lost, recover it from the dashboard
        if (storedDashboardId) {
          setDashboardId(storedDashboardId);
          const recovered = await fetchNotes(storedDashboardId);
          if (recovered) return; // tripId restored — no need to create a new trip
          // Dashboard fetch failed or had no tripId — clear stale id and fall through
          localStorage.removeItem('currentDashboardId');
        }

        // Fallback: try to find an existing trip before prompting to create one
        try {
          const tripsRes = await authFetch(`${API_BASE_URL}/api/trips`);
          if (tripsRes.ok) {
            const tripsData = await tripsRes.json();
            const trips: any[] = tripsData.data?.trips || [];
            if (trips.length > 0) {
              const latestTrip = trips[0];
              const latestTripId = latestTrip._id as string;
              // Try to find the dashboard for this trip
              const boardRes = await authFetch(`${API_BASE_URL}/api/boards/by-trip/${latestTripId}`);
              if (boardRes.ok) {
                const boardData = await boardRes.json();
                const dbId = boardData.data?.dashboard?._id as string;
                if (dbId) {
                  const name = latestTrip.name || '';
                  const status: Trip['status'] = latestTrip.status || 'planning';
                  setDashboardId(dbId);
                  setTripId(latestTripId);
                  setTripName(name);
                  setTripStatus(status);
                  localStorage.setItem('currentDashboardId', dbId);
                  localStorage.setItem('currentTripId', latestTripId);
                  localStorage.setItem('currentTripName', name);
                  localStorage.setItem('currentTripStatus', status);
                  await fetchNotes(dbId);
                  return;
                }
              }
              // No board found for existing trip — fall through to prompt user
            }
          }
        } catch (_) {
          // ignore — fall through to prompt user
        }

        // No trips at all — prompt the user to create and name their first trip
        setShowCreateTripModal(true);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, []);

  // Connect to socket and manage active users
  useEffect(() => {
    if (!dashboardId) return;

    // Join dashboard via REST API to register as active
    const joinDashboard = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data?.activeUsers) {
            const users: User[] = data.data.activeUsers.map((au: any) => ({
              id: au.userId?._id || au.userId || au.id,
              name: au.name || 'Unknown',
              avatar: au.avatar || '',
              bio: '',
              interests: [],
            }));
            setActiveUsers(users);
          }
          if (data.data?.collaboratorCount) {
            setCollaboratorCount(data.data.collaboratorCount);
          }
        }
      } catch (err) {
        console.error('Failed to join dashboard:', err);
      }
    };

    // Fetch current active users
    const fetchActiveUsers = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/active-users`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.activeUsers) {
            const users: User[] = data.data.activeUsers.map((au: any) => ({
              id: au.userId?._id || au.userId || au.id,
              name: au.name || 'Unknown',
              avatar: au.avatar || '',
              bio: '',
              interests: [],
            }));
            setActiveUsers(users.length > 0 ? users : [user]);
          }
          if (data.data?.collaboratorCount) {
            setCollaboratorCount(data.data.collaboratorCount);
          }
        }
      } catch (err) {
        console.error('Failed to fetch active users:', err);
      }
    };

    // Refresh collaborator count from dashboard
    const refreshCollaborators = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/api/boards/${dashboardId}`);
        if (response.ok) {
          const data = await response.json();
          const dashboard = data.data?.dashboard;
          if (dashboard) {
            const collabs = dashboard.collaborators || [];
            setCollaboratorCount(1 + collabs.length);
          }
        }
      } catch (err) {
        console.error('Failed to refresh collaborators:', err);
      }
    };

    joinDashboard();
    fetchActiveUsers();
    refreshCollaborators();

    // Connect to socket for real-time updates
    const token = localStorage.getItem('dayla_auth_token') || '';
    const socket = io(window.location.origin, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_room', { roomId: dashboardId, roomType: 'dashboard' });
    });

    socket.on('user_joined', (data: { userId: string; name: string; avatar?: string }) => {
      setActiveUsers(prev => {
        const exists = prev.some(u => u.id === data.userId);
        if (exists) return prev;
        return [...prev, { id: data.userId, name: data.name, avatar: data.avatar || '', bio: '', interests: [] }];
      });
      setParticipants(prev => {
        const exists = prev.some(p => p.id === data.userId);
        if (exists) return prev;
        return [...prev, { id: data.userId, name: data.name, avatar: data.avatar || '' }];
      });
      refreshCollaborators();
    });

    socket.on('user_left', (data: { userId: string }) => {
      setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    socket.on('user_editing', (data: { userId: string; userName: string; avatar?: string; noteId: string }) => {
      setEditingNoteId(data.noteId);
      setEditingUser({ id: data.userId, name: data.userName, avatar: data.avatar || '', bio: '', interests: [] });
    });

    socket.on('user_stopped_editing', () => {
      setEditingNoteId(null);
      setEditingUser(null);
    });

    // Listen for real-time note updates from collaborators
    socket.on('note_updated', (data: { noteId: string; updates: any }) => {
      setNotes(prev => prev.map(n => n.id === data.noteId ? { ...n, ...data.updates } : n));
    });

    socket.on('note_created', (data: { note: StickyNote }) => {
      setNotes(prev => {
        if (prev.some(n => n.id === data.note.id)) return prev;
        return [...prev, data.note];
      });
    });

    socket.on('note_deleted', (data: { noteId: string }) => {
      setNotes(prev => prev.filter(n => n.id !== data.noteId));
    });

    socket.on('connect_error', (err: Error) => {
      console.warn('Socket connection error (active users will use REST fallback):', err.message);
    });

    // Cleanup: leave dashboard and disconnect socket
    return () => {
      if (dashboardId) {
        authFetch(`${API_BASE_URL}/api/boards/${dashboardId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
      socket.emit('leave_room', { roomId: dashboardId, roomType: 'dashboard' });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dashboardId]);

  // Fetch trips and saved trips
  const fetchTripsData = async () => {
    setTripsLoading(true);
    try {
      const [tripsRes, savedRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/trips`),
        authFetch(`${API_BASE_URL}/api/community/saved`),
      ]);

      if (tripsRes.ok) {
        const data = await tripsRes.json();
        const trips: Trip[] = (data.data?.trips || []).map((t: any) => ({
          id: t._id || t.id,
          name: t.name || 'Untitled Trip',
          description: t.description || '',
          items: [],
          collaborators: (t.collaborators || []).map((c: any) => c._id || c),
          dates: t.dates ? { startDate: t.dates.startDate, endDate: t.dates.endDate } : undefined,
          status: t.status || 'planning',
          category: t.category || undefined,
          destination: t.destination?.name || '',
          coverImage: t.coverImage || '',
          tags: t.tags || [],
          createdAt: t.createdAt || '',
        }));
        setMyTrips(trips);
      }

      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedTrips(data.data?.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch trips data:', err);
    } finally {
      setTripsLoading(false);
    }
  };

  const updateTripCategory = async (tripId: string, category: TripCategory) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      if (response.ok) {
        setMyTrips(prev => prev.map(t => t.id === tripId ? { ...t, category } : t));
      }
    } catch (err) {
      console.error('Failed to update trip category:', err);
    }
    setEditingTripCategory(null);
  };

  // Create a new named trip (status: draft) and switch the canvas to it
  const handleCreateTrip = async () => {
    if (!newTripName.trim()) return;
    setCreatingTrip(true);
    setCreateTripError('');
    try {
      const response = await authFetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTripName.trim(), status: 'draft' }),
      });

      // Guard against non-JSON responses (rate limit, proxy errors, etc.)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from create trip:', text);
        setCreateTripError(
          response.status === 429
            ? 'Too many requests. Please wait a moment and try again.'
            : response.status === 401
            ? 'Session expired. Please log out and log back in.'
            : 'Server error. Please try again.'
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setCreateTripError(data.message || `Failed to create trip (${response.status})`);
        return;
      }

      const newTripId = data.data?.trip?._id;
      const newDashboardId = data.data?.dashboard?._id;

      if (!newTripId || !newDashboardId) {
        setCreateTripError('Server returned an unexpected response. Please try again.');
        console.error('Unexpected create trip response:', data);
        return;
      }

      const name = newTripName.trim();
      setTripId(newTripId);
      setDashboardId(newDashboardId);
      setTripName(name);
      setTripStatus('draft');
      localStorage.setItem('currentTripId', newTripId);
      localStorage.setItem('currentDashboardId', newDashboardId);
      localStorage.setItem('currentTripName', name);
      localStorage.setItem('currentTripStatus', 'draft');
      setNotes([]);
      setShowCreateTripModal(false);
      setShowTripsPanel(false);
      setNewTripName('');
      setCreateTripError('');
      fetchTripsData();
    } catch (err) {
      console.error('Failed to create trip:', err);
      setCreateTripError('Network error. Please check your connection and try again.');
    } finally {
      setCreatingTrip(false);
    }
  };

  // Switch the canvas to a different existing trip
  const handleSwitchTrip = async (tId: string) => {
    try {
      const boardRes = await authFetch(`${API_BASE_URL}/api/boards/by-trip/${tId}`);
      if (boardRes.ok) {
        const boardData = await boardRes.json();
        const dbId = boardData.data?.dashboard?._id as string;
        if (dbId) {
          const tripData = myTrips.find(t => t.id === tId);
          const name = tripData?.name || '';
          const status: Trip['status'] = tripData?.status || 'planning';
          setTripId(tId);
          setDashboardId(dbId);
          setTripName(name);
          setTripStatus(status);
          localStorage.setItem('currentTripId', tId);
          localStorage.setItem('currentDashboardId', dbId);
          localStorage.setItem('currentTripName', name);
          localStorage.setItem('currentTripStatus', status);
          await fetchNotes(dbId);
          setShowTripsPanel(false);
        }
      }
    } catch (err) {
      console.error('Failed to switch trip:', err);
    }
  };

  // Finalize a trip: move status from draft/planning → planned
  const handleFinalizeTrip = async (tId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/trips/${tId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'planned' }),
      });
      if (response.ok) {
        setMyTrips(prev => prev.map(t => t.id === tId ? { ...t, status: 'planned' } : t));
        if (tId === tripId) {
          setTripStatus('planned');
          localStorage.setItem('currentTripStatus', 'planned');
        }
      }
    } catch (err) {
      console.error('Failed to finalize trip:', err);
    }
  };

  const makeAuthor = (): NoteAuthor => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    timestamp: new Date().toISOString(),
  });

  const addNote = (type: StickyNote['type'], content?: string, emoji?: string, color?: string, date?: string, audioUrl?: string) => {
    const isAsset = type === 'image' || type === 'voice';
    const author = makeAuthor();
    const noteWidth = isAsset ? (type === 'image' ? 240 : 220) : 180;
    const noteHeight = isAsset ? (type === 'image' ? 180 : 80) : 180;
    // Place new notes at the visible canvas center in world coordinates
    const vw = canvasContainerRef.current?.clientWidth ?? window.innerWidth;
    const vh = canvasContainerRef.current?.clientHeight ?? window.innerHeight;
    const worldCx = (vw / 2 - panXRef.current) / zoomRef.current;
    const worldCy = (vh / 2 - panYRef.current) / zoomRef.current;
    const spread = notes.length % 9;
    const ox = (spread % 3 - 1) * 60;
    const oy = Math.floor(spread / 3) * 60;
    const newNote: StickyNote = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: Math.round(worldCx - noteWidth / 2 + ox),
      y: Math.round(worldCy - noteHeight / 2 + oy),
      width: noteWidth,
      height: noteHeight,
      content: content || (type === 'text' ? 'New plan item...' : type === 'schedule' ? 'Activity detail...' : ''),
      color: color || (isAsset ? 'transparent' : COLORS[Math.floor(Math.random() * COLORS.length)]),
      emoji: emoji || (type === 'schedule' ? '⏰' : type === 'image' ? '🖼️' : type === 'voice' ? '🎙️' : '🌲'),
      scheduledDate: date,
      audioUrl: audioUrl,
      crop: type === 'image' ? { x: 0, y: 0, zoom: 1 } : undefined,
      createdBy: author,
    };
    setNotes(prev => [...prev, newNote]);

    // Persist to backend
    if (tripId) {
      authFetch(`${API_BASE_URL}/api/trips/${tripId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 403) {
            setNotes(prev => prev.filter(n => n.id !== newNote.id));
            const alert = { id: Math.random().toString(36).substr(2, 9), message: data.message || 'Not authorized to create notes', type: 'warning' as const, timestamp: new Date() };
            setShowAlerts(prev => [...prev, alert]);
            setTimeout(() => setShowAlerts(prev => prev.filter(a => a.id !== alert.id)), 4000);
          }
        }
      }).catch(err => console.error('Failed to save note:', err));
    }
    // Broadcast to collaborators
    if (socketRef.current && dashboardId) {
      socketRef.current.emit('note_update', { roomId: dashboardId, noteId: newNote.id, updates: newNote });
    }
  };

  const stampEdit = (noteId: string) => {
    const author = makeAuthor();
    setNotes(prev => {
      const updated = prev.map(n => n.id === noteId ? { ...n, lastEditedBy: author } : n);
      const note = updated.find(n => n.id === noteId);
      if (note && tripId) {
        authFetch(`${API_BASE_URL}/api/trips/${tripId}/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note),
        }).then(async (res) => {
          if (!res.ok && res.status === 403) {
            const data = await res.json().catch(() => ({}));
            const alert = { id: Math.random().toString(36).substr(2, 9), message: data.message || 'Not authorized to edit notes', type: 'warning' as const, timestamp: new Date() };
            setShowAlerts(prev => [...prev, alert]);
            setTimeout(() => setShowAlerts(prev => prev.filter(a => a.id !== alert.id)), 4000);
          }
        }).catch(err => console.error('Failed to update note:', err));
      }
      if (note && socketRef.current && dashboardId) {
        socketRef.current.emit('note_update', { roomId: dashboardId, noteId, updates: note });
      }
      return updated;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Upload image to backend for persistent storage
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await authFetch(`${API_BASE_URL}/api/upload/images`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success && uploadData.data?.url) {
        addNote('image', uploadData.data.url);
      } else {
        // Fallback to base64 if upload fails
        console.warn('Image upload failed, using local data URL:', uploadData.message);
        const reader = new FileReader();
        reader.onload = (event) => addNote('image', event.target?.result as string);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Image upload error, using local data URL:', err);
      const reader = new FileReader();
      reader.onload = (event) => addNote('image', event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [micRequesting, setMicRequesting] = useState(false);

  const startVoiceRecording = async () => {
    if (micRequesting) return; // Prevent double-tap while permission prompt is open
    setMicRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use a supported MIME type (webm on Android/Chrome, mp4 on iOS Safari)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      mediaRecorderRef.current = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const mimeUsed = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeUsed });
          if (audioBlob.size > 1000) {
            // Upload audio to backend for persistent storage
            try {
              const ext = mimeUsed.includes('mp4') ? 'mp4' : mimeUsed.includes('ogg') ? 'ogg' : 'webm';
              const formData = new FormData();
              formData.append('audio', audioBlob, `voice_${Date.now()}.${ext}`);

              const uploadResponse = await authFetch(`${API_BASE_URL}/api/upload/audio`, {
                method: 'POST',
                body: formData,
              });

              const uploadData = await uploadResponse.json();
              if (uploadData.success && uploadData.data?.url) {
                addNote('voice', 'Voice Message', '🎙️', undefined, undefined, uploadData.data.url);
              } else {
                // Fallback to blob URL if upload fails
                console.warn('Audio upload failed, using local blob URL:', uploadData.message);
                addNote('voice', 'Voice Message', '🎙️', undefined, undefined, URL.createObjectURL(audioBlob));
              }
            } catch (uploadErr) {
              // Fallback to blob URL if network error
              console.warn('Audio upload error, using local blob URL:', uploadErr);
              addNote('voice', 'Voice Message', '🎙️', undefined, undefined, URL.createObjectURL(audioBlob));
            }
          }
        }
      };
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      const errName = err?.name || '';
      let message = 'Microphone access is required to record voice notes. Please allow it in your browser settings.';
      if (errName === 'NotAllowedError') {
        message = 'Microphone access was denied. Please enable it in your browser settings and try again.';
      } else if (errName === 'NotFoundError') {
        message = 'No microphone found. Please connect a microphone and try again.';
      }

      // Prevent duplicate mic alerts from stacking — only add if no existing mic alert
      setShowAlerts(prev => {
        const hasMicAlert = prev.some(a => a.type === 'warning' && a.message.includes('icrophone'));
        if (hasMicAlert) return prev; // Don't stack duplicates
        const alertId = 'mic_' + Date.now();
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setShowAlerts(p => p.filter(a => a.id !== alertId));
        }, 5000);
        return [...prev, { id: alertId, message, type: 'warning', timestamp: new Date() }];
      });
    } finally {
      setMicRequesting(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const toggleVoiceRecording = () => {
    if (micRequesting) return;
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ── Note interaction callbacks (used by StickyNoteCard) ──────────────────
  const handleNotePositionChange = (id: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    stampEdit(id);
    if (socketRef.current && dashboardId) {
      const note = notes.find(n => n.id === id);
      if (note) socketRef.current.emit('note_update', { roomId: dashboardId, noteId: id, updates: { ...note, x, y } });
    }
  };

  const handleNoteSizeChange = (id: string, width: number, height: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, width, height } : n));
    stampEdit(id);
  };

  const handleNoteDelete = (id: string) => {
    const removedNote = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (tripId) {
      authFetch(`${API_BASE_URL}/api/trips/${tripId}/notes/${id}`, { method: 'DELETE' })
        .then(async (res) => {
          if (!res.ok && res.status === 403) {
            if (removedNote) setNotes(prev => [...prev, removedNote]);
            const data = await res.json().catch(() => ({}));
            const alert = { id: Math.random().toString(36).substr(2, 9), message: data.message || 'Not authorized to delete notes', type: 'warning' as const, timestamp: new Date() };
            setShowAlerts(prev => [...prev, alert]);
            setTimeout(() => setShowAlerts(prev => prev.filter(a => a.id !== alert.id)), 4000);
          }
        })
        .catch(err => console.error('Failed to delete note:', err));
    }
    if (socketRef.current && dashboardId) {
      socketRef.current.emit('note_deleted', { roomId: dashboardId, noteId: id });
    }
  };

  const toggleLink = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, linkTo: prev[prev.findIndex(item => item.id === id) - 1]?.id } : n));
    stampEdit(id);
  };

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const totalSpent = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  
  const spentByCategory = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const saveExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      title: newExpense.title || 'Untitled',
      amount: Number(newExpense.amount),
      category: newExpense.category as BudgetCategory,
      date: new Date().toISOString().split('T')[0],
      paidById: newExpense.paidById || user.id,
      splitBetweenIds: newExpense.splitBetweenIds || [user.id]
    };
    setExpenses([...expenses, expense]);
    setShowAddExpense(false);
  };

  // Collaboration Functions
  const handleInviteUser = async (email: string) => {
    setInviteSending(true);
    setInviteError('');

    try {
      const effectiveDashboardId = dashboardId || localStorage.getItem('currentDashboardId') || '';
      if (!effectiveDashboardId) {
        throw new Error('No active plan found. Please create a trip first.');
      }

      const response = await authFetch(`${API_BASE_URL}/api/boards/${effectiveDashboardId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role: 'editor' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      // Update local state with the invitation
      const invitation = {
        id: data.data.invitation.id,
        email,
        invitedBy: user.name,
        timestamp: new Date()
      };
      setInvitations(prev => [...prev, invitation]);

      // Close modal on success
      setShowInviteModal(false);

      const successAlert = {
        id: Math.random().toString(36).substr(2, 9),
        message: `Invitation sent to ${email}! They will receive an email shortly.`,
        type: 'success' as const,
        timestamp: new Date()
      };
      setShowAlerts(prev => [...prev, successAlert]);
      setTimeout(() => {
        setShowAlerts(prev => prev.filter(a => a.id !== successAlert.id));
      }, 5000);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  const handleNoteEdit = (noteId: string) => {
    setEditingNoteId(noteId);
    setEditingUser(user);
    // Emit editing event to other collaborators via socket
    if (socketRef.current && dashboardId) {
      socketRef.current.emit('start_editing', { roomId: dashboardId, noteId });
    }
    setTimeout(() => {
      setEditingNoteId(null);
      setEditingUser(null);
      if (socketRef.current && dashboardId) {
        socketRef.current.emit('stop_editing', { roomId: dashboardId, noteId });
      }
    }, 3000);
  };

  // ── Infinite canvas helpers ────────────────────────────────────────────────

  const applyTransform = () => {
    const layer = canvasLayerRef.current;
    const container = canvasContainerRef.current;
    if (!layer) return;
    const z = zoomRef.current;
    const px = panXRef.current;
    const py = panYRef.current;
    layer.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${z})`;
    if (container) {
      const dotSize = Math.max(4, 24 * z);
      const modPx = ((px % dotSize) + dotSize) % dotSize;
      const modPy = ((py % dotSize) + dotSize) % dotSize;
      container.style.backgroundSize = `${dotSize}px ${dotSize}px`;
      container.style.backgroundPosition = `${modPx}px ${modPy}px`;
    }
  };

  const doZoom = (rawZoom: number, cx: number, cy: number) => {
    const clamped = Math.min(3, Math.max(0.25, rawZoom));
    const ratio = clamped / zoomRef.current;
    panXRef.current = cx + (panXRef.current - cx) * ratio;
    panYRef.current = cy + (panYRef.current - cy) * ratio;
    zoomRef.current = clamped;
    applyTransform();
    setZoomDisplay(Math.round(clamped * 100));
  };

  // Wheel zoom + pinch-to-zoom touch events (passive: false to preventDefault)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.001);
      doZoom(zoomRef.current * factor, e.clientX - rect.left, e.clientY - rect.top);
    };

    let pinching = false;
    let startDist = 0, startZoom = 1, startMidX = 0, startMidY = 0, startPanX = 0, startPanY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinching = true;
        const [t0, t1] = [e.touches[0], e.touches[1]];
        startDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        startZoom = zoomRef.current;
        startMidX = (t0.clientX + t1.clientX) / 2;
        startMidY = (t0.clientY + t1.clientY) / 2;
        startPanX = panXRef.current;
        startPanY = panYRef.current;
      } else {
        pinching = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pinching || e.touches.length < 2) return;
      e.preventDefault();
      const [t0, t1] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const newZoom = Math.min(3, Math.max(0.25, startZoom * (dist / startDist)));
      const ratio = newZoom / startZoom;
      // Zoom around the initial midpoint + pan with midpoint movement
      panXRef.current = midX - (startMidX - startPanX) * ratio;
      panYRef.current = midY - (startMidY - startPanY) * ratio;
      zoomRef.current = newZoom;
      applyTransform();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinching = false;
        setZoomDisplay(Math.round(zoomRef.current * 100));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spacebar pan mode + Cmd+/−/0 keyboard zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.code === 'Space' && !target.matches('input, textarea')) {
        e.preventDefault();
        isSpaceHeldRef.current = true;
        setIsSpaceHeld(true);
      }
      if (e.metaKey || e.ctrlKey) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        if (e.code === 'Equal') { e.preventDefault(); doZoom(zoomRef.current * 1.25, cx, cy); }
        if (e.code === 'Minus') { e.preventDefault(); doZoom(zoomRef.current / 1.25, cx, cy); }
        if (e.code === 'Digit0') {
          e.preventDefault();
          zoomRef.current = 1; panXRef.current = 0; panYRef.current = 0;
          applyTransform(); setZoomDisplay(100);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { isSpaceHeldRef.current = false; setIsSpaceHeld(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas pan pointer handlers (only fire when notes stopPropagation is not triggered)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    isPanningRef.current = true;
    setIsPanning(true);
    panOriginRef.current = { clientX: e.clientX, clientY: e.clientY, panX: panXRef.current, panY: panYRef.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    panXRef.current = panOriginRef.current.panX + (e.clientX - panOriginRef.current.clientX);
    panYRef.current = panOriginRef.current.panY + (e.clientY - panOriginRef.current.clientY);
    if (panRafRef.current) cancelAnimationFrame(panRafRef.current);
    panRafRef.current = requestAnimationFrame(applyTransform);
  };

  const handleCanvasPointerUp = () => {
    if (isPanningRef.current) { isPanningRef.current = false; setIsPanning(false); }
  };

  return (
    <div className="w-full h-full relative bg-[#f7f3ee] overflow-hidden">
      <input type="file" ref={imageInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-white/60 backdrop-blur-md z-40 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3a5a40]/10 rounded-2xl"><Trees className="text-[#3a5a40]" size={24} /></div>
          <div>
            <h1 className="text-lg font-bold text-[#3a5a40] leading-none">{tripName || 'Plan a Trip'}</h1>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight mt-1">
              {tripStatus ? tripStatus.replace('_', ' ') : ''}{tripDates.startDate ? ` · ${formatDate(tripDates.startDate)} – ${formatDate(tripDates.endDate)}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Collaborators Counter */}
          <div className="flex items-center gap-1 px-3 py-1 bg-[#3a5a40]/10 rounded-full" title={`${collaboratorCount} assigned · ${activeUsers.length} online`}>
            <Users size={14} className="text-[#3a5a40]" />
            <span className="text-xs font-bold text-[#3a5a40]">{collaboratorCount}</span>
          </div>

          {/* Invite Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-2 bg-[#3a5a40] text-white rounded-full shadow-lg hover:bg-[#588157] transition-all active:scale-95"
            title="Invite collaborators"
          >
            <UserPlus size={20} />
          </button>

          <button onClick={() => setShowWeather(true)} className="p-2 bg-white text-[#3a5a40] rounded-full shadow-sm hover:bg-stone-50 transition-all active:scale-95"><CloudSun size={20} /></button>
          <button onClick={() => setShowSusCal(true)} className="p-2 bg-[#3a5a40] text-white rounded-full shadow-lg hover:bg-[#588157] transition-all active:scale-95"><Leaf size={20} /></button>
        </div>
      </div>

      {/* ── Infinite Canvas ─────────────────────────────────────────────── */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 overflow-hidden touch-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #a3b18a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0px 0px',
          cursor: isPanning ? 'grabbing' : isSpaceHeld ? 'grab' : 'default',
        }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
      >
        {/* World transform layer — everything inside is in world coordinates */}
        <div
          ref={canvasLayerRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transformOrigin: '0 0',
            transform: 'translate3d(0px, 0px, 0) scale(1)',
            willChange: 'transform',
          }}
        >
          {/* Link lines (world coordinates) */}
          <svg
            className="absolute pointer-events-none"
            style={{ top: 0, left: 0, overflow: 'visible', width: 1, height: 1, zIndex: 10 }}
          >
            {notes.map(note => {
              if (!note.linkTo) return null;
              const target = notes.find(n => n.id === note.linkTo);
              if (!target) return null;
              return (
                <line
                  key={`link-${note.id}`}
                  x1={note.x + note.width / 2} y1={note.y + note.height / 2}
                  x2={target.x + target.width / 2} y2={target.y + target.height / 2}
                  stroke="#588157" strokeWidth="2" strokeDasharray="5,5" opacity="0.6"
                />
              );
            })}
          </svg>

          {/* Sticky notes */}
          {notes.map((note) => (
            <StickyNoteCard
              key={note.id}
              note={note}
              user={user}
              zoomRef={zoomRef}
              collaboratorEditingUser={editingNoteId === note.id && editingUser ? editingUser : null}
              dashboardId={dashboardId}
              tripId={tripId}
              socketRef={socketRef}
              croppingId={croppingId}
              onContentChange={(id, content) => {
                setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
              }}
              onPositionChange={handleNotePositionChange}
              onSizeChange={handleNoteSizeChange}
              onDelete={handleNoteDelete}
              onLinkToggle={toggleLink}
              onEditStart={handleNoteEdit}
              onEditEnd={(id) => {
                stampEdit(id);
                setTimeout(() => { setEditingNoteId(null); setEditingUser(null); }, 100);
              }}
              onCropToggle={(id) => setCroppingId(croppingId === id ? null : id)}
              onZoom={(id, delta) => {
                setNotes(prev => prev.map(n => n.id === id ? { ...n, crop: { ...n.crop!, zoom: Math.max(1, (n.crop?.zoom || 1) + delta) } } : n));
                stampEdit(id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Empty-board hint */}
      {notes.length === 0 && !isInitializing && (
        !tripId ? (
          /* No active trip — interactive prompt */
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="p-8 bg-white/80 rounded-[3rem] backdrop-blur-sm border border-white/60 shadow-xl flex flex-col items-center">
              <Trees size={56} className="mb-4 text-[#3a5a40]/40" />
              <p className="text-sm font-black tracking-widest uppercase text-stone-500 mb-1">No Active Trip</p>
              <p className="text-[11px] text-center max-w-[200px] font-bold text-stone-400 mb-5">Create a trip to start planning on the canvas.</p>
              <button
                onClick={() => setShowCreateTripModal(true)}
                className="px-6 py-3 bg-[#3a5a40] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-[#588157] transition-colors active:scale-95"
              >
                + Create Trip
              </button>
            </div>
          </div>
        ) : (
          /* Trip active but canvas empty — passive hint */
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="p-8 bg-white/30 rounded-[3rem] backdrop-blur-sm border border-white/40 flex flex-col items-center">
              <Trees size={56} className="mb-4 text-[#3a5a40]/30" />
              <p className="text-sm font-bold tracking-widest uppercase text-stone-400/80">Infinite Canvas</p>
              <p className="text-[10px] mt-2 text-center max-w-[200px] font-bold text-stone-400/60">Add notes, photos, or voice memos below. Pinch or scroll to zoom.</p>
            </div>
          </div>
        )
      )}

      {/* ── Zoom Controls ─────────────────────────────────────────────── */}
      <div className="absolute bottom-24 right-3 z-40 flex flex-col items-center gap-0.5 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-stone-100 p-1.5">
        <button
          onClick={() => doZoom(zoomRef.current * 1.3, window.innerWidth / 2, window.innerHeight / 2)}
          className="w-8 h-8 flex items-center justify-center text-[#3a5a40] hover:bg-stone-100 rounded-xl font-bold text-xl leading-none transition-colors"
          title="Zoom in (Cmd =)"
        >+</button>
        <span className="text-[9px] font-black text-stone-400 w-8 text-center tabular-nums">{zoomDisplay}%</span>
        <button
          onClick={() => doZoom(zoomRef.current / 1.3, window.innerWidth / 2, window.innerHeight / 2)}
          className="w-8 h-8 flex items-center justify-center text-[#3a5a40] hover:bg-stone-100 rounded-xl font-bold text-xl leading-none transition-colors"
          title="Zoom out (Cmd -)"
        >−</button>
        <div className="w-5 h-px bg-stone-200 my-0.5" />
        <button
          onClick={() => { zoomRef.current = 1; panXRef.current = 0; panYRef.current = 0; applyTransform(); setZoomDisplay(100); }}
          className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
          title="Reset view (Cmd 0)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 3h6M3 3v6M21 3h-6M21 3v6M3 21h6M3 21v-6M21 21h-6M21 21v-6"/>
          </svg>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl rounded-full px-6 py-3 flex gap-6 items-center z-50 border border-stone-100">
        <button onClick={() => addNote('text')} className="flex flex-col items-center gap-1 text-[#3a5a40] hover:scale-110 transition-transform">
          <Type size={20} /><span className="text-[8px] font-bold">NOTE</span>
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center gap-1 text-[#3a5a40] hover:scale-110 transition-transform">
          <ImageIcon size={20} /><span className="text-[8px] font-bold">IMAGE</span>
        </button>
        <button onClick={toggleVoiceRecording} className={`flex flex-col items-center gap-1 transition-all duration-300 ${isRecording ? 'text-red-500 scale-125' : 'text-[#3a5a40] hover:scale-110'}`}>
          <div className="relative">
            <Mic size={20} />
            {isRecording && <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />}
          </div>
          <span className="text-[8px] font-bold">
            {isRecording ? `${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : 'VOICE'}
          </span>
        </button>
        <div className="w-px h-8 bg-stone-200" />
        <button onClick={() => setShowCalendar(true)} className="flex flex-col items-center gap-1 text-[#3a5a40] hover:scale-110 transition-transform">
          <Calendar size={20} /><span className="text-[8px] font-bold">CAL</span>
        </button>
        <button onClick={() => setShowBudget(true)} className="flex flex-col items-center gap-1 text-[#3a5a40] hover:scale-110 transition-transform">
          <Wallet size={20} /><span className="text-[8px] font-bold">BUDGET</span>
        </button>
      </div>

      {/* Ntelipak Glowing Blue Button — bottom-left, above toolbar */}
      <button
        onClick={() => setShowSmartPacking(true)}
        className="ntelipak-btn absolute bottom-6 left-3 w-12 h-12 rounded-full flex items-center justify-center z-40 border-2 border-blue-300/50"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <Package size={20} className="text-white drop-shadow-lg" />
        <span className="ntelipak-glitter-a absolute w-1 h-1 rounded-full bg-white" />
        <span className="ntelipak-glitter-b absolute w-1 h-1 rounded-full bg-white" />
      </button>

      {/* Trips Glowing Button — bottom-right, above toolbar */}
      <button
        onClick={() => { setShowTripsPanel(true); fetchTripsData(); }}
        className="trips-btn absolute bottom-6 right-3 w-12 h-12 rounded-full flex items-center justify-center z-40 border-2 border-pink-300/50"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <Sparkles size={20} className="text-white drop-shadow-lg" />
        <span className="glitter-a absolute w-1 h-1 rounded-full bg-white" />
        <span className="glitter-b absolute w-1 h-1 rounded-full bg-white" />
      </button>

      {/* Alert Notifications */}
      {showAlerts.length > 0 && (
        <div className="absolute top-20 right-4 z-[200] space-y-2">
          {showAlerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-2xl shadow-lg border animate-in slide-in-from-right-2 ${
              alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
              alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${
                  alert.type === 'success' ? 'bg-green-100' : 
                  alert.type === 'warning' ? 'bg-amber-100' :
                  'bg-blue-100'
                }`}>
                  <Bell size={16} className={
                    alert.type === 'success' ? 'text-green-600' : 
                    alert.type === 'warning' ? 'text-amber-600' :
                    'text-blue-600'
                  } />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-1">{alert.timestamp.toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => setShowAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-[#3a5a40] mb-6 flex items-center gap-2">
              <UserPlus size={24} />
              Invite Collaborators
            </h3>
            <InviteForm
              onInvite={handleInviteUser}
              onClose={() => { setShowInviteModal(false); setInviteError(''); }}
              sending={inviteSending}
              error={inviteError}
            />
          </div>
        </div>
      )}

      {/* Feature Modals */}
      {showBudget && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[90vh] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 bg-white border-b border-stone-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-[#3a5a40] flex items-center gap-2"><Wallet size={24} /> Trip Budget</h2>
                <div className="flex gap-2">
                   <select 
                     value={currency.code} 
                     onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value) || CURRENCIES[0])}
                     className="bg-stone-100 border-none rounded-xl text-[10px] font-bold px-2"
                   >
                     {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                   </select>
                   <button onClick={() => setShowBudget(false)} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
                </div>
              </div>
              <div className="bg-[#3a5a40] p-6 rounded-[2.5rem] text-white flex flex-col shadow-xl">
                <div className="flex justify-between items-center mb-4">
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3b18a]">Total Spent</p>
                     <h3 className="text-4xl font-black">{currency.symbol}{totalSpent}</h3>
                   </div>
                   <div className="p-4 bg-white/10 rounded-2xl"><PieChart size={32} /></div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-[#a3b18a]" style={{ width: `${Math.min(100, (totalSpent/2500)*100)}%` }} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Spent by Category</h4>
                 <div className="grid grid-cols-2 gap-3">
                    {Object.entries(spentByCategory).map(([cat, amount]) => (
                      <div key={cat} className="bg-white p-3 rounded-2xl border border-stone-100 flex items-center gap-3">
                         <div className="w-2 h-8 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat as BudgetCategory] }} />
                         <div>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-tighter leading-none">{cat}</p>
                            <p className="text-sm font-black text-stone-800">{currency.symbol}{amount}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Recent Expenses</h4>
                 <div className="space-y-2">
                    {expenses.map(exp => (
                      <div key={exp.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-stone-50 rounded-xl text-[#3a5a40]"><DollarSign size={18} /></div>
                          <div>
                            <h4 className="text-sm font-bold text-stone-800">{exp.title}</h4>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Paid by {participants.find(p => p.id === exp.paidById)?.name}</p>
                          </div>
                        </div>
                        <span className="font-black text-stone-800">{currency.symbol}{exp.amount}</span>
                      </div>
                    ))}
                 </div>
                 <button 
                   onClick={() => setShowAddExpense(true)}
                   className="w-full py-4 bg-[#3a5a40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                 >
                   + Add New Expense
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      {showAddExpense && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-black text-[#3a5a40] mb-6">New Expense</h3>
             <div className="space-y-4">
                <input 
                  type="text" placeholder="What for? (e.g. Dinner)" 
                  className="w-full bg-stone-50 border-stone-200 border rounded-2xl px-4 py-3 text-sm font-bold"
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                />
                <div className="flex gap-2">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl px-3 py-3 flex items-center text-stone-400 font-bold">{currency.symbol}</div>
                  <input 
                    type="number" placeholder="0.00" 
                    className="flex-1 bg-stone-50 border-stone-200 border rounded-2xl px-4 py-3 text-sm font-bold"
                    onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  />
                </div>
                <select 
                   className="w-full bg-stone-50 border-stone-200 border rounded-2xl px-4 py-3 text-sm font-bold"
                   onChange={(e) => setNewExpense({...newExpense, category: e.target.value as BudgetCategory})}
                >
                  {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowAddExpense(false)} className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                  <button onClick={saveExpense} className="flex-1 py-4 bg-[#3a5a40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Save</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showCalendar && (() => {
        // Calendar helpers
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const today = new Date().toISOString().split('T')[0];

        const toDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        const isInTrip = (dateStr: string) => {
          if (!tripDates.startDate || !tripDates.endDate) return false;
          return dateStr >= tripDates.startDate && dateStr <= tripDates.endDate;
        };

        const getNotesForDate = (dateStr: string) => notes.filter(n => n.scheduledDate === dateStr);

        const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
        const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

        const handleAddPlan = () => {
          if (!selectedDate || !newPlanText.trim()) return;
          addNote('schedule', newPlanText.trim(), '🗓️', undefined, selectedDate);
          setNewPlanText('');
        };

        const selectedDateNotes = selectedDate ? getNotesForDate(selectedDate) : [];
        const selectedDateLabel = selectedDate
          ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : '';

        return (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[92vh] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 bg-white border-b border-stone-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-[#3a5a40] flex items-center gap-2"><Calendar size={24} /> Planner</h2>
                <button onClick={() => { setShowCalendar(false); setSelectedDate(null); }} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
              </div>

              {/* Trip date pickers */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    value={tripDates.startDate || ''}
                    onChange={(e) => setTripDates(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">End Date</label>
                  <input
                    type="date"
                    value={tripDates.endDate || ''}
                    onChange={(e) => setTripDates(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none"
                  />
                </div>
              </div>

              {/* Month navigation */}
              <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-xl transition-colors"><ChevronLeft size={18} className="text-stone-500" /></button>
                <h3 className="text-sm font-black text-stone-700">{monthName}</h3>
                <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-xl transition-colors"><ChevronRight size={18} className="text-stone-500" /></button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-stone-400 uppercase">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = toDateStr(day);
                  const inTrip = isInTrip(dateStr);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const hasNotes = getNotesForDate(dateStr).length > 0;
                  const isStart = dateStr === tripDates.startDate;
                  const isEnd = dateStr === tripDates.endDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                      className={`h-9 rounded-xl text-xs font-bold relative transition-all ${
                        isSelected
                          ? 'bg-[#3a5a40] text-white shadow-lg scale-110'
                          : isStart || isEnd
                          ? 'bg-[#588157] text-white'
                          : inTrip
                          ? 'bg-[#a3b18a]/20 text-[#3a5a40]'
                          : isToday
                          ? 'bg-stone-200 text-stone-700'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {day}
                      {hasNotes && (
                        <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected || isStart || isEnd ? 'bg-white' : 'bg-[#3a5a40]'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected date detail + add plan */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedDate ? (
                <>
                  <h4 className="text-xs font-black text-[#3a5a40] uppercase tracking-widest">{selectedDateLabel}</h4>

                  {/* Add plan form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPlanText}
                      onChange={(e) => setNewPlanText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlan()}
                      placeholder="Add a plan..."
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#a3b18a] outline-none"
                    />
                    <button
                      onClick={handleAddPlan}
                      disabled={!newPlanText.trim()}
                      className="px-4 py-2 bg-[#3a5a40] text-white rounded-xl text-sm font-bold hover:bg-[#588157] transition-colors disabled:opacity-40"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Plans for selected date */}
                  {selectedDateNotes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateNotes.map(n => (
                        <div key={n.id} className="p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{n.emoji}</span>
                            <span className="text-xs font-bold text-stone-700 flex-1">{n.content}</span>
                            <button onClick={() => setNotes(prev => prev.filter(p => p.id !== n.id))} className="text-stone-300 hover:text-red-400 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                          {n.createdBy && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-[#3a5a40] flex items-center justify-center shrink-0">
                                <span className="text-[5px] font-bold text-white">{n.createdBy.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="text-[8px] text-stone-400 font-bold truncate">
                                {n.createdBy.id === user.id ? 'You' : n.createdBy.name} · {timeAgo(n.createdBy.timestamp)}
                                {n.lastEditedBy && ` · edited by ${n.lastEditedBy.id === user.id ? 'You' : n.lastEditedBy.name}`}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">No plans for this day yet. Add one above!</p>
                  )}
                </>
              ) : (
                <>
                  {/* Timeline view showing all planned days */}
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Upcoming Plans</h4>
                  {notes.filter(n => n.scheduledDate).length > 0 ? (
                    <div className="space-y-3">
                      {[...new Set(notes.filter(n => n.scheduledDate).map(n => n.scheduledDate!))].sort().map(date => (
                        <div key={date} className="relative pl-8">
                          <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-[#a3b18a] bg-white z-10" />
                          <div className="absolute left-[7px] top-5 w-0.5 h-full bg-stone-100" />
                          <button onClick={() => setSelectedDate(date)} className="text-left w-full">
                            <h5 className="text-[10px] font-black text-[#3a5a40] uppercase tracking-widest mb-1">
                              {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h5>
                            <div className="space-y-1">
                              {notes.filter(n => n.scheduledDate === date).map(n => (
                                <div key={n.id} className="p-2 bg-white rounded-lg border border-stone-100">
                                  <div className="flex items-center gap-2">
                                    <span>{n.emoji}</span>
                                    <span className="text-[10px] font-bold text-stone-600 truncate">{n.content}</span>
                                  </div>
                                  {n.createdBy && (
                                    <span className="text-[7px] text-stone-400 font-bold ml-5">
                                      {n.createdBy.id === user.id ? 'You' : n.createdBy.name} · {timeAgo(n.createdBy.timestamp)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar size={40} className="mx-auto text-stone-300 mb-3" />
                      <p className="text-sm text-stone-400 font-bold">No plans yet</p>
                      <p className="text-xs text-stone-300 mt-1">Tap a date on the calendar to add plans</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {showWeather && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[70vh] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 bg-white border-b border-stone-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-[#3a5a40] flex items-center gap-2"><CloudSun size={24} /> Forecast</h2>
                  <p className="text-[10px] text-stone-400 font-black uppercase mt-1 tracking-widest">
                    {weatherData ? weatherData.current.location : 'Loading...'}
                  </p>
                </div>
                <button onClick={() => setShowWeather(false)} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {/* Location search bar */}
               <form onSubmit={(e) => { e.preventDefault(); fetchWeather(weatherLocation); }} className="flex gap-2">
                 <input
                   type="text"
                   value={weatherLocation}
                   onChange={(e) => setWeatherLocation(e.target.value)}
                   placeholder="Search city..."
                   className="flex-1 bg-white border border-stone-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#a3b18a] focus:border-[#a3b18a] outline-none"
                 />
                 <button type="submit" disabled={weatherLoading} className="px-4 py-2 bg-[#3a5a40] text-white rounded-2xl text-sm font-bold hover:bg-[#588157] transition-colors disabled:opacity-50">
                   {weatherLoading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                 </button>
               </form>

               {/* Loading state */}
               {weatherLoading && (
                 <div className="bg-[#3a5a40] p-8 rounded-[2.5rem] text-white text-center shadow-xl">
                   <Loader size={48} className="mx-auto my-4 animate-spin text-[#a3b18a]" />
                   <p className="text-sm font-bold">Fetching real-time weather...</p>
                 </div>
               )}

               {/* Error state */}
               {weatherError && !weatherLoading && (
                 <div className="bg-red-50 border border-red-200 p-6 rounded-[2.5rem] text-center">
                   <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
                   <p className="text-sm font-bold text-red-700">{weatherError}</p>
                   <button onClick={() => fetchWeather(weatherLocation)} className="mt-3 text-xs text-red-500 hover:underline font-bold">Try Again</button>
                 </div>
               )}

               {/* Current weather */}
               {weatherData && !weatherLoading && (
                 <>
                   <div className="bg-[#3a5a40] p-8 rounded-[2.5rem] text-white text-center shadow-xl relative overflow-hidden">
                     <p className="text-xs font-bold uppercase tracking-widest opacity-60">Currently</p>
                     <div className="mx-auto my-4 text-yellow-400">
                       {getWeatherIcon(weatherData.current.condition, 64)}
                     </div>
                     <h3 className="text-5xl font-black">{weatherData.current.temp_c}°C</h3>
                     <p className="text-sm font-bold mt-2">{weatherData.current.conditionText}</p>
                     <p className="text-xs opacity-60 mt-1">Feels like {weatherData.current.feelslike_c}°C · Humidity {weatherData.current.humidity}% · Wind {weatherData.current.wind_kph} km/h</p>
                   </div>

                   {/* Suggestion */}
                   {weatherData.suggestion && (
                     <div className="bg-[#e9edc9] p-4 rounded-3xl border border-[#ccd5ae] flex items-start gap-3">
                       <div className="p-2 bg-white rounded-xl text-[#3a5a40]"><Info size={20} /></div>
                       <div>
                         <h5 className="text-[10px] font-black uppercase text-[#3a5a40]">Activity Tip</h5>
                         <p className="text-[10px] font-bold text-stone-700 leading-tight">{weatherData.suggestion}</p>
                       </div>
                     </div>
                   )}

                   {/* Forecast days */}
                   <div className="grid grid-cols-2 gap-4">
                     {weatherData.forecast.slice(1).map((day: any, idx: number) => (
                       <div key={idx} className="bg-white p-4 rounded-3xl border border-stone-100 text-center flex flex-col items-center">
                         <p className="text-[9px] font-black text-stone-400 uppercase mb-2">{day.dayName}</p>
                         <div className="text-[#a3b18a]">{getWeatherIcon(day.condition)}</div>
                         <p className="text-xl font-black text-stone-800 mt-2">{day.temp_c}°</p>
                         <p className="text-[9px] text-stone-400 font-bold">{day.conditionText}</p>
                         {day.chance_of_rain > 30 && (
                           <p className="text-[8px] text-blue-500 font-bold mt-1">💧 {day.chance_of_rain}% rain</p>
                         )}
                       </div>
                     ))}
                   </div>

                   {/* Weather alerts */}
                   {weatherData.alerts && weatherData.alerts.length > 0 && weatherData.alerts.map((alert: any, idx: number) => (
                     <div key={idx} className="bg-[#fefae0] p-4 rounded-3xl border border-[#faedcd] flex items-start gap-3">
                       <div className="p-2 bg-white rounded-xl text-yellow-600"><AlertTriangle size={20} /></div>
                       <div>
                         <h5 className="text-[10px] font-black uppercase text-yellow-800">{alert.event || 'Weather Alert'}</h5>
                         <p className="text-[10px] font-bold text-stone-700 leading-tight">{alert.headline || alert.description}</p>
                       </div>
                     </div>
                   ))}
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {showSusCal && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[92vh] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col border-t border-stone-200 animate-slide-up">
            <div className="p-6 bg-white border-b border-stone-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#3a5a40] flex items-center gap-2"><Leaf size={28} className="text-[#a3b18a]" /> Eco-Tracker</h2>
                <button onClick={() => setShowSusCal(false)} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Trip config inputs */}
              <div className="bg-white p-4 rounded-3xl border border-stone-100 space-y-3">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Trip Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 uppercase">Transport</label>
                    <select value={ecoConfig.transport_mode} onChange={(e) => setEcoConfig(p => ({...p, transport_mode: e.target.value}))} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none">
                      <option value="car">Car</option>
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 uppercase">Distance (km)</label>
                    <input type="number" value={ecoConfig.distance} onChange={(e) => setEcoConfig(p => ({...p, distance: Number(e.target.value)}))} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 uppercase">Accommodation</label>
                    <select value={ecoConfig.accommodation_type} onChange={(e) => setEcoConfig(p => ({...p, accommodation_type: e.target.value}))} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none">
                      <option value="hotel">Hotel</option>
                      <option value="hostel">Hostel</option>
                      <option value="vacation_rental">Vacation Rental</option>
                      <option value="camping">Camping</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-stone-500 uppercase">Food Preference</label>
                    <select value={ecoConfig.food_types[0]} onChange={(e) => setEcoConfig(p => ({...p, food_types: [e.target.value]}))} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#a3b18a] outline-none">
                      <option value="vegan">Vegan</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="average_meal">Average</option>
                      <option value="meat_heavy">Meat Heavy</option>
                    </select>
                  </div>
                </div>
                <button onClick={fetchEcoData} disabled={ecoLoading} className="w-full bg-[#3a5a40] text-white font-bold py-2 rounded-xl text-xs hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {ecoLoading ? <><Loader size={14} className="animate-spin" /> Calculating...</> : <><Zap size={14} /> Calculate Emissions</>}
                </button>
              </div>

              {/* Loading state */}
              {ecoLoading && !ecoData && (
                <div className="bg-[#3a5a40] p-8 rounded-[2.5rem] text-white text-center shadow-xl">
                  <Loader size={48} className="mx-auto my-4 animate-spin text-[#a3b18a]" />
                  <p className="text-sm font-bold">Calculating carbon footprint...</p>
                </div>
              )}

              {/* Error state */}
              {ecoError && !ecoLoading && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-[2.5rem] text-center">
                  <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-bold text-red-700">{ecoError}</p>
                  <button onClick={fetchEcoData} className="mt-3 text-xs text-red-500 hover:underline font-bold">Try Again</button>
                </div>
              )}

              {/* Real emissions data */}
              {ecoData && !ecoLoading && (
                <>
                  {/* Eco Score Card */}
                  <div className="bg-[#3a5a40] p-6 rounded-[2.5rem] text-white shadow-xl space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#a3b18a]">Total Carbon Footprint</p>
                      <h3 className="text-5xl font-black mt-1">
                        {ecoData.total_emissions.toFixed(1)}<span className="text-xl"> kg</span>
                      </h3>
                      <p className="text-[10px] text-white/60 mt-1">CO₂ equivalent</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Per Day</p>
                          <p className="text-sm font-black">{ecoData.emissions_per_day.toFixed(1)} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown size={16} className={ecoData.comparison_to_average <= 0 ? 'text-green-400' : 'text-red-400'} />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">vs Average</p>
                          <p className="text-sm font-black">{ecoData.comparison_to_average > 0 ? '+' : ''}{ecoData.comparison_to_average.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eco Score (derived from comparison) */}
                  {(() => {
                    const score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, ecoData.comparison_to_average))));
                    return (
                      <div className="bg-white p-4 rounded-3xl border border-stone-100 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Eco Impact Score</p>
                        <h3 className={`text-4xl font-black mt-1 ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {score}<span className="text-lg text-stone-400">/100</span>
                        </h3>
                        <p className="text-[10px] text-stone-500 mt-1">
                          {score >= 70 ? 'Great! Your trip is eco-friendly' : score >= 40 ? 'Average impact — room for improvement' : 'High impact — consider greener options'}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Recommendations */}
                  {ecoData.recommendations && ecoData.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Recommendations</h4>
                      {ecoData.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="bg-[#e9edc9] p-3 rounded-2xl border border-[#ccd5ae] flex items-start gap-3">
                          <div className="p-1.5 bg-white rounded-lg text-[#3a5a40] shrink-0"><Leaf size={14} /></div>
                          <p className="text-[10px] font-bold text-stone-700 leading-tight">{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2"><Award size={14} /> Eco Badges</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      <div className={`flex flex-col items-center gap-1 shrink-0 ${ecoData.total_emissions < 50 ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-16 h-16 ${ecoData.total_emissions < 50 ? 'bg-[#a3b18a]' : 'bg-stone-300'} rounded-full flex items-center justify-center text-white shadow-lg`}><Leaf /></div>
                        <span className="text-[9px] font-bold">Low Carbon</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 shrink-0 ${ecoConfig.transport_mode === 'train' || ecoConfig.transport_mode === 'bus' ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-16 h-16 ${ecoConfig.transport_mode === 'train' || ecoConfig.transport_mode === 'bus' ? 'bg-[#d4a373]' : 'bg-stone-300'} rounded-full flex items-center justify-center text-white shadow-lg`}><Globe /></div>
                        <span className="text-[9px] font-bold">Green Travel</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 shrink-0 ${ecoConfig.food_types[0] === 'vegan' || ecoConfig.food_types[0] === 'vegetarian' ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-16 h-16 ${ecoConfig.food_types[0] === 'vegan' || ecoConfig.food_types[0] === 'vegetarian' ? 'bg-green-500' : 'bg-stone-300'} rounded-full flex items-center justify-center text-white shadow-lg`}><Store /></div>
                        <span className="text-[9px] font-bold">Plant Power</span>
                      </div>
                      <div className={`flex flex-col items-center gap-1 shrink-0 ${ecoConfig.accommodation_type === 'camping' ? '' : 'opacity-40 grayscale'}`}>
                        <div className={`w-16 h-16 ${ecoConfig.accommodation_type === 'camping' ? 'bg-blue-500' : 'bg-stone-300'} rounded-full flex items-center justify-center text-white shadow-lg`}><Droplets /></div>
                        <span className="text-[9px] font-bold">Nature Stay</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trips & Saved Panel */}
      {showTripsPanel && (() => {
        const CATEGORIES: { value: TripCategory | 'all'; label: string; icon: React.ReactNode; emoji: string }[] = [
          { value: 'all', label: 'All', icon: <FolderOpen size={14} />, emoji: '📋' },
          { value: 'hiking', label: 'Hiking', icon: <Mountain size={14} />, emoji: '🥾' },
          { value: 'business', label: 'Business', icon: <Briefcase size={14} />, emoji: '💼' },
          { value: 'family', label: 'Family', icon: <Home size={14} />, emoji: '👨‍👩‍👧‍👦' },
          { value: 'camping', label: 'Camping', icon: <Tent size={14} />, emoji: '⛺' },
          { value: 'exploring', label: 'Exploring', icon: <Compass size={14} />, emoji: '🧭' },
          { value: 'beach', label: 'Beach', icon: <Sun size={14} />, emoji: '🏖️' },
          { value: 'road_trip', label: 'Road Trip', icon: <MapPin size={14} />, emoji: '🚗' },
          { value: 'cultural', label: 'Cultural', icon: <Globe size={14} />, emoji: '🏛️' },
          { value: 'other', label: 'Other', icon: <Tag size={14} />, emoji: '🏷️' },
        ];

        const filteredTrips = myTrips.filter(t => {
          if (tripsStatusFilter !== 'all' && t.status !== tripsStatusFilter) return false;
          if (tripsFilter !== 'all' && t.category !== tripsFilter) return false;
          return true;
        });

        const filteredSaved = tripsFilter === 'all'
          ? savedTrips
          : savedTrips.filter(t => t.category === tripsFilter);

        const statusColors: Record<string, string> = {
          draft: 'bg-stone-100 text-stone-500',
          planning: 'bg-amber-100 text-amber-700',
          planned: 'bg-emerald-100 text-emerald-700',
          booked: 'bg-blue-100 text-blue-700',
          in_progress: 'bg-green-100 text-green-700',
          completed: 'bg-stone-100 text-stone-600',
          cancelled: 'bg-red-100 text-red-600',
        };

        return (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f7f3ee] w-full max-w-md h-[92vh] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            {/* Header */}
            <div className="p-6 bg-white border-b border-stone-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-[#3a5a40] flex items-center gap-2">
                  <Sparkles size={24} className="text-pink-500" /> My Trips
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowCreateTripModal(true)} className="p-2 bg-[#3a5a40] text-white rounded-full" title="New Trip"><Plus size={16} /></button>
                  <button onClick={() => setShowTripsPanel(false)} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTripsTab('planned')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tripsTab === 'planned' ? 'bg-[#3a5a40] text-white shadow-lg' : 'bg-stone-100 text-stone-500'}`}
                >
                  My Trips ({myTrips.length})
                </button>
                <button
                  onClick={() => setTripsTab('saved')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tripsTab === 'saved' ? 'bg-pink-500 text-white shadow-lg' : 'bg-stone-100 text-stone-500'}`}
                >
                  <Bookmark size={12} className="inline mr-1" />Saved ({savedTrips.length})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
                {([
                  { value: 'all', label: 'All' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'planned', label: 'Planned' },
                  { value: 'booked', label: 'Booked' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ] as { value: Trip['status'] | 'all'; label: string }[]).map(s => (
                  <button
                    key={s.value}
                    onClick={() => setTripsStatusFilter(s.value)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shrink-0 ${
                      tripsStatusFilter === s.value
                        ? `${statusColors[s.value] || 'bg-[#3a5a40] text-white'} shadow-md ring-1 ring-current/20`
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {s.label}{s.value !== 'all' ? ` (${myTrips.filter(t => t.status === s.value).length})` : ''}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setTripsFilter(cat.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all shrink-0 ${
                      tripsFilter === cat.value
                        ? 'bg-[#3a5a40] text-white shadow-md'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    <span className="text-xs">{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {tripsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader size={32} className="animate-spin text-[#a3b18a] mb-3" />
                  <p className="text-xs font-bold text-stone-400">Loading trips...</p>
                </div>
              ) : tripsTab === 'planned' ? (
                /* Planned Trips */
                filteredTrips.length > 0 ? (
                  filteredTrips.map(trip => (
                    <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow">
                      {trip.coverImage && (
                        <div className="h-28 overflow-hidden">
                          <img src={trip.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-stone-800 truncate">{trip.name}</h4>
                            {trip.destination && (
                              <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1 mt-0.5"><MapPin size={10} />{trip.destination}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {trip.status && (
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[trip.status] || 'bg-stone-100 text-stone-500'}`}>
                                {trip.status.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {trip.description && (
                          <p className="text-[10px] text-stone-500 mb-2 line-clamp-2">{trip.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {trip.dates?.startDate && (
                              <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                                <Calendar size={10} />
                                {formatDate(trip.dates.startDate)}{trip.dates.endDate ? ` - ${formatDate(trip.dates.endDate)}` : ''}
                              </span>
                            )}
                            {trip.collaborators.length > 0 && (
                              <span className="text-[9px] font-bold text-stone-400 flex items-center gap-1">
                                <Users size={10} /> {trip.collaborators.length + 1}
                              </span>
                            )}
                          </div>

                          {/* Category Badge / Picker */}
                          {editingTripCategory === trip.id ? (
                            <div className="flex gap-1 flex-wrap justify-end max-w-[180px]">
                              {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                                <button
                                  key={cat.value}
                                  onClick={() => updateTripCategory(trip.id, cat.value as TripCategory)}
                                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-[#a3b18a]/20 rounded-md transition-colors"
                                  title={cat.label}
                                >
                                  {cat.emoji}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTripCategory(trip.id)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                trip.category
                                  ? 'bg-[#a3b18a]/20 text-[#3a5a40]'
                                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              {trip.category
                                ? `${CATEGORIES.find(c => c.value === trip.category)?.emoji || ''} ${CATEGORIES.find(c => c.value === trip.category)?.label || trip.category}`
                                : '+ Category'}
                            </button>
                          )}
                        </div>
                        {/* Trip actions */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-stone-50">
                          <button
                            onClick={() => handleSwitchTrip(trip.id)}
                            className="flex-1 text-[10px] font-black py-1.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors uppercase tracking-wide"
                          >
                            Open
                          </button>
                          {(trip.status === 'draft' || trip.status === 'planning') && (
                            <button
                              onClick={() => handleFinalizeTrip(trip.id)}
                              className="flex-1 text-[10px] font-black py-1.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors uppercase tracking-wide"
                            >
                              Mark Planned
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <FolderOpen size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm text-stone-400 font-bold">
                      {tripsStatusFilter !== 'all'
                        ? `No ${tripsStatusFilter.replace('_', ' ')} trips`
                        : tripsFilter !== 'all'
                          ? `No ${CATEGORIES.find(c => c.value === tripsFilter)?.label} trips`
                          : 'No trips yet'}
                    </p>
                    <p className="text-xs text-stone-300 mt-1">Start planning on the canvas to see your trips here</p>
                  </div>
                )
              ) : (
                /* Saved Community Trips */
                filteredSaved.length > 0 ? (
                  filteredSaved.map(trip => (
                    <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow">
                      {trip.image && (
                        <div className="h-28 overflow-hidden relative">
                          <img src={trip.image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full">
                            <Heart size={12} fill="white" />
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-black text-stone-800 flex-1 truncate">{trip.title || trip.content.slice(0, 40)}</h4>
                        </div>
                        {trip.location && (
                          <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1 mb-1"><MapPin size={10} />{trip.location}</p>
                        )}
                        <p className="text-[10px] text-stone-500 mb-2 line-clamp-2">{trip.content}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Author */}
                            <div className="flex items-center gap-1">
                              {trip.author.avatar ? (
                                <img src={trip.author.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-[#3a5a40] flex items-center justify-center">
                                  <span className="text-[6px] font-bold text-white">{trip.author.name.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                              <span className="text-[9px] font-bold text-stone-400">{trip.author.name}</span>
                            </div>
                            <span className="text-[9px] text-stone-300 flex items-center gap-1"><Heart size={10} /> {trip.likes}</span>
                          </div>

                          {/* Category selector for saved trips */}
                          {editingTripCategory === trip.id ? (
                            <div className="flex gap-1 flex-wrap justify-end max-w-[180px]">
                              {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                                <button
                                  key={cat.value}
                                  onClick={() => {
                                    setSavedTrips(prev => prev.map(t => t.id === trip.id ? { ...t, category: cat.value as TripCategory } : t));
                                    setEditingTripCategory(null);
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 bg-stone-100 hover:bg-pink-100 rounded-md transition-colors"
                                  title={cat.label}
                                >
                                  {cat.emoji}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTripCategory(trip.id)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                                trip.category
                                  ? 'bg-pink-100 text-pink-600'
                                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                              }`}
                            >
                              {trip.category
                                ? `${CATEGORIES.find(c => c.value === trip.category)?.emoji || ''} ${CATEGORIES.find(c => c.value === trip.category)?.label || trip.category}`
                                : '+ Category'}
                            </button>
                          )}
                        </div>

                        {/* Tags */}
                        {trip.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {trip.tags.slice(0, 4).map((tag, i) => (
                              <span key={i} className="text-[8px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Bookmark size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm text-stone-400 font-bold">
                      {tripsFilter !== 'all' ? `No saved ${CATEGORIES.find(c => c.value === tripsFilter)?.label} trips` : 'No saved trips yet'}
                    </p>
                    <p className="text-xs text-stone-300 mt-1">Save trips from the community to see them here</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        );
      })()}


      {/* Create Trip Modal */}
      {showCreateTripModal && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-[#3a5a40] mb-1 flex items-center gap-2">
              <Plus size={22} /> New Trip
            </h3>
            <p className="text-xs text-stone-400 mb-5">Give your trip a name to get started.</p>
            <input
              type="text"
              value={newTripName}
              onChange={e => { setNewTripName(e.target.value); if (createTripError) setCreateTripError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCreateTrip()}
              placeholder="e.g. Bali Summer 2026"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] mb-3"
              autoFocus
            />
            {createTripError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {createTripError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowCreateTripModal(false); setNewTripName(''); setCreateTripError(''); }}
                disabled={creatingTrip}
                className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTrip}
                disabled={!newTripName.trim() || creatingTrip}
                className="flex-1 py-4 bg-[#3a5a40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creatingTrip && <Loader size={14} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Packing Modal */}
      {showSmartPacking && (
        <SmartPacking
          user={user}
          tripId={tripId}
          dashboardId={dashboardId}
          onClose={() => setShowSmartPacking(false)}
        />
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;
