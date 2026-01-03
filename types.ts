
export interface MarketplaceItem {
  id: number;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  image: string;
  model3d?: string;
  coordinates: { x: number; y: number };
  demandLevel: 'high' | 'medium' | 'low';
  supplyLevel: 'high' | 'medium' | 'low';
  isBargainable: boolean;
  minPrice: number;
  description: string;
  allowReferral?: boolean;
  referralFee?: number;
  vendorRating: number;
  vendorHandle: string;
}

export interface Collection {
  id: string;
  name: string;
  itemIds: number[];
  description?: string;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'disputed' | 'returning' | 'refunded' | 'released';

export interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  label: string;
  date: string;
  status: TransactionStatus;
  category: 'sale' | 'purchase' | 'royalty' | 'referral' | 'reward' | 'recharge';
  sellerId?: string;
  buyerId?: string;
  disputeVerdict?: string;
  itemCoordinates?: { x: number; y: number };
  trackingProgress?: number; // 0 to 1
  evidence?: {
    sent?: string;
    received?: string;
    returned?: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export enum ViewType {
  LANDING = 'landing',
  AUTH = 'auth',
  NEWS = 'news',
  MARKETPLACE = 'marketplace',
  CHATS = 'chats',
  PROFILE = 'profile',
  PUBLIC_PROFILE = 'public_profile',
  WALLET = 'wallet',
}

export type HubTab = 'stream' | 'collections' | 'promoted' | 'purchases' | 'wishlist' | 'mediation';

export interface RechargeBundle {
  id: string;
  amount: number;
  price: number;
  label: string;
  bonus?: string;
  color: string;
}

export type ArticleType = 'COMMUNITY_HUB' | 'NEWS' | 'BUSINESS_INSIGHT' | 'CULTURE_HEAT' | 'LEGAL_PROTOCOL';

export interface MarketDataPoint {
  value: number;
  label: string;
  event?: string;
}

export interface YouthProfile {
  name: string;
  age: number;
  origin: string;
  school: string;
  who: string;
  what: string;
  how: string;
  failures: string;
  successes: string;
  techStartDate: string;
  image: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  category: ArticleType;
  isOfficial?: boolean;
  image: string;
  isHot?: boolean;
  isTrending?: boolean;
  isAI?: boolean;
  marketData?: MarketDataPoint[];
  featuredProfiles?: YouthProfile[];
}

export interface UserPost {
  id: number;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  isPrivate: boolean;
  isAIDesign: boolean;
  designStatus: 'trending' | 'draft';
}

export interface NewsViewProps {
  onQuote: (text: string) => void;
  transactions?: Transaction[];
  wishlist?: MarketplaceItem[];
  onViewProfile: (userId: string) => void;
}

export interface ProfileViewProps {
  userId?: string; 
  recentlyViewed: MarketplaceItem[];
  wishlist: MarketplaceItem[];
  collections: Collection[];
  promotedItems: MarketplaceItem[];
  transactions: Transaction[];
  onHistoryItemClick: (item: MarketplaceItem) => void;
  onReward: (amount: number, label: string) => void;
  onUpdateTransaction?: (tx: Transaction) => void;
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string) => void;
  onTrackOrder?: (tx: Transaction) => void;
}
