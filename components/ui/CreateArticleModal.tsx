
import React, { useState } from 'react';
import { Article, YouthProfile, ArticleType } from '../../types';

interface CreateArticleModalProps {
  onClose: () => void;
  onPost: (article: Article) => void;
}

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({ onClose, onPost }) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState<ArticleType>('COMMUNITY_HUB');
  const [featuredProfiles, setFeaturedProfiles] = useState<YouthProfile[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const categories: ArticleType[] = ['COMMUNITY_HUB', 'NEWS', 'BUSINESS_INSIGHT', 'CULTURE_HEAT'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addProfile = () => {
    const newProfile: YouthProfile = {
      name: 'New Talent',
      age: 20,
      origin: 'Lagos',
      school: 'University of Node',
      who: 'A creative spirit.',
      what: 'Innovating the space.',
      how: 'Started with curiosity.',
      failures: 'None yet.',
      successes: 'Just starting out.',
      techStartDate: '2024',
      image: 'https://picsum.photos/seed/youth/300/300'
    };
    setFeaturedProfiles([...featuredProfiles, newProfile]);
  };

  const handlePost = () => {
    if (!title || !content || !image) return;
    setIsPosting(true);

    const newArticle: Article = {
      id: Date.now(),
      title,
      excerpt,
      content,
      author: "Zion Vance",
      authorId: "0xVANCE_82",
      date: "Just now",
      category,
      image,
      featuredProfiles
    };

    setTimeout(() => {
      onPost(newArticle);
      setIsPosting(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white text-black rounded-[4rem] p-12 space-y-12 relative my-10 shadow-2xl">
        <button onClick={onClose} className="absolute top-12 right-12 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-black transition-all">✕</button>
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter">Draft Feature</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Magazine Protocol v4.0</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Article Title</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-2xl font-black italic focus:outline-none focus:border-black"
              placeholder="The Future of..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Category</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value as ArticleType)}
                className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-black focus:outline-none appearance-none"
              >
                {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Hero Image</label>
               <input type="file" onChange={handleFileChange} className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-[10px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Narrative Content</label>
            <textarea 
              value={content} onChange={e => setContent(e.target.value)}
              className="w-full h-48 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-medium leading-relaxed focus:outline-none focus:border-black resize-none"
              placeholder="Tell the story..."
            />
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center px-4">
                <p className="text-[10px] font-black uppercase text-black tracking-widest">Success Story Profiles</p>
                <button 
                  onClick={addProfile}
                  className="px-4 py-2 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all"
                >
                  + Add Profile
                </button>
             </div>
             
             {featuredProfiles.length > 0 && (
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4">
                  {featuredProfiles.map((p, i) => (
                    <div key={i} className="flex-shrink-0 w-48 h-64 bg-gray-50 rounded-3xl border border-gray-100 p-4 flex flex-col items-center justify-center text-center space-y-3">
                       <div className="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden">
                         <img src={p.image} className="w-full h-full object-cover" />
                       </div>
                       <p className="text-[10px] font-black italic">{p.name}</p>
                       <p className="text-[8px] text-gray-400 uppercase">{p.origin}</p>
                    </div>
                  ))}
               </div>
             )}
          </div>

          <button 
            onClick={handlePost}
            disabled={!title || !content || !image || isPosting}
            className={`w-full py-8 rounded-full font-black uppercase tracking-[0.4em] text-xs transition-all shadow-2xl ${isPosting ? 'bg-gray-100 text-gray-400 animate-pulse' : 'bg-black text-white hover:bg-teal-500'}`}
          >
            {isPosting ? 'Publishing to Cloud Node...' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
};
