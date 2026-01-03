
import React, { useState } from 'react';
import { RechargeBundle } from '../../types';

interface RechargeModalProps {
  bundle: RechargeBundle;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

type RechargeStep = 'native_sheet' | 'processing' | 'success';

export const RechargeModal: React.FC<RechargeModalProps> = ({ bundle, onClose, onSuccess }) => {
  const [step, setStep] = useState<RechargeStep>('native_sheet');
  
  const TAX_RATE = 0.075; 
  const taxAmount = bundle.amount * TAX_RATE;
  const totalCharge = bundle.amount + taxAmount;

  const handleNativeConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess(bundle.amount), 1500);
    }, 2500);
  };

  const formatNairaKobo = (amt: number) => 
    new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 2 
    }).format(amt);

  return (
    <div className="fixed inset-0 z-[250] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Simulation of a Native Payment Sheet sliding from bottom */}
      <div className="w-full max-w-md bg-[#F2F2F7] rounded-t-[3rem] p-10 pb-16 space-y-10 shadow-[0_-20px_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500 ease-out">
        
        {step === 'native_sheet' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl p-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" className="w-full" alt="PlayStore" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-black tracking-tight">YFN Wallet Top-Up</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">In-App Purchase</p>
                  </div>
               </div>
               <button onClick={onClose} className="text-blue-600 font-bold text-sm">Cancel</button>
            </div>

            <div className="bg-white rounded-3xl p-8 space-y-6 shadow-sm border border-black/5">
               <div className="flex justify-between border-b border-gray-100 pb-4">
                 <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Amount</span>
                 <span className="text-black font-black tabular-nums">{formatNairaKobo(bundle.amount)}</span>
               </div>
               <div className="flex justify-between border-b border-gray-100 pb-4">
                 <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">VAT (7.5%)</span>
                 <span className="text-black font-black tabular-nums">{formatNairaKobo(taxAmount)}</span>
               </div>
               <div className="flex justify-between pt-2">
                 <span className="text-black text-sm font-black uppercase tracking-widest">Total</span>
                 <span className="text-2xl font-black text-black tabular-nums">{formatNairaKobo(totalCharge)}</span>
               </div>
            </div>

            <div className="flex items-center gap-4 bg-white/50 p-6 rounded-2xl border border-black/5">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md shadow-inner"></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-black uppercase tracking-tight">Mastercard •••• 8282</p>
                <p className="text-[8px] text-gray-500 font-bold uppercase">Linked to App Store Profile</p>
              </div>
              <div className="text-gray-300">›</div>
            </div>

            <button 
              onClick={handleNativeConfirm}
              className="w-full py-6 bg-[#007AFF] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <span className="text-lg">○</span>
              <span>Double-Click to Pay</span>
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-10 animate-fade-in">
             <div className="w-16 h-16 border-[4px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-sm font-black text-black uppercase tracking-widest">Communicating with Store...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-16 flex flex-col items-center justify-center space-y-8 animate-scale-up">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-black tracking-tight">Purchase Successful</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Your bank account has been charged.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
