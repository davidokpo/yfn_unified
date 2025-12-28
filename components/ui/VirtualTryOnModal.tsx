
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MarketplaceItem } from '../../types';

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
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied or unavailable.");
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
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
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
            { text: `Photorealistically edit this image to show this person wearing the "${item.name}". Ensure the lighting and physics of the garment match the scene. The item is described as: ${item.description}. If the person's face is visible, keep it recognizable but realistically composite the clothing.` }
          ]
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        let foundImage = false;
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setResult(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
        if (!foundImage) throw new Error("No image part returned from vision engine.");
      }
    } catch (error) {
      console.error("Try-On Error:", error);
      alert("The design engine encountered a bottleneck. Please try again with a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto relative bg-white text-black rounded-[3rem] p-10 shadow-2xl my-8">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-100 rounded-full transition-all spring-pop z-50"
        >
          ✕
        </button>
        
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-black italic tracking-tighter">Virtual Fitting Protocol</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Sankofa Vision Layer v2.1</p>
        </div>

        {!result ? (
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">1. Origin Frame</h3>
              <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-gray-100 relative shadow-inner">
                {isCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : image ? (
                  <img src={image} className="absolute inset-0 w-full h-full object-cover animate-fade-in" alt="Base" />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Awaiting Capture</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {!isCameraActive ? (
                  <>
                    <button onClick={startCamera} className="flex-1 py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all spring-pop">Capture Live</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all spring-pop">Upload File</button>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
                  </>
                ) : (
                  <button onClick={capturePhoto} className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl">Confirm Frame</button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">2. Selected Asset</h3>
              <div className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden relative border border-gray-100 shadow-xl group">
                <img src={item.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={item.name} />
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="font-black text-white italic text-xl tracking-tighter">{item.name}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">{item.category}</p>
                </div>
              </div>
              <button 
                disabled={!image || loading}
                onClick={processTryOn}
                className="w-full py-6 bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl disabled:opacity-20 transition-all hover:bg-gray-900 shimmer-titanium"
              >
                {loading ? "Synthesizing Fit..." : "Initialize Fitting"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-fade-in">
            <div className="aspect-[4/3] w-full rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl relative bg-gray-50">
              <img src={result} className="w-full h-full object-cover" alt="Try on result" />
              <div className="absolute top-6 right-6 bg-white text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl border border-gray-100">Neural Sync Success</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setResult(null)} className="py-5 bg-gray-100 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">Reset Fit</button>
              {item.isBargainable && onStartBargain && (
                <button onClick={onStartBargain} className="py-5 bg-amber-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all hover:bg-amber-400">Negotiate Price</button>
              )}
              {onDirectBuy && (
                <button onClick={onDirectBuy} className="py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all hover:bg-gray-800">Finalize Order</button>
              )}
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};
