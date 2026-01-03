
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { MarketplaceItem } from '../../types';

interface PriceBargainModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onSuccess: (finalPrice: number) => void;
}

interface MarketIntel {
  buyerTip: string;
  sellerSecret: string;
  marketSentiment: string;
}

export const PriceBargainModal: React.FC<PriceBargainModalProps> = ({ item, onClose, onSuccess }) => {
  const [offer, setOffer] = useState<number>(Math.floor(item.numericPrice * 0.8));
  const [attempts, setAttempts] = useState(0);
  const [aiMessage, setAiMessage] = useState("Hi! What's your budget for this item? Make me a fair offer.");
  const [intel, setIntel] = useState<MarketIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIntel, setLoadingIntel] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  const safeParseJSON = (text: string) => {
    try {
      const cleanJson = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchIntel = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `
            Analyze the market for this item: "${item.name}". 
            Context:
            - Demand: ${item.demandLevel}
            - Supply: ${item.supplyLevel}
            - Category: ${item.category}
            - Price: ${item.price}
            
            Return a JSON object with:
            1. 'buyerTip': A simple negotiation tip in plain English.
            2. 'sellerSecret': A simple insight into how the seller might be feeling.
            3. 'marketSentiment': A short 2-word description of the market (e.g., "In Demand", "Hard to Find").
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                buyerTip: { type: Type.STRING },
                sellerSecret: { type: Type.STRING },
                marketSentiment: { type: Type.STRING }
              },
              required: ['buyerTip', 'sellerSecret', 'marketSentiment']
            }
          }
        });
        const parsed = safeParseJSON(response.text || '{}');
        if (parsed) setIntel(parsed);
      } catch (err) {
        setIntel({
          buyerTip: "Try starting at around 80% of the asking price.",
          sellerSecret: "Sellers usually appreciate serious buyers who pay quickly.",
          marketSentiment: "Available"
        });
      } finally {
        setLoadingIntel(false);
      }
    };
    fetchIntel();
  }, [item]);

  const handleNegotiate = async () => {
    if (attempts >= 3 || isAccepted) return;
    
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Bargaining Simulation:
          - Item: ${item.name}
          - Price: ${item.numericPrice}
          - Lowest Price Seller will take: ${item.minPrice}
          - Current Offer: ${offer}
          - Try: ${attempts + 1} / 3

          Act as a friendly seller. 
          If the offer is high enough, accept it. 
          If not, decline politely and ask for more. 
          On the 3rd try, give a final "yes" or "no".
          
          Respond ONLY in JSON.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              isAccepted: { type: Type.BOOLEAN }
            },
            required: ['message', 'isAccepted']
          }
        }
      });

      const result = safeParseJSON(response.text || '{}');
      if (result) {
        setAiMessage(result.message);
        setAttempts(prev => prev + 1);

        if (result.isAccepted) {
          setIsAccepted(true);
          setTimeout(() => onSuccess(offer), 2500);
        }
      }
    } catch (err) {
      setAiMessage("Sorry, I didn't catch that. Could you repeat your offer?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-black rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden my-8">
        
        <div className="absolute top-0 inset-x-0 h-1.5 flex bg-gray-100">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 transition-all duration-1000 ease-out ${attempts >= i ? 'bg-amber-500' : 'bg-transparent'}`} />
          ))}
        </div>
        
        <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-100 rounded-full transition-all spring-pop z-50">✕</button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Shopping Insight</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase italic tracking-tighter">
                  {loadingIntel ? "Checking..." : intel?.marketSentiment}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-teal-50 rounded-3xl border border-teal-100 space-y-2 relative overflow-hidden group">
                <p className="text-[8px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">Quick Tip</p>
                <p className="text-[11px] font-bold leading-relaxed italic text-teal-900 min-h-[40px]">
                  {loadingIntel ? "Loading..." : intel?.buyerTip}
                </p>
              </div>

              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-2 relative overflow-hidden group">
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">Seller Vibe</p>
                <p className="text-[11px] font-bold leading-relaxed italic text-amber-900 min-h-[40px]">
                  {loadingIntel ? "Loading..." : intel?.sellerSecret}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter">{item.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <p className="text-sm font-bold text-amber-600">{item.price}</p>
              </div>
            </div>

            <div className="bg-gray-950 p-8 rounded-[2.5rem] border border-black relative group shadow-2xl">
              <p className="text-lg font-black italic text-white leading-tight min-h-[80px] flex items-center transition-all">
                "{aiMessage}"
              </p>
            </div>

            {!isAccepted && attempts < 3 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Set your offer</label>
                    <span className="text-2xl font-black tabular-nums">{formatNaira(offer)}</span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range"
                      min={Math.floor(item.minPrice * 0.7)}
                      max={item.numericPrice}
                      step={500}
                      value={offer}
                      onChange={(e) => setOffer(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleNegotiate}
                  disabled={loading}
                  className="w-full py-6 bg-black text-white rounded-full font-black uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-50 shadow-2xl shimmer-titanium"
                >
                  {loading ? "Sending offer..." : `Send Offer (${3 - attempts} tries left)`}
                </button>
              </div>
            )}

            {isAccepted && (
              <div className="text-center p-8 bg-teal-500 text-white rounded-[2.5rem] animate-bounce shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.4em]">Offer Accepted!</p>
              </div>
            )}

            {attempts >= 3 && !isAccepted && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center p-6 bg-red-50 rounded-3xl border border-red-100">
                  <p className="text-xs font-medium text-red-900 mt-1 italic">No more offers allowed. You can buy it at the original price or keep looking.</p>
                </div>
                <button 
                  onClick={() => onSuccess(item.numericPrice)}
                  className="w-full py-6 bg-gray-100 text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all spring-pop border border-gray-200"
                >
                  Buy for {item.price}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
