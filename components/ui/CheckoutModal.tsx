
import React, { useState, useMemo } from 'react';
import { MarketplaceItem } from '../../types';

interface CheckoutModalProps {
  item: MarketplaceItem;
  finalPrice: number;
  onClose: () => void;
  onComplete: (total: number, label: string) => void;
}

type CheckoutStep = 'summary' | 'card_entry' | '3ds_secure' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ item, finalPrice, onClose, onComplete }) => {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const userPos = { x: 50, y: 50 };

  const { deliveryCost, distance } = useMemo(() => {
    const dist = Math.sqrt(
      Math.pow(userPos.x - item.coordinates.x, 2) + 
      Math.pow(userPos.y - item.coordinates.y, 2)
    );
    // Formula: Base 2000 + (dist * 150)
    const cost = Math.floor(2000 + (dist * 150));
    return { deliveryCost: cost, distance: dist };
  }, [item, userPos.x, userPos.y]);

  const total = finalPrice + deliveryCost;

  const handleNext = () => {
    if (step === 'summary') setStep('card_entry');
    else if (step === 'card_entry') {
      setStep('3ds_secure');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          onComplete(total, `Order: ${item.name}`);
        }, 1500);
      }, 3000);
    }
  };

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  const getCardIcon = (num: string) => {
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    return 'Card';
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-md bg-white text-black rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden transition-all duration-500">
        
        {step !== 'success' && step !== '3ds_secure' && (
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        {step === 'summary' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter">Order Review</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Terminal #82</p>
            </div>

            <div className="flex gap-6 items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="relative">
                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt={item.name} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black italic">1</div>
              </div>
              <div>
                <h4 className="font-black italic text-lg leading-tight">{item.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-black">{formatNaira(finalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex flex-col">
                  <span className="text-gray-400">Delivery Cost</span>
                  <span className="text-[9px] text-gray-300 font-bold uppercase tracking-tight">Zone: {distance.toFixed(1)} dist units</span>
                </div>
                <span className="font-black">{formatNaira(deliveryCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-black/5">
                <span className="text-lg font-black uppercase tracking-tighter">Total</span>
                <span className="text-3xl font-black italic tracking-tighter">{formatNaira(total)}</span>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-6 bg-black text-white rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Secure Checkout</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        )}

        {step === 'card_entry' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
               <button onClick={() => setStep('summary')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                 Back
               </button>
               <div className="text-right">
                 <h2 className="text-xl font-black italic">Payment Method</h2>
                 <p className="text-[8px] font-black text-teal-500 uppercase tracking-widest">End-to-End Encrypted</p>
               </div>
            </div>

            {/* Stripe Element Mock */}
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Card Information</label>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                     <div className="flex items-center px-6 py-4 border-b border-gray-100">
                        <input 
                          type="text" 
                          placeholder="Card number"
                          className="bg-transparent border-none focus:outline-none w-full text-sm font-bold placeholder:text-gray-300"
                          value={cardData.number}
                          onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                        />
                        <span className="text-[10px] font-black text-amber-500">{getCardIcon(cardData.number)}</span>
                     </div>
                     <div className="flex">
                        <input 
                          type="text" 
                          placeholder="MM / YY"
                          className="flex-1 bg-transparent border-none focus:outline-none px-6 py-4 text-sm font-bold placeholder:text-gray-300 border-r border-gray-100"
                          value={cardData.expiry}
                          onChange={e => setCardData({...cardData, expiry: e.target.value.slice(0, 5)})}
                        />
                        <input 
                          type="password" 
                          placeholder="CVC"
                          className="w-24 bg-transparent border-none focus:outline-none px-6 py-4 text-sm font-bold placeholder:text-gray-300"
                          value={cardData.cvc}
                          onChange={e => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span className="text-[9px] font-black uppercase tracking-widest">Secured by Stripe Terminal</span>
              </div>
              <button 
                onClick={handleNext}
                disabled={cardData.number.length < 16}
                className="w-full py-6 bg-black text-white rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-20"
              >
                Pay {formatNaira(total)}
              </button>
            </div>
          </div>
        )}

        {step === '3ds_secure' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-10 animate-fade-in">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm font-black uppercase tracking-widest animate-pulse">Authenticating with your bank...</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">3D Secure Protocol V2.1</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-scale-up">
            <div className="w-24 h-24 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl scale-125 border-8 border-teal-50">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter">Transaction Clear</h2>
              <p className="text-xs text-gray-500 font-medium max-w-[250px] mx-auto leading-relaxed">Your creative asset is on the way. Dispatch coordinates synchronized with local hub.</p>
            </div>
            <div className="pt-6">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Receipt sent to node wallet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
