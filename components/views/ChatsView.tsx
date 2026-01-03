
import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '../../types';
import { GoogleGenAI } from '@google/genai';

interface ChatsViewProps {
  initialContactId?: string | null;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', participantId: 'yfn_universe', participantName: 'YFN Support', participantAvatar: 'https://picsum.photos/seed/yfn/100/100', lastMessage: 'Welcome to the Universe!', lastTimestamp: '2h ago', unreadCount: 0 },
  { id: 'c2', participantId: 'davina_soles', participantName: 'Davina Soles', participantAvatar: 'https://picsum.photos/seed/davina/100/100', lastMessage: 'Is the item still available?', lastTimestamp: '1d ago', unreadCount: 2 },
  { id: 'c3', participantId: 'heis_protocol', participantName: 'Rema (HEIS)', participantAvatar: 'https://picsum.photos/seed/sound/100/100', lastMessage: 'That new drop is fire.', lastTimestamp: '3d ago', unreadCount: 0 },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', senderId: 'yfn_universe', text: "Hello! I'm your YFN assistant. How can I help you navigate the marketplace today?", timestamp: '2h ago', isAI: true }
  ],
  'c2': [
    { id: 'm2', senderId: 'davina_soles', text: "Hi Zion! I saw your collection.", timestamp: '1d ago' },
    { id: 'm3', senderId: 'davina_soles', text: "Is the Premium Silk Agbada still in stock?", timestamp: '1d ago' }
  ]
};

export const ChatsView: React.FC<ChatsViewProps> = ({ initialContactId }) => {
  const [activeConvId, setActiveConvId] = useState<string | null>(initialContactId ? 'c2' : 'c1'); // Mock logic for demo
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTypingAI, setIsTypingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeConvId]);

  const activeConv = MOCK_CONVERSATIONS.find(c => c.id === activeConvId);

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConvId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'self',
      text: inputText,
      timestamp: 'Just now'
    };

    setMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), userMsg]
    }));
    setInputText('');

    // If talking to YFN Support, simulate AI response
    if (activeConvId === 'c1') {
      setIsTypingAI(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `The user said: "${inputText}". You are a helpful support assistant for YFN, a social commerce app in Nigeria. Keep your response short, helpful, and friendly.`
        });
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'yfn_universe',
          text: response.text || "I'm here to help!",
          timestamp: 'Just now',
          isAI: true
        };
        
        setMessages(prev => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), aiMsg]
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsTypingAI(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[70vh] flex bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-fade-in">
      
      {/* Conversations List */}
      <div className="w-80 border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5">
           <h3 className="text-xl font-black italic text-white tracking-tighter">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
          {MOCK_CONVERSATIONS.map(conv => (
            <button 
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all ${activeConvId === conv.id ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="relative">
                <img src={conv.participantAvatar} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                {conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#050505]">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-black uppercase tracking-tight truncate">{conv.participantName}</p>
                <p className={`text-[10px] truncate ${activeConvId === conv.id ? 'text-gray-600' : 'text-gray-500'}`}>{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chat Thread */}
      <div className="flex-1 flex flex-col bg-white/[0.02]">
        {activeConv ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
               <div className="flex items-center gap-4">
                  <img src={activeConv.participantAvatar} className="w-10 h-10 rounded-xl" alt="" />
                  <div>
                    <p className="text-[12px] font-black text-white uppercase tracking-widest">{activeConv.participantName}</p>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
               </div>
               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
               </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
            >
              {(messages[activeConvId] || []).map(msg => {
                const isSelf = msg.senderId === 'self';
                return (
                  <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-5 rounded-[2rem] text-sm font-medium ${isSelf ? 'bg-teal-500 text-black' : 'bg-white/10 text-white'}`}>
                      {msg.text}
                      <p className={`text-[8px] font-black uppercase mt-2 opacity-50 ${isSelf ? 'text-black' : 'text-gray-400'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                );
              })}
              {isTypingAI && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-3xl animate-pulse text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-black/20">
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
                <button 
                  onClick={sendMessage}
                  className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-teal-500 transition-all spring-pop"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl">💬</div>
             <div className="space-y-2">
               <h4 className="text-xl font-black italic text-white">Select a chat to begin</h4>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Connect with creators and merchants across the universe.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
