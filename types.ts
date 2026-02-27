
export type ViewType = 'auth' | 'dashboard' | 'community' | 'chat' | 'profile';

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
}

export interface NoteAuthor {
  id: string;
  name: string;
  avatar?: string;
  timestamp: string; // ISO date string
}

export interface StickyNote {
  id: string;
  type: 'text' | 'image' | 'voice' | 'weather' | 'schedule' | 'budget' | 'sustainability';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // Text or Image URL
  color: string;
  linkTo?: string; // ID of another note
  emoji?: string;
  audioUrl?: string;
  metadata?: any;
  scheduledDate?: string; // Date for specific activity
  scale?: number;
  crop?: {
    x: number;
    y: number;
    zoom: number;
  };
  createdBy?: NoteAuthor;
  lastEditedBy?: NoteAuthor;
}

export interface SustainabilityImpact {
  carbonKg: number;
  waterLiters: number;
  ecosystemScore: number; // 0-100
  localBenefit: number; // 0-100
}

export interface OffsetProject {
  id: string;
  name: string;
  type: 'reforestation' | 'renewable' | 'conservation';
  description: string;
  image: string;
  costPerKg: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  impactRating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
}

export interface TripDates {
  startDate?: string;
  endDate?: string;
}

export interface WeatherDay {
  date: string;
  temp: number;
  condition: 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy' | 'Stormy';
  icon: string;
}

export interface WeatherSuggestion {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  reason: string;
  action: string;
  emoji: string;
}

export type BudgetCategory = 'Accommodation' | 'Transportation' | 'Food & Dining' | 'Activities' | 'Shopping' | 'Other';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: BudgetCategory;
  date: string;
  paidById: string;
  splitBetweenIds: string[];
  description?: string;
}

export type TripCategory = 'hiking' | 'business' | 'family' | 'camping' | 'exploring' | 'beach' | 'road_trip' | 'cultural' | 'other';

export interface Trip {
  id: string;
  name: string;
  description: string;
  items: StickyNote[];
  collaborators: string[];
  dates?: TripDates;
  status?: 'planning' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
  category?: TripCategory;
  destination?: string;
  coverImage?: string;
  tags?: string[];
  createdAt?: string;
}

export interface SavedCommunityTrip {
  id: string;
  title: string;
  content: string;
  location: string;
  image: string;
  author: { id: string; name: string; avatar: string };
  tags: string[];
  savedAt: string;
  tripId?: string;
  likes: number;
  comments: number;
  category?: TripCategory;
}

// ─── Ntelipak (Smart Packing) Types ───────────────────────────────────

export type PackingItemCategory =
  | 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medicine'
  | 'gear' | 'food' | 'accessories' | 'footwear' | 'weather_essentials'
  | 'cultural' | 'entertainment' | 'safety' | 'other';

export type PackingItemSource =
  | 'manual' | 'weather' | 'activity' | 'duration' | 'cultural' | 'template' | 'memory';

export interface PackingItem {
  _id: string;
  name: string;
  category: PackingItemCategory;
  quantity: number;
  packed: boolean;
  packedBy?: { _id: string; name: string; avatar?: string } | null;
  packedAt?: string | null;
  assignedTo?: { _id: string; name: string; avatar?: string } | null;
  weight: number;
  volume: number;
  isEssential: boolean;
  isShared: boolean;
  source: PackingItemSource;
  shopUrl?: string | null;
  notes: string;
  addedBy?: { _id: string; name: string; avatar?: string };
  addedAt?: string;
  _unusedFlag?: boolean;
  _favoriteFlag?: boolean;
}

export interface PackingLuggage {
  _id: string;
  name: string;
  type: 'carry_on' | 'checked' | 'personal' | 'backpack' | 'duffel' | 'other';
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  airline: string;
  color: string;
}

export interface PackingAirlineRestrictions {
  airline: string;
  carryOnWeight: number;
  carryOnDimensions?: { l: number; w: number; h: number };
  checkedWeight: number;
  checkedCount: number;
  prohibitedItems: string[];
}

export interface PackingList {
  _id: string;
  tripId: string;
  owner: { _id: string; name: string; avatar?: string };
  collaborators: Array<{ user: { _id: string; name: string; avatar?: string }; role: string }>;
  items: PackingItem[];
  luggage: PackingLuggage[];
  generatedFrom?: {
    weather: boolean;
    activities: string[];
    duration: number;
    destination: string;
    destinationCountry: string;
    temperature?: { avgC: number; minC: number; maxC: number };
    conditions: string[];
  };
  airlineRestrictions?: PackingAirlineRestrictions;
  isComplete: boolean;
  totalItems: number;
  packedItems: number;
  progress: number;
  totalWeight: number;
  totalVolume: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackingSuggestion {
  type: 'warning' | 'tip' | 'missing';
  message: string;
}

export interface PackingTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'system' | 'user' | 'seasonal' | 'destination';
  tripCategory?: string;
  season?: string;
  items: Array<{ name: string; category: string; quantity: number; isEssential: boolean }>;
  usageCount: number;
}

export interface Post {
  id: string;
  _id?: string;
  author?: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  title?: string;
  content: string;
  images?: Array<{ url: string; caption?: string }>;
  location?: { name: string; coordinates?: { lat: number; lng: number } };
  tags?: Array<{ name: string; category: string }>;
  likes?: Array<{ user: any; createdAt?: string }>;
  likeCount?: number;
  liked?: boolean;
  saved?: boolean;
  comments?: PostComment[];
  saves?: Array<{ user: any; createdAt?: string }>;
  views?: number;
  visibility?: 'public' | 'friends' | 'private';
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  userId?: string;
  userName?: string;
  userAvatar?: string;
  image?: string;
}

export interface PostComment {
  id?: string;
  _id?: string;
  author?: { _id: string; name: string; avatar?: string };
  content?: string;
  // Legacy fields
  userName?: string;
  text?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  _id?: string;
  senderId: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text?: string;
  content?: string;
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
}

export interface ConversationParticipant {
  user: User & { _id?: string };
  role?: 'admin' | 'member';
  joinedAt?: Date;
  lastReadAt?: Date;
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: ConversationParticipant[];
  messages: Message[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
  lastMessage?: {
    _id: string;
    content?: string;
    sender?: { _id: string; name: string; avatar?: string };
    createdAt?: string;
  } | null;
  updatedAt?: Date;
  createdBy?: string;
  messageCount?: number;
  inviteCode?: string;
}
