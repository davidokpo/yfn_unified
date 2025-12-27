
import React, { useState } from 'react';
import { CrystalPackage } from '../../types';

interface RechargeModalProps {
  bundle: CrystalPackage;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({ bundle, onClose, onSuccess }) => {
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState('PLAY_STORE');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(bundle.price);
      }, 1500);
    }, 2500);
  };

  const methods = [
    { id: 'PLAY_STORE', name: 'Play Store Card', icon: '💳' },
    { id: 'BANK', name: 'Direct Bank', icon: '🏛️' },
    { id: 'CRYPTO', name: 'Spatial Coin', icon: '🔗' },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-sm bg-white text-black rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 inset-x-0 h-1.5 ${bundle.color}`}></div>
        
        {step !== 'success' && step !== 'processing' && (
          <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black">✕</button>
        )}

        {step === 'method' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black italic tracking-tighter">Secure Recharge</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Sync #{bundle.id}</p>
            </div>

            <div className={`p-8 rounded-[2.5rem] ${bundle.color} text-white space-y-2 shadow-2xl relative overflow-hidden group`}>
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Selected Package</p>
               <h3 className="text-4xl font-black italic tracking-tighter">{bundle.credits} Crystals</h3>
               <p className="text-lg font-bold">₦{bundle.price.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Payment Method</p>
              <div className="space-y-2">
                {methods.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all spring-pop ${selectedMethod === m.id ? 'border-black bg-black text-white shadow-xl scale-[1.02]' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-black uppercase tracking-widest">{m.name}</span>
                    </div>
                    {selectedMethod === m.id && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePay}
              className="w-full py-6 bg-black text-white rounded-full font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              Confirm Billing
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-10 animate-fade-in">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">⚡</span>
                </div>
             </div>
             <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-widest">Handshaking with {selectedMethod}...</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Aura Encryption Level 4096</p>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-scale-up">
            <div className="w-24 h-24 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl scale-125 border-8 border-teal-50">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter">Recharge Clear</h2>
              <p className="text-xs text-gray-500 font-medium max-w-[200px] mx-auto leading-relaxed">Crystals synthesized and added to your node balance.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
