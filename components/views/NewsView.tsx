
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ARTICLES } from '../../lib/database';
import { Article, ArticleType, MarketDataPoint, NewsViewProps } from '../../types';

const PulseChart: React.FC<{ data: MarketDataPoint[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full bg-black/40 rounded-[3rem] border border-white/10 p-12 space-y-10 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></div>
            <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Live Node</span>
         </div>
      </div>

      <div className="space-y-2">
         <h3 className="text-2xl font-black italic text-white tracking-tighter">Market Resonance</h3>
         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metric: Relative Acquisition Delta</p>
      </div>

      <div className="flex items-end justify-between h-48 gap-4 pt-8">
        {data.map((point, idx) => {
          const heightPercent = (point.value / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-4 group relative">
              {point.event && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 animate-in slide-in-from-bottom-2 duration-700">
                  <div className="px-3 py-1 bg-white text-black text-[8px] font-black uppercase rounded shadow-xl relative">
                    {point.event}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </div>
                </div>
              )}
              
              <div 
                className={`w-full rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${point.value === maxVal ? 'bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'bg-white/10 group-hover:bg-white/30'}`}
                style={{ height: `${heightPercent}%`, transitionDelay: `${idx * 100}ms` }}
              >
                {point.value === maxVal && (
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-white italic">
                      +{point.value}%
                   </div>
                )}
              </div>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{point.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-8 justify-between">
         <div className="flex gap-6">
            <div className="space-y-1">
               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Target Asset</p>
               <p className="text-xs font-black text-white italic">Artisanal Footwear</p>
            </div>
            <div className="space-y-1">
               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Trigger</p>
               <p className="text-xs font-black text-teal-500 italic">Burna Boy Visual</p>
            </div>
         </div>
         <p className="text-[9px] font-medium text-gray-500 leading-relaxed max-w-xs italic">
           Correlation detected between cultural node activation and marketplace spikes.
         </p>
      </div>
    </div>
  );
};

type HubFilter = 'subscriptions' | 'saved' | 'opened' | 'finished';

export const NewsView: React.FC<NewsViewProps> = ({ onQuote, transactions = [], wishlist = [], onViewProfile }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<ArticleType | 'HUB'>('HUB');
  const [hubFilter, setHubFilter] = useState<HubFilter>('subscriptions');
  const [articleStates, setArticleStates] = useState<Record<number, HubFilter>>({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const userInterestCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    [...transactions.map(t => t.label), ...wishlist.map(w => w.category)].forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'GENERAL';
  }, [transactions, wishlist]);

  const featuredArticles = useMemo(() => {
    const base = MOCK_ARTICLES.filter(a => a.isHot || a.isAI || a.isTrending || a.isOfficial);
    const officialInsight = base.find(a => a.id === 101);
    if (officialInsight) {
      officialInsight.title = `YFN Pulse: ${userInterestCategory} Delta Identified`;
      officialInsight.excerpt = `Analyzing massive yield potential for your ${userInterestCategory} node based on recent protocol activity.`;
    }
    return base.slice(0, 5);
  }, [userInterestCategory]);

  const followedNodes = useMemo(() => [
    { id: 'yfn_universe', name: 'YFN Official', handle: '@universe', avatar: 'https://picsum.photos/seed/yfn/100/100', isOfficial: true },
    { id: '0xVANCE_82', name: 'Zion Vance', handle: '@vance', avatar: 'https://picsum.photos/seed/vance/100/100' },
    { id: 'node_ai', name: 'Pulse AI', handle: '@pulse', avatar: 'https://picsum.photos/seed/ai/100/100', isAI: true },
    { id: 'heis_protocol', name: 'HEIS Protocol', handle: '@rema', avatar: 'https://picsum.photos/seed/sound/100/100' },
  ], []);

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'HUB') {
      if (hubFilter === 'subscriptions') {
        const authorIds = followedNodes.map(n => n.id);
        return authorIds.map(aid => 
          // FIX: Corrected typo 'articleAuthorId' to 'a.authorId'
          MOCK_ARTICLES.filter(a => a.authorId === aid).sort((a,b) => b.id - a.id)[0]
        ).filter(Boolean);
      }
      return MOCK_ARTICLES.filter(a => articleStates[a.id] === hubFilter);
    }
    return MOCK_ARTICLES.filter(a => a.category === activeCategory);
  }, [activeCategory, hubFilter, articleStates, followedNodes]);

  useEffect(() => {
    if (activeCategory !== 'HUB' || featuredArticles.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeCategory, featuredArticles.length]);

  // FIX: Added missing LEGAL_PROTOCOL property to match ArticleType definition in Record
  const categoryLabels: Record<ArticleType, string> = {
    'COMMUNITY_HUB': 'Features',
    'NEWS': 'News',
    'BUSINESS_INSIGHT': 'Insights',
    'CULTURE_HEAT': 'Heat',
    'LEGAL_PROTOCOL': 'Legal'
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    if (!articleStates[article.id] || (articleStates[article.id] !== 'finished' && articleStates[article.id] !== 'saved')) {
      setArticleStates(prev => ({ ...prev, [article.id]: 'opened' }));
    }
  };

  const updateArticleState = (id: number, newState: HubFilter) => {
    setArticleStates(prev => ({ ...prev, [id]: newState }));
  };

  const handleAuthorClick = (e: React.MouseEvent, authorId: string) => {
    e.stopPropagation();
    onViewProfile(authorId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-44 animate-fade-in space-y-16 pt-10">
      
      {/* Featured Slideshow */}
      {activeCategory === 'HUB' && (
        <div className="relative h-[480px] md:h-[400px] w-full rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl group">
          {featuredArticles.map((slide, idx) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlideIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
            >
              <div className="absolute inset-0">
                <img src={slide.image} className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[10s] ease-linear" alt={slide.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
              </div>

              <div className="absolute inset-0 p-12 flex flex-col justify-end gap-6">
                <div className={`flex items-center gap-4 transition-all duration-700 delay-100 ${idx === currentSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                   <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                     slide.isOfficial ? 'bg-white text-black ring-4 ring-white/20' :
                     slide.category === 'BUSINESS_INSIGHT' ? 'bg-teal-500 text-black' :
                     slide.category === 'CULTURE_HEAT' ? 'bg-red-600 text-white' :
                     'bg-amber-500 text-black'
                   }`}>
                     {slide.isOfficial ? 'YFN Official Protocol' : slide.isAI ? 'Pulse Bot Analysis' : categoryLabels[slide.category]}
                   </span>
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${slide.isOfficial ? 'bg-white shadow-[0_0_8px_white]' : 'bg-teal-500'}`}></div>
                     <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{slide.isOfficial ? 'Universe Node Verified' : 'Node Verified'}</span>
                   </div>
                </div>

                <div className={`space-y-4 transition-all duration-700 delay-200 ${idx === currentSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <h3 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter leading-[1] max-w-2xl">{slide.title}</h3>
                  <p className="text-[14px] md:text-[16px] font-medium text-gray-400 line-clamp-2 leading-relaxed max-w-xl">"{slide.excerpt}"</p>
                </div>

                <div className={`pt-4 transition-all duration-700 delay-300 ${idx === currentSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <button 
                    onClick={() => handleOpenArticle(slide)}
                    className={`group/btn relative px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:pr-12 ${slide.isOfficial ? 'bg-amber-500 text-black' : 'bg-white text-black'}`}
                  >
                    <span className="relative z-10">{slide.isOfficial ? 'ACCESS UNIVERSE' : 'DECRYPT NODE'}</span>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-all">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-10 right-12 z-20 flex gap-2">
            {featuredArticles.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlideIndex ? 'w-8 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Primary Category Switcher */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
        {(['HUB', 'COMMUNITY_HUB', 'NEWS', 'BUSINESS_INSIGHT', 'CULTURE_HEAT'] as const).map(cat => (
          <button 
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              if (cat !== 'HUB') setHubFilter('subscriptions');
            }}
            className={`flex-shrink-0 px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all border spring-pop ${
              activeCategory === cat ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-transparent text-gray-500 border-white/5 hover:border-white/20'
            }`}
          >
            {cat === 'HUB' ? 'Universe Hub' : categoryLabels[cat as keyof typeof categoryLabels]}
          </button>
        ))}
      </div>

      {/* Universe Hub: Integrated Sub-Filters */}
      {activeCategory === 'HUB' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className="flex gap-10 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
            {(['subscriptions', 'saved', 'opened', 'finished'] as HubFilter[]).map(filter => (
              <button 
                key={filter}
                onClick={() => setHubFilter(filter)}
                className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all relative pb-2 whitespace-nowrap ${hubFilter === filter ? 'text-white' : 'text-gray-600 hover:text-white'}`}
              >
                {filter}
                {hubFilter === filter && <div className="absolute bottom-0 inset-x-0 h-1 bg-white rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Bold Card Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 min-h-[400px]">
        {filteredArticles.length > 0 ? filteredArticles.map((article, idx) => {
          const isHubView = activeCategory === 'HUB';
          const isSubscription = isHubView && hubFilter === 'subscriptions';
          const nodeInfo = followedNodes.find(n => n.id === article.authorId);

          return (
            <div 
              key={article.id} 
              onClick={() => handleOpenArticle(article)}
              className={`group relative flex flex-col gap-8 animate-item-reveal cursor-pointer transition-all duration-500 p-8 rounded-[4rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Header: Dynamic Node Identity */}
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-4 cursor-pointer" onClick={(e) => handleAuthorClick(e, article.authorId)}>
                    <div className={`w-12 h-12 rounded-2xl border-2 p-0.5 ${nodeInfo?.isOfficial ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-white/10 hover:border-white/40'} transition-all`}>
                       <img src={nodeInfo?.avatar || article.image} className="w-full h-full rounded-2xl object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${nodeInfo?.isOfficial ? 'text-amber-500' : 'text-white group-hover:text-amber-500'} transition-colors`}>
                        {nodeInfo?.name || article.author}
                      </span>
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">
                        {isSubscription ? 'Recent Protocol Update' : `Node Status: ${hubFilter}`}
                      </span>
                    </div>
                 </div>
                 {isSubscription && <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>}
              </div>

              {/* Media Node */}
              <div className="aspect-[16/10] rounded-[3rem] overflow-hidden bg-gray-900 border border-white/5 relative">
                <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-60" />
                <div className="absolute top-6 left-6 flex gap-3">
                   <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl ${
                     article.isOfficial ? 'bg-amber-500 text-black' :
                     article.category === 'NEWS' ? 'bg-red-500 text-white' : 
                     article.category === 'COMMUNITY_HUB' ? 'bg-teal-500 text-white' : 
                     'bg-white text-black'
                   }`}>
                     {categoryLabels[article.category]}
                   </span>
                </div>
              </div>

              {/* Content Node */}
              <div className="px-2 space-y-6">
                 <h4 className={`text-4xl font-black italic tracking-tighter leading-[1.1] transition-colors ${article.isOfficial ? 'text-amber-500' : 'text-white group-hover:text-amber-500'}`}>
                   {article.title}
                 </h4>
                 <p className="text-[14px] font-medium text-gray-400 leading-relaxed line-clamp-3 italic opacity-80">
                   "{article.excerpt}"
                 </p>
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">{article.date} • {article.authorId}</span>
                    <div className={`w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center transition-all ${article.isOfficial ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'text-white/40 group-hover:border-amber-500 group-hover:text-amber-500 group-hover:bg-amber-500/10'}`}>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                 </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-48 text-center bg-white/5 rounded-[5rem] border-2 border-dashed border-white/10 animate-fade-in">
             <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-700">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </div>
             <p className="text-[14px] font-black text-gray-500 uppercase tracking-[0.8em]">Hub Station Empty</p>
             <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-4 italic">Initialize Node Subscriptions to populate your Universe Hub</p>
          </div>
        )}
      </div>

      {/* Reader Protocol Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl animate-fade-in overflow-y-auto flex flex-col items-center pt-24 pb-48 px-6">
          <div className="fixed top-12 right-12 flex gap-4 z-[110]">
             <button 
               onClick={() => updateArticleState(selectedArticle.id, articleStates[selectedArticle.id] === 'saved' ? 'opened' : 'saved')}
               className={`w-14 h-14 rounded-full flex items-center justify-center font-black spring-pop shadow-2xl transition-all ${articleStates[selectedArticle.id] === 'saved' ? 'bg-rose-500 text-white ring-4 ring-rose-500/20' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
             >
               {articleStates[selectedArticle.id] === 'saved' ? '♥' : '♡'}
             </button>
             <button 
               onClick={() => setSelectedArticle(null)} 
               className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-black spring-pop shadow-2xl hover:bg-amber-500 transition-colors text-xl"
             >✕</button>
          </div>
          
          <div className="max-w-xl w-full space-y-16 animate-in slide-in-from-bottom-10 duration-700">
            <div className="aspect-video w-full rounded-[4rem] overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
              <img src={selectedArticle.image} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-8 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <span className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl tracking-widest ${
                   selectedArticle.isOfficial ? 'bg-amber-500 text-black' :
                   selectedArticle.category === 'NEWS' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                 }`}>
                   {selectedArticle.isOfficial ? 'Official Verse' : categoryLabels[selectedArticle.category]}
                 </span>
                 <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{selectedArticle.date}</span>
              </div>
              <h1 className="text-6xl font-black italic leading-[1] tracking-tighter text-white">{selectedArticle.title}</h1>
              <div 
                className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white cursor-pointer transition-colors"
                onClick={(e) => handleAuthorClick(e, selectedArticle.authorId)}
              >
                By {selectedArticle.author}
              </div>
            </div>

            {selectedArticle.category === 'BUSINESS_INSIGHT' && selectedArticle.marketData && (
              <PulseChart data={selectedArticle.marketData} />
            )}

            <p className="text-[22px] text-gray-300 leading-[1.6] font-medium first-letter:text-8xl first-letter:font-black first-letter:mr-5 first-letter:float-left first-letter:text-white first-letter:italic mb-24">
              {selectedArticle.content}
            </p>

            <div className="space-y-6 pt-16 border-t border-white/10">
               <button 
                 onClick={() => {
                   updateArticleState(selectedArticle.id, 'finished');
                   setSelectedArticle(null);
                 }}
                 className="w-full py-10 bg-teal-500 text-black rounded-full font-black uppercase tracking-[0.4em] hover:bg-white transition-all shadow-2xl text-[13px]"
               >
                 MARK AS FINISHED & ARCHIVE
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
