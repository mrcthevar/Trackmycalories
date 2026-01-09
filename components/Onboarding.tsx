import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError(true);
      return;
    }
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      
      {/* Vibrant Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/80 via-purple-100/50 to-pink-100/50 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/80 via-cyan-100/50 to-emerald-100/50 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col">
        
        {/* Header Section */}
        <div className="mb-12">
          {/* Logo Container with Gradient */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/20 mb-10 transition-transform hover:scale-105 duration-300">
            <Logo size={36} className="text-white" />
          </div>
          
          <h1 className="text-5xl font-bold tracking-tighter text-slate-900 mb-6 leading-[1.1]">
            Track your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">nutrition</span>.
          </h1>
          
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-[90%]">
            Your colorful AI assistant for a balanced, healthy lifestyle.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`transition-all duration-300 transform ${error ? 'translate-x-[-4px]' : ''}`}>
                <input
                type="text"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setError(false);
                }}
                className={`w-full h-16 px-6 rounded-[24px] bg-white/60 backdrop-blur-md border transition-all duration-300 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:shadow-xl focus:shadow-indigo-500/5 ${
                    error ? 'border-red-300 focus:border-red-300' : 'border-slate-200 focus:border-indigo-500/30'
                }`}
                placeholder="What's your first name?"
                autoComplete="off"
                autoFocus
                />
            </div>

            <button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-16 rounded-[24px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xl shadow-purple-500/20"
            >
                Get Started
                <ArrowRight size={20} strokeWidth={2.5} />
            </button>
        </form>
      </div>

       <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Private & Secure
        </p>
       </div>
    </div>
  );
};

export default Onboarding;