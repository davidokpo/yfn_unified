
import { db, firebase } from './firebase';
import { MarketplaceItem, Article, UserPost, Transaction, Collection } from '../types';

export const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: 1,
    name: "Premium Silk Agbada",
    category: "APPAREL",
    price: "₦850,000",
    numericPrice: 850000,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&h=1200&auto=format&fit=crop",
    model3d: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    coordinates: { x: 25, y: 30 },
    demandLevel: 'high',
    supplyLevel: 'low',
    isBargainable: true,
    minPrice: 750000,
    vendorRating: 4.8,
    vendorHandle: "@vance_studio",
    allowReferral: true,
    referralFee: 25000,
    description: "Hand-woven silk Agbada with modern embroidery patterns. A staple of the 2025 luxury protocol."
  },
  {
    id: 2,
    name: "The 'Executive' Fade & Beard Grooming",
    category: "SERVICES",
    price: "₦25,000",
    numericPrice: 25000,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&h=800&auto=format&fit=crop",
    coordinates: { x: 45, y: 60 },
    demandLevel: 'high',
    supplyLevel: 'medium',
    isBargainable: false,
    minPrice: 25000,
    vendorRating: 4.9,
    vendorHandle: "@clipper_node",
    allowReferral: true,
    referralFee: 2000,
    description: "Mobile premium barbing service. Includes deep conditioning, hot towel treatment, and precision fade. Experience the ultimate grooming node."
  },
  {
    id: 3,
    name: "Artisanal Leather Tote",
    category: "BAGS",
    price: "₦120,000",
    numericPrice: 120000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&h=1200&auto=format&fit=crop",
    coordinates: { x: 70, y: 20 },
    demandLevel: 'medium',
    supplyLevel: 'low',
    isBargainable: true,
    minPrice: 95000,
    vendorRating: 4.7,
    vendorHandle: "@davina_soles",
    allowReferral: true,
    referralFee: 5000,
    description: "Hand-stitched full-grain leather tote. Built for durability and refined for the modern Lagosian elite."
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 100,
    title: "The Universe Protocol: Official 2025 Vision",
    excerpt: "YFN Official outlines the strategic roadmap for the creative economy integration.",
    content: "Youth Future Network (YFN) is transitioning from a platform to a protocol. Our mission for 2025 focuses on three core nodes: Liquidity Sovereignty, AI Co-Creation, and Cultural Archiving. We are building the infrastructure that allows every creator to own their IP and every merchant to scale globally without friction.",
    author: "YFN Official",
    authorId: "yfn_universe",
    date: "Just now",
    category: "NEWS",
    isOfficial: true,
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200&h=800&auto=format&fit=crop",
    isHot: true
  },
  {
    id: 401,
    title: "The Leather Ledger: 2025 Sourcing",
    excerpt: "Why the future of African luxury starts with ethical hide sovereignty.",
    content: "Luxury is moving away from the mass-produced toward the hyper-local. In this piece, Davina explores how Nigerian tanneries are outpacing European counterparts in texture and durability. We explore the high-fidelity sourcing nodes that power Davina Soles.",
    author: "Davina Soles",
    authorId: "davina_soles",
    date: "1d ago",
    category: "BUSINESS_INSIGHT",
    image: "https://images.unsplash.com/photo-1530519729491-acf50994c650?q=80&w=1200&h=800&auto=format&fit=crop",
    isTrending: true
  },
  {
    id: 1,
    title: "The 2025 Ledger: 10 Youths Defining the New Lagos",
    excerpt: "The authoritative selection of innovators rewriting the Nigerian success protocol.",
    content: "The landscape of Nigerian success is shifting from resource extraction to digital sovereignty...",
    author: "Zion Vance",
    authorId: "0xVANCE_82",
    date: "2h ago",
    category: "COMMUNITY_HUB",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1200&h=800&auto=format&fit=crop",
    isHot: true
  }
];

export const MOCK_POSTS: UserPost[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1529139572765-3974d3cf1905?q=80&w=600&h=600&auto=format&fit=crop",
    caption: "Designed this silk dress with the AI studio.",
    likes: 1205,
    comments: 42,
    isPrivate: false,
    isAIDesign: true,
    designStatus: 'trending'
  }
];

const USER_NODE_ID = "0xVANCE_82"; 
const canUseCloud = () => db !== null;

export const FirebaseService = {
  seedMarketplace: async () => {
    if (!canUseCloud()) return;
    try {
      const snapshot = await db.collection('marketplace_items').limit(1).get();
      if (snapshot.empty) {
        const batch = db.batch();
        MOCK_ITEMS.forEach(item => {
          const ref = db.collection('marketplace_items').doc(item.id.toString());
          batch.set(ref, item);
        });
        await batch.commit();
      }
    } catch (e) {}
  },

  fetchMarketplace: async (): Promise<MarketplaceItem[]> => {
    if (!canUseCloud()) return MOCK_ITEMS;
    try {
      const snapshot = await db.collection('marketplace_items').get();
      if (snapshot.empty) return MOCK_ITEMS;
      return snapshot.docs.map((doc: any) => doc.data() as MarketplaceItem);
    } catch (e) {
      return MOCK_ITEMS;
    }
  },

  addItemToMarketplace: async (item: MarketplaceItem) => {
    if (!canUseCloud()) {
       MOCK_ITEMS.unshift(item);
       return;
    }
    try {
      await db.collection('marketplace_items').doc(item.id.toString()).set(item);
    } catch (e) {}
  },

  syncUserNode: async (callback: (data: any) => void) => {
    const defaultData = { balance: 2450500.00, wishlist: [], recentlyViewed: [], promotedItems: [] };
    if (!canUseCloud()) {
      callback(defaultData);
      return () => {};
    }
    try {
      return db.collection('users').doc(USER_NODE_ID).onSnapshot((doc: any) => {
        if (doc.exists) callback(doc.data());
        else callback(defaultData);
      });
    } catch (e) {
      callback(defaultData);
      return () => {};
    }
  },

  updateUserField: async (field: string, value: any) => {
    if (!canUseCloud()) return;
    try {
      await db.collection('users').doc(USER_NODE_ID).update({ [field]: value });
    } catch (e) {}
  },

  addTransaction: async (tx: Transaction) => {
    if (!canUseCloud()) return;
    try {
      await db.collection('users').doc(USER_NODE_ID).collection('transactions').add({
        ...tx,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      const userRef = db.collection('users').doc(USER_NODE_ID);
      await db.runTransaction(async (transaction: any) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) return;
        const currentBalance = userDoc.data().balance || 0;
        const newBalance = tx.type === 'incoming' ? currentBalance + tx.amount : currentBalance - tx.amount;
        transaction.update(userRef, { balance: newBalance });
      });
    } catch (e) {}
  },

  fetchTransactions: async (callback: (txs: Transaction[]) => void) => {
    if (!canUseCloud()) { callback([]); return () => {}; }
    try {
      return db.collection('users').doc(USER_NODE_ID).collection('transactions')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot: any) => {
          callback(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        });
    } catch (e) { callback([]); return () => {}; }
  },

  fetchCollections: async (callback: (cols: Collection[]) => void) => {
    if (!canUseCloud()) { callback([]); return () => {}; }
    try {
      return db.collection('users').doc(USER_NODE_ID).collection('collections')
        .onSnapshot((snapshot: any) => {
          callback(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        });
    } catch (e) { callback([]); return () => {}; }
  },

  addCollection: async (name: string, itemIds: number[]) => {
    if (!canUseCloud()) return;
    try {
      await db.collection('users').doc(USER_NODE_ID).collection('collections').add({
        name, itemIds, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {}
  },

  updateCollection: async (colId: string, itemIds: number[]) => {
    if (!canUseCloud()) return;
    try {
      await db.collection('users').doc(USER_NODE_ID).collection('collections').doc(colId).update({ itemIds });
    } catch (e) {}
  }
};
