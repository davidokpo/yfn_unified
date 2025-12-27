
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MarketplaceItem } from '../../types';
import { GlassCard } from './GlassCard';

interface VirtualTryOnModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onStartBargain?: () => void;
  onDirectBuy?: () => void;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ item, onClose, onStartBargain, onDirectBuy }) => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processTryOn = async () => {
    if (!image) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Photorealistically edit this image to show this person wearing the "${item.name}". Ensure the lighting and physics of the garment match the scene. The item is described as: ${item.description}` }
          ]
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setResult(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (error) {
      alert("AI processing failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto relative bg-white text-black rounded-[3rem] p-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black z-10">✕</button>
        
        <h2 className="text-3xl font-black mb-8 italic">Virtual Experience</h2>

        {!result ? (
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Your Frame</h3>
              <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-gray-100 relative shadow-inner">
                {isCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : image ? (
                  <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Base" />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <p className="text-gray-400 text-xs font-medium">Capture a clear photo to see the fit.</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {!isCameraActive ? (
                  <>
                    <button onClick={startCamera} className="flex-1 py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">Camera</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest">Upload</button>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                  </>
                ) : (
                  <button onClick={capturePhoto} className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">Snap</button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Selected Asset</h3>
              <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden relative border border-gray-100 shadow-xl">
                <img src={item.image} className="absolute inset-0 w-full h-full object-cover" alt={item.name} />
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="font-black text-white italic text-xl">{item.name}</p>
                </div>
              </div>
              <button 
                disabled={!image || loading}
                onClick={processTryOn}
                className="w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl disabled:opacity-20"
              >
                {loading ? "Generating..." : "See Me Wearing This"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            <div className="aspect-[4/3] w-full rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl relative">
              <img src={result} className="w-full h-full object-cover" alt="Try on result" />
              <div className="absolute top-6 right-6 bg-white text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">AI Synthesized</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setResult(null)} className="py-5 bg-gray-100 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">Retry</button>
              <button onClick={onStartBargain} className="py-5 bg-amber-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Negotiate</button>
              <button onClick={onDirectBuy} className="py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Buy for {item.price}</button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
