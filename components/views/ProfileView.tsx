
import React, { useState, useMemo } from 'react';
import { MOCK_POSTS, MOCK_ITEMS, MOCK_ARTICLES } from '../../lib/database';
import { UserPost, MarketplaceItem, Collection, Transaction, Article, ProfileViewProps } from '../../types';
import { VendorUploadModal } from '../ui/VendorUploadModal';
import { CreatePostModal } from '../ui/CreatePostModal';
import { CreateArticleModal } from '../ui/CreateArticleModal';
import { CreativeSpark } from '../ui/CreativeSpark';

type ProfileMode = 'HUB' | 'STUDIO' | 'STOREFRONT';
type HubTab = 'stream' | 'collections' | 'promoted' | 'purchases' | 'wishlist';

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  userId = "0xVANCE_82",
  recentlyViewed, wishlist, collections, promotedItems, transactions, onHistoryItemClick, onReward, onViewProfile
}) => {
  const isSelf = userId === "0xVANCE_82";
  const [activeMode, setActiveMode] = useState<ProfileMode>(isSelf ? 'HUB' : 'STOREFRONT');
  const [hubTab, setHubTab] = useState<HubTab>('stream');
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isWritingArticle, setIsWritingArticle] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const profileData = useMemo(() => {
    if (userId === 'yfn_universe') return { name: 'YFN Official', handle: '@universe', avatar: 'https://picsum.photos/seed/yfn/300/300', isOfficial: true, connections: '1.2M', photoPublic: true };
    if (userId === 'node_ai') return { name: 'Pulse Intelligence', handle: '@pulse', avatar: 'https://picsum.photos/seed/ai/300/300', isAI: true, connections: '850K', photoPublic: true };
    if (userId === 'heis_protocol') return { name: 'HEIS Protocol', handle: '@rema', avatar: 'https://picsum.photos/seed/sound/300/300', connections: '4.5M', photoPublic: false };
    if (userId === 'davina_soles') return { 
      name: 'Davina Soles', 
      handle: '@davina_soles', 
      avatar: 'https://picsum.photos/seed/davina/300/300', 
      connections: '85K', 
      bio: 'Artisanal leathercraft and luxury spatial assets.', 
      photoPublic: false 
    };
    return { name: 'Zion Vance', handle: '@vance', avatar: 'https://picsum.photos/seed/vance/300/300', connections: '12K', bio: 'Creative technologist and sovereign designer.', photoPublic: true };
  }, [userId]);

  const userArticles = useMemo(() => MOCK_ARTICLES.filter(a => a.authorId === userId), [userId]);
  
  const userItems = useMemo(() => MOCK_ITEMS.filter(item => {
    const handle = item.vendorHandle.startsWith('@') ? item.vendorHandle.slice(1) : item.vendorHandle;
    return handle === profileData.handle.slice(1);
  }), [profileData.handle]);

  const displayPromoted = isSelf ? promotedItems : userItems.filter(i => i.allowReferral).slice(0, 4);

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amt);

  const isPhotoRevealed = isSelf || profileData.photoPublic || isFollowing;

  const hubTabs = useMemo(() => {
    if (isSelf) return ['stream', 'collections', 'promoted', 'purchases', 'wishlist'];
    return ['stream', 'promoted'];
  }, [isSelf]);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-xl mx-auto px-6 py-10 pb-44 space-y-12">
        
        {/* Role Multi-Switcher */}
        <div className="flex justify-center sticky top-32 z-40 mb-12">
          <div className="bg-white/5 backdrop-blur-2xl p-1.5 rounded-[2rem] border border-white/10 flex gap-1 shadow-2xl">
            {(['HUB', 'STUDIO', 'STOREFRONT'] as ProfileMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all spring-pop ${activeMode === mode ? 'bg-white text-black shadow-xl scale-105' : 'text-gray-500 hover:text-white'}`}
              >
                {mode === 'HUB' ? (isSelf ? 'User Hub' : 'Profile') : mode === 'STUDIO' ? 'Creative Studio' : 'Storefront'}
              </button>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-28 h-28 rounded-[2rem] border-4 p-1 overflow-hidden shadow-2xl relative ${profileData.isOfficial ? 'border-amber-500' : 'border-white/10'}`}>
            {isPhotoRevealed ? (
              <img src={profileData.avatar} className="w-full h-full object-cover rounded-[1.8rem] animate-fade-in" alt="Profile" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center rounded-[1.8rem] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-amber-500/10 animate-pulse"></div>
                 <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 <div className="absolute inset-x-0 bottom-2">
                   <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/40 italic">Follow to View</p>
                 </div>
              </div>
            )}
            {isSelf && (
              <button 
                onClick={() => setShowAIModal(true)}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-xl hover:bg-amber-500 transition-colors animate-sankofa"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            )}
          </div>
          <div className="space-y-1">
             <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-black italic tracking-tighter text-white">{profileData.name}</h2>
                {profileData.isOfficial && <span className="w-5 h-5 bg-amber-500 text-black rounded-full flex items-center justify-center text-[10px] font-black">✓</span>}
             </div>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profileData.handle} • {profileData.connections} Connections</p>
             {profileData.bio && <p className="text-[12px] text-gray-400 font-medium italic mt-2">"{profileData.bio}"</p>}
          </div>
          
          {!isSelf && (
             <div className="flex gap-4 mt-4">
               <button 
                 onClick={() => setIsFollowing(!isFollowing)}
                 className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white border border-white/20' : 'bg-amber-500 text-black shadow-xl'}`}
               >
                 {isFollowing ? 'Following' : 'Follow'}
               </button>
               <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white spring-pop">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </button>
             </div>
          )}
        </div>

        {/* HUB Content */}
        {activeMode === 'HUB' && (
          <div className="animate-fade-in space-y-12">
            <div className="flex gap-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
              {hubTabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setHubTab(tab as HubTab)}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative ${hubTab === tab ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab === 'promoted' && !isSelf ? 'Picks' : tab}
                  {hubTab === tab && <div className="absolute bottom-0 inset-x-0 h-1 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {hubTab === 'stream' && (
                MOCK_POSTS.length > 0 ? MOCK_POSTS.map(post => (
                  <div key={post.id} className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative group bg-gray-900">
                    <img src={post.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt="post" />
                  </div>
                )) : <div className="col-span-full py-20 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">No public broadcasts.</div>
              )}
              
              {hubTab === 'promoted' && (
                displayPromoted.length > 0 ? displayPromoted.map(item => (
                  <div key={item.id} onClick={() => onHistoryItemClick(item)} className="aspect-[4/5] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all p-3 flex flex-col gap-4">
                     <div className="relative flex-1 rounded-2xl overflow-hidden bg-gray-900">
                        <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={item.name} />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                          {isSelf ? `+${formatNaira(item.referralFee || 0)}` : 'TOP PICK'}
                        </div>
                     </div>
                     <div className="px-2 pb-2">
                        <p className="text-[11px] font-black text-white italic truncate">{item.name}</p>
                        {!isSelf && <p className="text-[7px] font-black text-amber-500 uppercase mt-1">Recommended</p>}
                     </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No active picks</p>
                  </div>
                )
              )}
              
              {isSelf && hubTab === 'collections' && collections.map(col => (
                <div key={col.id} className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-2 space-y-2 group cursor-pointer hover:bg-white/10 transition-all">
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-900">
                    <img src={MOCK_ITEMS.find(i => col.itemIds.includes(i.id))?.image || "https://picsum.photos/seed/col/300/300"} className="w-full h-full object-cover" alt={col.name} />
                  </div>
                  <p className="text-[10px] font-black text-white italic truncate px-2">{col.name}</p>
                </div>
              ))}

              {isSelf && hubTab === 'wishlist' && (
                wishlist.length > 0 ? wishlist.map(item => (
                   <div key={item.id} onClick={() => onHistoryItemClick(item)} className="aspect-[4/5] bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all p-3 flex flex-col gap-4">
                     <div className="relative flex-1 rounded-2xl overflow-hidden bg-gray-900">
                        <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt={item.name} />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">Saved</div>
                     </div>
                     <div className="px-2 pb-2">
                        <p className="text-[11px] font-black text-white italic truncate">{item.name}</p>
                     </div>
                  </div>
                )) : <div className="col-span-full py-20 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Wishlist is empty.</div>
              )}

              {isSelf && hubTab === 'purchases' && transactions.filter(tx => tx.category === 'purchase').map(tx => (
                <div key={tx.id} className="col-span-full bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl">🛍️</div>
                      <div>
                         <p className="text-xs font-black text-white">{tx.label}</p>
                         <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{tx.date}</p>
                      </div>
                   </div>
                   <p className="text-sm font-black text-white italic">-{formatNaira(tx.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDIO Content */}
        {activeMode === 'STUDIO' && (
          <div className="animate-fade-in space-y-12">
            {isSelf && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-teal-500/5 p-10 rounded-[3rem] border border-teal-500/10 flex flex-col justify-between items-start space-y-8">
                    <div>
                      <h3 className="text-2xl font-black italic text-white tracking-tighter">Creative Station</h3>
                      <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mt-1">Design Studio Node</p>
                    </div>
                    <button onClick={() => setIsWritingArticle(true)} className="w-full px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl spring-pop hover:bg-teal-500 hover:text-white transition-all">Draft Feature</button>
                </div>
                <div className="bg-amber-500/5 p-10 rounded-[3rem] border border-amber-500/10 flex flex-col justify-between items-start space-y-8">
                    <div className="flex justify-between w-full">
                      <h3 className="text-2xl font-black italic text-white tracking-tighter">Creative Spark</h3>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center animate-sankofa"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                    </div>
                    <button onClick={() => setShowAIModal(true)} className="w-full px-8 py-4 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl spring-pop hover:bg-white transition-all">Launch Engine</button>
                </div>
              </div>
            )}

            <div className="flex gap-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
              <button className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative text-teal-400`}>
                Published Features
                <div className="absolute bottom-0 inset-x-0 h-1 bg-teal-400 rounded-full"></div>
              </button>
            </div>

            <div className="space-y-6">
              {userArticles.length > 0 ? userArticles.map(article => (
                <div key={article.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex gap-6 items-center group cursor-pointer hover:bg-white/[0.08] transition-all">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-900 flex-shrink-0">
                    <img src={article.image} className="w-full h-full object-cover" alt={article.title} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black italic text-white leading-tight">{article.title}</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{article.category} • {article.date}</p>
                  </div>
                  <div className="text-[10px] font-black text-teal-400">Read →</div>
                </div>
              )) : <div className="py-20 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">No published features.</div>}
            </div>
          </div>
        )}

        {/* STOREFRONT Content */}
        {activeMode === 'STOREFRONT' && (
          <div className="animate-fade-in space-y-12">
            <div className="flex justify-between items-center bg-amber-500/5 p-10 rounded-[3rem] border border-amber-500/10">
               <div className="max-w-[60%]">
                  <h3 className="text-2xl font-black italic text-white tracking-tighter">{isSelf ? 'My Store' : `${profileData.name}'s Shop`}</h3>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Authorized Merchant</p>
               </div>
               {isSelf && (
                 <button onClick={() => setIsUploading(true)} className="px-8 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl spring-pop hover:bg-amber-500 hover:text-black transition-all">
                   List Item
                 </button>
               )}
            </div>

            <div className="grid grid-cols-2 gap-6">
               {userItems.length > 0 ? userItems.map(item => (
                 <div key={item.id} onClick={() => onHistoryItemClick(item)} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 border border-amber-500/20 p-2 group hover:border-amber-500 transition-all cursor-pointer flex flex-col">
                    <div className="aspect-square w-full rounded-[2rem] overflow-hidden mb-3">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                    </div>
                    <div className="px-3 flex-1 flex flex-col justify-between pb-2">
                       <p className="text-[11px] font-black text-white italic truncate">{item.name}</p>
                       <p className="text-[10px] font-black text-amber-500 mt-1">{formatNaira(item.numericPrice)}</p>
                    </div>
                 </div>
               )) : <div className="col-span-full py-20 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">No active listings.</div>}
            </div>
          </div>
        )}

      </div>

      {isUploading && <VendorUploadModal onClose={() => setIsUploading(false)} onSuccess={() => setIsUploading(false)} />}
      {isCreatingPost && <CreatePostModal onClose={() => setIsCreatingPost(false)} onPost={() => {}} />}
      {isWritingArticle && <CreateArticleModal onClose={() => setIsWritingArticle(false)} onPost={() => {}} />}
      {showAIModal && <CreativeSpark onClose={() => setShowAIModal(false)} onReward={onReward} />}
    </div>
  );
};
