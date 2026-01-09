import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Nutrition } from '../types';
import { Droplets, Wheat, Candy, Flame } from 'lucide-react';

interface NutritionCardProps {
  totalNutrition: Nutrition;
  dailyGoal: number;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ totalNutrition, dailyGoal }) => {
  const data = [
    { name: 'Protein', value: totalNutrition.protein, color: '#3B82F6' }, // Blue 500
    { name: 'Carbs', value: totalNutrition.carbs, color: '#10B981' },   // Emerald 500
    { name: 'Fat', value: totalNutrition.fat, color: '#F59E0B' },      // Amber 500
  ];

  // If no data, show subtle gray ring
  const chartData = data.every(d => d.value === 0) 
    ? [{ name: 'Empty', value: 1, color: '#F1F5F9' }] 
    : data;

  const percentage = Math.min(100, Math.round((totalNutrition.calories / dailyGoal) * 100));
  const gradientId = React.useId();

  return (
    <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-transform active:scale-[0.99] duration-300 border border-slate-100">
      
      {/* Header & Main Progress */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Calories Remaining</h2>
          <div className="flex items-baseline">
            <span className="text-5xl font-black tracking-tighter text-slate-900">{Math.max(0, dailyGoal - totalNutrition.calories)}</span>
            <span className="text-slate-400 ml-2 font-medium text-sm">kcal left</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-medium">
             Goal: <span className="text-slate-600 font-semibold">{dailyGoal}</span> • Consumed: <span className="text-slate-600 font-semibold">{totalNutrition.calories}</span>
          </div>
        </div>
        
        {/* Progress Ring with Gradient */}
        <div className="h-20 w-20 relative">
             <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
              <defs>
                  <linearGradient id={`ring-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />  {/* Indigo */}
                      <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet */}
                      <stop offset="100%" stopColor="#EC4899" /> {/* Pink */}
                  </linearGradient>
              </defs>
              {/* Track */}
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Indicator */}
              <path
                stroke={`url(#ring-gradient-${gradientId})`}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                 <Flame size={18} className="text-indigo-500 fill-indigo-500/20" />
            </div>
        </div>
      </div>

      {/* Macros Pie & Legend */}
      <div className="flex gap-6 items-center mb-8">
        <div className="h-28 w-28 relative flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={32}
                    outerRadius={45}
                    paddingAngle={data.every(d => d.value === 0) ? 0 : 6}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Macros</span>
              </div>
        </div>

        <div className="flex-1 space-y-3">
            {data.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between group">
                    <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm ring-2 ring-white" style={{ backgroundColor: macro.color }}></div>
                        <span className="text-slate-500 text-xs font-bold tracking-wide">{macro.name}</span>
                    </div>
                    <span className="text-slate-900 font-bold text-sm">{macro.value}g</span>
                </div>
            ))}
        </div>
      </div>

      {/* Micro Nutrients Strip - Colorful Cards */}
      <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-emerald-50 rounded-2xl p-3 border border-emerald-100/50">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-wider">
                  <Wheat size={12} strokeWidth={2.5} /> Fiber
              </div>
              <div className="text-slate-900 font-bold text-base tracking-tight">{totalNutrition.fiber.toFixed(1)}<span className="text-xs text-emerald-600/60 ml-0.5 font-bold">g</span></div>
          </div>
          
          <div className="text-center bg-amber-50 rounded-2xl p-3 border border-amber-100/50">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase mb-1 tracking-wider">
                  <Candy size={12} strokeWidth={2.5} /> Sugar
              </div>
              <div className="text-slate-900 font-bold text-base tracking-tight">{totalNutrition.sugar.toFixed(1)}<span className="text-xs text-amber-600/60 ml-0.5 font-bold">g</span></div>
          </div>
          
          <div className="text-center bg-cyan-50 rounded-2xl p-3 border border-cyan-100/50">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-cyan-600 uppercase mb-1 tracking-wider">
                  <Droplets size={12} strokeWidth={2.5} /> Water
              </div>
              <div className="text-slate-900 font-bold text-base tracking-tight">{Math.round(totalNutrition.water)}<span className="text-xs text-cyan-600/60 ml-0.5 font-bold">ml</span></div>
          </div>
      </div>
    </div>
  );
};

export default NutritionCard;