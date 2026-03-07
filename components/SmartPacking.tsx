import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  User, PackingList, PackingItem, PackingLuggage, PackingSuggestion, PackingTemplate,
  PackingItemCategory, TripCategory, Participant,
} from '../types';
import { API_BASE_URL, authFetch } from '../lib/api';
import {
  X, Plus, Check, Trash2, Search, ChevronDown, ChevronUp, Package, Plane, Weight,
  AlertTriangle, Star, ShoppingCart, Users, Loader, RefreshCw, Zap, Shield, Shirt,
  Sparkles, MapPin, Clock, CloudSun, Tag, ExternalLink, ChevronLeft, ChevronRight,
  Luggage, BarChart3, CheckCircle2, Info, BookOpen,
} from 'lucide-react';

interface SmartPackingProps {
  user: User;
  tripId: string;
  dashboardId: string;
  onClose: () => void;
}

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  clothing:           { icon: '👕', label: 'Clothing',    color: '#3b82f6' },
  toiletries:         { icon: '🧴', label: 'Toiletries',  color: '#8b5cf6' },
  electronics:        { icon: '🔌', label: 'Electronics', color: '#f59e0b' },
  documents:          { icon: '📄', label: 'Documents',   color: '#ef4444' },
  medicine:           { icon: '💊', label: 'Medicine',    color: '#10b981' },
  gear:               { icon: '🎒', label: 'Gear',        color: '#6366f1' },
  food:               { icon: '🍎', label: 'Food',        color: '#f97316' },
  accessories:        { icon: '🧢', label: 'Accessories', color: '#ec4899' },
  footwear:           { icon: '👟', label: 'Footwear',    color: '#14b8a6' },
  weather_essentials: { icon: '🌧️', label: 'Weather',    color: '#0ea5e9' },
  cultural:           { icon: '🏛️', label: 'Cultural',   color: '#a855f7' },
  entertainment:      { icon: '🎮', label: 'Entertainment', color: '#f43f5e' },
  safety:             { icon: '🔒', label: 'Safety',      color: '#059669' },
  other:              { icon: '📦', label: 'Other',        color: '#6b7280' },
};

const SOURCE_LABELS: Record<string, { emoji: string; label: string }> = {
  weather:  { emoji: '🌤️', label: 'Weather-based' },
  activity: { emoji: '🏃', label: 'Activity gear' },
  duration: { emoji: '📅', label: 'Duration calc' },
  cultural: { emoji: '🏛️', label: 'Cultural rule' },
  template: { emoji: '📋', label: 'Template' },
  memory:   { emoji: '🧠', label: 'Smart memory' },
  manual:   { emoji: '✏️', label: 'Manual' },
};

const SmartPacking: React.FC<SmartPackingProps> = ({ user, tripId, dashboardId, onClose }) => {
  // ─── State ──────────────────────────────────────────────────────────
  const [list, setList] = useState<PackingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<PackingSuggestion[]>([]);
  const [templates, setTemplates] = useState<PackingTemplate[]>([]);
  const [compliance, setCompliance] = useState<any>(null);

  // UI toggles
  const [tab, setTab] = useState<'items' | 'luggage' | 'insights'>('items');
  const [filterCat, setFilterCat] = useState<PackingItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [realtimeLog, setRealtimeLog] = useState<Array<{ id: string; msg: string; time: Date }>>([]);

  // New item form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PackingItemCategory>('other');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newEssential, setNewEssential] = useState(false);
  const [newShared, setNewShared] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Generate form
  const [genActivities, setGenActivities] = useState<string[]>([]);
  const [genAirline, setGenAirline] = useState('');
  const [genDestination, setGenDestination] = useState('');
  const [genCountryCode, setGenCountryCode] = useState('');

  // Luggage form
  const [showAddLuggage, setShowAddLuggage] = useState(false);
  const [lugName, setLugName] = useState('');
  const [lugType, setLugType] = useState<'carry_on' | 'checked' | 'personal' | 'backpack' | 'duffel' | 'other'>('checked');
  const [lugMaxWeight, setLugMaxWeight] = useState(23);
  const [lugAirline, setLugAirline] = useState('');
  const [lugColor, setLugColor] = useState('#3a5a40');
  const [addingLuggage, setAddingLuggage] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  // Error / success feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const socketRef = useRef<Socket | null>(null);

  const jsonHeaders = { 'Content-Type': 'application/json' };

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  }
  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  // ─── Fetch packing list ────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}`, { headers: jsonHeaders });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.data);
      } else {
        showError(data.message || 'Failed to load packing list');
      }
    } catch (err) {
      console.error('Failed to fetch packing list:', err);
      showError(err instanceof Error ? err.message : 'Failed to load packing list');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // ─── Fetch suggestions ─────────────────────────────────────────────
  const fetchSuggestions = useCallback(async () => {
    if (!tripId) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/suggestions`, { headers: jsonHeaders });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data.suggestions || []);
        setCompliance(data.data.compliance);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  }, [tripId]);

  // ─── Fetch templates ───────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/templates`, { headers: jsonHeaders });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
      } else {
        showError(data.message || 'Failed to load templates');
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      showError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  }, []);

  // ─── Socket setup ──────────────────────────────────────────────────
  useEffect(() => {
    fetchList();
    fetchTemplates();

    const token = localStorage.getItem('dayla_auth_token') || '';
    const socket = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { roomId: dashboardId, roomType: 'dashboard' });
    });

    // Packing real-time events
    socket.on('packing:item_added', (data) => {
      addLog(`${data.addedBy.name} added "${data.item.name}"`);
      fetchList();
    });
    socket.on('packing:item_packed', (data) => {
      addLog(`${data.packedBy.name} ${data.packed ? 'packed' : 'unpacked'} an item`);
      fetchList();
    });
    socket.on('packing:member_assigned', (data) => {
      addLog(`${data.assignedBy.name} assigned an item to ${data.assignedTo.name}`);
      fetchList();
    });
    socket.on('packing:duplicate_detected', (data) => {
      addLog(`⚠️ ${data.duplicates.length} duplicate(s) detected by ${data.detectedBy.name}`);
    });
    socket.on('packing:template_applied', (data) => {
      addLog(`${data.appliedBy.name} applied template "${data.templateName}" (+${data.addedCount} items)`);
      fetchList();
    });
    socket.on('packing:item_removed', (data) => {
      addLog(`${data.removedBy.name} removed "${data.itemName}"`);
      fetchList();
    });

    return () => {
      socket.disconnect();
    };
  }, [dashboardId, fetchList, fetchTemplates]);

  // Fetch suggestions when list changes
  useEffect(() => {
    if (list && list.items.length > 0) fetchSuggestions();
  }, [list?.items?.length, fetchSuggestions]);

  // ─── Helpers ────────────────────────────────────────────────────────
  function addLog(msg: string) {
    setRealtimeLog(prev => [{ id: Date.now().toString(), msg, time: new Date() }, ...prev].slice(0, 20));
  }

  function emitSocket(event: string, data: any) {
    socketRef.current?.emit(event, { roomId: dashboardId, ...data });
  }

  // ─── Actions ────────────────────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/generate`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          activities: genActivities.length ? genActivities : undefined,
          airline: genAirline || undefined,
          destination: genDestination || undefined,
          countryCode: genCountryCode || undefined,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.data);
        setSuggestions(data.generation?.suggestions || []);
        setShowGenerate(false);
        addLog('Smart packing list generated!');
        showSuccess('Smart list generated!');
      } else {
        showError(data.message || 'Generation failed');
      }
    } catch (err) {
      console.error('Generate failed:', err);
      showError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddItem() {
    if (!newName.trim()) return;
    setAddingItem(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/items`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory,
          quantity: newQuantity,
          isEssential: newEssential,
          isShared: newShared,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.list);
        emitSocket('packing:item_added', { item: data.data });
        if (data.duplicates?.length) {
          emitSocket('packing:duplicate_detected', { duplicates: data.duplicates });
          addLog(`⚠️ Duplicate detected: "${newName}"`);
        }
        showSuccess(`"${newName.trim()}" added!`);
        setNewName(''); setNewQuantity(1); setNewEssential(false); setNewShared(false);
        setShowAddItem(false);
      } else {
        showError(data.message || 'Failed to add item');
      }
    } catch (err) {
      console.error('Add item failed:', err);
      showError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  }

  async function handleTogglePacked(itemId: string, packed: boolean) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ packed }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.list);
        emitSocket('packing:item_packed', { itemId, packed });
      } else {
        showError(data.message || 'Failed to update item');
      }
    } catch (err) {
      console.error('Toggle packed failed:', err);
      showError('Failed to update item');
    }
  }

  async function handleRemoveItem(itemId: string, itemName: string) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/items/${itemId}`, {
        method: 'DELETE',
        headers: jsonHeaders,
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.list);
        emitSocket('packing:item_removed', { itemId, itemName });
        showSuccess(`"${itemName}" removed`);
      } else {
        showError(data.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Remove item failed:', err);
      showError('Failed to remove item');
    }
  }

  async function handleAssignItem(itemId: string, assignedToId: string | null) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ assignedTo: assignedToId }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.list);
        if (assignedToId) {
          const assignedUser = list?.collaborators.find(c => c.user._id === assignedToId);
          emitSocket('packing:member_assigned', {
            itemId,
            assignedTo: { userId: assignedToId, name: assignedUser?.user.name || 'Someone' },
          });
        }
      } else {
        showError(data.message || 'Failed to assign item');
      }
    } catch (err) {
      console.error('Assign item failed:', err);
      showError('Failed to assign item');
    }
  }

  async function handleApplyTemplate(templateId: string, templateName: string) {
    setApplyingTemplate(templateId);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/apply-template`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ templateId }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.data);
        emitSocket('packing:template_applied', { templateName, addedCount: data.added });
        setShowTemplates(false);
        addLog(`Template "${templateName}" applied (+${data.added} items)`);
        showSuccess(`"${templateName}" applied (+${data.added} items)`);
      } else {
        showError(data.message || 'Failed to apply template');
      }
    } catch (err) {
      console.error('Apply template failed:', err);
      showError(err instanceof Error ? err.message : 'Failed to apply template');
    } finally {
      setApplyingTemplate(null);
    }
  }

  async function handleAddLuggage() {
    if (!lugName.trim()) return;
    setAddingLuggage(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/luggage`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          name: lugName.trim(),
          type: lugType,
          maxWeight: lugMaxWeight * 1000,
          maxVolume: 62000,
          airline: lugAirline,
          color: lugColor,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.data);
        showSuccess(`"${lugName.trim()}" added!`);
        setLugName(''); setLugType('checked'); setLugMaxWeight(23); setLugAirline(''); setLugColor('#3a5a40');
        setShowAddLuggage(false);
      } else {
        showError(data.message || 'Failed to add luggage');
      }
    } catch (err) {
      console.error('Add luggage failed:', err);
      showError(err instanceof Error ? err.message : 'Failed to add luggage');
    } finally {
      setAddingLuggage(false);
    }
  }

  async function handleRemoveLuggage(luggageId: string, luggageName: string) {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/packing/${tripId}/luggage/${luggageId}`, {
        method: 'DELETE',
        headers: jsonHeaders,
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      if (data.success) {
        setList(data.data);
        showSuccess(`"${luggageName}" removed`);
      } else {
        showError(data.message || 'Failed to remove luggage');
      }
    } catch (err) {
      console.error('Remove luggage failed:', err);
      showError('Failed to remove luggage');
    }
  }

  // ─── Derived data ──────────────────────────────────────────────────
  const items = list?.items || [];
  const filteredItems = items.filter(i => {
    if (filterCat !== 'all' && i.category !== filterCat) return false;
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const grouped = filteredItems.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalWeight = list?.totalWeight || 0;
  const totalVolume = list?.totalVolume || 0;
  const progress = list?.progress || 0;
  const packedCount = list?.packedItems || 0;
  const totalCount = list?.totalItems || 0;

  // Collabs for assignment dropdown
  const allMembers = [
    { _id: user.id, name: user.name, avatar: user.avatar },
    ...(list?.collaborators?.map(c => c.user) || []),
  ];

  // ─── Toggle category collapse ─────────────────────────────────────
  function toggleCat(cat: string) {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#f7f3ee] flex items-end justify-center">
        <div className="bg-white w-full max-w-[480px] h-[85vh] rounded-t-[2rem] flex items-center justify-center">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f7f3ee] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-gradient-to-b from-white to-blue-50/30 w-full max-w-[480px] h-[85vh] rounded-t-[2rem] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-[#1a3a2a] tracking-tight flex items-center gap-2">
                <Package size={18} className="text-blue-500 flex-shrink-0" /> Ntelipak
              </h2>
              <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Smart Packing Assistant</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {list && list.items.length > 0 && (
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} className="text-blue-500" />
                  <span className="text-[9px] font-black text-blue-700">{packedCount}/{totalCount}</span>
                </div>
              )}
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-stone-100 transition">
                <X size={18} className="text-stone-500" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[8px] text-stone-400 font-bold mt-1">{progress}% packed · {(totalWeight / 1000).toFixed(1)} kg total</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0.5 mt-2 bg-stone-100 rounded-full p-0.5">
            {(['items', 'luggage', 'insights'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-full transition-all ${
                  tab === t ? 'bg-white text-blue-600 shadow' : 'text-stone-500'
                }`}
              >
                {t === 'items' ? `Items (${totalCount})` : t === 'luggage' ? 'Luggage' : 'Insights'}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Error / Success Toast ──────────────────────────── */}
        {error && (
          <div className="mx-4 mb-1 px-3 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 flex-shrink-0">
            <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
            <p className="text-[10px] font-bold text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X size={12} /></button>
          </div>
        )}
        {success && (
          <div className="mx-4 mb-1 px-3 py-2 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
            <p className="text-[10px] font-bold text-green-700 flex-1">{success}</p>
          </div>
        )}

        {/* ─── Tab Content ─────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-8 scrollbar-hide">

          {/* ═══ ITEMS TAB ═══ */}
          {tab === 'items' && (
            <>
              {/* Actions bar */}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                <button onClick={() => setShowGenerate(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black hover:bg-blue-600 transition active:scale-95">
                  <Zap size={11} /> Smart List
                </button>
                <button onClick={() => setShowAddItem(!showAddItem)} className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 text-stone-700 rounded-full text-[9px] font-black hover:bg-stone-200 transition active:scale-95">
                  <Plus size={11} /> Add Item
                </button>
                <button onClick={() => { setShowTemplates(true); fetchTemplates(); }} className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 text-stone-700 rounded-full text-[9px] font-black hover:bg-stone-200 transition active:scale-95">
                  <BookOpen size={11} /> Templates
                </button>
              </div>

              {/* Search + Filter */}
              {totalCount > 0 && (
                <div className="flex gap-1.5 mb-3">
                  <div className="flex-1 relative min-w-0">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items..."
                      className="w-full pl-7 pr-2 py-1.5 bg-white border border-stone-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value as PackingItemCategory | 'all')}
                    className="px-2 py-1.5 bg-white border border-stone-200 rounded-xl text-[9px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 max-w-[110px] flex-shrink-0"
                  >
                    <option value="all">All</option>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>{meta.icon} {meta.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add Item Form */}
              {showAddItem && (
                <div className="mb-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[9px] font-black text-stone-600 uppercase mb-2">Add New Item</p>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Item name..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    autoFocus
                  />
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PackingItemCategory)}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-[10px] font-bold"
                    >
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.icon} {meta.label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2 flex-shrink-0">
                      <button onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))} className="text-stone-400 hover:text-stone-600 p-0.5">-</button>
                      <span className="text-xs font-bold w-5 text-center">{newQuantity}</span>
                      <button onClick={() => setNewQuantity(Math.min(20, newQuantity + 1))} className="text-stone-400 hover:text-stone-600 p-0.5">+</button>
                    </div>
                  </div>
                  <div className="flex gap-3 mb-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold text-stone-600 cursor-pointer">
                      <input type="checkbox" checked={newEssential} onChange={(e) => setNewEssential(e.target.checked)} className="rounded border-stone-300 text-blue-500" />
                      Essential
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-stone-600 cursor-pointer">
                      <input type="checkbox" checked={newShared} onChange={(e) => setNewShared(e.target.checked)} className="rounded border-stone-300 text-blue-500" />
                      Shared item
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      disabled={addingItem || !newName.trim()}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {addingItem ? <><Loader size={12} className="animate-spin" /> Adding...</> : 'Add Item'}
                    </button>
                    <button onClick={() => setShowAddItem(false)} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black hover:bg-stone-200 transition">Cancel</button>
                  </div>
                </div>
              )}

              {/* Items grouped by category */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[40vh] text-stone-400">
                  <Package size={44} className="mb-3 opacity-30" />
                  <p className="text-sm font-bold">No items yet</p>
                  <p className="text-[10px] mt-1 text-center px-4">Generate a smart list or add items manually</p>
                </div>
              ) : (
                Object.entries(grouped).map(([cat, catItems]) => {
                  const meta = CATEGORY_META[cat] || CATEGORY_META.other;
                  const isCollapsed = collapsedCats.has(cat);
                  const catPacked = catItems.filter(i => i.packed).length;
                  return (
                    <div key={cat} className="mb-2">
                      <button
                        onClick={() => toggleCat(cat)}
                        className="w-full flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-stone-100 hover:bg-stone-50 transition active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm flex-shrink-0">{meta.icon}</span>
                          <span className="text-[11px] font-black text-stone-700 truncate">{meta.label}</span>
                          <span className="text-[9px] font-bold text-stone-400 flex-shrink-0">{catPacked}/{catItems.length}</span>
                        </div>
                        {isCollapsed ? <ChevronRight size={14} className="text-stone-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-stone-400 flex-shrink-0" />}
                      </button>

                      {!isCollapsed && (
                        <div className="mt-1 space-y-1">
                          {catItems.map(item => (
                            <div
                              key={item._id}
                              className={`flex items-start gap-2 py-2 px-2.5 rounded-xl border transition-all ${
                                item.packed
                                  ? 'bg-green-50/50 border-green-200/50'
                                  : item._unusedFlag
                                    ? 'bg-amber-50/50 border-amber-200/50'
                                    : 'bg-white border-stone-100'
                              }`}
                            >
                              {/* Checkbox */}
                              <button
                                onClick={() => handleTogglePacked(item._id, !item.packed)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition active:scale-90 ${
                                  item.packed ? 'bg-green-500 border-green-500' : 'border-stone-300 hover:border-blue-400'
                                }`}
                              >
                                {item.packed && <Check size={10} className="text-white" />}
                              </button>

                              {/* Item info */}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className={`text-[11px] font-bold truncate max-w-[140px] ${item.packed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                    {item.name}
                                  </span>
                                  {item.quantity > 1 && <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 rounded flex-shrink-0">×{item.quantity}</span>}
                                  {item.isEssential && <span className="text-[7px] font-black text-red-500 bg-red-50 px-1 rounded flex-shrink-0">MUST</span>}
                                  {item._favoriteFlag && <Star size={9} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                                  {item.isShared && <Users size={9} className="text-purple-400 flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[7px] text-stone-400">
                                    {SOURCE_LABELS[item.source]?.emoji} {SOURCE_LABELS[item.source]?.label || item.source}
                                  </span>
                                  <span className="text-[7px] text-stone-400">{item.weight}g</span>
                                  {item._unusedFlag && <span className="text-[7px] text-amber-600 font-bold">Unused</span>}
                                </div>
                                {item.assignedTo && (
                                  <span className="text-[7px] text-purple-600 font-bold block mt-0.5">→ {item.assignedTo.name}</span>
                                )}
                                {item.packed && item.packedBy && (
                                  <span className="text-[7px] text-green-600 font-bold block mt-0.5">✓ by {item.packedBy.name}</span>
                                )}
                              </div>

                              {/* Actions — compact for mobile */}
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                {item.isShared && allMembers.length > 1 && (
                                  <select
                                    value={item.assignedTo?._id || ''}
                                    onChange={(e) => handleAssignItem(item._id, e.target.value || null)}
                                    className="text-[7px] font-bold bg-purple-50 border border-purple-200 rounded-lg px-1 py-0.5 focus:outline-none max-w-[60px]"
                                  >
                                    <option value="">Assign</option>
                                    {allMembers.map(m => (
                                      <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                  </select>
                                )}
                                {item.shopUrl && (
                                  <a
                                    href={item.shopUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg hover:bg-stone-100 transition"
                                    title="Buy this item"
                                  >
                                    <ShoppingCart size={11} className="text-stone-400" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleRemoveItem(item._id, item.name)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 transition"
                                >
                                  <Trash2 size={11} className="text-stone-300 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ═══ LUGGAGE TAB ═══ */}
          {tab === 'luggage' && (
            <>
              {/* Add Luggage button */}
              <div className="flex gap-1.5 mb-3">
                <button
                  onClick={() => setShowAddLuggage(!showAddLuggage)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black hover:bg-blue-600 transition active:scale-95"
                >
                  <Plus size={11} /> Add Bag
                </button>
              </div>

              {/* Add Luggage Form */}
              {showAddLuggage && (
                <div className="mb-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[9px] font-black text-stone-600 uppercase mb-2">Add New Bag</p>
                  <input
                    type="text"
                    value={lugName}
                    onChange={(e) => setLugName(e.target.value)}
                    placeholder="Bag name (e.g. Carry-On, Main Suitcase)..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLuggage()}
                    autoFocus
                  />
                  <div className="flex gap-2 mb-2">
                    <select
                      value={lugType}
                      onChange={(e) => setLugType(e.target.value as typeof lugType)}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-[10px] font-bold"
                    >
                      <option value="carry_on">Carry-on</option>
                      <option value="checked">Checked</option>
                      <option value="personal">Personal Item</option>
                      <option value="backpack">Backpack</option>
                      <option value="duffel">Duffel</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl px-2 flex-shrink-0">
                      <span className="text-[9px] font-bold text-stone-500">Max</span>
                      <button onClick={() => setLugMaxWeight(Math.max(1, lugMaxWeight - 1))} className="text-stone-400 hover:text-stone-600 p-0.5">-</button>
                      <span className="text-xs font-bold w-5 text-center">{lugMaxWeight}</span>
                      <button onClick={() => setLugMaxWeight(Math.min(50, lugMaxWeight + 1))} className="text-stone-400 hover:text-stone-600 p-0.5">+</button>
                      <span className="text-[9px] font-bold text-stone-500">kg</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={lugAirline}
                      onChange={(e) => setLugAirline(e.target.value)}
                      placeholder="Airline (optional)..."
                      className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[9px] font-bold text-stone-500">Color</span>
                      <input type="color" value={lugColor} onChange={(e) => setLugColor(e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddLuggage}
                      disabled={addingLuggage || !lugName.trim()}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {addingLuggage ? <><Loader size={12} className="animate-spin" /> Adding...</> : 'Add Bag'}
                    </button>
                    <button onClick={() => setShowAddLuggage(false)} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black hover:bg-stone-200 transition">Cancel</button>
                  </div>
                </div>
              )}

              {/* Luggage items */}
              {(list?.luggage || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[30vh] text-stone-400">
                  <Luggage size={44} className="mb-3 opacity-30" />
                  <p className="text-sm font-bold">No bags added</p>
                  <p className="text-[10px] mt-1 text-center px-4">Add your luggage to track weight and volume limits</p>
                </div>
              ) : (
                (list?.luggage || []).map((bag) => {
                  const weightPct = bag.maxWeight > 0 ? Math.min(100, Math.round((totalWeight / bag.maxWeight) * 100)) : 0;
                  const volumePct = bag.maxVolume > 0 ? Math.min(100, Math.round((totalVolume / bag.maxVolume) * 100)) : 0;
                  const overweight = totalWeight > bag.maxWeight;
                  const overvol = totalVolume > bag.maxVolume;

                  return (
                    <div key={bag._id} className="mb-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0" style={{ background: bag.color }}>
                            <Luggage size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-stone-800 truncate">{bag.name}</p>
                            <p className="text-[8px] text-stone-400 font-bold uppercase">{bag.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {bag.airline && <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate max-w-[80px]"><Plane size={9} className="inline mr-0.5" />{bag.airline}</span>}
                          <button
                            onClick={() => handleRemoveLuggage(bag._id, bag.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition"
                          >
                            <Trash2 size={11} className="text-stone-300 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Weight bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[8px] font-bold mb-0.5">
                          <span className={overweight ? 'text-red-600' : 'text-stone-600'}>Weight: {(totalWeight / 1000).toFixed(1)} kg</span>
                          <span className="text-stone-400">{(bag.maxWeight / 1000).toFixed(0)} kg max</span>
                        </div>
                        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              overweight ? 'bg-gradient-to-r from-red-400 to-red-600' : weightPct > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, weightPct)}%` }}
                          />
                        </div>
                        {overweight && <p className="text-[7px] font-bold text-red-500 mt-0.5">⚠️ Over by {((totalWeight - bag.maxWeight) / 1000).toFixed(1)} kg</p>}
                      </div>

                      {/* Volume bar */}
                      <div>
                        <div className="flex justify-between text-[8px] font-bold mb-0.5">
                          <span className={overvol ? 'text-red-600' : 'text-stone-600'}>Volume: {(totalVolume / 1000).toFixed(1)} L</span>
                          <span className="text-stone-400">{(bag.maxVolume / 1000).toFixed(0)} L max</span>
                        </div>
                        <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              overvol ? 'bg-gradient-to-r from-red-400 to-red-600' : volumePct > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, volumePct)}%` }}
                          />
                        </div>
                        {overvol && <p className="text-[7px] font-bold text-red-500 mt-0.5">⚠️ Over by {((totalVolume - bag.maxVolume) / 1000).toFixed(1)} L</p>}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Airline compliance */}
              {compliance && (
                <div className={`p-3 rounded-2xl border shadow-sm ${compliance.overweight ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Plane size={14} className={`flex-shrink-0 ${compliance.overweight ? 'text-red-500' : 'text-green-500'}`} />
                    <p className="text-[11px] font-black truncate">{compliance.airline} Compliance</p>
                  </div>
                  {compliance.overweight ? (
                    <p className="text-[9px] text-red-700 font-bold">
                      ⚠️ Over {(compliance.checkedLimit / 1000).toFixed(0)} kg limit by {(compliance.overweightBy / 1000).toFixed(1)} kg
                    </p>
                  ) : (
                    <p className="text-[9px] text-green-700 font-bold">
                      ✓ Within {(compliance.checkedLimit / 1000).toFixed(0)} kg limit
                    </p>
                  )}
                </div>
              )}

              {/* Category weight breakdown */}
              {totalCount > 0 && (
                <div className="mt-3 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
                  <p className="text-[9px] font-black text-stone-600 uppercase mb-2 flex items-center gap-1"><BarChart3 size={11} /> Weight Breakdown</p>
                  {Object.entries(grouped).map(([cat, catItems]) => {
                    const catWeight = catItems.reduce((s, i) => s + (i.weight * i.quantity), 0);
                    const pct = totalWeight > 0 ? Math.round((catWeight / totalWeight) * 100) : 0;
                    const meta = CATEGORY_META[cat] || CATEGORY_META.other;
                    return (
                      <div key={cat} className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs w-5 flex-shrink-0">{meta.icon}</span>
                        <span className="text-[8px] font-bold text-stone-600 w-14 truncate flex-shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden min-w-0">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                        </div>
                        <span className="text-[7px] font-bold text-stone-500 w-9 text-right flex-shrink-0">{(catWeight / 1000).toFixed(1)}kg</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ═══ INSIGHTS TAB ═══ */}
          {tab === 'insights' && (
            <>
              {/* Generation info */}
              {list?.generatedFrom && list.generatedFrom.weather && (
                <div className="mb-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-700 uppercase mb-1 flex items-center gap-1"><CloudSun size={12} /> Weather Data Used</p>
                  <p className="text-[10px] text-blue-600">
                    Destination: {list.generatedFrom.destination || 'N/A'} · {list.generatedFrom.duration} days
                    {list.generatedFrom.temperature && (
                      <> · {list.generatedFrom.temperature.minC}°C – {list.generatedFrom.temperature.maxC}°C</>
                    )}
                  </p>
                  {list.generatedFrom.conditions.length > 0 && (
                    <p className="text-[10px] text-blue-600 mt-0.5">
                      Conditions: {list.generatedFrom.conditions.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-black text-stone-600 uppercase mb-2 flex items-center gap-1"><Sparkles size={12} /> Smart Suggestions</p>
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className={`mb-1.5 p-2.5 rounded-xl border ${
                        s.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                        s.type === 'missing' ? 'bg-red-50 border-red-200' :
                        'bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <p className={`text-[10px] font-bold ${
                        s.type === 'warning' ? 'text-amber-700' :
                        s.type === 'missing' ? 'text-red-700' :
                        'text-emerald-700'
                      }`}>
                        {s.type === 'warning' ? '⚠️' : s.type === 'missing' ? '❌' : '💡'} {s.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Real-time activity log */}
              <div className="mb-3">
                <p className="text-[10px] font-black text-stone-600 uppercase mb-2 flex items-center gap-1"><Clock size={12} /> Live Activity</p>
                {realtimeLog.length === 0 ? (
                  <p className="text-[10px] text-stone-400 text-center py-4">No activity yet. Start packing!</p>
                ) : (
                  realtimeLog.map(log => (
                    <div key={log.id} className="flex items-center gap-2 py-1.5 border-b border-stone-100 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      <p className="text-[10px] text-stone-600 flex-1">{log.msg}</p>
                      <span className="text-[8px] text-stone-400">{log.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Item sources breakdown */}
              {totalCount > 0 && (
                <div className="p-3 bg-white rounded-2xl border border-stone-200">
                  <p className="text-[10px] font-black text-stone-600 uppercase mb-2 flex items-center gap-1"><Tag size={12} /> Item Sources</p>
                  {Object.entries(
                    items.reduce<Record<string, number>>((acc, i) => {
                      acc[i.source] = (acc[i.source] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([src, count]) => (
                    <div key={src} className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{SOURCE_LABELS[src]?.emoji || '📦'}</span>
                      <span className="text-[10px] font-bold text-stone-600 flex-1">{SOURCE_LABELS[src]?.label || src}</span>
                      <span className="text-[10px] font-black text-blue-600">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Generate Modal ──────────────────────────────────── */}
        {showGenerate && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowGenerate(false)}>
            <div className="bg-white rounded-2xl p-4 w-full max-w-[400px] shadow-2xl max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-black text-[#1a3a2a] mb-3 flex items-center gap-2"><Zap size={16} className="text-blue-500" /> Generate Smart List</h3>

              <label className="text-[9px] font-black text-stone-600 uppercase block mb-1">Activities</label>
              <div className="flex flex-wrap gap-1 mb-3">
                {(['hiking', 'camping', 'beach', 'business', 'exploring', 'cultural', 'road_trip', 'family'] as const).map(act => (
                  <button
                    key={act}
                    onClick={() => setGenActivities(prev => prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act])}
                    className={`px-2 py-1 rounded-full text-[9px] font-black transition active:scale-95 ${
                      genActivities.includes(act) ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {act.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <label className="text-[9px] font-black text-stone-600 uppercase block mb-1">Destination (weather)</label>
              <input
                type="text"
                value={genDestination}
                onChange={(e) => setGenDestination(e.target.value)}
                placeholder="e.g. Accra, Cape Town, Paris..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs mb-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <label className="text-[9px] font-black text-stone-600 uppercase block mb-1">Country Code (cultural)</label>
              <input
                type="text"
                value={genCountryCode}
                onChange={(e) => setGenCountryCode(e.target.value.toUpperCase())}
                placeholder="e.g. SA, JP, TH..."
                maxLength={2}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs mb-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <label className="text-[9px] font-black text-stone-600 uppercase block mb-1">Airline (optional)</label>
              <input
                type="text"
                value={genAirline}
                onChange={(e) => setGenAirline(e.target.value)}
                placeholder="e.g. Emirates, Delta..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                >
                  {generating ? <><Loader size={14} className="animate-spin" /> Generating...</> : <><Zap size={14} /> Generate</>}
                </button>
                <button onClick={() => setShowGenerate(false)} className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-black hover:bg-stone-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Templates Modal ─────────────────────────────────── */}
        {showTemplates && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
            <div className="bg-white rounded-2xl p-4 w-full max-w-[400px] shadow-2xl max-h-[65vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-black text-[#1a3a2a] mb-3 flex items-center gap-2"><BookOpen size={16} className="text-blue-500" /> Packing Templates</h3>
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                  <Loader size={20} className="animate-spin mb-2 text-blue-400" />
                  <p className="text-[10px] font-bold">Loading templates...</p>
                </div>
              ) : (
                templates.map(t => (
                  <div key={t._id} className="mb-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-stone-800 truncate">{t.name}</p>
                        <p className="text-[9px] text-stone-500 truncate">{t.description} · {t.items.length} items</p>
                      </div>
                      <button
                        onClick={() => handleApplyTemplate(t._id, t.name)}
                        disabled={applyingTemplate === t._id}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black hover:bg-blue-600 transition flex-shrink-0 active:scale-95 disabled:opacity-50 flex items-center gap-1"
                      >
                        {applyingTemplate === t._id ? <><Loader size={10} className="animate-spin" /> Applying...</> : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartPacking;
