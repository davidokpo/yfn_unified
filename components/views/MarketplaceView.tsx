
import React, { useState, useMemo, useEffect } from 'react';
import { FirebaseService } from '../../lib/database';
import { MarketplaceItem, Collection, ViewType, Transaction } from '../../types';
import { PriceBargainModal } from '../ui/PriceBargainModal';
import { VirtualTryOnModal } from '../ui/VirtualTryOnModal';
import { InteractiveMap } from '../ui/InteractiveMap';
import { VendorUploadModal } from '../ui/VendorUploadModal';
import { CheckoutModal } from '../ui/CheckoutModal';
import { ProductDetailModal } from '../ui/ProductDetailModal';

interface MarketplaceViewProps {
  balance: number;
  initialItem?: MarketplaceItem | null;
  wishlist: MarketplaceItem[];
  collections: Collection[];
  activeTrackingTx?: Transaction | null;
  onReward: (amount: number, label: string) => void;
  onPurchase: (amount: number, label: string, item: MarketplaceItem) => void;
  onViewItem: (item: MarketplaceItem) => void;
  onToggleWishlist: (item: MarketplaceItem) => void;
  onAddToCollection: (collectionId: string, itemId: number) => void;
  onCreateCollection: (name: string, itemId: number) => void;
  onPromoteItem: (item: MarketplaceItem) => void;
  onRequestViewChange?: (view: any) => void;
  onViewProfile: (userId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ 
  balance, 
  initialItem, 
  wishlist,
  collections,
  activeTrackingTx = null,
  onReward, 
  onPurchase, 
  onViewItem,
  onToggleWishlist,
  onAddToCollection,
  onCreateCollection,
  onPromoteItem,
  onRequestViewChange,
  onViewProfile
}) => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(initialItem || null);
  const [isViewingDetail, setIsViewingDetail] = useState(!!initialItem);
  const [isBargaining, setIsBargaining] = useState(false);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(0);
  const [referralFeedback, setReferralFeedback] = useState<{name: string, amt: number} | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'location' | 'rating'>('location');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const isOverlayOpen = isViewingDetail || isBargaining || isTryingOn || isUploading || isCheckingOut;
    const event = new CustomEvent('yfn-modal-toggle', { detail: { open: isOverlayOpen } });
    window.dispatchEvent(event);
  }, [isViewingDetail, isBargaining, isTryingOn, isUploading, isCheckingOut]);

  const refreshItems = async () => {
    setLoading(true);
    const data = await FirebaseService.fetchMarketplace();
    setItems(data);
    setLoading(false);
  };

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amt);

  useEffect(() => {
    refreshItems();
  }, []);

  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
      setIsViewingDetail(true);
      onViewItem(initialItem);
    }
  }, [initialItem, onViewItem]);

  const userPos = { x: 50, y: 50 };

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const filteredItems = useMemo(() => {
    let result = items.filter(item => 
      (activeCategory === 'ALL' || item.category.toUpperCase() === activeCategory) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.vendorHandle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterType === 'location') {
      return result.sort((a, b) => getDistance(userPos, a.coordinates) - getDistance(userPos, b.coordinates));
    } else {
      return result.sort((a, b) => b.vendorRating - a.vendorRating);
    }
  }, [items, searchQuery, filterType, activeCategory]);

  // Map should be shown if searching, filtering by location, or if an order is being tracked
  const showMap = searchQuery.trim().length > 0 || filterType === 'location' || !!activeTrackingTx;

  const handleSelectItem = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsViewingDetail(true);
    onViewItem(item);
  };

  const handleVendorClick = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    let authorId = handle.startsWith('@') ? handle.slice(1) : handle;
    if (authorId === 'davina_soles') authorId = 'davina_soles';
    if (authorId === 'vance_studio') authorId = '0xVANCE_82';
    onViewProfile(authorId);
  };

  const handleStartCheckout = (price: number) => {
    setCheckoutPrice(price);
    setIsBargaining(false);
    setIsTryingOn(false);
    setIsViewingDetail(false);
    setIsCheckingOut(true);
  };

  const handleCompletePurchase = (total: number, label: string) => {
    if (selectedItem) {
      onPurchase(total, label, selectedItem);
      setIsCheckingOut(false);
      
      if (selectedItem.allowReferral) {
        const commission = selectedItem.referralFee || Math.floor(selectedItem.numericPrice * 0.05);
        setTimeout(() => {
          onReward(commission, `Referral Commission: ${selectedItem.name}`);
        }, 1000);
      }
      
      setSelectedItem(null);
    }
  };

  const handleReferral = (e: React.MouseEvent | null, item: MarketplaceItem) => {
    if (e) e.stopPropagation();
    const estimatedFee = item.referralFee || Math.floor(item.numericPrice * 0.05);
    onPromoteItem(item); 
    
    const refId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const refLink = `https://yfn.app/r/${refId}/${item.id}`;
    navigator.clipboard.writeText(refLink);
    
    setReferralFeedback({ name: item.name, amt: estimatedFee });
    setTimeout(() => setReferralFeedback(null), 5000);
  };

  const isInWishlist = (id: number) => wishlist.some(i => i.id === id);

  const handleWishlistClick = (e: React.MouseEvent | null, item: MarketplaceItem) => {
    if (e) e.stopPropagation();
    onToggleWishlist(item);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Decrypting Spatial Node...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-48 animate-fade-in pt-4 relative">
      {referralFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-6 animate-in slide-in-from-top-20 duration-700">
           <div className="bg-white text-black rounded-[2.5rem] p-6 shadow-2xl border-4 border-amber-500 flex items-center gap-5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse" />
             <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 font-black text-xl">🔗</div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-0.5">Referral Node Synced</p>
                <p className="text-sm font-bold leading-tight italic">Link copied! Earn {formatNaira(referralFeedback.amt)} on next purchase of {referralFeedback.name}.</p>
             </div>
           </div>
        </div>
      )}

      <div className="sticky top-28 z-40 space-y-8 mb-16 pt-4 bg-[#050505]/80 backdrop-blur-md pb-4 -mx-6 px-6 border-b border-white/5">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center px-8 py-6 shadow-2xl transition-all duration-500 focus-within:ring-4 focus-within:ring-amber-500/20 focus-within:bg-white/10 group">
              <svg className={`w-6 h-6 mr-5 transition-all duration-500 ${searchQuery ? 'text-amber-500 scale-110' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text"
                placeholder="Search products or services..."
                className="bg-transparent border-none focus:outline-none text-xl w-full text-white placeholder:text-gray-600 font-black italic tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsUploading(true)}
              className="w-20 h-20 bg-white text-black rounded-[2.5rem] flex items-center justify-center hover:bg-amber-500 transition-all shadow-2xl spring-pop group active:scale-90"
            >
              <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-xl">
               {(['location', 'rating'] as const).map(type => (
                 <button 
                   key={type}
                   onClick={() => setFilterType(type)}
                   className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all spring-pop flex items-center gap-2 ${
                     filterType === type ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'
                   }`}
                 >
                   {type === 'location' ? 'Proximity Origin' : 'Reputation Rank'}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${showMap ? 'max-h-[600px] mb-20 opacity-100 scale-100' : 'max-h-0 opacity-0 mb-0 scale-95'}`}>
        <div className="rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl p-1 bg-white/5 relative">
          <InteractiveMap 
            items={filteredItems} 
            filterType={filterType}
            onSelectItem={handleSelectItem} 
            selectedItemId={selectedItem?.id}
            trackingTx={activeTrackingTx}
          />
        </div>
      </div>

      <div 
        key={`${filterType}-${activeCategory}-${searchQuery}`}
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
      >
        {filteredItems.map((item, index) => {
          return (
            <div 
              key={item.id} 
              className="group bg-white rounded-[3.5rem] overflow-hidden shadow-2xl transition-all spring-pop cursor-pointer border border-gray-50 hover:shadow-amber-500/10 animate-item-reveal hover:scale-[1.01] duration-500"
              onClick={() => handleSelectItem(item)}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.name} />
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <div className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase rounded-xl tracking-widest shadow-2xl flex items-center gap-2">
                    <span className="text-amber-500">★</span> {item.vendorRating}
                  </div>
                </div>
                <div className="absolute top-8 right-8 flex flex-col gap-3">
                  <button 
                    onClick={(e) => handleWishlistClick(e, item)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all spring-pop backdrop-blur-md ${
                      isInWishlist(item.id) ? 'bg-rose-500 text-white animate-heart' : 'bg-white/20 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <svg className="w-7 h-7" fill={isInWishlist(item.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  {item.allowReferral && (
                    <button 
                      onClick={(e) => handleReferral(e, item)}
                      className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-10 flex justify-between items-start">
                 <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{item.category}</p>
                    <h3 className="text-3xl font-black italic text-black leading-tight tracking-tighter">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-2 group/handle cursor-pointer" onClick={(e) => handleVendorClick(e, item.vendorHandle)}>
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/handle:text-amber-500 transition-colors">{item.vendorHandle}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-black tabular-nums tracking-tighter">{formatNaira(item.numericPrice)}</p>
                    {item.isBargainable && <p className="text-[8px] font-black text-teal-500 uppercase tracking-widest mt-1 italic">Bargain Protocol Active</p>}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {isViewingDetail && selectedItem && (
        <ProductDetailModal 
          item={selectedItem}
          collections={collections}
          isWishlisted={isInWishlist(selectedItem.id)}
          onToggleWishlist={() => handleWishlistClick(null, selectedItem)}
          onClose={() => setIsViewingDetail(false)}
          onTryOn={() => { setIsViewingDetail(false); setIsTryingOn(true); }}
          onBargain={() => { setIsViewingDetail(false); setIsBargaining(true); }}
          onPromote={() => handleReferral(null, selectedItem)}
          onBuy={() => handleStartCheckout(selectedItem.numericPrice)}
          onAddToCollection={onAddToCollection}
          onCreateCollection={onCreateCollection}
          onViewProfile={onViewProfile}
        />
      )}

      {isBargaining && selectedItem && (
        <PriceBargainModal 
          item={selectedItem} 
          onClose={() => { setIsBargaining(false); setIsViewingDetail(true); }} 
          onSuccess={(finalPrice) => handleStartCheckout(finalPrice)} 
        />
      )}

      {isTryingOn && selectedItem && (
        <VirtualTryOnModal 
          item={selectedItem} 
          onClose={() => { setIsTryingOn(false); setIsViewingDetail(true); }} 
          onStartBargain={() => { setIsTryingOn(false); setIsBargaining(true); }}
          onDirectBuy={() => handleStartCheckout(selectedItem.numericPrice)}
        />
      )}

      {isCheckingOut && selectedItem && (
        <CheckoutModal 
          item={selectedItem} 
          finalPrice={checkoutPrice} 
          balance={balance}
          onClose={() => setIsCheckingOut(false)} 
          onComplete={handleCompletePurchase}
          onTopUp={() => onRequestViewChange && onRequestViewChange(ViewType.WALLET)}
        />
      )}

      {isUploading && (
        <VendorUploadModal onClose={() => setIsUploading(false)} onSuccess={refreshItems} />
      )}
    </div>
  );
};
