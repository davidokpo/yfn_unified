
import React, { useState } from 'react';

interface AuthViewProps {
  onComplete: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  // Pre-filled for development convenience
  const [email, setEmail] = useState('vance@yfn.app');
  const [password, setPassword] = useState('password123');
  const [handle, setHandle] = useState('vance_82');
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => onComplete(), 500);
      }
      setSyncProgress(progress);
    }, 150);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      
      <div className="max-w-md w-full relative z-10 space-y-10 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-white text-black mx-auto flex items-center justify-center rounded-2xl text-2xl font-black shadow-2xl mb-6">Y</div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white">Your Account</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] italic">Sign in or Create a new Profile</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl p-1 rounded-full border border-white/10 flex gap-1 shadow-2xl">
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Register
          </button>
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-6">Username</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 font-black">@</span>
                <input 
                  required
                  type="text" 
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 pl-12 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
                  placeholder="vance_82"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-6">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
              placeholder="name@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-6">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 space-y-4">
            {!loading ? (
              <>
                <button 
                  type="submit"
                  className="w-full py-7 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-amber-500 transition-all spring-pop flex items-center justify-center gap-3"
                >
                  <span>{mode === 'register' ? 'CREATE PROFILE' : 'SIGN IN'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                
                {/* DEV BYPASS BUTTON */}
                <button 
                  type="button"
                  onClick={onComplete}
                  className="w-full py-4 text-[9px] font-black uppercase text-white/20 hover:text-amber-500 tracking-[0.5em] transition-all hover:bg-white/5 rounded-full"
                >
                  [ Dev Bypass Security Node ]
                </button>
              </>
            ) : (
              <div className="space-y-6 animate-pulse">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-black text-amber-500 text-center uppercase tracking-[0.3em]">
                  {syncProgress < 40 ? 'Verifying...' : syncProgress < 80 ? 'Setting up profile...' : 'Complete'}
                </p>
              </div>
            )}
          </div>
        </form>

        <div className="pt-10 text-center border-t border-white/5">
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
            By signing in, you agree to our <br/>
            Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
