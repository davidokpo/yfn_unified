
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Transaction, CrystalPackage } from '../../types';
import { RechargeModal } from '../ui/RechargeModal';

interface WalletViewProps {
  balance: number;
  transactions: Transaction[];
  onTransaction: (amount: number, label: string, type: 'incoming' | 'outgoing', category?: Transaction['category']) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ balance, transactions, onTransaction }) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<CrystalPackage | null>(null);

  const crystalBundles: CrystalPackage[] = [
    { id: 'B1', credits: 500, price: 5000, label: 'Seedling Bundle', color: 'bg-teal-500' },
    { id: 'B2', credits: 1200, price: 10000, label: 'Oracle Bundle', bonus: '+20% Bonus', color: 'bg-amber-500' },
    { id: 'B3', credits: 5000, price: 40000, label: 'Apex Node', bonus: '+50% Bonus', color: 'bg-rose-500' },
    { id: 'B4', credits: 15000, price: 100000, label: 'Universe Tier', bonus: 'Exclusive Perk', color: 'bg-[#039be5]' },
  ];

  // Smooth balance counter animation
  useEffect(() => {
    if (displayBalance === balance) return;
    const diff = balance - displayBalance;
    const step = Math.max(1, Math.abs(diff) / 15);
    const timeout = setTimeout(() => {
      setDisplayBalance(prev => {
        const next = diff > 0 ? prev + step : prev - step;
        if ((diff > 0 && next > balance) || (diff < 0 && next < balance)) return balance;
        return next;
      });
    }, 20);
    return () => clearTimeout(timeout);
  }, [balance, displayBalance]);

  const getSankofaWisdom = async () => {
    setLoadingInsight(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a wise African fintech mentor. The user has a balance of ${balance} Naira. Give a punchy, 2-sentence piece of advice on wealth building through royalties and social commerce.`
      });
      setInsight(response.text);
    } catch (e) {
      setInsight("True wealth is like a tree; it grows from small seeds of creativity.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (filter === 'income') return transactions.filter(t => t.type === 'incoming');
    if (filter === 'expense') return transactions.filter(t => t.type === 'outgoing');
    return transactions;
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'incoming').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'outgoing').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense };
  }, [transactions]);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      onTransaction(balance, "Withdrawal to Bank", "outgoing");
      setIsWithdrawing(false);
      alert("Withdrawal initialized. Funds should settle within 24 hours.");
    }, 2000);
  };

  const handleRechargeSuccess = (amount: number) => {
    onTransaction(amount, `Crystal Recharge: ${selectedBundle?.label}`, 'incoming', 'recharge');
    setSelectedBundle(null);
  };

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-48 animate-fade-in space-y-16">
      
      {/* Dynamic Balance Header */}
      <div className="bg-white text-black rounded-[4rem] p-12 md:p-20 flex flex-col items-center text-center shadow-2xl relative overflow-hidden shimmer-titanium">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-4">Settlement Balance</p>
        <h2 className="text-6xl md:text-8xl font-black italic tabular-nums leading-none tracking-tighter mb-8 transition-all">
          {Math.floor(displayBalance).toLocaleString()}
        </h2>
        
        <div className="flex gap-4">
           <button 
             onClick={handleWithdraw}
             disabled={balance <= 0 || isWithdrawing}
             className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all spring-pop disabled:opacity-20 shadow-xl"
           >
             {isWithdrawing ? "Transferring..." : "Withdraw"}
           </button>
           <button 
            onClick={() => {
              const element = document.getElementById('crystal-shop');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-14 h-14 bg-amber-500 text-black rounded-full flex items-center justify-center hover:bg-amber-400 transition-all spring-pop shadow-lg animate-pulse"
          >
             <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
           </button>
        </div>
      </div>

      {/* Crystal Shop Section */}
      <div id="crystal-shop" className="space-y-8">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Recharge Credits</h3>
           <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">Hot Bundles</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {crystalBundles.map((bundle) => (
            <button 
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle)}
              className={`group relative p-6 rounded-[2.5rem] border border-white/5 transition-all spring-pop overflow-hidden ${bundle.color} hover:scale-105 active:scale-95 text-left`}
            >
               <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="space-y-1 relative z-10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-2 truncate">{bundle.label}</p>
                  <h4 className="text-2xl font-black italic tracking-tighter text-white leading-tight">{bundle.credits}</h4>
                  <p className="text-[10px] font-bold text-white/80">₦{bundle.price.toLocaleString()}</p>
                  {bundle.bonus && (
                    <div className="mt-4 inline-block px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest">
                      {bundle.bonus}
                    </div>
                  )}
               </div>
               <div className="absolute bottom-4 right-4 text-white opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-2 group hover:bg-white/10 transition-colors">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-teal-400 transition-colors">Total Earned</p>
           <p className="text-2xl font-black text-teal-400 tabular-nums">{formatNaira(stats.income)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-2 group hover:bg-white/10 transition-colors">
           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-rose-400 transition-colors">Total Spent</p>
           <p className="text-2xl font-black text-rose-400 tabular-nums">{formatNaira(stats.expense)}</p>
        </div>
      </div>

      {/* Merchant Insights (AI) */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[3rem] p-10 space-y-6 relative group overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg animate-sankofa">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/></svg>
          </div>
          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">Node Insights</h4>
        </div>
        <p className="text-xl font-medium text-gray-200 italic leading-relaxed min-h-[3rem]">
          {insight || "Your creative capital is growing. Diversify your designs to increase royalty streams."}
        </p>
        <button 
          onClick={getSankofaWisdom}
          disabled={loadingInsight}
          className="text-[10px] font-black uppercase text-amber-500 tracking-widest hover:text-white transition-all underline underline-offset-8 decoration-2 spring-pop"
        >
          {loadingInsight ? "Querying Neural Bank..." : "Get Market Wisdom"}
        </button>
      </div>

      {/* Transaction Ledger */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Transaction Ledger</h3>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
             {(['all', 'income', 'expense'] as const).map((t) => (
               <button 
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all spring-pop ${filter === t ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white/5 p-8 rounded-[3rem] flex items-center justify-between border border-white/5 group hover:bg-white/[0.08] hover:border-white/10 transition-all spring-pop cursor-default">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl transition-all ${
                    tx.type === 'incoming' 
                    ? 'bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20' 
                    : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                  }`}>
                    {tx.category === 'recharge' ? '⚡' : tx.category === 'royalty' ? '®' : tx.category === 'referral' ? '🔗' : tx.category === 'sale' ? '🛍️' : '₦'}
                  </div>
                  <div>
                    <p className="text-xl font-black italic tracking-tighter group-hover:text-white transition-colors leading-tight">{tx.label}</p>
                    <div className="flex items-center gap-3 mt-1">
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                         tx.type === 'incoming' ? 'bg-teal-500/20 text-teal-500' : 'bg-rose-500/20 text-rose-500'
                       }`}>
                         {tx.category}
                       </span>
                       <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black tabular-nums ${tx.type === 'incoming' ? 'text-teal-400' : 'text-white'}`}>
                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Confirmed Node</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 bg-white/2 rounded-[3rem] border border-dashed border-white/5">
               <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">No matching records in the ledger</p>
            </div>
          )}
        </div>
      </div>

      {selectedBundle && (
        <RechargeModal 
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
          onSuccess={handleRechargeSuccess}
        />
      )}
    </div>
  );
};
