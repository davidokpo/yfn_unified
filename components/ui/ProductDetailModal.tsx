
import React, { useState } from 'react';
import { MarketplaceItem, Collection } from '../../types';
import { AddToCollectionModal } from './AddToCollectionModal';

// Use a local constant with 'as any' for custom elements to avoid shadowing or breaking the global JSX namespace
const ModelViewer = 'model-viewer' as any;

interface ProductDetailModalProps {
  item: MarketplaceItem;
  collections: Collection[];
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onClose: () => void;
  onTryOn: () => void;
  onBargain: () => void;
  onPromote: () => void;
  onBuy: () => void;
  onAddToCollection: (collectionId: string, itemId: number) => void;
  onCreateCollection: (name: string, itemId: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  item, collections, isWishlisted, onToggleWishlist, onClose, onTryOn, onBargain, onPromote, onBuy, onAddToCollection, onCreateCollection
}) => {
  const [showShareHub, setShowShareHub] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const handleCopyLink = () => {
    const dummyLink = `https://yfn.app/vault/${item.id}`;
    navigator.clipboard.writeText(dummyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromoteClick = () => {
    const refId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const refLink = `https://yfn.app/r/${refId}/${item.id}`;
    
    navigator.clipboard.writeText(refLink);
    
    setPromoted(true);
    onPromote(); 
    
    setTimeout(() => setPromoted(false), 3000);
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: '💬', color: 'bg-[#25D366]' },
    { name: 'X / Twitter', icon: '𝕏', color: 'bg-black' },
    { name: 'Instagram', icon: '📸', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
    { name: 'Direct', icon: '✉️', color: 'bg-gray-800' },
  ];

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-fade-in overflow-y-auto pt-20 pb-20">
      <div className="w-full max-w-2xl bg-white text-black rounded-[3rem] p-10 space-y-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors spring-pop">✕</button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Visual Side */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 relative group bg-gray-50">
              
              {viewMode === '2d' ? (
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={item.name} />
              ) : (
                <ModelViewer
                  src={item.model3d}
                  alt={item.name}
                  auto-rotate
                  camera-controls
                  interaction-prompt="auto"
                  touch-action="none"
                  exposure="1"
                  shadow-intensity="1"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                ></ModelViewer>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

              {item.model3d && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-black/80 backdrop-blur-xl p-1 rounded-full border border-white/20 shadow-2xl scale-90">
                  <button 
                    onClick={() => setViewMode('2d')}
                    className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === '2d' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Archive
                  </button>
                  <button 
                    onClick={() => setViewMode('3d')}
                    className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Spatial
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
               <div className={`w-2.5 h-2.5 rounded-full ${item.supplyLevel === 'low' ? 'bg-red-500 animate-pulse' : 'bg-teal-500'}`} />
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                 {item.supplyLevel === 'low' ? 'Low Stock - Price Varies by Region' : 'In Stock'}
               </p>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-1">{item.category}</p>
                <h2 className="text-4xl font-black italic tracking-tighter leading-tight">{item.name}</h2>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                 <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-black italic">Y</div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.vendorHandle}</span>
                   <span className="text-[9px] text-gray-400 font-bold uppercase">Vendor Rating: {item.vendorRating} ★</span>
                 </div>
              </div>

              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                {item.description}
              </p>

              <div className="pt-4">
                <p className="text-3xl font-black italic tracking-tighter tabular-nums">{item.price}</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">+ Delivery calculated at checkout</p>
              </div>
            </div>

            <div className="pt-8 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={onTryOn}
                  className="py-4 bg-gray-100 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all spring-pop"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Try On
                </button>
                <button 
                  onClick={onBargain}
                  className="py-4 bg-gray-100 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all spring-pop"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  Bargain
                </button>
                <button 
                  onClick={() => setShowCollectionModal(true)}
                  className="py-4 bg-gray-100 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all spring-pop"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Collect
                </button>
                <button 
                  onClick={onToggleWishlist}
                  className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all spring-pop shadow-lg ${isWishlisted ? 'bg-rose-500 text-white animate-heart' : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-100'}`}
                >
                  <svg className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isWishlisted ? 'Saved' : 'Save for Later'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handlePromoteClick}
                  className={`py-5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all spring-pop shadow-lg ${promoted ? 'bg-teal-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                >
                  {promoted ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Promoted
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      Promote
                    </>
                  )}
                </button>
                <button 
                  onClick={onBuy}
                  className="py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCollectionModal && (
        <AddToCollectionModal 
          item={item}
          collections={collections}
          onClose={() => setShowCollectionModal(false)}
          onAdd={onAddToCollection}
          onCreate={onCreateCollection}
        />
      )}

      {showShareHub && (
        <div className="fixed inset-0 z-[160] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowShareHub(false)}>
           <div 
             className="w-full max-w-sm bg-white rounded-t-[3rem] md:rounded-[3rem] p-10 space-y-10 animate-in slide-in-from-bottom-20 duration-500 shadow-2xl relative"
             onClick={(e) => e.stopPropagation()}
           >
              <button onClick={() => setShowShareHub(false)} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors spring-pop">✕</button>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter">Share Asset</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aura Protocol v1.4</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {shareOptions.map((opt) => (
                  <button key={opt.name} className="flex flex-col items-center gap-3 group">
                    <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform spring-pop`}>
                      {opt.icon}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black">{opt.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Permanent Link</p>
                <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-2 pl-6 items-center">
                  <span className="flex-1 text-[10px] font-bold text-gray-400 truncate">yfn.app/vault/{item.id}</span>
                  <button 
                    onClick={handleCopyLink}
                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-teal-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
