
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

export interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  label: string;
  date: string;
  status: 'confirmed' | 'pending';
  category: 'sale' | 'purchase' | 'royalty' | 'referral' | 'reward' | 'recharge';
}

export interface YouthProfile {
  name: string;
  age: number;
  origin: string;
  school: string;
  who: string; // Brief intro
  what: string; // What they do
  how: string; // What led to this/The journey
  failures: string;
  successes: string;
  techStartDate: string; // When they started tech/hustle
  image: string;
}

export type ArticleType = 'COMMUNITY_HUB' | 'NEWS' | 'BUSINESS_INSIGHT' | 'CULTURE_HEAT';

export interface MarketDataPoint {
  label: string;
  value: number;
  event?: string;
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
  image: string;
  isHot?: boolean;
  isTrending?: boolean;
  isAI?: boolean;
  isOfficial?: boolean;
  featuredProfiles?: YouthProfile[];
  marketData?: MarketDataPoint[]; // For Pulse Intelligence charts
}

export interface UserPost {
  id: number;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  isPrivate: boolean;
  isLocked?: boolean;
  isAIDesign?: boolean;
  designStatus?: 'draft' | 'trending' | 'matched';
  royaltyRate?: number;
}

export enum ViewType {
  LANDING = 'landing',
  NEWS = 'news',
  MARKETPLACE = 'marketplace',
  PROFILE = 'profile',
  PUBLIC_PROFILE = 'public_profile',
  WALLET = 'wallet',
}

export interface RechargeBundle {
  id: string;
  amount: number;
  price: number;
  label: string;
  bonus?: string;
  color: string;
}

export interface NewsViewProps {
  onQuote: (text: string) => void;
  transactions?: Transaction[];
  wishlist?: MarketplaceItem[];
  onViewProfile: (userId: string) => void;
}

export interface ProfileViewProps {
  userId?: string; // Optional: if provided, view this specific user
  recentlyViewed: MarketplaceItem[];
  wishlist: MarketplaceItem[];
  collections: Collection[];
  promotedItems: MarketplaceItem[];
  transactions: Transaction[];
  onHistoryItemClick: (item: MarketplaceItem) => void;
  onReward: (amount: number, label: string) => void;
  onViewProfile?: (userId: string) => void;
}
