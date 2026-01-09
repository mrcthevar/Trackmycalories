import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Nutrition } from '../types';

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Daily Summary</h2>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-bold text-slate-900">{totalNutrition.calories}</span>
            <span className="text-slate-400 ml-2 font-medium">/ {dailyGoal} kcal</span>
          </div>
        </div>
        <div className="h-16 w-16 relative">
             <svg className="h-full w-full" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={`${percentage > 100 ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                {percentage}%
            </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}g`, '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-medium pointer-events-none">
                  MACROS
              </div>
        </div>

        <div className="flex flex-col justify-center space-y-3">
            {data.map((macro) => (
                <div key={macro.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: macro.color }}></div>
                        <span className="text-slate-600 text-sm">{macro.name}</span>
                    </div>
                    <span className="text-slate-800 font-semibold text-sm">{macro.value}g</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;