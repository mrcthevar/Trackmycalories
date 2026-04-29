import React from 'react';
import { cn } from '../lib/utils';

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden", className)}>
    {children}
  </div>
);

export const Button = ({ 
  className, 
  variant = 'primary', 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20",
    secondary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-50"
  };
  
  return (
    <button 
      className={cn("px-6 py-2.5 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Progress = ({ value, max = 100, color = "bg-emerald-500", className }: { value: number; max?: number; color?: string; className?: string }) => (
  <div className={cn("h-2 w-full bg-slate-100 rounded-full overflow-hidden", className)}>
    <div 
      className={cn("h-full transition-all duration-500 ease-out", color)}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);
