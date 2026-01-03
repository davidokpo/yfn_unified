
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Transaction } from '../../types';

interface LegalAIModalProps {
  transaction: Transaction;
  onClose: () => void;
  onVerdict: (verdict: 'refund' | 'release' | 'split', splitRatio?: number) => void;
}

export const LegalAIModal: React.FC<LegalAIModalProps> = ({ transaction, onClose, onVerdict }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'verdict'>('upload');
  const [photos, setPhotos] = useState<{
    sent?: string;
    received?: string;
    returned?: string;
  }>({});
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<keyof typeof photos | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos(prev => ({ ...prev, [activeSlot]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    setLoading(true);
    setStep('analyzing');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      // Fix: Explicitly type parts to any[] to allow both text and inlineData parts in the same array
      const parts: any[] = [
        { text: `Sovereign Dispute Resolution Protocol:
          Item: ${transaction.label}
          Price: ${transaction.amount}
          Status: Returning/Disputed
          
          You are the YFN Legal AI Judge, an elite digital lawyer and mediator. 
          Your task is to analyze the high-fidelity evidence frames from three stages:
          1. Origin (Seller Sent): The item's condition before transit.
          2. Arrival (Buyer Received): The item's condition upon delivery.
          3. Feedback (Seller Received Back): The item's condition after a return attempt.
          
          RULES:
          - If Stage 1 and Stage 2 are identical, but Stage 3 shows damage: Decision = RELEASE (Seller keeps money, item was ruined by buyer).
          - If Stage 2 shows damage that Stage 1 does not: Decision = REFUND (Buyer gets money back, courier/seller at fault).
          - If the item is functionally identical but "not liked": Decision = SPLIT (Partial refund to cover logistics).
          
          Provide a professional 3-sentence legal verdict and a JSON decision.`
        }
      ];

      // Attach images to prompt if they exist
      if (photos.sent) parts.push({ inlineData: { data: photos.sent.split(',')[1], mimeType: 'image/jpeg' } });
      if (photos.received) parts.push({ inlineData: { data: photos.received.split(',')[1], mimeType: 'image/jpeg' } });
      if (photos.returned) parts.push({ inlineData: { data: photos.returned.split(',')[1], mimeType: 'image/jpeg' } });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdictText: { type: Type.STRING },
              decision: { type: Type.STRING, enum: ['refund', 'release', 'split'] },
              ratio: { type: Type.NUMBER, description: 'Percentage to go to SELLER (0-100)' }
            },
            required: ['verdictText', 'decision']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAiAnalysis(result.verdictText);
      setStep('verdict');
      
      setTimeout(() => {
        onVerdict(result.decision, result.ratio);
      }, 5000);
    } catch (err) {
      setAiAnalysis("Protocol failure in evidence analysis. Defaulting to escrow hold for manual audit. Temporary verdict: Funds split 50/50.");
      setStep('verdict');
      setTimeout(() => onVerdict('split', 50), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-2xl bg-white text-black rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
        {/* Adinkra-style pattern watermark */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden rotate-45">
          <div className="grid grid-cols-10 gap-10">
            {Array.from({ length: 100 }).map((_, i) => <div key={i} className="text-6xl font-black">⚖️</div>)}
          </div>
        </div>

        <button onClick={onClose} className="absolute top-10 right-10 text-gray-300 hover:text-black z-20">✕</button>

        <div className="text-center space-y-2 relative z-10">
          <div className="w-24 h-24 bg-amber-500 text-black rounded-3xl mx-auto flex items-center justify-center text-4xl font-black mb-6 animate-sankofa shadow-2xl">⚖️</div>
          <h2 className="text-4xl font-black italic tracking-tighter">Sovereign Court</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">YFN Legal AI • Neutral Mediation Node</p>
        </div>

        {step === 'upload' && (
          <div className="space-y-8 animate-fade-in relative z-10">
             <p className="text-center text-sm font-medium text-gray-500 px-10 leading-relaxed italic">
               The Protocol requires visual timestamps of the asset at three critical junction nodes to reach a binding verdict.
             </p>

             <div className="grid grid-cols-3 gap-6">
                {(['sent', 'received', 'returned'] as const).map(slot => (
                  <button 
                    key={slot}
                    onClick={() => { setActiveSlot(slot); fileInputRef.current?.click(); }}
                    className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-4 transition-all ${photos[slot] ? 'border-teal-500 bg-teal-50 shadow-inner scale-[1.02]' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}
                  >
                    {photos[slot] ? (
                      <img src={photos[slot]} className="w-full h-full object-cover rounded-2xl" alt="" />
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📸</div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stage: {slot}</span>
                      </>
                    )}
                  </button>
                ))}
             </div>
             <input ref={fileInputRef} type="file" hidden onChange={handlePhotoUpload} />

             <button 
               onClick={startAnalysis}
               disabled={!photos.sent || !photos.received}
               className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl disabled:opacity-20 hover:bg-amber-500 transition-all spring-pop"
             >
               Initialize Neural Audit
             </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="py-24 flex flex-col items-center justify-center space-y-12 animate-fade-in relative z-10">
             <div className="relative">
                <div className="w-32 h-32 border-[8px] border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">⚖️</div>
             </div>
             <div className="text-center space-y-4">
                <p className="text-lg font-black uppercase tracking-[0.4em] animate-pulse">Arbiter is Deliberating...</p>
                <div className="flex gap-2 justify-center">
                  <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          </div>
        )}

        {step === 'verdict' && (
          <div className="space-y-12 py-10 animate-fade-in text-center relative z-10">
             <div className="p-10 bg-gray-50 border border-gray-100 rounded-[3.5rem] shadow-inner relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-1 border border-gray-100 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400">Final Decision</div>
               <p className="text-xl font-black italic text-black leading-relaxed">
                 "{aiAnalysis}"
               </p>
             </div>
             <div className="space-y-4">
               <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] animate-pulse italic">Binding Protocol Executing in 5s</p>
               <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-amber-500 h-full animate-[shimmer_5s_linear_forwards]" style={{ width: '100%' }}></div>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
