
import React, { useState } from 'react';
import { MarketplaceItem, Collection } from '../../types';
import { AddToCollectionModal } from './AddToCollectionModal';

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
  onViewProfile: (userId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  item, collections, isWishlisted, onToggleWishlist, onClose, onTryOn, onBargain, onPromote, onBuy, onAddToCollection, onCreateCollection, onViewProfile
}) => {
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const isService = item.category.toUpperCase() === 'SERVICES';

  const handlePromoteClick = () => {
    const refId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const refLink = `https://yfn.app/r/${refId}/${item.id}`;
    
    navigator.clipboard.writeText(refLink).then(() => {
      setPromoted(true);
      onPromote(); 
      setTimeout(() => setPromoted(false), 3000);
    });
  };

  const handleVendorClick = () => {
    const userId = item.vendorHandle.startsWith('@') ? item.vendorHandle.slice(1) : item.vendorHandle;
    onViewProfile(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-fade-in overflow-y-auto pt-20 pb-20">
      <div className="w-full max-w-2xl bg-white text-black rounded-[3rem] p-10 space-y-10 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-100 rounded-full transition-all spring-pop z-50"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 relative group bg-gray-50">
              
              {viewMode === '2d' || !item.model3d ? (
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
            
            <div className="flex gap-2">
               <button onClick={handlePromoteClick} className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${promoted ? 'bg-amber-500 text-black' : 'bg-white border border-gray-100 text-gray-400'}`}>
                 {promoted ? 'Link Copied' : 'Promote & Earn'}
               </button>
               <button onClick={() => setShowCollectionModal(true)} className="flex-1 py-4 bg-white border border-gray-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400">Curate</button>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-1">{item.category}</p>
                <h2 className="text-4xl font-black italic tracking-tighter leading-tight">{item.name}</h2>
              </div>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 cursor-pointer group" onClick={handleVendorClick}>
                 <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-[10px] font-black italic shadow-md">Y</div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none group-hover:text-amber-500 transition-colors">{item.vendorHandle}</span>
                   <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Reputation: {item.vendorRating} ★</span>
                 </div>
              </div>

              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                {item.description}
              </p>

              <div className="pt-4 flex items-end justify-between">
                <p className="text-3xl font-black italic tracking-tighter tabular-nums">{item.price}</p>
                {item.isBargainable && (
                   <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.3em] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">Bargain Protocol</span>
                )}
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {!isService && (
                  <button onClick={onTryOn} className="py-4 bg-gray-100 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all border border-transparent hover:border-black/5">Try On</button>
                )}
                {item.isBargainable ? (
                  <button onClick={onBargain} className="py-4 bg-teal-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">Bargain</button>
                ) : (
                  <button onClick={onToggleWishlist} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-900'}`}>{isWishlisted ? 'Saved' : 'Wishlist'}</button>
                )}
              </div>
              <button onClick={onBuy} className={`w-full py-5 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all ${isService ? 'bg-teal-600 hover:bg-teal-700' : 'bg-black hover:bg-gray-900'}`}>{isService ? 'Book Service' : `Buy for ${item.price}`}</button>
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
    </div>
  );
};
