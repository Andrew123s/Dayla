
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  Settings, LogOut, Edit3, Camera, Map, Award, Users, X, Save, 
  Bell, Shield, Moon, Globe, ChevronRight, Loader, Check, AlertCircle,
  MapPin, Calendar, Heart, Image as ImageIcon
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

interface UserStats {
  trips: number;
  posts: number;
  friends: number;
}

interface VisitedPlace {
  id: string;
  name: string;
  date: string;
  image?: string;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState<UserStats>({ trips: 0, posts: 0, friends: 0 });
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    interests: user.interests?.join(', ') || '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    privateProfile: false,
    language: 'English',
  });

  // Fetch user stats on mount
  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          // Use real data if available, otherwise use defaults
          setStats({
            trips: data.data.user.tripCount || 0,
            posts: data.data.user.postCount || 0,
            friends: data.data.user.friendCount || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        // Clear localStorage cache and force reload
        localStorage.removeItem('dayla_user');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to upload avatar' });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditSubmit = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          interests: editForm.interests.split(',').map(i => i.trim()).filter(i => i),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          setShowEditModal(false);
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    // In a real app, save to backend
    setMessage({ type: 'success', text: 'Setting updated!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const fetchVisitedPlaces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trips/visited', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVisitedPlaces(data.data.places || []);
        }
      }
    } catch (error) {
      console.error('Error fetching visited places:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPlacesModal = () => {
    setShowPlacesModal(true);
    fetchVisitedPlaces();
  };

  // No sample data — only show real visited places from the API
  const samplePlaces: VisitedPlace[] = [];

  return (
    <div className="h-full bg-[#f7f3ee] overflow-y-auto">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header with background */}
      <div className="relative h-48 bg-gradient-to-br from-[#3a5a40] to-[#588157]">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl"
                alt="Profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl bg-[#a3b18a] flex items-center justify-center">
                <span className="text-3xl font-black text-white">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <button 
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg text-[#3a5a40] hover:bg-stone-50 transition-colors active:scale-95 disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-16 px-6 text-center space-y-2">
        <h2 className="text-xl font-bold text-stone-800">{user.name}</h2>
        <p className="text-sm text-stone-500 italic">"{user.bio || 'Adventure awaits!'}"</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-4 py-4">
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <span className="font-bold text-stone-800">{stats.trips}</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold">Trips</span>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
            <span className="font-bold text-stone-800">{stats.posts}</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold">Posts</span>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div 
            className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowFriendsModal(true)}
          >
            <span className="font-bold text-stone-800">{stats.friends}</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold">Friends</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mx-6 mb-4 p-3 rounded-xl flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Profile Actions */}
      <div className="mt-2 px-6 space-y-4 pb-24">
        {/* Interests Section */}
        <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="text-xs font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
            <Award size={14} /> My Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map(i => (
                <span key={i} className="px-3 py-1 bg-[#e9edc9] text-[#3a5a40] text-xs font-bold rounded-full">
                  {i}
                </span>
              ))
            ) : (
              <span className="text-stone-400 text-sm">No interests added yet</span>
            )}
          </div>
        </div>

        {/* Menu Options */}
        <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-1">
          <button 
            onClick={() => {
              setEditForm({
                name: user.name || '',
                bio: user.bio || '',
                interests: user.interests?.join(', ') || '',
              });
              setShowEditModal(true);
            }}
            className="w-full flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-700 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Edit3 size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium">Edit Profile</span>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
          
          <button 
            onClick={() => setShowFriendsModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-700 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users size={18} className="text-purple-600" />
              </div>
              <span className="text-sm font-medium">Find Friends</span>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
          
          <button 
            onClick={openPlacesModal}
            className="w-full flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-700 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <Map size={18} className="text-green-600" />
              </div>
              <span className="text-sm font-medium">My Visited Places</span>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
          
          <div className="h-px bg-stone-100 my-2" />
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <LogOut size={18} className="text-red-500" />
              </div>
              <span className="text-sm font-medium">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Edit Profile</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Interests</label>
                <input
                  type="text"
                  value={editForm.interests}
                  onChange={(e) => setEditForm(prev => ({ ...prev, interests: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none transition-all"
                  placeholder="Hiking, Photography, Wildlife (comma-separated)"
                />
                <p className="text-xs text-stone-400 mt-1">Separate interests with commas</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={handleEditSubmit}
                disabled={saving}
                className="w-full py-3 bg-[#3a5a40] text-white rounded-xl font-bold hover:bg-[#588157] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Settings</h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Bell size={18} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Notifications</p>
                    <p className="text-xs text-stone-400">Push notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingToggle('notifications')}
                  className={`w-12 h-7 rounded-full transition-colors ${settings.notifications ? 'bg-[#3a5a40]' : 'bg-stone-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Moon size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Dark Mode</p>
                    <p className="text-xs text-stone-400">Coming soon</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingToggle('darkMode')}
                  disabled
                  className={`w-12 h-7 rounded-full transition-colors opacity-50 ${settings.darkMode ? 'bg-[#3a5a40]' : 'bg-stone-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Private Profile Toggle */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                    <Shield size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Private Profile</p>
                    <p className="text-xs text-stone-400">Hide from public</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingToggle('privateProfile')}
                  className={`w-12 h-7 rounded-full transition-colors ${settings.privateProfile ? 'bg-[#3a5a40]' : 'bg-stone-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.privateProfile ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Globe size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Language</p>
                    <p className="text-xs text-stone-400">{settings.language}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-stone-400" />
              </div>
            </div>
            
            <div className="p-4 border-t border-stone-100">
              <p className="text-center text-xs text-stone-400">
                Dayla v1.0.0 • Made with 💚 for nature lovers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Find Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Find Friends</h2>
              <button 
                onClick={() => setShowFriendsModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#3a5a40] focus:border-[#3a5a40] outline-none transition-all"
              />
            </div>
            
            <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[50vh]">
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-stone-300 mb-3" />
                <p className="text-stone-500 text-sm">Search for friends by name or email</p>
                <p className="text-stone-400 text-xs mt-1">Connect with other adventurers on Dayla</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visited Places Modal */}
      {showPlacesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Visited Places</h2>
              <button 
                onClick={() => setShowPlacesModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader size={24} className="animate-spin text-[#3a5a40]" />
                </div>
              ) : visitedPlaces.length > 0 ? (
                visitedPlaces.map((place) => (
                  <div key={place.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    {place.image ? (
                      <img src={place.image} alt={place.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center">
                        <MapPin size={24} className="text-stone-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-700">{place.name}</p>
                      <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                        <Calendar size={12} />
                        <span>{new Date(place.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Heart size={18} className="text-red-400" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Map size={48} className="mx-auto text-stone-300 mb-3" />
                  <p className="text-stone-500">No visited places yet</p>
                  <p className="text-stone-400 text-sm">Start exploring!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileView;
