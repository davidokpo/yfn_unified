
import React, { useMemo } from 'react';
import { MarketplaceItem } from '../../types';

interface InteractiveMapProps {
  items: MarketplaceItem[];
  onSelectItem: (item: MarketplaceItem) => void;
  selectedItemId?: number;
  filterType: 'location' | 'rating';
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ items, onSelectItem, selectedItemId, filterType }) => {
  const userPos = { x: 50, y: 50 };

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Identify the closest item for visual highlighting if we're in location mode
  const closestItemId = useMemo(() => {
    if (items.length === 0) return null;
    let minIdx = 0;
    let minDist = getDistance(userPos, items[0].coordinates);
    
    for (let i = 1; i < items.length; i++) {
      const d = getDistance(userPos, items[i].coordinates);
      if (d < minDist) {
        minDist = d;
        minIdx = i;
      }
    }
    return items[minIdx].id;
  }, [items, userPos]);

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="relative aspect-video w-full bg-gray-900/40 rounded-[2rem] overflow-hidden border border-white/5 shadow-inner">
      {/* Dynamic Scanline Effect when searching */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:25px_25px]"></div>

      {/* User Location Marker - The Origin */}
      <div 
        className="absolute w-12 h-12 -ml-6 -mt-6 z-10 pointer-events-none"
        style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
      >
        <div className="w-full h-full border border-white/20 rounded-full animate-ping opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] relative">
              <div className="absolute -inset-2 border-2 border-white/30 rounded-full"></div>
           </div>
        </div>
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.4em] text-white/60 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">Origin</span>
      </div>

      {/* Item Markers */}
      {items.map((item) => {
        const isSelected = item.id === selectedItemId;
        const isClosest = item.id === closestItemId && filterType === 'location';
        const isTopRated = item.demandLevel === 'high';

        return (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`absolute group transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 ${isSelected ? 'z-40 scale-125' : 'hover:z-30'}`}
            style={{ left: `${item.coordinates.x}%`, top: `${item.coordinates.y}%` }}
          >
            <div className={`relative -ml-4 -mt-4 flex flex-col items-center`}>
              {/* Enhanced Aura for Closest Node */}
              {isClosest && (
                <>
                  <div className="absolute inset-0 w-8 h-8 rounded-full border-4 border-teal-500 animate-ping opacity-60" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full border border-teal-400 animate-ping opacity-30 delay-300" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-teal-500 text-black text-[7px] font-black uppercase tracking-widest rounded shadow-[0_0_10px_rgba(20,184,166,0.8)] animate-bounce">
                      Closest
                    </span>
                  </div>
                </>
              )}
              
              <div 
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-md
                  ${isSelected ? 'border-white bg-white/40 ring-4 ring-white/10' : 
                    filterType === 'rating' && isTopRated ? 'border-amber-500 bg-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.5)]' :
                    isClosest ? 'border-teal-400 bg-teal-400/40 shadow-[0_0_25px_rgba(20,184,166,0.7)] scale-110' : 
                    'border-white/20 bg-black/40 hover:border-white/60'}
                `}
              >
                {isTopRated && filterType === 'rating' && (
                  <span className="text-[10px] text-amber-500 font-black">★</span>
                )}
                {!isTopRated && isClosest && (
                  <div className="w-2.5 h-2.5 bg-teal-400 rounded-full shadow-[0_0_8px_white] animate-pulse" />
                )}
                {!isTopRated && !isClosest && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-white/40 group-hover:bg-white transition-colors'}`} />
                )}
              </div>
              
              <div className={`
                absolute top-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50 pointer-events-none
                ${isSelected ? 'opacity-100 translate-y-0' : ''}
              `}>
                <div className="bg-black/90 backdrop-blur-xl px-4 py-3 rounded-[1.2rem] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  <div className="font-black text-white text-[10px] uppercase tracking-[0.1em] mb-0.5 italic">{item.name}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-[9px] text-amber-500 font-black italic tracking-tighter tabular-nums">{formatNaira(item.numericPrice)}</div>
                    <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{item.vendorHandle}</div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {/* Legend Protocol */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-3 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Spatial Legend</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Target Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/60">High Heat Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
