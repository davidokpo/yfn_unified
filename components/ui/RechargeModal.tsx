
import React, { useState } from 'react';
import { RechargeBundle } from '../../types';

interface RechargeModalProps {
  bundle: RechargeBundle;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type RechargeStep = 'method' | 'card_entry' | 'processing' | 'success';

export const RechargeModal: React.FC<RechargeModalProps> = ({ bundle, onClose, onSuccess }) => {
  const [step, setStep] = useState<RechargeStep>('method');
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

  const handlePay = () => {
    if (selectedMethod === 'CARD') {
      setStep('card_entry');
    } else {
      setStep('processing');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => onSuccess(bundle.amount), 1500);
      }, 2500);
    }
  };

  const handleCardConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess(bundle.amount), 1500);
    }, 2500);
  };

  const methods = [
    { id: 'CARD', name: 'Bank Card Top-Up', icon: '💳', brand: 'Visa / Mastercard' },
    { id: 'BANK_TRANSFER', name: 'Instant Bank Sync', icon: '🏛️' },
  ];

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amt);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-sm bg-white text-black rounded-[5rem] p-12 space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
        <div className={`absolute top-0 inset-x-0 h-4 ${bundle.color} animate-pulse shadow-[0_10px_20px_rgba(0,0,0,0.1)]`}></div>
        
        {step !== 'success' && step !== 'processing' && (
          <button onClick={onClose} className="absolute top-12 right-12 text-gray-300 hover:text-black transition-all spring-pop p-2 hover:bg-gray-50 rounded-full">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        {step === 'method' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black italic tracking-tighter leading-none">Add Funds</h2>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Encrypted Funding Gateway</p>
            </div>

            <div className={`p-12 rounded-[3.5rem] ${bundle.color} text-white space-y-3 shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden group`}>
               <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
               <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">Deposit Tier</p>
               <h3 className="text-5xl font-black italic tracking-tighter">{formatNaira(bundle.amount)}</h3>
               <div className="flex justify-between items-center pt-2">
                 <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">{bundle.label}</p>
                 <span className="text-[10px] font-black">NGN/SECURE</span>
               </div>
            </div>

            <div className="space-y-6">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Authorized Source</p>
              <div className="space-y-4">
                {methods.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full p-8 rounded-[2.5rem] flex items-center justify-between border-2 transition-all duration-500 spring-pop ${selectedMethod === m.id ? 'border-black bg-black text-white shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-4xl filter drop-shadow-md">{m.icon}</span>
                      <div className="text-left">
                        <span className="text-[13px] font-black uppercase tracking-[0.1em] block">{m.name}</span>
                        {m.brand && <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block">{m.brand} Verified</span>}
                      </div>
                    </div>
                    {selectedMethod === m.id && (
                      <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePay}
              className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] text-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all shimmer-titanium"
            >
              Continue to Funding
            </button>
          </div>
        )}

        {step === 'card_entry' && (
          <div className="space-y-12 animate-fade-in">
             <div className="text-center space-y-3">
                <h2 className="text-4xl font-black italic tracking-tighter leading-none">Card Details</h2>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Authorize {formatNaira(bundle.amount)}</p>
             </div>

             <div className="space-y-6 bg-gray-50 p-10 rounded-[4rem] border border-gray-100 shadow-inner">
                <div className="space-y-3">
                   <div className="flex justify-between items-center px-2">
                     <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Card Number</p>
                     <div className="flex gap-1">
                        <div className="w-4 h-3 bg-gray-200 rounded-sm"></div>
                        <div className="w-4 h-3 bg-gray-200 rounded-sm"></div>
                     </div>
                   </div>
                   <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] text-xl font-bold focus:outline-none focus:border-black tabular-nums tracking-[0.15em] shadow-sm"
                    value={cardData.number}
                    onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                   />
                </div>
                <div className="flex gap-6">
                   <div className="flex-1 space-y-3">
                      <p className="text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">Expiry</p>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] text-lg font-bold focus:outline-none focus:border-black tabular-nums shadow-sm"
                        value={cardData.expiry}
                        onChange={e => setCardData({...cardData, expiry: e.target.value.slice(0, 5)})}
                      />
                   </div>
                   <div className="w-36 space-y-3">
                      <p className="text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">CVV</p>
                      <input 
                        type="password" 
                        placeholder="000"
                        className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] text-lg font-bold focus:outline-none focus:border-black tabular-nums shadow-sm"
                        value={cardData.cvc}
                        onChange={e => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                      />
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <button 
                  onClick={handleCardConfirm}
                  disabled={cardData.number.length < 16}
                  className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[12px] shadow-[0_25px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all disabled:opacity-20"
                >
                  Confirm & Deposit
                </button>
                <button onClick={() => setStep('method')} className="w-full text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] py-2 hover:text-black transition-colors">Back to Methods</button>
             </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-32 flex flex-col items-center justify-center space-y-16 animate-fade-in">
             <div className="relative">
                <div className="w-44 h-44 border-[8px] border-black border-t-transparent rounded-full animate-spin shadow-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse filter drop-shadow-xl">🏛️</div>
             </div>
             <div className="text-center space-y-5">
                <p className="text-2xl font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Node...</p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic max-w-xs leading-relaxed">Securing external settlement with bank sovereignty protocol.</p>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-32 flex flex-col items-center justify-center space-y-12 animate-scale-up">
            <div className="w-44 h-44 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-[0_30px_60px_rgba(20,184,166,0.3)] scale-125 border-8 border-teal-50">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center space-y-5 px-10">
              <h2 className="text-5xl font-black italic tracking-tighter leading-none">Funds Added</h2>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.1em] leading-relaxed">Your sovereign e-wallet balance has been successfully verified and updated across all universe nodes.</p>
            </div>
            <div className="pt-6">
              <button 
                onClick={onClose}
                className="px-12 py-4 bg-gray-100 text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all spring-pop"
              >
                Close Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
