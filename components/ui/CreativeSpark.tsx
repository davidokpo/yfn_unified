
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
      alert("Error generating image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onReward(15000, "Design Submission Reward");
      alert("Your design has been published!");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-lg bg-white text-black rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black">✕</button>
        
        <div className="flex flex-col items-center gap-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black italic">Design Center</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI-Powered Creation Tool</p>
          </div>
          
          <div className="w-full">
            {!vision ? (
              <div className="space-y-6">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your design (e.g., A stylish leather handbag with gold details)..."
                  className="w-full h-40 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:outline-none focus:border-black transition-colors resize-none font-medium text-black"
                />
                <button 
                  disabled={loading || !prompt}
                  onClick={generateVision}
                  className="w-full py-6 bg-black text-white font-black uppercase tracking-widest rounded-full shadow-xl disabled:opacity-20 flex items-center justify-center gap-3 group"
                >
                  {loading ? 'Creating...' : 'Generate Design'}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="aspect-square w-full rounded-3xl overflow-hidden border border-gray-100 shadow-xl bg-gray-50">
                  <img src={vision} className="w-full h-full object-cover" alt="AI Generated" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setVision(null)} className="flex-1 py-5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest">Delete</button>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-1 py-5 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Design'}
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
