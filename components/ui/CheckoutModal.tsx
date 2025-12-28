
import React, { useState, useMemo } from 'react';
import { MarketplaceItem } from '../../types';

interface CheckoutModalProps {
  item: MarketplaceItem;
  finalPrice: number;
  balance: number;
  onClose: () => void;
  onComplete: (total: number, label: string) => void;
  onTopUp: () => void;
}

type CheckoutStep = 'summary' | 'processing_wallet' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  item, finalPrice, balance, onClose, onComplete, onTopUp 
}) => {
  const [step, setStep] = useState<CheckoutStep>('summary');
  const userPos = { x: 50, y: 50 };

  const { deliveryCost } = useMemo(() => {
    const isService = item.category.toUpperCase() === 'SERVICES';
    if (isService) return { deliveryCost: 0 }; 

    const dist = Math.sqrt(
      Math.pow(userPos.x - item.coordinates.x, 2) + 
      Math.pow(userPos.y - item.coordinates.y, 2)
    );
    const cost = Math.floor(2000 + (dist * 150));
    return { deliveryCost: cost };
  }, [item, userPos.x, userPos.y]);

  const total = finalPrice + deliveryCost;
  const hasSufficientFunds = balance >= total;

  const handleWalletPayment = () => {
    if (!hasSufficientFunds) return;
    setStep('processing_wallet');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onComplete(total, `Order: ${item.name}`);
      }, 1500);
    }, 2000);
  };

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amt);

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-md bg-white text-black rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
        
        {step === 'summary' && (
          <button onClick={onClose} className="absolute top-10 right-10 text-gray-300 hover:text-black transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        {step === 'summary' && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter">Confirm Transaction</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Secure Wallet Settlement</p>
            </div>

            <div className="flex gap-6 items-center bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
              <img src={item.image} className="w-24 h-24 rounded-3xl object-cover shadow-xl" alt={item.name} />
              <div>
                <h4 className="font-black italic text-xl leading-tight">{item.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>
              </div>
            </div>

            <div className="space-y-5 border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Base Amount</span>
                <span className="font-black tabular-nums">{formatNaira(finalPrice)}</span>
              </div>
              {deliveryCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Spatial Logistics</span>
                  <span className="font-black tabular-nums">{formatNaira(deliveryCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-6 border-t border-black/10">
                <span className="text-lg font-black uppercase tracking-tighter">Total Payable</span>
                <span className="text-3xl font-black italic tracking-tighter tabular-nums">{formatNaira(total)}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Your Wallet Balance</span>
                <span className={`text-sm font-black tabular-nums ${hasSufficientFunds ? 'text-teal-600' : 'text-rose-500'}`}>
                  {formatNaira(balance)}
                </span>
              </div>
              {!hasSufficientFunds && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-tight text-center italic">
                  Critical: Deposit funds to authorize settlement.
                </p>
              )}
            </div>

            {hasSufficientFunds ? (
              <button 
                onClick={handleWalletPayment}
                className="w-full py-7 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[#039be5] translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20"></div>
                <span>Authorize Wallet Payment</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </button>
            ) : (
              <button 
                onClick={() => { onClose(); onTopUp(); }}
                className="w-full py-7 bg-amber-500 text-black rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-amber-400"
              >
                <span>Deposit via Bank Card</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
        )}

        {step === 'processing_wallet' && (
          <div className="py-24 flex flex-col items-center justify-center space-y-12 animate-fade-in">
            <div className="relative">
              <div className="w-32 h-32 border-[6px] border-black border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🏛️</div>
            </div>
            <div className="text-center space-y-4">
              <p className="text-base font-black uppercase tracking-[0.3em] animate-pulse">Debiting E-Wallet...</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Authenticating with Firebase Cloud Node</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-24 flex flex-col items-center justify-center space-y-10 animate-scale-up">
            <div className="w-32 h-32 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl border-8 border-teal-50">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center space-y-3 px-6">
              <h2 className="text-5xl font-black italic tracking-tighter leading-none">Settled</h2>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Payment Verified. Transaction logged to your historical ledger.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
