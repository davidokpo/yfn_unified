
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface CreativeSparkProps {
  onClose: () => void;
  onReward: (amount: number, label: string) => void;
}

export const CreativeSpark: React.FC<CreativeSparkProps> = ({ onClose, onReward }) => {
  const [prompt, setPrompt] = useState('');
  const [vision, setVision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const generateVision = async () => {
    if (!prompt) return;
    setLoading(true);
    // Directly using the GoogleGenAI SDK as the primary engine, but conceptually backed by Firebase project credentials
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality minimalist fashion item: ${prompt}. Clean white background, luxury product photography.` }]
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setVision(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      alert("Design engine busy. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onReward(15000, "Design Submission Bonus");
      alert("Design published! Your asset is now stored in the Firebase Cloud Vault.");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-lg bg-white text-black rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
        
        {/* Firebase Branding Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-[#039be5]"></div>
        
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black">✕</button>
        
        <div className="flex flex-col items-center gap-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black italic">Creator Studio</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Vertex AI Protocol</span>
              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
              <span className="text-[10px] font-black text-[#039be5] uppercase tracking-[0.3em]">Firebase Secured</span>
            </div>
          </div>
          
          <div className="w-full">
            {!vision ? (
              <div className="space-y-6">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your design (e.g., A leather tote bag with African brass hardware)..."
                  className="w-full h-40 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:outline-none focus:border-[#039be5] transition-colors resize-none font-medium text-black"
                />
                <button 
                  disabled={loading || !prompt}
                  onClick={generateVision}
                  className="w-full py-6 bg-black text-white font-black uppercase tracking-widest rounded-full shadow-xl disabled:opacity-20 flex items-center justify-center gap-3 group"
                >
                  {loading ? 'Visualizing...' : (
                    <>
                      <span>Generate Design</span>
                      <svg className="w-4 h-4 text-[#039be5]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gray-50">
                  <img src={vision} className="w-full h-full object-cover" alt="AI Generated" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setVision(null)} className="flex-1 py-5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest">Discard</button>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-1 py-5 bg-[#039be5] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl"
                  >
                    {isPublishing ? 'Publishing...' : 'Sync to Vault'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
