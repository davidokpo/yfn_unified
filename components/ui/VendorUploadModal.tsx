
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MarketplaceItem } from '../../types';
import { FirebaseService } from '../../lib/database';

interface VendorUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const VendorUploadModal: React.FC<VendorUploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('APPAREL');
  const [description, setDescription] = useState('');
  const [isBargainable, setIsBargainable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['APPAREL', 'BAGS', 'TECH', 'FOOTWEAR', 'SERVICES', 'ACCESSORIES'];

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
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: "Analyze this item and provide: 1. A catchy name (3 words max) 2. A luxurious 2-sentence description. 3. A suggested price in Naira (number only)." }
          ]
        }
      });
      
      const text = response.text || "";
      setDescription(text);
      const match = text.match(/\d+/);
      if (match) setPrice(match[0]);
    } catch (err) {
      setDescription("A premium artisanal offering.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!file || !name || !price) return;
    setIsUploading(true);

    const numericPrice = parseInt(price);
    const newItem: MarketplaceItem = {
      id: Date.now(),
      name,
      category,
      price: `₦${numericPrice.toLocaleString()}`,
      numericPrice,
      image: file,
      description,
      coordinates: { 
        x: Math.floor(Math.random() * 80) + 10, 
        y: Math.floor(Math.random() * 80) + 10 
      },
      demandLevel: 'medium',
      supplyLevel: 'low',
      isBargainable: isBargainable && category !== 'SERVICES',
      minPrice: Math.floor(numericPrice * 0.8),
      vendorRating: 5.0,
      vendorHandle: "@vance_authorized",
      allowReferral: true,
      referralFee: Math.floor(numericPrice * 0.05)
    };

    await FirebaseService.addItemToMarketplace(newItem);

    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0a0a0a] rounded-[4rem] p-10 space-y-10 relative border border-white/10 shadow-2xl my-10">
        <button onClick={onClose} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-all spring-pop">✕</button>
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter">List Offering</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New Marketplace Asset</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-6">
             <div className="aspect-[4/5] bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center relative shadow-inner group">
               {file ? (
                 <img src={file} className="w-full h-full object-cover animate-fade-in" alt="Preview" />
               ) : (
                 <label className="cursor-pointer flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-500 px-6 text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-500">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                   </div>
                   <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Upload Photo</span>
                   <input type="file" className="hidden" onChange={handleFileChange} />
                 </label>
               )}
             </div>
             {file && (
               <button 
                onClick={generateAIDescription} 
                disabled={loading}
                className="w-full py-4 bg-amber-500/10 text-[10px] font-black uppercase tracking-widest text-amber-500 rounded-2xl border border-amber-500/20 hover:bg-amber-500/20 transition-all"
               >
                 {loading ? "Analyzing..." : "Auto-fill Details (AI)"}
               </button>
             )}
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-4">Name</label>
                <input 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-white focus:outline-none"
                  placeholder="Product Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-4">Category</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none appearance-none"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-4">Price (₦)</label>
                <input 
                  type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black text-amber-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Enable Bargaining</span>
                <button 
                  onClick={() => setIsBargainable(!isBargainable)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isBargainable ? 'bg-teal-500' : 'bg-gray-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBargainable ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest ml-4">Description</label>
                <textarea 
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs font-medium text-gray-400 h-28 resize-none focus:outline-none leading-relaxed"
                  placeholder="Brief description..."
                />
              </div>
           </div>
        </div>

        <button 
          onClick={handleFinish}
          disabled={!file || !name || !price || isUploading}
          className={`w-full py-7 rounded-full font-black uppercase tracking-widest transition-all text-xs shadow-2xl ${isUploading ? 'bg-white/10 text-gray-500 animate-pulse' : 'bg-white text-black hover:bg-amber-500'}`}
        >
          {isUploading ? "Uploading..." : "List Item"}
        </button>
      </div>
    </div>
  );
};
