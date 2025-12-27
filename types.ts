
export interface MarketplaceItem {
  id: number;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  image: string;
  model3d?: string; // URL to GLB/USDZ asset
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

export interface UserWallet {
  balance: number;
  transactions: Transaction[];
}

export interface CrystalPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  bonus?: string;
  color: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  isHot?: boolean;
  isTrending?: boolean;
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
  WALLET = 'wallet',
}
