
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, Transaction, MarketplaceItem, Collection } from './types';
import { FirebaseService } from './lib/database';
import { LandingView } from './components/views/LandingView';
import { AuthView } from './components/views/AuthView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { NewsView } from './components/views/NewsView';
import { ChatsView } from './components/views/ChatsView';
import { ProfileView } from './components/views/ProfileView';
import { WalletView } from './components/views/WalletView';
import { initFirebase } from './lib/firebase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LANDING);
  const [initiallySelectedItem, setInitiallySelectedItem] = useState<MarketplaceItem | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [activeCloudMode, setActiveCloudMode] = useState<'active' | 'local' | 'connecting'>('connecting');
  
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tracking System
  const [activeTrackingTx, setActiveTrackingTx] = useState<Transaction | null>(null);
  
  // Toast System
  const toastTimeoutRef = useRef<number | null>(null);

  const [balance, setBalance] = useState<number>(2450500.00);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<MarketplaceItem[]>([]);
  const [wishlist, setWishlist] = useState<MarketplaceItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [promotedItems, setPromotedItems] = useState<MarketplaceItem[]>([]);
  const [userAvatar, setUserAvatar] = useState('https://picsum.photos/seed/vance/120/120');

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000) as unknown as number;
  };

  useEffect(() => {
    const handleModalToggle = (e: any) => {
      const open = e.detail.open;
      setIsModalOpen(open);
      setNavCollapsed(open);
    };
    window.addEventListener('yfn-modal-toggle' as any, handleModalToggle);
    return () => window.removeEventListener('yfn-modal-toggle' as any, handleModalToggle);
  }, []);

  const handlePageClick = useCallback(() => {
    if (isModalOpen && !navCollapsed) {
      setNavCollapsed(true);
    }
  }, [isModalOpen, navCollapsed]);

  useEffect(() => {
    const startBackend = async () => {
      const fb = await initFirebase();
      if (fb) {
        setIsFirebaseActive(true);
        setActiveCloudMode(fb.mode as 'active' | 'local' | 'connecting');
        
        if (fb.mode === 'active') {
          await FirebaseService.seedMarketplace();
          FirebaseService.syncUserNode((userData) => {
            setBalance(userData.balance ?? 2450500.00);
            setRecentlyViewed(userData.recentlyViewed || []);
            setWishlist(userData.wishlist || []);
            setPromotedItems(userData.promotedItems || []);
            setIsConnecting(false);
          });
          FirebaseService.fetchTransactions((txs) => setTransactions(txs));
          FirebaseService.fetchCollections((cols) => setCollections(cols));
        } else {
          setIsConnecting(false);
        }
      } else {
        setActiveCloudMode('local');
        setIsConnecting(false);
      }
    };
    startBackend();
  }, []);

  const addTransaction = (amount: number, label: string, type: 'incoming' | 'outgoing', category: Transaction['category'] = 'reward', extra?: Partial<Transaction>) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      type,
      amount,
      label,
      date: 'Just now',
      status: category === 'purchase' ? 'pending' : 'confirmed',
      category,
      ...extra
    };
    FirebaseService.addTransaction(newTx);
    
    if (activeCloudMode === 'local') {
      if (type === 'incoming') setBalance(prev => prev + amount);
      else setBalance(prev => prev - amount);
      setTransactions(prev => [newTx, ...prev]);
    }

    if (type === 'incoming') {
      showToast(`Node Credit: ${label}`, 'success');
    } else {
      showToast(`Order Synced: ${label}`, 'success');
    }
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(tx => tx.id === updatedTx.id ? updatedTx : tx));
    if (updatedTx.status === 'refunded') {
      setBalance(prev => prev + updatedTx.amount);
      showToast('Dispute Resolved: Refunded', 'info');
    } else if (updatedTx.status === 'released') {
      showToast('Funds Released to Merchant', 'success');
    }
  };

  const trackView = (item: MarketplaceItem) => {
    const updated = [item, ...recentlyViewed.filter(i => i.id !== item.id)].slice(0, 10);
    FirebaseService.updateUserField('recentlyViewed', updated);
    if (activeCloudMode === 'local') setRecentlyViewed(updated);
  };

  const toggleWishlist = (item: MarketplaceItem) => {
    const isPresent = wishlist.some(i => i.id === item.id);
    const updated = isPresent ? wishlist.filter(i => i.id !== item.id) : [item, ...wishlist];
    FirebaseService.updateUserField('wishlist', updated);
    if (activeCloudMode === 'local') setWishlist(updated);
    showToast(isPresent ? 'Removed from Wishlist' : 'Added to Wishlist', isPresent ? 'info' : 'success');
  };

  const promoteItem = (item: MarketplaceItem) => {
    if (promotedItems.some(i => i.id === item.id)) return;
    const updated = [...promotedItems, item];
    FirebaseService.updateUserField('promotedItems', updated);
    if (activeCloudMode === 'local') setPromotedItems(updated);
  };

  const addToCollection = (collectionId: string, itemId: number) => {
    const col = collections.find(c => c.id === collectionId);
    if (col && !col.itemIds.includes(itemId)) {
      const updatedIds = [...col.itemIds, itemId];
      FirebaseService.updateCollection(collectionId, updatedIds);
      if (activeCloudMode === 'local') {
        setCollections(prev => prev.map(c => c.id === collectionId ? {...c, itemIds: updatedIds} : c));
      }
      showToast(`Asset Curated in ${col.name}`, 'success');
    }
  };

  const createCollection = (name: string, itemId?: number) => {
    FirebaseService.addCollection(name, itemId ? [itemId] : []);
    if (activeCloudMode === 'local') {
      const newCol: Collection = { id: Math.random().toString(), name, itemIds: itemId ? [itemId] : [] };
      setCollections(prev => [...prev, newCol]);
    }
    showToast(`Mood Board '${name}' Initialized`, 'success');
    return "pending"; 
  };

  const handleViewProfile = (userId: string) => {
    setSelectedProfileId(userId);
    setCurrentView(ViewType.PUBLIC_PROFILE);
  };

  const handleVaultItemClick = (item: MarketplaceItem) => {
    setInitiallySelectedItem(item);
    setCurrentView(ViewType.MARKETPLACE);
  };

  const handleStartChat = (userId: string) => {
    setChatTargetId(userId);
    setCurrentView(ViewType.CHATS);
  };

  const handleTrackOrder = (tx: Transaction) => {
    setActiveTrackingTx(tx);
    setCurrentView(ViewType.MARKETPLACE);
    showToast(`Initializing Intercept Path: ${tx.label}`, 'info');
  };

  const formatNairaKobo = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amt);

  if (currentView === ViewType.LANDING) return <LandingView onEnter={() => setCurrentView(ViewType.AUTH)} />;
  if (currentView === ViewType.AUTH) return <AuthView onComplete={() => setCurrentView(ViewType.NEWS)} />;

  const NavButton = ({ view, children }: React.PropsWithChildren<{ view: ViewType }>) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => { setCurrentView(view); setInitiallySelectedItem(null); setSelectedProfileId(null); setChatTargetId(null); setActiveTrackingTx(null); }} 
        className={`relative flex-1 p-3 rounded-2xl transition-all spring-pop flex items-center justify-center ${isActive ? 'text-black' : 'text-gray-500 hover:text-white'}`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-white rounded-2xl shadow-xl z-0 animate-in fade-in zoom-in duration-300">
             <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full animate-ping-soft"></div>
          </div>
        )}
        <span className="relative z-10">{children}</span>
      </button>
    );
  };

  return (
    <div className={`min-h-screen relative flex flex-col bg-[#050505] transition-colors duration-1000`} onClick={handlePageClick}>
      <div className={`aura-glow top-0 left-0 ${currentView === ViewType.MARKETPLACE ? 'bg-amber-500' : currentView === ViewType.PROFILE || currentView === ViewType.PUBLIC_PROFILE ? 'bg-rose-500' : 'bg-teal-500'}`} />

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none w-full max-w-xs">
          <div className={`px-6 py-4 rounded-3xl shadow-2xl border flex items-center gap-4 animate-toast backdrop-blur-3xl ${
            toast.type === 'success' ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 
            toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
            'bg-white/10 border-white/20 text-white'
          }`}>
             <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-teal-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-white'}`}></div>
             <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{toast.message}</p>
          </div>
        </div>
      )}

      <header className="fixed top-8 inset-x-8 z-50 h-16 flex items-center justify-between pointer-events-none">
        <div onClick={() => { setCurrentView(ViewType.NEWS); setActiveTrackingTx(null); }} className="text-3xl font-black italic tracking-tighter cursor-pointer flex items-center gap-3 pointer-events-auto spring-pop">
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-xl text-xl not-italic font-black shadow-2xl">Y</div>
          <span className="text-white drop-shadow-md">YFN</span>
          <div className={`px-3 py-1 rounded-full flex items-center gap-2 ml-2 transition-all duration-500 border ${activeCloudMode === 'active' ? 'bg-[#039be5]/20 border-[#039be5]/40 text-[#039be5]' : 'bg-amber-500/20 border-amber-500/40 text-amber-500'}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
            <span className="text-[8px] font-black uppercase tracking-widest">{activeCloudMode}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => setCurrentView(ViewType.WALLET)} className="flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full hover:bg-white/10 transition-all shadow-xl spring-pop">
             <span className="text-sm font-black text-amber-500 tracking-tighter tabular-nums">{formatNairaKobo(balance)}</span>
             <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black">₦</div>
          </button>
          <div onClick={() => { setCurrentView(ViewType.PROFILE); setActiveTrackingTx(null); }} className="w-12 h-12 rounded-2xl border-2 border-white/10 overflow-hidden cursor-pointer shadow-2xl spring-pop hover:border-white/50 relative">
            <img src={userAvatar} className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 relative z-10">
        {currentView === ViewType.NEWS && <NewsView onQuote={() => {}} transactions={transactions} wishlist={wishlist} onViewProfile={handleViewProfile} />}
        {currentView === ViewType.MARKETPLACE && (
          <MarketplaceView balance={balance} initialItem={initiallySelectedItem} wishlist={wishlist} collections={collections} activeTrackingTx={activeTrackingTx}
            onReward={(amt, label) => addTransaction(amt, label, 'incoming', 'referral')} 
            onPurchase={(amt, label, item) => addTransaction(amt, label, 'outgoing', 'purchase', { itemCoordinates: item.coordinates })}
            onViewItem={trackView} onToggleWishlist={toggleWishlist} onAddToCollection={addToCollection} onCreateCollection={createCollection}
            onViewProfile={handleViewProfile} onPromoteItem={promoteItem} onRequestViewChange={(v) => setCurrentView(v)} />
        )}
        {currentView === ViewType.CHATS && <ChatsView initialContactId={chatTargetId} />}
        {(currentView === ViewType.PROFILE || currentView === ViewType.PUBLIC_PROFILE) && (
          <ProfileView 
            userId={selectedProfileId || undefined} recentlyViewed={recentlyViewed} wishlist={wishlist} collections={collections} promotedItems={promotedItems} transactions={transactions}
            onHistoryItemClick={handleVaultItemClick} onReward={(amt, label) => addTransaction(amt, label, 'incoming', 'royalty')}
            onUpdateTransaction={updateTransaction} onViewProfile={handleViewProfile} onStartChat={handleStartChat} onTrackOrder={handleTrackOrder}
            onAvatarChange={isSelf => isSelf ? (url) => setUserAvatar(url) : undefined}
          />
        )}
        {currentView === ViewType.WALLET && <WalletView balance={balance} transactions={transactions} onTransaction={addTransaction} />}
      </main>

      <nav className={`fixed bottom-10 z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${navCollapsed ? 'right-10 w-20 h-20 rounded-[2.5rem] bg-amber-500' : 'inset-x-8 h-20 bg-black/80 backdrop-blur-2xl rounded-full px-4 max-w-xl mx-auto border border-white/10 shadow-2xl'}`}>
        {navCollapsed ? (
          <button onClick={() => setNavCollapsed(false)} className="w-full h-full flex items-center justify-center text-black animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        ) : (
          <div className="flex justify-around items-center h-full w-full">
            <NavButton view={ViewType.NEWS}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg></NavButton>
            <NavButton view={ViewType.MARKETPLACE}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></NavButton>
            <NavButton view={ViewType.CHATS}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></NavButton>
            <NavButton view={ViewType.WALLET}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></NavButton>
            <NavButton view={ViewType.PROFILE}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></NavButton>
          </div>
        )}
      </nav>
    </div>
  );
};

export default App;
