import React, { useState } from 'react';
import { ChefHat, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm transform rotate-3">
            <ChefHat size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to TrackMyCalories</h1>
          <p className="text-slate-500 text-lg">
            Your personal AI nutrition assistant. <br />
            Let's get to know you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700 ml-1">
              What should we call you?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(false);
              }}
              placeholder="Enter your name"
              className={`w-full px-5 py-4 rounded-xl border ${
                error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'
              } bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 transition-all text-lg`}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;