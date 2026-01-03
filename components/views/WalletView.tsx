
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../../types';
import { RechargeModal } from '../ui/RechargeModal';

interface WalletViewProps {
  balance: number;
  transactions: Transaction[];
  onTransaction: (amount: number, label: string, type: 'incoming' | 'outgoing', category?: Transaction['category']) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ balance, transactions, onTransaction }) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    if (displayBalance === balance) return;
    const diff = balance - displayBalance;
    const step = Math.max(0.01, Math.abs(diff) / 10);
    const timeout = setTimeout(() => {
      setDisplayBalance(prev => {
        const next = diff > 0 ? prev + step : prev - step;
        if ((diff > 0 && next > balance) || (diff < 0 && next < balance)) return balance;
        return next;
      });
    }, 10);
    return () => clearTimeout(timeout);
  }, [balance, displayBalance]);

  const handleWithdraw = () => {
    if (balance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      onTransaction(balance, "Sovereign Vault Withdrawal", "outgoing", "sale");
      setIsWithdrawing(false);
    }, 2000);
  };

  const handleRechargeSuccess = (amount: number) => {
    onTransaction(amount, `Cloud Node Sync`, 'incoming', 'recharge');
    setShowRechargeModal(false);
    setCustomAmount('');
  };

  const formatNairaKobo = (amt: number) => 
    new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN', 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amt);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === 'all') return true;
      if (filter === 'income') return tx.type === 'incoming';
      if (filter === 'expense') return tx.type === 'outgoing';
      return true;
    });
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => {
    const today = filteredTransactions.filter(t => t.date === 'Just now' || t.date.includes('h ago'));
    const earlier = filteredTransactions.filter(t => !today.includes(t));
    return { today, earlier };
  }, [filteredTransactions]);

  const getActionIcon = (category: Transaction['category'], type: 'incoming' | 'outgoing') => {
    if (type === 'incoming') {
      switch(category) {
        case 'recharge': return '⚡';
        case 'reward': return '🎁';
        case 'referral': return '🔗';
        case 'royalty': return '👑';
        default: return '🌾';
      }
    }
    return category === 'purchase' ? '🛡️' : '🌊';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-48 animate-fade-in space-y-24">
      
      {/* 1. Sovereign Wealth Node (Main Balance) */}
      <div className="relative">
        {/* Decorative Background Patterns */}
        <div className="absolute -inset-20 bg-gradient-to-tr from-amber-500/10 via-transparent to-teal-500/10 rounded-[6rem] blur-[120px] opacity-40 pointer-events-none"></div>
        
        <div className="relative bg-[#080808] border border-white/5 rounded-[4rem] p-12 md:p-24 flex flex-col items-center text-center shadow-3xl overflow-hidden shimmer-titanium group">
          {/* Adinkra Pattern Watermark (Sankofa Symbol Representation) */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none overflow-hidden flex items-center justify-center">
             <div className="text-[40rem] font-black rotate-12 leading-none">◈</div>
          </div>

          <div className="relative z-10 space-y-8 w-full max-w-2xl">
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.6em]">Universe Capital Reserve</p>
            </div>
            
            <h2 className="text-6xl md:text-9xl font-black italic tabular-nums leading-none tracking-tighter text-white drop-shadow-2xl">
              {formatNairaKobo(displayBalance)}
            </h2>
            
            <div className="flex flex-wrap justify-center gap-6 pt-12">
              <button 
                onClick={handleWithdraw}
                disabled={balance <= 0 || isWithdrawing}
                className="group relative px-16 py-7 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all spring-pop disabled:opacity-20 shadow-2xl flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                {isWithdrawing ? (
                  <div className="relative z-10 w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="relative z-10">Withdrawal protocol</span>
                )}
              </button>
            </div>
          </div>
          
          {/* Bottom stats mini-cards */}
          <div className="grid grid-cols-2 gap-4 w-full mt-16 max-w-md relative z-10">
             <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Node Trust Score</span>
                <span className="text-sm font-black text-teal-400 italic">4.9 / 5.0</span>
             </div>
             <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex flex-col items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Protocol Rank</span>
                <span className="text-sm font-black text-amber-500 italic">Prestige Elite</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Capital Injection Section (Recharge) */}
      <div className="space-y-10">
        <div className="flex items-center gap-6 px-4">
           <h3 className="text-2xl font-black italic tracking-tighter text-white whitespace-nowrap">Capital Injection</h3>
           <div className="h-px w-full bg-white/5"></div>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8">
          {/* Information Card */}
          <div className="md:col-span-2 group">
            <div className="h-full p-10 bg-white/5 border border-white/10 rounded-[3.5rem] flex flex-col justify-between relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-white/20">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black italic text-white tracking-tighter">Native Cloud Sync</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">
                  Securely seed your wallet using the PlayStore or App Store payment rail. High-fidelity encryption ensures instant node synchronization.
                </p>
              </div>
              <div className="pt-8 flex items-center gap-3">
                 <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#050505] flex items-center justify-center text-[10px]">💳</div>
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#050505] flex items-center justify-center text-[10px]">📱</div>
                 </div>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Verified payment nodes only</span>
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-[3.5rem] p-10 md:p-12 space-y-10 relative shadow-2xl overflow-hidden">
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.5em] ml-6">Injection Amount (₦)</label>
              <div className="relative group">
                <input 
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-10 text-5xl font-black text-amber-500 focus:outline-none focus:border-amber-500/50 focus:ring-8 focus:ring-amber-500/5 transition-all tabular-nums"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-700 font-black italic text-xl">NGN</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowRechargeModal(true)}
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="group w-full py-8 bg-[#007AFF] text-white rounded-full font-black uppercase tracking-[0.5em] text-[11px] shadow-3xl active:scale-95 transition-all disabled:opacity-10 hover:bg-white hover:text-black flex items-center justify-center gap-4 relative overflow-hidden"
            >
              <span className="relative z-10">Confirm Node Injection</span>
              <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sankofa Logs (Transaction History) */}
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 px-4">
          <div className="space-y-3">
            <h3 className="text-4xl font-black italic tracking-tighter text-white leading-none">Sankofa Logs</h3>
            <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em] italic">Tracing the path of capital...</p>
          </div>
          
          <div className="flex bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-2xl shadow-xl">
             {(['all', 'income', 'expense'] as const).map((t) => (
               <button 
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all spring-pop ${filter === t ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-20">
          {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([period, txs]) => txs.length > 0 && (
            <div key={period} className="space-y-10 animate-fade-in">
              <div className="flex items-center gap-8 px-6">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] whitespace-nowrap italic">{period === 'today' ? 'Active Protocol Cycle' : 'Archive Data'}</span>
                <div className="h-px w-full bg-white/5"></div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {txs.map((tx, idx) => (
                  <div 
                    key={tx.id} 
                    className="group bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 cursor-pointer shadow-xl relative overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2 ${tx.status === 'pending' ? 'bg-amber-500' : tx.type === 'incoming' ? 'bg-teal-500' : 'bg-gray-800'}`}></div>
                    
                    <div className="flex items-center gap-10">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6 ${tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : tx.type === 'incoming' ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-gray-600'}`}>
                        {getActionIcon(tx.category, tx.type)}
                      </div>
                      <div className="text-left space-y-2">
                        <p className="text-2xl font-black italic text-white group-hover:text-amber-500 transition-colors leading-tight">{tx.label}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{tx.status === 'pending' ? 'Locked in Escrow' : tx.category}</span>
                          <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{tx.date}</span>
                          <span className="text-[9px] font-bold text-gray-800 uppercase tracking-tighter">ID: {tx.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right mt-10 md:mt-0 space-y-2">
                      <p className={`text-4xl font-black tabular-nums italic tracking-tighter ${tx.type === 'incoming' ? 'text-teal-400' : 'text-white'}`}>
                        {tx.type === 'incoming' ? '+' : '-'}{formatNairaKobo(tx.amount)}
                      </p>
                      <div className="flex items-center justify-end gap-3">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                          tx.status === 'confirmed' || tx.status === 'released' ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' : 
                          tx.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse' :
                          'bg-gray-800 border-white/5 text-gray-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="py-40 text-center space-y-8 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[4rem]">
             <div className="text-6xl opacity-20">🕳️</div>
             <p className="text-[12px] font-black text-gray-600 uppercase tracking-[0.5em]">No Protocol Activity Detected</p>
          </div>
        )}
      </div>

      {showRechargeModal && (
        <RechargeModal 
          bundle={{
            id: 'native-sync',
            amount: parseFloat(customAmount),
            price: parseFloat(customAmount),
            label: `Native Node Synchronization`,
            color: 'bg-blue-600'
          }}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={handleRechargeSuccess}
        />
      )}
    </div>
  );
};
