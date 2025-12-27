
import React, { useState } from 'react';
import { Collection, MarketplaceItem } from '../../types';

interface AddToCollectionModalProps {
  item: MarketplaceItem;
  collections: Collection[];
  onClose: () => void;
  onAdd: (collectionId: string, itemId: number) => void;
  onCreate: (name: string, itemId: number) => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ 
  item, collections, onClose, onAdd, onCreate 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim(), item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-sm bg-white text-black rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black">✕</button>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black italic tracking-tighter">Curate Asset</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign to Mood Board</p>
        </div>

        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-3">
          {collections.map(col => (
            <button 
              key={col.id}
              onClick={() => { onAdd(col.id, item.id); onClose(); }}
              className="w-full p-6 bg-gray-50 hover:bg-black hover:text-white rounded-2xl border border-gray-100 text-left transition-all flex items-center justify-between group"
            >
              <span className="font-black italic text-sm">{col.name}</span>
              <span className="text-[9px] font-bold uppercase text-gray-400 group-hover:text-white/50">{col.itemIds.length} items</span>
            </button>
          ))}

          {!isCreating ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full p-6 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-black hover:text-black transition-all"
            >
              + Create New Collection
            </button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <input 
                autoFocus
                type="text"
                placeholder="Collection Name..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:border-black"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-2">
                 <button onClick={() => setIsCreating(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-gray-400">Cancel</button>
                 <button onClick={handleCreate} className="flex-1 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 text-center">
          <p className="text-[9px] font-medium text-gray-400 leading-relaxed italic">
            Curating assets builds your spatial reputation and unlocks community perks.
          </p>
        </div>
      </div>
    </div>
  );
};
