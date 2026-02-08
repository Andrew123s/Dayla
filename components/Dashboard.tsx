
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  StickyNote, NoteAuthor, User, WeatherDay, WeatherSuggestion, TripDates,
  Expense, Participant, BudgetCategory, SustainabilityImpact, OffsetProject, EcoChallenge,
  Trip, SavedCommunityTrip, TripCategory
} from '../types';
import {
  Plus, Image as ImageIcon, Mic, Type, Share2, Calendar, Link2, Layout,
  CloudSun, X, MapPin, Wind, Thermometer, CloudRain, Sun, AlertTriangle,
  CheckCircle2, Info, Search, Clock, ChevronLeft, ChevronRight, Wallet,
  CreditCard, PieChart, Users, DollarSign, Filter, Trash2, Leaf, Droplets,
  Trees, Zap, Award, BookOpen, Globe, TrendingDown, Store, Star, Play, Pause, Move, Maximize2, Crop as CropIcon,
  UserPlus, Bell, PenTool, Loader, Cloud, CloudLightning,
  Sparkles, Mountain, Briefcase, Home, Tent, Compass, Heart, Bookmark, Tag, FolderOpen
} from 'lucide-react';

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
const InviteForm: React.FC<{ onInvite: (email: string) => void; onClose: () => void }> = ({ onInvite, onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim());
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
          className="w-full bg-stone-50 border-stone-200 border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40]"
          required
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-4 bg-[#3a5a40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#588157] transition-colors"
        >
          Send Invite
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
  // Dashboard ID - In a real app, this would come from route params or be fetched
  const [dashboardId, setDashboardId] = useState<string>('');
  
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Feature Toggles
  const [showWeather, setShowWeather] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showSusCal, setShowSusCal] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTripsPanel, setShowTripsPanel] = useState(false);

  // Trips & Saved Data
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedCommunityTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsTab, setTripsTab] = useState<'planned' | 'saved'>('planned');
  const [tripsFilter, setTripsFilter] = useState<TripCategory | 'all'>('all');
  const [editingTripCategory, setEditingTripCategory] = useState<string | null>(null);

  // Collaboration Features
  const [activeUsers, setActiveUsers] = useState<User[]>([user]); // Start with current user
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitations, setInvitations] = useState<Array<{id: string, email: string, invitedBy: string, timestamp: Date}>>([]);
  const [showAlerts, setShowAlerts] = useState<Array<{id: string, message: string, type: 'info' | 'success' | 'warning', timestamp: Date}>>([]);

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
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}&days=5`, {
        credentials: 'include',
      });
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

      const response = await fetch('/api/climatiq/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...ecoConfig,
          duration,
        }),
      });
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

  // Initialize or fetch dashboard on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Try to get existing dashboard from localStorage
        const storedDashboardId = localStorage.getItem('currentDashboardId');
        
        if (storedDashboardId) {
          setDashboardId(storedDashboardId);
          return;
        }

        // Create a new trip (which automatically creates a dashboard)
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: 'My Adventure',
            description: 'Planning our next adventure',
            dates: {
              startDate: tripDates.startDate,
              endDate: tripDates.endDate
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const newDashboardId = data.data.dashboard._id;
          setDashboardId(newDashboardId);
          localStorage.setItem('currentDashboardId', newDashboardId);
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error('Failed to create trip/dashboard:', errData);
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
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
        const response = await fetch(`/api/boards/${dashboardId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
        }
      } catch (err) {
        console.error('Failed to join dashboard:', err);
      }
    };

    // Fetch current active users
    const fetchActiveUsers = async () => {
      try {
        const response = await fetch(`/api/boards/${dashboardId}/active-users`, {
          credentials: 'include',
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
            setActiveUsers(users.length > 0 ? users : [user]);
            // Update participants from collaborator info
            const parts: Participant[] = users.map(u => ({
              id: u.id,
              name: u.id === user.id ? 'You' : u.name,
              avatar: u.avatar || '',
            }));
            if (parts.length > 0) setParticipants(parts);
          }
        }
      } catch (err) {
        console.error('Failed to fetch active users:', err);
      }
    };

    joinDashboard();
    fetchActiveUsers();

    // Connect to socket for real-time updates
    const socket = io(window.location.origin, {
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

    socket.on('connect_error', (err: Error) => {
      console.warn('Socket connection error (active users will use REST fallback):', err.message);
    });

    // Cleanup: leave dashboard and disconnect socket
    return () => {
      if (dashboardId) {
        fetch(`/api/boards/${dashboardId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
        fetch('/api/trips', { credentials: 'include' }),
        fetch('/api/community/saved', { credentials: 'include' }),
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
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  const makeAuthor = (): NoteAuthor => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    timestamp: new Date().toISOString(),
  });

  const addNote = (type: StickyNote['type'], content?: string, emoji?: string, color?: string, date?: string, audioUrl?: string) => {
    const isAsset = type === 'image' || type === 'voice';
    const author = makeAuthor();
    const newNote: StickyNote = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100 + (notes.length * 20),
      y: 150 + (notes.length * 20),
      width: isAsset ? (type === 'image' ? 240 : 220) : 180,
      height: isAsset ? (type === 'image' ? 180 : 80) : 180,
      content: content || (type === 'text' ? 'New plan item...' : type === 'schedule' ? 'Activity detail...' : ''),
      color: color || (isAsset ? 'transparent' : COLORS[Math.floor(Math.random() * COLORS.length)]),
      emoji: emoji || (type === 'schedule' ? '⏰' : type === 'image' ? '🖼️' : type === 'voice' ? '🎙️' : '🌲'),
      scheduledDate: date,
      audioUrl: audioUrl,
      crop: type === 'image' ? { x: 0, y: 0, zoom: 1 } : undefined,
      createdBy: author,
    };
    setNotes([...notes, newNote]);
  };

  const stampEdit = (noteId: string) => {
    const author = makeAuthor();
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, lastEditedBy: author } : n));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
          if (audioBlob.size > 1000) {
            addNote('voice', 'Voice Message', '🎙️', undefined, undefined, URL.createObjectURL(audioBlob));
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
      // Use inline alert instead of blocking alert() dialog
      const errName = err?.name || '';
      let message = 'Microphone access is required to record voice notes. Please allow it in your browser settings.';
      if (errName === 'NotAllowedError') {
        message = 'Microphone access was denied. Please enable it in your browser settings and try again.';
      } else if (errName === 'NotFoundError') {
        message = 'No microphone found. Please connect a microphone and try again.';
      }
      setShowAlerts(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type: 'warning',
        timestamp: new Date()
      }]);
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

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setDraggedId(id);
    setDragOffset({ x: e.clientX - note.x, y: e.clientY - note.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedId) {
      setNotes(prev => prev.map(note => note.id === draggedId ? { ...note, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } : note));
    } else if (resizingId) {
      setNotes(prev => prev.map(note => {
        if (note.id === resizingId) {
          return { ...note, width: Math.max(120, e.clientX - note.x), height: Math.max(60, e.clientY - note.y) };
        }
        return note;
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggedId) stampEdit(draggedId);
    if (resizingId) stampEdit(resizingId);
    setDraggedId(null);
    setResizingId(null);
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
    // Always close the modal immediately so it doesn't get stuck
    setShowInviteModal(false);

    try {
      if (!dashboardId) {
        throw new Error('Dashboard is still loading. Please try again in a moment.');
      }

      // Make API call to send invitation email
      const response = await fetch(`/api/boards/${dashboardId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

      // Add success alert notification
      const successAlert = {
        id: Math.random().toString(36).substr(2, 9),
        message: `Invitation sent to ${email}! They will receive an email shortly.`,
        type: 'success' as const,
        timestamp: new Date()
      };
      setShowAlerts(prev => [...prev, successAlert]);

      // Auto-remove alert after 5 seconds
      setTimeout(() => {
        setShowAlerts(prev => prev.filter(a => a.id !== successAlert.id));
      }, 5000);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      
      // Show error alert
      const errorAlert = {
        id: Math.random().toString(36).substr(2, 9),
        message: error instanceof Error ? error.message : 'Failed to send invitation',
        type: 'warning' as const,
        timestamp: new Date()
      };
      setShowAlerts(prev => [...prev, errorAlert]);

      // Auto-remove alert after 5 seconds
      setTimeout(() => {
        setShowAlerts(prev => prev.filter(a => a.id !== errorAlert.id));
      }, 5000);
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

  return (
    <div className="w-full h-full relative canvas-bg bg-[#f7f3ee] overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <input type="file" ref={imageInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

      {/* Header */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-white/60 backdrop-blur-md z-40 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3a5a40]/10 rounded-2xl"><Trees className="text-[#3a5a40]" size={24} /></div>
          <div>
            <h1 className="text-lg font-bold text-[#3a5a40] leading-none">Dayla</h1>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tight mt-1">{formatDate(tripDates.startDate)} - {formatDate(tripDates.endDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Active Users Counter */}
          <div className="flex items-center gap-1 px-3 py-1 bg-[#3a5a40]/10 rounded-full">
            <Users size={14} className="text-[#3a5a40]" />
            <span className="text-xs font-bold text-[#3a5a40]">{activeUsers.length}</span>
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

      {/* Links SVG */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        {notes.map(note => {
          if (!note.linkTo) return null;
          const target = notes.find(n => n.id === note.linkTo);
          if (!target) return null;
          return <line key={`link-${note.id}`} x1={note.x + note.width/2} y1={note.y + note.height/2} x2={target.x + target.width/2} y2={target.y + target.height/2} stroke="#588157" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />;
        })}
      </svg>

      {/* Canvas Elements */}
      {notes.map((note) => (
        <div key={note.id} onMouseDown={(e) => handleMouseDown(e, note.id)} style={{ left: note.x, top: note.y, width: note.width, height: note.height, backgroundColor: (note.type === 'image' || note.type === 'voice') ? 'transparent' : note.color }} className={`absolute rounded-2xl shadow-xl cursor-move transition-all duration-100 flex flex-col z-20 group ${draggedId === note.id ? 'scale-105 rotate-1 z-30 ring-2 ring-[#3a5a40]/30' : ''} ${note.type !== 'image' && note.type !== 'voice' ? 'p-4' : ''}`}>
          {/* Editing Indicator */}
          {editingNoteId === note.id && editingUser && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#3a5a40] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-30 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
              <PenTool size={12} />
              {editingUser.name} is editing
            </div>
          )}

          <div className="absolute -top-10 left-0 right-0 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-xl py-1 border border-stone-100 shadow-sm pointer-events-auto">
             <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleLink(note.id); }} className="p-1 hover:bg-[#3a5a40]/10 rounded transition-colors"><Link2 size={16} className="text-[#3a5a40]" /></button>
                {note.type === 'image' && <button onClick={(e) => { e.stopPropagation(); setCroppingId(croppingId === note.id ? null : note.id); }} className={`p-1 hover:bg-[#3a5a40]/10 rounded transition-colors ${croppingId === note.id ? 'bg-[#3a5a40] text-white' : 'text-[#3a5a40]'}`}><CropIcon size={16} /></button>}
             </div>
             <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(n => n.id !== note.id)); }} className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"><Trash2 size={16} /></button>
          </div>

          {note.type === 'image' ? (
            <div className="w-full h-full relative overflow-hidden rounded-2xl bg-stone-200 border-4 border-white shadow-sm">
              <img src={note.content} className="w-full h-full object-cover transition-transform" style={{ transform: `scale(${note.crop?.zoom || 1})`, transformOrigin: 'center' }} alt="Board Asset" />
              {croppingId === note.id && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-2">
                  <div className="flex gap-2">
                     <button onMouseDown={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, crop: { ...n.crop!, zoom: Math.max(1, n.crop!.zoom - 0.1) } } : n)); stampEdit(note.id); }} className="p-2 bg-white rounded-lg text-[#3a5a40] shadow-md">-</button>
                     <button onMouseDown={(e) => { e.stopPropagation(); setNotes(prev => prev.map(n => n.id === note.id ? { ...n, crop: { ...n.crop!, zoom: n.crop!.zoom + 0.1 } } : n)); stampEdit(note.id); }} className="p-2 bg-white rounded-lg text-[#3a5a40] shadow-md">+</button>
                  </div>
                  <button onClick={() => setCroppingId(null)} className="text-[10px] text-white font-bold uppercase mt-2 underline">Done</button>
                </div>
              )}
            </div>
          ) : note.type === 'voice' ? (
            <VoiceNote note={note} />
          ) : (
            <>
              <div className="flex justify-between items-start mb-1">
                <span className="text-lg">{note.emoji}</span>
                {note.scheduledDate && <div className="flex items-center gap-1 text-[9px] font-bold text-stone-600 uppercase tracking-wide"><Clock size={10} /> {formatDate(note.scheduledDate)}</div>}
              </div>
              <textarea
                className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-sm font-medium text-stone-800 p-0 leading-tight"
                defaultValue={note.content}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => handleNoteEdit(note.id)}
                onBlur={(e) => {
                  const newContent = e.target.value;
                  if (newContent !== note.content) {
                    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: newContent } : n));
                    stampEdit(note.id);
                  }
                  setTimeout(() => {
                    setEditingNoteId(null);
                    setEditingUser(null);
                  }, 100);
                }}
              />
              {/* Author / Last Edited Info */}
              {(note.createdBy || note.lastEditedBy) && (
                <div className="mt-auto pt-1 border-t border-stone-200/50 flex flex-col gap-0.5">
                  {note.createdBy && (
                    <div className="flex items-center gap-1.5">
                      {note.createdBy.avatar ? (
                        <img src={note.createdBy.avatar} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#3a5a40] flex items-center justify-center">
                          <span className="text-[6px] font-bold text-white">{note.createdBy.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-[8px] font-bold text-stone-400 truncate">
                        Added by {note.createdBy.id === user.id ? 'You' : note.createdBy.name} · {timeAgo(note.createdBy.timestamp)}
                      </span>
                    </div>
                  )}
                  {note.lastEditedBy && (
                    <div className="flex items-center gap-1.5">
                      {note.lastEditedBy.avatar ? (
                        <img src={note.lastEditedBy.avatar} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#588157] flex items-center justify-center">
                          <span className="text-[6px] font-bold text-white">{note.lastEditedBy.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="text-[8px] font-bold text-stone-400 truncate">
                        Edited by {note.lastEditedBy.id === user.id ? 'You' : note.lastEditedBy.name} · {timeAgo(note.lastEditedBy.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Author badge for image/voice notes */}
          {(note.type === 'image' || note.type === 'voice') && note.createdBy && (
            <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 z-10">
              {note.createdBy.avatar ? (
                <img src={note.createdBy.avatar} className="w-3 h-3 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="text-[5px] font-bold text-white">{note.createdBy.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className="text-[7px] font-bold text-white/80 truncate max-w-[80px]">
                {note.createdBy.id === user.id ? 'You' : note.createdBy.name}
                {note.lastEditedBy && note.lastEditedBy.id !== note.createdBy.id ? ` · edited by ${note.lastEditedBy.id === user.id ? 'You' : note.lastEditedBy.name}` : ''}
              </span>
            </div>
          )}

          <div onMouseDown={(e) => { e.stopPropagation(); setResizingId(note.id); }} className="resize-handle absolute -bottom-1 -right-1 w-6 h-6 bg-[#3a5a40] rounded-full flex items-center justify-center text-white shadow-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-40 border-2 border-white"><Maximize2 size={12} /></div>
        </div>
      ))}

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

      {/* Trips Glowing Button */}
      <button
        onClick={() => { setShowTripsPanel(true); fetchTripsData(); }}
        className="trips-btn absolute bottom-5 right-4 w-14 h-14 rounded-full flex items-center justify-center z-50 border-2 border-pink-300/50"
      >
        <Sparkles size={22} className="text-white drop-shadow-lg" />
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
            <InviteForm onInvite={handleInviteUser} onClose={() => setShowInviteModal(false)} />
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

        const filteredTrips = tripsFilter === 'all'
          ? myTrips
          : myTrips.filter(t => t.category === tripsFilter);

        const filteredSaved = tripsFilter === 'all'
          ? savedTrips
          : savedTrips.filter(t => t.category === tripsFilter);

        const statusColors: Record<string, string> = {
          planning: 'bg-amber-100 text-amber-700',
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
                <button onClick={() => setShowTripsPanel(false)} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTripsTab('planned')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tripsTab === 'planned' ? 'bg-[#3a5a40] text-white shadow-lg' : 'bg-stone-100 text-stone-500'}`}
                >
                  Planned ({myTrips.length})
                </button>
                <button
                  onClick={() => setTripsTab('saved')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tripsTab === 'saved' ? 'bg-pink-500 text-white shadow-lg' : 'bg-stone-100 text-stone-500'}`}
                >
                  <Bookmark size={12} className="inline mr-1" />Saved ({savedTrips.length})
                </button>
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
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <FolderOpen size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-sm text-stone-400 font-bold">
                      {tripsFilter !== 'all' ? `No ${CATEGORIES.find(c => c.value === tripsFilter)?.label} trips` : 'No planned trips yet'}
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

      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-stone-400 opacity-60">
            <div className="p-8 bg-white/20 rounded-[3rem] backdrop-blur-sm border border-white/30 flex flex-col items-center">
              <Trees size={64} className="mb-4 text-[#3a5a40]/30" />
              <p className="text-sm font-bold tracking-widest uppercase">Canvas Empty</p>
              <p className="text-[10px] mt-2 text-center max-w-[200px] font-bold">Record voices, upload photos, or add sticky notes to build your roadmap.</p>
            </div>
        </div>
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
