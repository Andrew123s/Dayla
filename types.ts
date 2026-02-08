
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

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  content: string;
  image: string;
  likes: number;
  comments: PostComment[];
}

export interface PostComment {
  id: string;
  userName: string;
  text: string;
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
  joinedAt?: Date;
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: ConversationParticipant[];
  messages: Message[];
  isGroup: boolean;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  updatedAt?: Date;
}
