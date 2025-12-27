
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface VendorUploadModalProps {
  onClose: () => void;
}

export const VendorUploadModal: React.FC<VendorUploadModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files?.[0]) {
      reader.onload = (ev) => setFile(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generateAIDescription = async () => {
    if (!file) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const base64Data = file.split(',')[1];
      // Fix: Ensure contents follows the correct GenerateContentParameters structure.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "Write a high-quality product description (2 sentences) for this fashion/tech item. Focus on quality and style." }
          ]
        }
      });
      setDescription(response.text || "Quality item ready for the marketplace.");
    } catch (err) {
      setDescription("A premium addition to our collection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setIsUploading(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-xl bg-[#0a0a0a] rounded-[3rem] p-10 space-y-8 relative border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white">✕</button>
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic">List Your Item</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Join our community of creators</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-4">
             <div className="aspect-[4/5] bg-white/5 rounded-[2rem] border border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center relative">
               {file ? (
                 <img src={file} className="w-full h-full object-cover" alt="Preview" />
               ) : (
                 <label className="cursor-pointer flex flex-col items-center gap-3">
                   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                     <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                   </div>
                   <span className="text-[10px] font-bold uppercase text-gray-500">Add Image</span>
                   <input type="file" className="hidden" onChange={handleFileChange} />
                 </label>
               )}
             </div>
             {file && (
               <button 
                onClick={generateAIDescription} 
                disabled={loading}
                className="w-full py-3 bg-white/5 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
               >
                 {loading ? "Thinking..." : "AI Auto-Fill"}
               </button>
             )}
           </div>

           <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-gray-600 px-2">Product Name</label>
                <input 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-white focus:outline-none transition-colors"
                  placeholder="e.g. Classic Silk Shirt"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-gray-600 px-2">Price (₦)</label>
                <input 
                  type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-white focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-gray-600 px-2">Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs h-32 resize-none focus:border-white focus:outline-none transition-colors"
                  placeholder="Tell us about the product..."
                />
              </div>
           </div>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!file || !name || !price || isUploading}
          className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all text-sm ${isUploading ? 'bg-gray-800 animate-pulse' : 'bg-white text-black hover:bg-amber-500'}`}
        >
          {isUploading ? "Uploading..." : "List Product"}
        </button>
      </div>
    </div>
  );
};
