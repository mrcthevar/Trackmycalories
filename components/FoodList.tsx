import React from 'react';
import { FoodEntry } from '../types';
import { Trash2 } from 'lucide-react';

interface FoodListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

const FoodList: React.FC<FoodListProps> = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="text-2xl">🥗</span>
        </div>
        <p className="text-slate-500">No food logged today.</p>
        <p className="text-slate-400 text-sm mt-1">Snap a photo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <h3 className="text-slate-800 font-semibold text-lg px-1">Today's Meals</h3>
      {entries.slice().reverse().map((entry) => (
        <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex gap-4 items-center group">
            <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl">🍽️</div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-900 truncate pr-2">{entry.name}</h4>
                    <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">{entry.nutrition.calories} kcal</span>
                </div>
                <p className="text-slate-500 text-xs truncate mb-1">{entry.description}</p>
                <div className="flex gap-3 text-xs text-slate-400">
                    <span><span className="font-medium text-slate-600">{entry.nutrition.protein}g</span> P</span>
                    <span><span className="font-medium text-slate-600">{entry.nutrition.carbs}g</span> C</span>
                    <span><span className="font-medium text-slate-600">{entry.nutrition.fat}g</span> F</span>
                </div>
            </div>

            <button 
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                aria-label="Delete entry"
            >
                <Trash2 size={18} />
            </button>
        </div>
      ))}
    </div>
  );
};

export default FoodList;