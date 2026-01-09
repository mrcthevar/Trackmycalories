import React from 'react';
import { FoodEntry } from '../types';
import { Trash2, Lightbulb } from 'lucide-react';

interface FoodListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

const FoodList: React.FC<FoodListProps> = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-200 mb-4 animate-bounce">
            <span className="text-2xl">🍎</span>
        </div>
        <h3 className="text-slate-900 font-medium text-lg">Your plate is empty</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Snap a photo of your meal to get nutritional insights and expert tips.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <h3 className="text-slate-800 font-bold text-lg px-1 flex items-center gap-2">
        Today's Meals
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{entries.length}</span>
      </h3>
      {entries.slice().reverse().map((entry) => (
        <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3 group transition-all hover:shadow-md">
            <div className="flex gap-4 items-center">
                <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative shadow-inner">
                    {entry.imageUrl ? (
                        <img src={entry.imageUrl} alt={entry.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl">🍽️</div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900 truncate pr-2 text-base">{entry.name}</h4>
                        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">{entry.nutrition.calories} kcal</span>
                    </div>
                    <p className="text-slate-500 text-xs truncate mb-2">{entry.description}</p>
                    <div className="flex gap-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{entry.nutrition.protein}g P</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{entry.nutrition.carbs}g C</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{entry.nutrition.fat}g F</span>
                    </div>
                </div>

                <button 
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors self-start"
                    aria-label="Delete entry"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            
            {/* Dietician Tip Footer */}
            {entry.healthTip && (
                <div className="mt-1 pt-3 border-t border-slate-50 flex gap-2 items-start">
                    <Lightbulb size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-indigo-900/80 italic leading-relaxed">"{entry.healthTip}"</p>
                </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default FoodList;