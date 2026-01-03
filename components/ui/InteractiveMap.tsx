
import React, { useMemo, useEffect, useState } from 'react';
import { MarketplaceItem, Transaction } from '../../types';

interface InteractiveMapProps {
  items: MarketplaceItem[];
  onSelectItem?: (item: MarketplaceItem) => void;
  selectedItemId?: number;
  filterType?: 'location' | 'rating';
  trackingTx?: Transaction | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  items, 
  onSelectItem, 
  selectedItemId, 
  filterType = 'location',
  trackingTx = null
}) => {
  const userPos = { x: 82, y: 18 }; // Zion's Penthouse Node
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [showLogisticsOverlay, setShowLogisticsOverlay] = useState(true);

  useEffect(() => {
    if (trackingTx) {
      let startTime = Date.now();
      const duration = 30000; 
      const animate = () => {
        const now = Date.now();
        const elapsed = (now - startTime) % duration;
        setSimulatedProgress(elapsed / duration);
        requestAnimationFrame(animate);
      };
      const animId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animId);
    }
  }, [trackingTx]);

  const courierPos = useMemo(() => {
    if (!trackingTx || !trackingTx.itemCoordinates) return null;
    const start = trackingTx.itemCoordinates;
    const end = userPos;
    const p = simulatedProgress;
    
    // Grid-based movement simulation (moves along axes first)
    const midX = start.x;
    const midY = end.y;
    
    if (p < 0.5) {
      const subP = p * 2;
      return { x: start.x, y: start.y + (end.y - start.y) * subP };
    } else {
      const subP = (p - 0.5) * 2;
      return { x: start.x + (end.x - start.x) * subP, y: end.y };
    }
  }, [trackingTx, userPos, simulatedProgress]);

  // Generate random building blocks for the "Uber" look
  const cityBlocks = useMemo(() => {
    const blocks = [];
    for (let i = 0; i < 60; i++) {
      blocks.push({
        id: i,
        x: Math.random() * 95,
        y: Math.random() * 95,
        w: Math.random() * 4 + 2,
        h: Math.random() * 4 + 2,
        type: Math.random() > 0.8 ? 'shop' : 'house'
      });
    }
    return blocks;
  }, []);

  return (
    <div className="relative aspect-video w-full bg-[#030303] rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl group cursor-crosshair">
      
      {/* 1. Base Map Layer */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${showLogisticsOverlay ? 'opacity-30' : 'opacity-60'}`}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="roadGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>

          {/* District Fills */}
          <rect x="0" y="0" width="100" height="100" fill="#050505" />
          
          {/* Detailed Building Blocks */}
          {cityBlocks.map(block => (
            <rect 
              key={block.id}
              x={block.x} y={block.y} width={block.w} height={block.h}
              fill={block.type === 'shop' ? '#111' : '#0a0a0a'}
              stroke={block.type === 'shop' ? '#222' : '#151515'}
              strokeWidth="0.1"
              rx="0.5"
            />
          ))}

          {/* Road Grid (The Uber Lines) */}
          <g stroke="#121212" strokeWidth="1.2" fill="none">
             {[10, 25, 40, 55, 70, 85].map(pos => (
               <React.Fragment key={pos}>
                 <line x1="0" y1={pos} x2="100" y2={pos} />
                 <line x1={pos} y1="0" x2={pos} y2="100" />
               </React.Fragment>
             ))}
          </g>

          {/* Main Highway Glow */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#1a1a1a" strokeWidth="2.5" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#1a1a1a" strokeWidth="2.5" />
        </svg>
      </div>

      {/* 2. Street Labels */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none">
         <span className="absolute top-[18.5%] left-[5%] text-[6px] font-black text-white uppercase tracking-[0.8em]">Sovereign Blvd</span>
         <span className="absolute top-[45%] right-[19%] text-[6px] font-black text-white uppercase tracking-[0.8em] rotate-90">Lagos Gate North</span>
         <span className="absolute bottom-[20%] left-[40%] text-[6px] font-black text-white uppercase tracking-[0.8em]">Vance District</span>
      </div>

      {/* 3. Logistics Overlay (Paths & Scan) */}
      {trackingTx && showLogisticsOverlay && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path 
            d={`M ${trackingTx.itemCoordinates?.x} ${trackingTx.itemCoordinates?.y} V ${userPos.y} H ${userPos.x}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.3"
            filter="url(#pathGlow)"
          />
        </svg>
      )}

      {/* 4. The Courier (🛵) */}
      {courierPos && (
        <div 
          className="absolute w-24 h-24 -ml-12 -mt-12 z-40 transition-all duration-300 ease-linear"
          style={{ left: `${courierPos.x}%`, top: `${courierPos.y}%` }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Scan Wave */}
            <div className="absolute w-16 h-16 border border-amber-500/30 rounded-full animate-ping" />
            
            {/* Courier Node */}
            <div className="relative w-11 h-11 bg-white text-black rounded-2xl shadow-3xl flex items-center justify-center border-2 border-amber-500 transform scale-110">
               <span className="text-xl">🛵</span>
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white animate-pulse" />
            </div>

            {/* Float Tag */}
            <div className="mt-3 px-3 py-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl flex items-center gap-2">
               <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">Bode (D-82)</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. User Destination (U) */}
      <div 
        className="absolute w-12 h-12 -ml-6 -mt-6 z-30"
        style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
      >
        <div className="w-full h-full bg-teal-500/10 rounded-full animate-ping" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <div className="w-6 h-6 rounded-lg bg-teal-500 text-black flex items-center justify-center font-black text-[9px] shadow-[0_0_20px_rgba(20,184,166,0.5)] border border-white/20">U</div>
        </div>
      </div>

      {/* 6. Marketplace Pins */}
      {items.map((item) => {
        const isSelected = item.id === selectedItemId;
        const isSource = trackingTx?.itemCoordinates?.x === item.coordinates.x && trackingTx?.itemCoordinates?.y === item.coordinates.y;
        
        return (
          <button
            key={item.id}
            onClick={() => onSelectItem?.(item)}
            className={`absolute group transition-all duration-500 z-20 ${isSelected ? 'z-50 scale-125' : 'hover:scale-110'} ${trackingTx && !isSource ? 'opacity-20 grayscale' : 'opacity-100'}`}
            style={{ left: `${item.coordinates.x}%`, top: `${item.coordinates.y}%` }}
          >
            <div className="relative -ml-4 -mt-4">
              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden transition-all ${isSelected ? 'border-amber-500 bg-white' : isSource ? 'border-amber-500 scale-110 shadow-amber-500/50 shadow-xl' : 'border-white/10 hover:border-white/50'}`}>
                <img src={item.image} className={`w-full h-full object-cover ${isSelected || isSource ? 'opacity-100' : 'opacity-40'}`} alt="" />
              </div>
            </div>
          </button>
        );
      })}

      {/* 7. Controls & HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-50 pointer-events-none">
         {trackingTx && (
           <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-3xl flex items-center gap-6 animate-in slide-in-from-top-4 duration-700 pointer-events-auto">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-xl shadow-xl">⚡</div>
                 <div>
                    <p className="text-[7px] font-black text-amber-500 uppercase tracking-widest">In Transit</p>
                    <p className="text-[10px] font-black text-white italic">Street: {simulatedProgress < 0.5 ? 'Sovereign Blvd' : 'Vance Way'}</p>
                 </div>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="text-right">
                 <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Arrival</p>
                 <p className="text-[10px] font-black text-teal-400 italic">~{Math.max(1, Math.ceil((1 - simulatedProgress) * 15))} min</p>
              </div>
           </div>
         )}
      </div>

      {/* Logistics Toggle Switch */}
      <div className="absolute bottom-8 right-8 z-50">
         <button 
           onClick={() => setShowLogisticsOverlay(!showLogisticsOverlay)}
           className={`px-5 py-3 rounded-2xl border flex items-center gap-3 transition-all shadow-3xl group ${showLogisticsOverlay ? 'bg-amber-500 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
         >
            <span className="text-[9px] font-black uppercase tracking-widest">{showLogisticsOverlay ? 'Logistics View: ON' : 'Logistics View: OFF'}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showLogisticsOverlay ? 'bg-black/20' : 'bg-white/10'}`}>
               <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${showLogisticsOverlay ? 'left-4.5 bg-black' : 'left-0.5 bg-gray-500'}`} />
            </div>
         </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      {!trackingTx && (
        <div className="absolute bottom-8 left-8 p-5 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-2xl space-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
             <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">Penthouse (Home)</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
             <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">Active Vendor</span>
           </div>
        </div>
      )}
    </div>
  );
};
