
// Import firebase alongside db to access FieldValue
import { db, firebase } from './firebase';
import { MarketplaceItem, Article, UserPost, Transaction, Collection } from '../types';

// Initial Seed Data for the Marketplace Node - Exported as MOCK_ITEMS
export const MOCK_ITEMS: MarketplaceItem[] = [
  {
    id: 1,
    name: "Premium Silk Agbada",
    category: "Apparel",
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
    description: "Hand-woven silk Agbada with modern embroidery patterns. Breathable and luxurious spatial asset."
  },
  {
    id: 2,
    name: "Canvas Tech Tote",
    category: "Bags",
    price: "₦120,000",
    numericPrice: 120000,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&h=1200&auto=format&fit=crop",
    model3d: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    coordinates: { x: 70, y: 15 },
    demandLevel: 'medium',
    supplyLevel: 'medium',
    isBargainable: true,
    minPrice: 100000,
    vendorRating: 4.5,
    vendorHandle: "@lagos_leather",
    allowReferral: true,
    referralFee: 5000,
    description: "Rugged canvas tote with padded laptop sleeve and artisanal brass zippers."
  },
  {
    id: 3,
    name: "Urban Kente Sneakers",
    category: "Footwear",
    price: "₦145,000",
    numericPrice: 145000,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800&h=1200&auto=format&fit=crop",
    coordinates: { x: 85, y: 80 },
    demandLevel: 'high',
    supplyLevel: 'medium',
    isBargainable: false,
    minPrice: 145000,
    vendorRating: 4.9,
    vendorHandle: "@kente_kicks",
    allowReferral: false,
    description: "Limited edition sneakers featuring authentic Kente patterns on a high-performance sole."
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "The Rise of Consumer-Created Design",
    excerpt: "How AI is allowing shoppers to become the next generation of fashion moguls.",
    content: "The market is shifting. We are no longer just buying what's on the shelf; we are designing it. With royalties now flowing back to authors, the power has truly returned to the people.",
    author: "Tunde Akerele",
    date: "2h ago",
    category: "Economy",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=1200&h=800&auto=format&fit=crop",
    isHot: true,
    isTrending: true
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

// Firebase Service Layer
const USER_NODE_ID = "0xVANCE_82"; 

// Safety Check to prevent noisy permission logs
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
        console.log("YFN: Marketplace Node Synchronized.");
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

  syncUserNode: async (callback: (data: any) => void) => {
    const defaultData = { balance: 2450500.00, wishlist: [], recentlyViewed: [], promotedItems: [] };
    if (!canUseCloud()) {
      callback(defaultData);
      return () => {};
    }
    
    try {
      return db.collection('users').doc(USER_NODE_ID).onSnapshot(
        (doc: any) => {
          if (doc.exists) callback(doc.data());
          else {
            db.collection('users').doc(USER_NODE_ID).set(defaultData).catch(() => {});
            callback(defaultData);
          }
        },
        (error: any) => callback(defaultData)
      );
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
        const newBalance = tx.type === 'incoming' 
          ? currentBalance + tx.amount 
          : currentBalance - tx.amount;
        transaction.update(userRef, { balance: newBalance });
      });
    } catch (e) {}
  },

  fetchTransactions: async (callback: (txs: Transaction[]) => void) => {
    if (!canUseCloud()) {
      callback([]);
      return () => {};
    }
    try {
      return db.collection('users').doc(USER_NODE_ID).collection('transactions')
        .orderBy('timestamp', 'desc')
        .onSnapshot(
          (snapshot: any) => {
            const txs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            callback(txs);
          },
          (error: any) => callback([])
        );
    } catch (e) {
      callback([]);
      return () => {};
    }
  },

  fetchCollections: async (callback: (cols: Collection[]) => void) => {
    if (!canUseCloud()) {
      callback([]);
      return () => {};
    }
    try {
      return db.collection('users').doc(USER_NODE_ID).collection('collections')
        .onSnapshot(
          (snapshot: any) => {
            const cols = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            callback(cols);
          },
          (error: any) => callback([])
        );
    } catch (e) {
      callback([]);
      return () => {};
    }
  },

  addCollection: async (name: string, itemIds: number[]) => {
    if (!canUseCloud()) return;
    try {
      await db.collection('users').doc(USER_NODE_ID).collection('collections').add({
        name,
        itemIds,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
