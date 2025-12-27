
import React, { useState } from 'react';
import { MOCK_POSTS, MOCK_ITEMS } from '../../lib/database';
import { UserPost, MarketplaceItem, Collection } from '../../types';
import { VendorUploadModal } from '../ui/VendorUploadModal';

interface ProfileViewProps {
  recentlyViewed: MarketplaceItem[];
  wishlist: MarketplaceItem[];
  collections: Collection[];
  promotedItems: MarketplaceItem[];
  onHistoryItemClick: (item: MarketplaceItem) => void;
}

type PersonalTab = 'stream' | 'designs' | 'collections';
type MerchantTab = 'inventory' | 'storefront';

export const ProfileView: React.FC<ProfileViewProps> = ({ recentlyViewed, wishlist, collections, promotedItems, onHistoryItemClick }) => {
  const [isVendorMode, setIsVendorMode] = useState(false);
  const [personalTab, setPersonalTab] = useState<PersonalTab>('stream');
  const [merchantTab, setMerchantTab] = useState<MerchantTab>('inventory');
  const [hasPermission, setHasPermission] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  const handleSyncCloud = () => {
    setSyncingCloud(true);
    setTimeout(() => {
      setSyncingCloud(false);
      setHasPermission(true);
      alert("Cloud Identity Synced: Firebase Node #82 is now active.");
    }, 1500);
  };

  const archivalPosts = MOCK_POSTS.filter(p => !p.isAIDesign);
  const aiDesigns = MOCK_POSTS.filter(p => p.isAIDesign);

  const getCollectionPreview = (itemIds: number[]) => {
    const firstItemId = itemIds[0];
    const item = MOCK_ITEMS.find(i => i.id === firstItemId);
    return item?.image || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&h=400&auto=format&fit=crop";
  };

  const DesignStatusBadge = ({ status }: { status: UserPost['designStatus'] }) => {
    switch (status) {
      case 'trending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-widest">High Heat</span>
          </div>
        );
      case 'matched':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white rounded-full shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            <span className="text-[10px] font-black uppercase tracking-widest">Matched</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-400 rounded-full border border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest">Node Draft</span>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out ${isVendorMode ? 'bg-black' : 'bg-transparent'}`}>
      <div className="max-w-xl mx-auto px-6 py-10 pb-44 space-y-12">
        
        {/* Identity Prism Switch */}
        <div className="flex justify-center sticky top-32 z-40 mb-12">
          <div className="bg-white/5 backdrop-blur-2xl p-1.5 rounded-3xl border border-white/10 flex gap-1 shadow-2xl">
            <button 
              onClick={() => setIsVendorMode(false)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all spring-pop ${!isVendorMode ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              Creator Node
            </button>
            <button 
              onClick={() => setIsVendorMode(true)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all spring-pop ${isVendorMode ? 'bg-amber-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              Vendor Mode
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className={`absolute -inset-4 rounded-[3rem] blur-2xl opacity-20 transition-all duration-1000 ${isVendorMode ? 'bg-amber-500' : 'bg-white'}`}></div>
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/10 overflow-hidden relative shadow-2xl spring-pop cursor-pointer">
              <img src="https://picsum.photos/seed/vance/300/300" className="w-full h-full object-cover" alt="Profile" />
            </div>
            {hasPermission && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#039be5] text-white rounded-2xl flex items-center justify-center border-4 border-black shadow-xl animate-bounce">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black italic tracking-tighter">Zion Vance</h2>
            <div className="flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Node ID: 82.0x.VANCE</span>
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
              <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Creative Rank: A+</span>
            </div>
          </div>

          {!hasPermission ? (
            <button 
              onClick={handleSyncCloud}
              disabled={syncingCloud}
              className="px-8 py-3 bg-[#039be5]/10 border border-[#039be5]/30 rounded-full flex items-center gap-3 spring-pop hover:bg-[#039be5]/20 transition-all group"
            >
              <div className={`w-2 h-2 rounded-full bg-[#039be5] ${syncingCloud ? 'animate-ping' : 'animate-pulse'}`}></div>
              <span className="text-[9px] font-black uppercase text-[#039be5] tracking-widest group-hover:tracking-[0.3em] transition-all">
                {syncingCloud ? 'Connecting to Firebase...' : 'Sync Cloud Identity'}
              </span>
            </button>
          ) : (
            <div className="bg-teal-500/10 border border-teal-500/30 px-6 py-2 rounded-full">
               <span className="text-[9px] font-black uppercase text-teal-500 tracking-widest">Firebase Identity Verified</span>
            </div>
          )}
        </div>

        {/* Tabs and Grid */}
        <div className="space-y-8">
          <div className="flex gap-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
            {!isVendorMode ? (
              (['stream', 'designs', 'collections'] as PersonalTab[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setPersonalTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative ${personalTab === tab ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab}
                  {personalTab === tab && <div className="absolute bottom-0 inset-x-0 h-1 bg-white rounded-full animate-in fade-in zoom-in"></div>}
                </button>
              ))
            ) : (
              (['inventory', 'storefront'] as MerchantTab[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setMerchantTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative ${merchantTab === tab ? 'text-amber-500' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab}
                  {merchantTab === tab && <div className="absolute bottom-0 inset-x-0 h-1 bg-amber-500 rounded-full animate-in fade-in zoom-in"></div>}
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Contextual Grid Rendering */}
            {!isVendorMode ? (
              personalTab === 'stream' ? (
                archivalPosts.map(post => (
                  <div key={post.id} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer relative shimmer-titanium">
                    <img src={post.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" alt="post" />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black text-white">❤️ {post.likes}</span>
                    </div>
                  </div>
                ))
              ) : personalTab === 'designs' ? (
                aiDesigns.map(post => (
                  <div key={post.id} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer relative group">
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="design" />
                    <div className="absolute top-4 left-4">
                      <DesignStatusBadge status={post.designStatus} />
                    </div>
                  </div>
                ))
              ) : (
                collections.map(col => (
                  <div key={col.id} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-2 space-y-2 group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-900">
                      <img src={getCollectionPreview(col.itemIds)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={col.name} />
                    </div>
                    <div className="px-2 pb-2">
                       <p className="text-[10px] font-black text-white italic truncate">{col.name}</p>
                       <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{col.itemIds.length} Assets</p>
                    </div>
                  </div>
                ))
              )
            ) : (
              merchantTab === 'inventory' ? (
                <>
                  <div 
                    onClick={() => setIsUploading(true)}
                    className="aspect-square rounded-3xl border-2 border-dashed border-amber-500/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-amber-500/5 hover:border-amber-500 transition-all spring-pop"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Deploy Asset</span>
                  </div>
                  {/* Mock Inventory */}
                  {MOCK_ITEMS.slice(0, 2).map(item => (
                    <div key={item.id} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-amber-500/20 p-2 space-y-2 group cursor-pointer hover:border-amber-500 transition-all">
                      <img src={item.image} className="aspect-square w-full rounded-2xl object-cover" alt={item.name} />
                      <div className="px-2">
                         <p className="text-[10px] font-black text-amber-500 italic truncate">{item.name}</p>
                         <p className="text-[8px] font-bold text-gray-500 uppercase">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                promotedItems.map(item => (
                  <div key={item.id} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-teal-500/20 p-2 space-y-2 group cursor-pointer hover:border-teal-500 transition-all">
                    <img src={item.image} className="aspect-square w-full rounded-2xl object-cover" alt={item.name} />
                    <div className="absolute top-4 right-4 bg-teal-500 text-white p-1.5 rounded-lg shadow-xl">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <div className="px-2">
                       <p className="text-[10px] font-black text-teal-400 italic truncate">{item.name}</p>
                       <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Royalty Node Active</p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Global Stats Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center space-y-2 group hover:bg-white/10 transition-all">
             <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Followers</p>
             <p className="text-3xl font-black italic tracking-tighter tabular-nums">1.2M</p>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center space-y-2 group hover:bg-white/10 transition-all">
             <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">Aura Score</p>
             <p className="text-3xl font-black italic tracking-tighter tabular-nums text-amber-500">99.8</p>
          </div>
        </div>
      </div>

      {isUploading && <VendorUploadModal onClose={() => setIsUploading(false)} />}
    </div>
  );
};
