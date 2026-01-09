import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Nutrition } from '../types';
import { Droplets, Wheat, Candy } from 'lucide-react';

interface NutritionCardProps {
  totalNutrition: Nutrition;
  dailyGoal: number;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ totalNutrition, dailyGoal }) => {
  const data = [
    { name: 'Protein', value: totalNutrition.protein, color: '#3b82f6' }, // blue-500
    { name: 'Carbs', value: totalNutrition.carbs, color: '#10b981' },   // emerald-500
    { name: 'Fat', value: totalNutrition.fat, color: '#f59e0b' },      // amber-500
  ];

  const percentage = Math.min(100, Math.round((totalNutrition.calories / dailyGoal) * 100));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Daily Intake</h2>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{totalNutrition.calories}</span>
            <span className="text-slate-400 ml-2 font-medium text-sm">/ {dailyGoal} kcal</span>
          </div>
        </div>
        <div className="h-14 w-14 relative">
             <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={`${percentage > 100 ? 'text-red-500' : 'text-indigo-600'} transition-all duration-1000 ease-out`}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {percentage}%
            </div>
        </div>
      </div>

      {/* Macros Section */}
      <div className="flex gap-6 items-center mb-6">
        <div className="h-24 w-24 relative flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={25}
                    outerRadius={38}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}g`, '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center text-[8px] text-slate-400 font-bold pointer-events-none uppercase tracking-wide">
                  Macros
              </div>
        </div>

        <div className="flex-1 space-y-2">
            {data.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: macro.color }}></div>
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">{macro.name}</span>
                    </div>
                    <span className="text-slate-800 font-bold text-sm">{macro.value}g</span>
                </div>
            ))}
        </div>
      </div>

      {/* Micro Nutrients Strip */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 uppercase mb-1">
                  <Wheat size={12} /> Fiber
              </div>
              <div className="text-slate-800 font-bold text-sm">{totalNutrition.fiber.toFixed(1)}g</div>
          </div>
          <div className="text-center border-l border-slate-100">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-500 uppercase mb-1">
                  <Candy size={12} /> Sugar
              </div>
              <div className="text-slate-800 font-bold text-sm">{totalNutrition.sugar.toFixed(1)}g</div>
          </div>
          <div className="text-center border-l border-slate-100">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-500 uppercase mb-1">
                  <Droplets size={12} /> Water
              </div>
              <div className="text-slate-800 font-bold text-sm">{Math.round(totalNutrition.water)}ml</div>
          </div>
      </div>
    </div>
  );
};

export default NutritionCard;