import React from 'react';
import { motion } from 'motion/react';
import { Camera, ChevronRight, Upload, Zap, PieChart, Info, MapPin } from 'lucide-react';
import { Button } from './UIComponents';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">Annam</span>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-500">
          <a href="#" className="text-emerald-600">Home</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">How it Works</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Blog</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
        </nav>
        <Button onClick={onStart} variant="primary">Get Started</Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-8">
              <span className="text-base text-emerald-600">🥗</span> AI-Powered Indian Food Analysis
            </div>
            <h1 className="text-6xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
              Track Calories from Your <span className="text-emerald-600">Food Photos</span> Instantly
            </h1>
            <p className="text-slate-500 text-xl mb-12 max-w-lg leading-relaxed font-medium">
              Revolutionizing Indian meal tracking. No more manual entries. Just snap a photo and let our AI handle the rest.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Button onClick={onStart} className="px-10 py-4 text-xl">Try It Now</Button>
              <button className="flex items-center gap-3 font-bold text-slate-600 hover:text-emerald-600 transition-colors group">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all shadow-sm">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-slate-600 border-b-[6px] border-b-transparent ml-1 group-hover:border-l-emerald-600" />
                </div>
                How it works
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-[48px] shadow-2xl shadow-emerald-100 border border-slate-100 p-5 max-w-lg mx-auto relative z-10 overflow-hidden">
               <div className="rounded-[40px] overflow-hidden relative group">
                 <img 
                   src="https://images.unsplash.com/photo-1585937421612-70a0f295561a?auto=format&fit=crop&q=80&w=1000" 
                   alt="Indian Meal" 
                   className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               
               <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-white/50 max-w-[220px] animate-bounce-slow">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                     <span className="text-lg">🍱</span>
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Detected</p>
                     <p className="text-base font-bold text-slate-800">Thali Meal</p>
                   </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 bg-slate-50 rounded-lg">1.5 Servings</span>
                    <span className="text-base font-bold text-emerald-600">720 kcal</span>
                 </div>
               </div>
               
               <div className="p-8">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl tracking-tight">Smart Analysis...</h3>
                    <span className="text-emerald-600 font-extrabold">92%</span>
                 </div>
                 <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                 </div>
               </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>

        {/* How It Works Section */}
        <div className="mt-48 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-20 tracking-tight">Simple, Accurate Tracking</h2>
          <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <FeatureStep 
              icon={<Upload size={36} />} 
              color="bg-emerald-50 text-emerald-600" 
              title="Snap & Upload" 
              desc="Just take a quick photo of your meal before you start eating."
            />
            <FeatureStep 
              icon={<Zap size={36} />} 
              color="bg-orange-50 text-orange-600" 
              title="AI Detection" 
              desc="Our custom AI identifies specific Indian dishes and portion sizes."
            />
            <FeatureStep 
              icon={<PieChart size={36} />} 
              color="bg-blue-50 text-blue-600" 
              title="Instant Insights" 
              desc="Get calories, protein, and macros automatically logged to your day."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureStep({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center group">
      <div className={cn("w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110 shadow-sm", color)}>
        {icon}
      </div>
      <h4 className="text-2xl font-bold mb-4 tracking-tight">{title}</h4>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
