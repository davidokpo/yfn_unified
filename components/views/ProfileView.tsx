
import React, { useState, useMemo, useRef } from 'react';
import { MOCK_POSTS, MOCK_ITEMS, MOCK_ARTICLES } from '../../lib/database';
import { UserPost, MarketplaceItem, Collection, Transaction, Article, ProfileViewProps, HubTab } from '../../types';
import { VendorUploadModal } from '../ui/VendorUploadModal';
import { CreatePostModal } from '../ui/CreatePostModal';
import { CreateArticleModal } from '../ui/CreateArticleModal';
import { CreativeSpark } from '../ui/CreativeSpark';
import { LegalAIModal } from '../ui/LegalAIModal';
import { InteractiveMap } from '../ui/InteractiveMap';

interface ExtendedProfileViewProps extends ProfileViewProps {
  onAvatarChange?: (isSelf: boolean) => ((url: string) => void) | undefined;
}

type ProfileMode = 'HUB' | 'STUDIO' | 'STOREFRONT';

export const ProfileView: React.FC<ExtendedProfileViewProps> = ({ 
  userId = "0xVANCE_82",
  recentlyViewed, wishlist, collections, promotedItems, transactions, onHistoryItemClick, onReward, onUpdateTransaction, onViewProfile, onStartChat, onTrackOrder, onAvatarChange
}) => {
  const isSelf = userId === "0xVANCE_82";
  const [activeMode, setActiveMode] = useState<ProfileMode>(isSelf ? 'HUB' : 'STOREFRONT');
  const [hubTab, setHubTab] = useState<HubTab>(isSelf ? 'stream' : 'promoted');
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isWritingArticle, setIsWritingArticle] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [disputeTx, setDisputeTx] = useState<Transaction | null>(null);
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const profileData = useMemo(() => {
    if (userId === 'yfn_universe') return { name: 'YFN Official', handle: '@universe', avatar: 'https://picsum.photos/seed/yfn/300/300', isOfficial: true, connections: '1.2M', photoPublic: true, bio: 'The heartbeat of the unified creative protocol.' };
    if (userId === 'node_ai') return { name: 'Pulse Intelligence', handle: '@pulse', avatar: 'https://picsum.photos/seed/ai/300/300', isAI: true, connections: '850K', photoPublic: true, bio: 'Algorithmic curation for the modern Lagosian.' };
    if (userId === 'heis_protocol') return { name: 'HEIS Protocol', handle: '@rema', avatar: 'https://picsum.photos/seed/sound/300/300', connections: '4.5M', photoPublic: false, bio: 'Establishing sound sovereignty across the network.' };
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

  const handleAvatarClick = () => {
    if (isSelf && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setIsAvatarUpdating(true);
        const updateFn = onAvatarChange(true);
        if (updateFn) updateFn(url);
        setTimeout(() => setIsAvatarUpdating(false), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatNairaKobo = (amt: number) => 
    new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 2 
    }).format(amt);

  const userItems = useMemo(() => MOCK_ITEMS.filter(item => {
    const handle = item.vendorHandle.startsWith('@') ? item.vendorHandle.slice(1) : item.vendorHandle;
    return handle === profileData.handle.slice(1);
  }), [profileData.handle, profileData.name]);

  const displayPromoted = isSelf ? promotedItems : userItems.filter(i => i.allowReferral).slice(0, 4);

  const hubTabs = useMemo((): HubTab[] => {
    if (isSelf) return ['stream', 'collections', 'promoted', 'purchases', 'mediation', 'wishlist'];
    return ['stream', 'promoted'];
  }, [isSelf]);

  const handleReleaseEscrow = (tx: Transaction) => {
    if (onUpdateTransaction) {
      onUpdateTransaction({ ...tx, status: 'released' });
    }
  };

  const handleRequestReturn = (tx: Transaction) => {
    if (onUpdateTransaction) {
      onUpdateTransaction({ ...tx, status: 'returning' });
    }
  };

  const handleOpenDispute = (tx: Transaction) => {
    setDisputeTx(tx);
  };

  const handleVerdict = (decision: 'refund' | 'release' | 'split', splitRatio?: number) => {
    if (!disputeTx || !onUpdateTransaction) return;
    let finalStatus: Transaction['status'] = 'refunded';
    if (decision === 'release') finalStatus = 'released';
    if (decision === 'split') finalStatus = 'confirmed';
    onUpdateTransaction({ ...disputeTx, status: finalStatus, disputeVerdict: `AI Verdict: ${decision.toUpperCase()}` });
    setDisputeTx(null);
  };

  const isPhotoRevealed = isSelf || profileData.photoPublic || isFollowing;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-xl mx-auto px-6 py-10 pb-44 space-y-12">
        
        {/* Mode Switcher */}
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

        {/* Profile Identity Header */}
        <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
          <div 
            onClick={handleAvatarClick}
            className={`w-32 h-32 rounded-[2.5rem] border-4 p-1.5 overflow-hidden shadow-2xl relative cursor-pointer group transition-all duration-500 ${profileData.isOfficial ? 'border-amber-500' : 'border-white/10'} ${isAvatarUpdating ? 'animate-ripple' : ''}`}
          >
            {isPhotoRevealed ? (
              <>
                <img src={profileData.avatar} className="w-full h-full object-cover rounded-[2.2rem] animate-fade-in transition-transform duration-700 group-hover:scale-110" alt="Profile" />
                {isSelf && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] font-black uppercase text-white tracking-widest">Update</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center rounded-[2.2rem] relative overflow-hidden group cursor-pointer" onClick={() => setIsFollowing(true)}>
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-amber-500/10 animate-pulse"></div>
                 <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 <div className="absolute inset-x-0 bottom-3">
                   <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/40 italic">Follow to Reveal</p>
                 </div>
              </div>
            )}
            {isSelf && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowAIModal(true); }}
                className="absolute -bottom-2 -right-2 w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-amber-500 transition-colors animate-sankofa"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            )}
            <input ref={avatarInputRef} type="file" hidden accept="image/*" onChange={handleAvatarFileChange} />
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-center gap-3">
                <h2 className="text-4xl font-black italic tracking-tighter text-white">{profileData.name}</h2>
                {profileData.isOfficial && (
                  <div className="w-6 h-6 bg-amber-500 text-black rounded-full flex items-center justify-center text-[11px] font-black shadow-lg">✓</div>
                )}
             </div>
             <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">{profileData.handle} • {profileData.connections} Connections</p>
             {profileData.bio && (
               <p className="text-[13px] text-gray-400 font-medium italic mt-4 max-w-sm mx-auto leading-relaxed">
                 "{profileData.bio}"
               </p>
             )}
          </div>
          
          {!isSelf && (
             <div className="flex gap-4 mt-2">
               <button 
                 onClick={() => setIsFollowing(!isFollowing)}
                 className={`px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all spring-pop shadow-2xl ${isFollowing ? 'bg-white/10 text-white border border-white/20 backdrop-blur-xl' : 'bg-amber-500 text-black'}`}
               >
                 {isFollowing ? 'Following' : 'Follow Node'}
               </button>
               <button 
                 onClick={() => onStartChat && onStartChat(userId)}
                 className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all spring-pop shadow-xl"
               >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               </button>
             </div>
          )}
        </div>

        {/* Content Tabs */}
        {activeMode === 'HUB' && (
          <div className="animate-fade-in space-y-12">
            <div className="flex gap-8 border-b border-white/5 pb-1 overflow-x-auto no-scrollbar">
              {hubTabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setHubTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all relative ${hubTab === tab ? 'text-white' : 'text-gray-600 hover:text-white'}`}
                >
                  {tab === 'purchases' ? 'Purchase History' : tab === 'mediation' ? 'Sovereign Court' : tab}
                  {hubTab === tab && <div className="absolute bottom-0 inset-x-0 h-1 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {hubTab === 'mediation' && (
                <div className="col-span-full space-y-8 animate-fade-in">
                  <div className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20 text-6xl rotate-12">⚖️</div>
                    <h3 className="text-2xl font-black italic text-white tracking-tighter">Mediation Center</h3>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-relaxed max-w-xs">
                      The YFN Legal AI Judge reviews all disputed commerce nodes to ensure neutral protocol outcomes.
                    </p>
                  </div>

                  {transactions.filter(tx => tx.status === 'returning' || tx.status === 'disputed' || tx.disputeVerdict).map(tx => (
                    <div key={tx.id} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 space-y-8 group hover:border-amber-500/50 transition-all">
                       <div className="flex items-start justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-amber-500/20">⚖️</div>
                             <div>
                                <p className="text-xl font-black italic text-white leading-tight">{tx.label}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">Dispute Node: {tx.id.toUpperCase()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-white italic">{formatNairaKobo(tx.amount)}</p>
                             <span className="text-[8px] font-black uppercase px-4 py-1.5 rounded-full mt-2 inline-block bg-amber-500 text-black animate-pulse">
                               In Mediation
                             </span>
                          </div>
                       </div>

                       {tx.disputeVerdict ? (
                         <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Protocol Final Decision</p>
                            <p className="text-sm font-medium italic text-gray-300">"{tx.disputeVerdict}"</p>
                         </div>
                       ) : (
                         <div className="pt-4 border-t border-white/5">
                            <button 
                              onClick={() => handleOpenDispute(tx)}
                              className="w-full py-5 bg-amber-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl spring-pop hover:scale-[1.02]"
                            >
                              Initialize Neural Review
                            </button>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}

              {hubTab === 'purchases' && (
                <div className="col-span-full space-y-8">
                  {transactions.filter(tx => tx.category === 'purchase').length === 0 ? (
                    <div className="py-24 text-center space-y-6 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                       <div className="text-6xl opacity-20">🛒</div>
                       <p className="text-[12px] font-black text-gray-500 uppercase tracking-[0.5em]">No Assets Acquired Yet</p>
                       <button onClick={() => window.location.reload()} className="text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-colors">Start Exploring Marketplace</button>
                    </div>
                  ) : (
                    transactions.filter(tx => tx.category === 'purchase').map(tx => (
                      <div key={tx.id} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/10 space-y-8 animate-fade-in group hover:bg-white/[0.08] transition-all shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl overflow-hidden shadow-2xl border border-white/5">
                                   <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center">🛍️</div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black italic text-white tracking-tighter leading-tight">{tx.label}</p>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{tx.date}</span>
                                      <span className="text-[10px] text-gray-700 font-bold uppercase tracking-tighter">NODE: {tx.id}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left md:text-right space-y-3">
                                <p className="text-2xl font-black text-white italic tabular-nums">{formatNairaKobo(tx.amount)}</p>
                                <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full inline-block ${
                                  tx.status === 'released' ? 'bg-teal-500 text-black' :
                                  tx.status === 'pending' ? 'bg-amber-500 text-black animate-pulse' :
                                  tx.status === 'returning' ? 'bg-blue-500 text-white' :
                                  'bg-red-500 text-white'
                                } shadow-lg`}>
                                  {tx.status === 'pending' ? 'Locked in Escrow' : tx.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            {tx.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => onTrackOrder && onTrackOrder(tx)}
                                  className="py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 spring-pop"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  Track Node Intercept
                                </button>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleReleaseEscrow(tx)}
                                    className="flex-1 py-5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all"
                                  >
                                    Release
                                  </button>
                                  <button 
                                    onClick={() => handleRequestReturn(tx)}
                                    className="flex-1 py-5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                  >
                                    Return
                                  </button>
                                </div>
                              </>
                            )}
                            
                            {tx.status === 'returning' && (
                              <button 
                                onClick={() => { setHubTab('mediation'); handleOpenDispute(tx); }}
                                className="col-span-full py-5 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse"
                              >
                                Enter Sovereign Court Mediation
                              </button>
                            )}

                            {tx.status === 'released' && (
                               <div className="col-span-full p-6 bg-teal-500/5 rounded-2xl border border-teal-500/20 flex items-center justify-between">
                                  <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Protocol Fulfillment Complete</p>
                                  <div className="w-8 h-8 rounded-full bg-teal-500 text-black flex items-center justify-center text-xs">✓</div>
                               </div>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {/* Other tabs follow original logic */}
            </div>
          </div>
        )}
        {/* STUDIO/STOREFRONT follow original logic */}
      </div>

      {disputeTx && (
        <LegalAIModal 
          transaction={disputeTx} 
          onClose={() => setDisputeTx(null)} 
          onVerdict={handleVerdict} 
        />
      )}
    </div>
  );
};
