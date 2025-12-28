
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, RechargeBundle } from '../../types';
import { RechargeModal } from '../ui/RechargeModal';

interface WalletViewProps {
  balance: number;
  transactions: Transaction[];
  onTransaction: (amount: number, label: string, type: 'incoming' | 'outgoing', category?: Transaction['category']) => void;
}

interface TierConfig {
  id: string;
  label: string;
  sublabel: string;
  cardClass: string;
  accentColor: string;
  patternOpacity: string;
  glowColor: string;
  threshold: number;
  nextLabel: string;
  perks: string[];
}

export const WalletView: React.FC<WalletViewProps> = ({ balance, transactions, onTransaction }) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<RechargeBundle | null>(null);

  // High-Fidelity Tier Configuration
  const tier: TierConfig = useMemo(() => {
    if (balance >= 1000000) {
      return {
        id: 'sovereign',
        label: 'SOVEREIGN NODE',
        sublabel: 'Black Obsidian Status',
        cardClass: 'bg-black border-cyan-500/40 text-white',
        accentColor: 'text-cyan-400',
        patternOpacity: 'opacity-20',
        glowColor: 'from-cyan-500/30 via-blue-500/10 to-transparent',
        threshold: 1000000,
        nextLabel: 'MAX CLEARANCE',
        perks: ['0% Processing Fees', 'Priority AI Rendering', 'Unlimited Vault Storage']
      };
    } else if (balance >= 250000) {
      return {
        id: 'elite',
        label: 'ELITE LIQUIDITY',
        sublabel: 'Titanium Gold Status',
        cardClass: 'bg-amber-950/40 border-amber-500/30 text-white',
        accentColor: 'text-amber-500',
        patternOpacity: 'opacity-15',
        glowColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
        threshold: 250000,
        nextLabel: 'SOVEREIGN NODE',
        perks: ['2% Cash-back on Sales', 'Extended AI Studio Access', 'Verified Merchant Badge']
      };
    } else if (balance >= 50000) {
      return {
        id: 'merchant',
        label: 'ACTIVE MERCHANT',
        sublabel: 'Silver Ivory Status',
        cardClass: 'bg-gray-900/80 border-white/20 text-white',
        accentColor: 'text-teal-400',
        patternOpacity: 'opacity-10',
        glowColor: 'from-teal-500/10 via-white/5 to-transparent',
        threshold: 50000,
        nextLabel: 'ELITE LIQUIDITY',
        perks: ['Marketplace Listing Access', 'Standard AI Try-On', 'Basic Wallet Sync']
      };
    } else {
      return {
        id: 'initiate',
        label: 'INITIATE NODE',
        sublabel: 'Standard Utility Status',
        cardClass: 'bg-white/5 border-white/10 text-white',
        accentColor: 'text-gray-400',
        patternOpacity: 'opacity-05',
        glowColor: 'from-white/5 via-transparent to-transparent',
        threshold: 0,
        nextLabel: 'ACTIVE MERCHANT',
        perks: ['Basic Browsing Only', 'Limited AI Preview', 'Manual Ledger']
      };
    }
  }, [balance]);

  const progressInfo = useMemo(() => {
    const thresholds = [50000, 250000, 1000000];
    const nextIdx = thresholds.findIndex(t => t > balance);
    if (nextIdx === -1) return { percent: 100, needed: 0, next: 'MAX ASCENSION' };
    
    const nextVal = thresholds[nextIdx];
    const prevVal = nextIdx === 0 ? 0 : thresholds[nextIdx - 1];
    const percent = Math.min(100, ((balance - prevVal) / (nextVal - prevVal)) * 100);
    return { percent, needed: nextVal - balance, next: tier.nextLabel };
  }, [balance, tier.nextLabel]);

  const fundingBundles: RechargeBundle[] = [
    { id: 'T1', amount: 10000.00, price: 10000.00, label: 'Standard Sync', color: 'bg-gray-400' },
    { id: 'T2', amount: 50000.00, price: 50000.00, label: 'Merchant Clearance', bonus: 'Instant Level Up', color: 'bg-teal-500' },
    { id: 'T3', amount: 250000.00, price: 250000.00, label: 'Elite Protocol', bonus: 'Unlock Platinum Rank', color: 'bg-amber-500' },
    { id: 'T4', amount: 1000000.00, price: 1000000.00, label: 'Sovereign Infusion', bonus: 'Infinite Node Access', color: 'bg-cyan-500' },
  ];

  // Fix: Calculate inflow/outflow stats from transactions history
  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'incoming') acc.income += tx.amount;
        else acc.expense += tx.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  // Fix: Filter transactions based on selected filter state
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === 'all') return true;
      if (filter === 'income') return tx.type === 'incoming';
      if (filter === 'expense') return tx.type === 'outgoing';
      return true;
    });
  }, [transactions, filter]);

  useEffect(() => {
    if (displayBalance === balance) return;
    const diff = balance - displayBalance;
    const step = Math.max(0.1, Math.abs(diff) / 15);
    const timeout = setTimeout(() => {
      setDisplayBalance(prev => {
        const next = diff > 0 ? prev + step : prev - step;
        if ((diff > 0 && next > balance) || (diff < 0 && next < balance)) return balance;
        return next;
      });
    }, 15);
    return () => clearTimeout(timeout);
  }, [balance, displayBalance]);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      onTransaction(balance, "Withdrawal to Bank Account", "outgoing", "sale");
      setIsWithdrawing(false);
      alert("Withdrawal Protocol Authenticated. Check your bank node in 15-30 mins.");
    }, 2000);
  };

  const handleRechargeSuccess = (amount: number) => {
    onTransaction(amount, `Liquidity Injection: Secure Gateway`, 'incoming', 'recharge');
    setSelectedBundle(null);
  };

  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amt);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-48 animate-fade-in space-y-24">
      
      {/* 1. Sovereign Identity Card */}
      <div className="relative group perspective-1000">
        <div className={`absolute -inset-10 bg-gradient-to-tr ${tier.glowColor} rounded-[8rem] blur-[120px] transition-all duration-1000`}></div>
        <div className={`relative ${tier.cardClass} backdrop-blur-3xl rounded-[5rem] p-12 md:p-20 flex flex-col items-center text-center shadow-2xl overflow-hidden border ring-1 ring-white/10 transition-all duration-1000`}>
          
          {/* Scanning Line Effect */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent -translate-y-full animate-[shimmer_4s_infinite_linear] pointer-events-none opacity-20"></div>

          {/* Pattern Layer */}
          <div className={`absolute inset-0 ${tier.patternOpacity} pointer-events-none transition-opacity duration-1000`}>
            <svg width="100%" height="100%">
              <pattern id="kente-sovereign" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 L60 0 L120 60 L60 120 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#kente-sovereign)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-12 w-full">
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className={`px-6 py-2 rounded-full border border-current mb-8 ${tier.accentColor} bg-current/5 transition-colors duration-1000`}>
                   <span className="text-[11px] font-black uppercase tracking-[0.5em]">{tier.label}</span>
                </div>
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-[0.3em] italic mb-2">{tier.sublabel}</p>
                <h2 className="text-6xl md:text-[8rem] font-black italic tabular-nums leading-none tracking-tighter group-hover:scale-105 transition-transform duration-1000">
                  {new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(displayBalance)}
                  <span className="text-4xl opacity-30 ml-2">.{(displayBalance % 1).toFixed(2).split('.')[1]}</span>
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {tier.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className={`w-1.5 h-1.5 rounded-full ${tier.accentColor.replace('text', 'bg')}`}></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{perk}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <button 
                onClick={handleWithdraw}
                disabled={balance <= 0 || isWithdrawing}
                className="px-16 py-6 bg-white text-black rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-amber-500 transition-all spring-pop disabled:opacity-20 shadow-2xl active:scale-95"
              >
                {isWithdrawing ? "Transmitting..." : "Withdraw Funds"}
              </button>
              <button 
                onClick={() => document.getElementById('evolution-node')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-16 py-6 bg-white/10 backdrop-blur-2xl text-white border border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all shadow-xl spring-pop"
              >
                Inject Liquidity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Node Evolution Protocol */}
      <div id="evolution-node" className="space-y-16 pt-8 scroll-mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 px-8">
           <div className="space-y-4 text-left max-w-xl">
             <div className="flex items-center gap-4">
               <h3 className="text-[18px] font-black uppercase tracking-[0.6em] text-white">Evolution Protocol</h3>
               <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">v4.0.96</span>
               </div>
             </div>
             <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest italic leading-relaxed">
               Add liquidity to stabilize your node and unlock higher clearance levels.
             </p>
           </div>
           
           {/* High-Performance Progress Bar */}
           <div className="flex-1 max-w-md space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Clearance Progress</span>
                  <span className="text-[12px] font-black text-white italic tracking-widest">TO {progressInfo.next}</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white italic tabular-nums leading-none">{Math.floor(progressInfo.percent)}%</span>
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full relative group ${tier.accentColor.replace('text', 'bg')}`}
                  style={{ width: `${progressInfo.percent}%` }}
                >
                  <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm"></div>
                </div>
              </div>
              {progressInfo.needed > 0 && (
                <div className="flex justify-between items-center px-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    ₦{progressInfo.needed.toLocaleString()} DELTA
                  </p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-1 h-1 rounded-full ${progressInfo.percent > (i*20) ? tier.accentColor.replace('text', 'bg') : 'bg-white/10'}`}></div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {fundingBundles.map((bundle) => (
            <button 
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle)}
              className="group relative p-12 rounded-[5rem] bg-[#0a0a0a] border border-white/5 transition-all duration-700 spring-pop hover:bg-white/[0.04] hover:border-white/20 text-center shadow-2xl flex flex-col items-center gap-12 overflow-hidden"
            >
               {/* Animated Aura for the bundle */}
               <div className={`absolute top-0 inset-x-0 h-2 ${bundle.color} opacity-40 group-hover:h-3 group-hover:opacity-100 transition-all duration-500`}></div>
               
               <div className={`w-32 h-32 rounded-[4rem] flex items-center justify-center text-6xl shadow-2xl ${bundle.color} bg-opacity-5 border border-white/5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700`}>
                 <span className="filter drop-shadow-2xl scale-125">🏛️</span>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">{bundle.label}</p>
                  <h4 className="text-5xl font-black italic tracking-tighter text-white">₦{bundle.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</h4>
               </div>

               <div className="min-h-[32px]">
                 {bundle.bonus && (
                    <div className="px-8 py-3 bg-white/5 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 shadow-inner group-hover:border-white/30 group-hover:text-white transition-all">
                      {bundle.bonus}
                    </div>
                 )}
               </div>
               
               <div className="py-6 px-16 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500 shadow-2xl flex items-center justify-center gap-4">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 <span>Authorize</span>
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Transaction Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        <div className="bg-[#0a0a0a] backdrop-blur-3xl p-16 space-y-8 rounded-[5rem] border border-white/5 shadow-2xl group hover:border-teal-500/20 transition-all duration-1000">
           <div className="flex justify-between items-center">
             <div>
               <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] mb-1">Inflow Nodes</p>
               <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Protocol Verified</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 text-2xl">↑</div>
           </div>
           <p className="text-6xl font-black text-teal-400 tabular-nums tracking-tighter italic">{formatNaira(stats.income)}</p>
        </div>
        <div className="bg-[#0a0a0a] backdrop-blur-3xl p-16 space-y-8 rounded-[5rem] border border-white/5 shadow-2xl group hover:border-rose-500/20 transition-all duration-1000">
           <div className="flex justify-between items-center">
             <div>
               <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] mb-1">Outflow Nodes</p>
               <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Secure Settlements</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 text-2xl">↓</div>
           </div>
           <p className="text-6xl font-black text-rose-400 tabular-nums tracking-tighter italic">{formatNaira(stats.expense)}</p>
        </div>
      </div>

      {/* 4. Historical Ledger */}
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 px-10">
          <div className="space-y-4">
            <h3 className="text-[16px] font-black uppercase tracking-[0.8em] text-white">Historical Ledger</h3>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Immutable transaction sequence</p>
          </div>
          <div className="flex bg-[#0a0a0a] p-2.5 rounded-[3rem] border border-white/10 shadow-2xl">
             {(['all', 'income', 'expense'] as const).map((t) => (
               <button 
                 key={t}
                 onClick={() => setFilter(t)}
                 className={`px-16 py-5 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 spring-pop ${filter === t ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-12 px-4">
          {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
            <div key={tx.id} className="group bg-[#0a0a0a] p-12 md:p-20 rounded-[7rem] flex flex-col md:flex-row md:items-center justify-between border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-1000 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-16 relative z-10">
                <div className={`w-36 h-36 rounded-[4rem] flex items-center justify-center text-7xl shadow-inner border group-hover:scale-110 duration-700 ${
                  tx.type === 'incoming' 
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/10' 
                  : 'bg-white/5 text-gray-700 border-white/5'
                }`}>
                  {tx.category === 'recharge' ? '⚡' : tx.category === 'royalty' ? '®' : tx.category === 'referral' ? '🔗' : '🛍️'}
                </div>
                <div className="space-y-6 text-left">
                  <p className="text-5xl font-black italic tracking-tighter text-white leading-tight group-hover:translate-x-2 transition-transform duration-500">{tx.label}</p>
                  <div className="flex items-center gap-10">
                     <span className={`text-[11px] font-black uppercase px-10 py-3 rounded-full tracking-[0.4em] ${
                       tx.type === 'incoming' ? 'bg-teal-500 text-black' : 'bg-gray-800 text-gray-400'
                     }`}>
                       {tx.category}
                     </span>
                     <span className="text-[14px] font-bold text-gray-600 uppercase tracking-widest italic">{tx.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right mt-12 md:mt-0">
                <p className={`text-7xl font-black tabular-nums tracking-tighter ${tx.type === 'incoming' ? 'text-teal-400' : 'text-white'}`}>
                  {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-2">Verified Node Settlement</p>
              </div>
            </div>
          )) : (
            <div className="py-64 text-center bg-[#0a0a0a] rounded-[7rem] border-2 border-dashed border-white/5">
              <p className="text-[14px] font-black text-gray-600 uppercase tracking-[2em]">Ledger Clear</p>
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
