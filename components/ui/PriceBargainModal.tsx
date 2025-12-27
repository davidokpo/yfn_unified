
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
  const [aiMessage, setAiMessage] = useState("Oya, tell me your budget. I'm listening.");
  const [intel, setIntel] = useState<MarketIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIntel, setLoadingIntel] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  useEffect(() => {
    const fetchIntel = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `
            Analyze the specific Nigerian social commerce market for this item: "${item.name}". 
            Context:
            - Demand Level: ${item.demandLevel}
            - Supply Level: ${item.supplyLevel}
            - Category: ${item.category}
            - Listing Price: ${item.price}
            
            Return a JSON object with:
            1. 'buyerTip': A witty, tactical negotiation tip for the buyer (Nigerian Pidgin-English mix).
            2. 'sellerSecret': A psychological insight into why this vendor might sell lower or hold firm.
            3. 'marketSentiment': A short phrase describing the current "vibe" of this specific product's market (e.g., "High Heat", "Cold Storage", "Steady Flow").
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
        setIntel(JSON.parse(response.text || '{}'));
      } catch (err) {
        setIntel({
          buyerTip: "Standard market run: Start at 75% and don't blink.",
          sellerSecret: "Vendors here value quick turnover over maximum margin right now.",
          marketSentiment: "Neutral Pulse"
        });
      } finally {
        setLoadingIntel(false);
      }
    };
    fetchIntel();
  }, [item]);

  const handleNegotiate = async () => {
    if (attempts >= 3) return;
    
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Bargaining Simulation (Nigerian Souk Protocol):
          - Item: ${item.name}
          - Listed At: ${item.numericPrice}
          - Vendor's Secret Floor: ${item.minPrice}
          - Current Bid: ${offer}
          - Attempt: ${attempts + 1} / 3

          Roleplay as the vendor. If the bid is >= floor, accept it. 
          If below, reject with a sharp but humorous Nigerian pidgin response. 
          If this is the final (3rd) attempt, be very clear that the price is fixed.
          
          Respond ONLY in JSON format.
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

      const result = JSON.parse(response.text || '{}');
      setAiMessage(result.message);
      setAttempts(prev => prev + 1);

      if (result.isAccepted) {
        setIsAccepted(true);
        setTimeout(() => onSuccess(offer), 2000);
      }
    } catch (err) {
      setAiMessage("Node busy. Try the offer again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-black rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
        
        {/* Connection Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex bg-gray-100">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 transition-all duration-700 ${attempts >= i ? 'bg-amber-500' : 'bg-transparent'}`} />
          ))}
        </div>
        
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors spring-pop">✕</button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Intelligence Column */}
          <div className="w-full md:w-64 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Market Intelligence</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase italic">
                  {loadingIntel ? "Analyzing nodes..." : intel?.marketSentiment}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Buyer Intel Box */}
              <div className="p-5 bg-teal-50 rounded-3xl border border-teal-100 space-y-2 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition-all" />
                <p className="text-[8px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                  Tactical Tip
                </p>
                <p className="text-[11px] font-bold leading-relaxed italic text-teal-900 min-h-[40px]">
                  {loadingIntel ? "Decrypting..." : intel?.buyerTip}
                </p>
              </div>

              {/* Seller Secret Box */}
              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-2 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  Vendor Mindset
                </p>
                <p className="text-[11px] font-bold leading-relaxed italic text-amber-900 min-h-[40px]">
                  {loadingIntel ? "Querying..." : intel?.sellerSecret}
                </p>
              </div>
            </div>

            {/* Demand Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                <span>Market Pressure</span>
                <span>{item.demandLevel === 'high' ? 'High Heat' : 'Cooling'}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.demandLevel === 'high' ? 'w-full bg-amber-500' : item.demandLevel === 'medium' ? 'w-1/2 bg-teal-400' : 'w-1/4 bg-gray-300'}`} 
                />
              </div>
            </div>
          </div>

          {/* Bargain Column */}
          <div className="flex-1 space-y-8">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-3xl font-black italic tracking-tighter">{item.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <p className="text-sm font-bold text-amber-600">{item.price}</p>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Floor Node: {formatNaira(item.minPrice)}</p>
              </div>
            </div>

            <div className="bg-gray-950 p-8 rounded-[2.5rem] border border-black relative group">
              <div className="absolute -top-3 -left-3 bg-white border border-black px-4 py-1 text-[8px] font-black uppercase tracking-widest">Vendor Response</div>
              <p className="text-lg font-black italic text-white leading-tight min-h-[60px] flex items-center">
                "{aiMessage}"
              </p>
            </div>

            {!isAccepted && attempts < 3 && (
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Bid Node</label>
                    <span className="text-2xl font-black tabular-nums">{formatNaira(offer)}</span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range"
                      min={item.minPrice * 0.75}
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
                  {loading ? "Transmitting Bid..." : `Confirm Offer (${3 - attempts} Attempts Left)`}
                </button>
              </div>
            )}

            {isAccepted && (
              <div className="text-center p-8 bg-teal-500 text-white rounded-[2.5rem] animate-bounce shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em]">Offer Locked In!</p>
              </div>
            )}

            {attempts >= 3 && !isAccepted && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center p-6 bg-red-50 rounded-3xl border border-red-100">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Protocol Terminated</p>
                  <p className="text-xs font-medium text-red-900 mt-1">Vendor refused to budge. Reset needed.</p>
                </div>
                <button 
                  onClick={() => onSuccess(item.numericPrice)}
                  className="w-full py-6 bg-gray-100 text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all spring-pop"
                >
                  Accept Original Price ({item.price})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
