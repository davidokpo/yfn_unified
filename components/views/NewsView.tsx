
import React, { useState } from 'react';
import { MOCK_ARTICLES } from '../../lib/database';
import { Article } from '../../types';

export const NewsView: React.FC<{ onQuote: (text: string) => void }> = ({ onQuote }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeHub, setActiveHub] = useState('LAGOS');
  const [syncing, setSyncing] = useState(false);

  const handleHubClick = (hub: string) => {
    if (hub === activeHub) return;
    setSyncing(true);
    setActiveHub(hub);
    setTimeout(() => setSyncing(false), 800);
  };

  const hotArticle = MOCK_ARTICLES.find(a => a.isHot);
  const trendingArticles = MOCK_ARTICLES.filter(a => a.isTrending);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-44 animate-fade-in space-y-16 pt-10">
      {/* City Hubs Navigation */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
        {['LAGOS', 'NAIROBI', 'ACCRA', 'DAKAR', 'JOBURG'].map((hub) => (
          <div 
            key={hub} 
            onClick={() => handleHubClick(hub)}
            className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-full p-[2px] transition-all duration-500 ${activeHub === hub ? 'bg-amber-500 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/10 group-hover:bg-white/30'}`}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-gray-950 relative">
                <img src={`https://picsum.photos/seed/${hub}/150/150`} className={`w-full h-full object-cover transition-all ${activeHub === hub ? 'opacity-100' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} alt={hub} />
                {syncing && activeHub === hub && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            <span className={`text-[9px] font-black tracking-[0.2em] transition-colors ${activeHub === hub ? 'text-amber-500' : 'text-gray-500 group-hover:text-white'}`}>{hub}</span>
          </div>
        ))}
      </div>

      {/* Featured Story */}
      {hotArticle && (
        <div 
          className="relative h-[500px] rounded-[3.5rem] overflow-hidden shadow-2xl cursor-pointer group shimmer-titanium"
          onClick={() => setSelectedArticle(hotArticle)}
        >
          <img src={hotArticle.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-12 flex flex-col justify-end">
            <div className="space-y-4 max-w-2xl">
              <div className="flex gap-2">
                 <span className="px-4 py-1.5 bg-white text-black text-[9px] font-black uppercase rounded-full tracking-widest">Global Heat</span>
                 <span className="px-4 py-1.5 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[9px] font-black uppercase rounded-full tracking-widest">{activeHub} SYNCED</span>
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500">{hotArticle.title}</h2>
              <p className="text-gray-300 text-lg font-medium line-clamp-2">{hotArticle.excerpt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trending List */}
      <div className="space-y-8">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Trending in the Universe</h3>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest">LIVE DATA</span>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trendingArticles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => setSelectedArticle(article)}
              className="bg-white/5 rounded-[2.5rem] p-6 space-y-4 group cursor-pointer hover:bg-white/[0.08] transition-all border border-white/5 hover:border-white/20 spring-pop shadow-xl"
            >
              <div className="aspect-video rounded-3xl overflow-hidden bg-gray-900 relative">
                <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white tracking-widest border border-white/10">ARTICLE #{article.id}</div>
              </div>
              <div className="px-2">
                 <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">{article.category}</p>
                 <h4 className="text-2xl font-black italic leading-tight group-hover:text-amber-500 transition-colors">{article.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto flex flex-col items-center pt-24 pb-48 px-6">
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="fixed top-12 right-12 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-black z-[110] spring-pop shadow-2xl hover:bg-amber-500 transition-colors"
          >✕</button>
          
          <div className="max-w-xl w-full space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 shimmer-titanium">
              <img src={selectedArticle.image} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">{selectedArticle.category}</p>
              <h1 className="text-5xl font-black italic leading-none">{selectedArticle.title}</h1>
              <div className="flex items-center gap-4 py-6 border-y border-white/10">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl italic">
                   {selectedArticle.author[0]}
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Author Node</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">{selectedArticle.author}</p>
                 </div>
                 <div className="ml-auto flex gap-2">
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all spring-pop">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                 </div>
              </div>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed font-medium">
              {selectedArticle.content}
            </p>

            <button onClick={() => setSelectedArticle(null)} className="w-full py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-amber-500 transition-all spring-pop shadow-2xl">Exit Reader Protocol</button>
          </div>
        </div>
      )}
    </div>
  );
};
