
import React, { useState, useRef } from 'react';
import { UserPost } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
  onPost: (post: UserPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost }) => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!image) return;
    setIsPosting(true);
    
    const newPost: UserPost = {
      id: Date.now(),
      imageUrl: image,
      caption: caption,
      likes: 0,
      comments: 0,
      isPrivate: isPrivate,
      isAIDesign: false,
      designStatus: 'draft'
    };

    // Simulate network delay
    setTimeout(() => {
      onPost(newPost);
      setIsPosting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
      <div className="w-full max-w-lg bg-white text-black rounded-[3rem] p-10 space-y-8 relative shadow-2xl overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-gray-300 hover:text-black hover:bg-gray-100 rounded-full transition-all"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter">Share to Universe</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Node Broadcast Protocol</p>
        </div>

        <div className="space-y-6">
          {/* Image Upload Area */}
          <div 
            onClick={() => !image && fileInputRef.current?.click()}
            className={`aspect-square w-full rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative cursor-pointer ${image ? 'border-transparent' : 'border-gray-200 hover:border-black/20 hover:bg-gray-50'}`}
          >
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
                >
                  Change
                </button>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Visual Asset</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Caption Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-4">Manifesto / Caption</label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What are you manifesting?"
              className="w-full h-24 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm focus:outline-none focus:border-black transition-all resize-none font-medium"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black">Private Node</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Only visible to your followers</p>
            </div>
            <button 
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-500 ${isPrivate ? 'bg-black' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 ${isPrivate ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <button 
            disabled={!image || isPosting}
            onClick={handlePost}
            className={`w-full py-6 rounded-full font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl active:scale-95 ${isPosting ? 'bg-gray-100 text-gray-400 animate-pulse' : 'bg-black text-white hover:bg-gray-900'}`}
          >
            {isPosting ? 'Broadcasting...' : 'Broadcast to Universe'}
          </button>
        </div>
      </div>
    </div>
  );
};
