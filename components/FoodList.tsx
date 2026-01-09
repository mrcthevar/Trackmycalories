import React from 'react';
import { FoodEntry, MealType } from '../types';
import { Trash2, Lightbulb, Type as TypeIcon, ScanBarcode, Droplets } from 'lucide-react';

interface FoodListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

const FoodList: React.FC<FoodListProps> = ({ entries, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 opacity-60">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4 animate-pulse">
            <span className="text-4xl">🥗</span>
        </div>
        <h3 className="text-slate-900 font-semibold text-base">No meals logged</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto leading-relaxed">Your nutritional journal is waiting for your first meal.</p>
      </div>
    );
  }

  // --- Color Logic ---
  const getMealColor = (type: MealType | string) => {
    switch (type) {
        case 'Breakfast': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', iconBg: 'bg-orange-100' };
        case 'Lunch': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', iconBg: 'bg-emerald-100' };
        case 'Dinner': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', iconBg: 'bg-indigo-100' };
        case 'Snack': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', iconBg: 'bg-pink-100' };
        default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', iconBg: 'bg-slate-100' };
    }
  };

  const getIconForSource = (entry: FoodEntry) => {
    if (entry.source === 'water') return <Droplets size={24} className="text-cyan-500" />;
    if (entry.source === 'text') return <TypeIcon size={24} className="text-indigo-500" />;
    if (entry.source === 'label') return <ScanBarcode size={24} className="text-slate-700" />;
    return null; 
  };

  const mealOrder: MealType[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  
  const groupedEntries = entries.reduce((acc, entry) => {
    const type = entry.mealType || 'Snack'; 
    if (!acc[type]) acc[type] = [];
    acc[type].push(entry);
    return acc;
  }, {} as Record<MealType, FoodEntry[]>);

  const renderEntry = (entry: FoodEntry, isLast: boolean) => {
    const colors = getMealColor(entry.mealType || 'Snack');
    
    return (
        <div key={entry.id} className={`bg-white p-4 flex gap-4 items-center group relative ${!isLast ? 'border-b border-slate-100' : ''}`}>
            
            {/* Image / Icon Container with dynamic color */}
            <div className={`h-14 w-14 flex-shrink-0 rounded-[18px] overflow-hidden ${colors.iconBg} relative shadow-sm flex items-center justify-center`}>
                {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.name} className="h-full w-full object-cover" />
                ) : (
                    getIconForSource(entry) || <span className="text-xl">🍽️</span>
                )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-slate-900 truncate pr-2 text-[15px] leading-tight">{entry.name}</h4>
                    <div className="flex flex-col items-end">
                        <span className="text-[13px] font-black text-slate-900">
                            {entry.nutrition.calories > 0 ? entry.nutrition.calories : entry.nutrition.water}
                            <span className="text-[10px] font-medium text-slate-400 ml-0.5">{entry.nutrition.calories > 0 ? 'kcal' : 'ml'}</span>
                        </span>
                    </div>
                </div>
                
                <p className="text-slate-400 text-[13px] truncate mb-1">{entry.description}</p>
                
                {entry.healthTip && (
                    <div className={`flex gap-1.5 items-start mt-1.5 p-2 rounded-lg ${colors.bg}`}>
                        <Lightbulb size={12} className={`${colors.text} mt-0.5 flex-shrink-0`} fill="currentColor" fillOpacity={0.2} />
                        <p className={`text-[11px] ${colors.text} leading-tight line-clamp-2 font-medium`}>{entry.healthTip}</p>
                    </div>
                )}
            </div>

            {/* Delete Action */}
            <button 
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 absolute top-4 right-4 group-hover:relative group-hover:top-0 group-hover:right-0"
                aria-label="Delete entry"
            >
                <Trash2 size={18} strokeWidth={2} />
            </button>
        </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
        {mealOrder.map(mealType => {
            const group = groupedEntries[mealType];
            if (!group || group.length === 0) return null;

            const totalCals = group.reduce((sum, e) => sum + e.nutrition.calories, 0);
            const colors = getMealColor(mealType);

            return (
                <div key={mealType}>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${colors.text.replace('text', 'bg')}`}></div>
                            <h3 className={`font-bold text-[13px] uppercase tracking-wider ${colors.text}`}>
                                {mealType}
                            </h3>
                        </div>
                        {totalCals > 0 && (
                             <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{totalCals} kcal</span>
                        )}
                    </div>
                    {/* List Container */}
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/50">
                        {group.slice().reverse().map((entry, idx) => renderEntry(entry, idx === group.length - 1))}
                    </div>
                </div>
            );
        })}
        
        {/* Legacy/Other Entries */}
        {Object.keys(groupedEntries).filter(key => !mealOrder.includes(key as MealType)).map(key => {
             const group = groupedEntries[key as MealType];
             if(!group || group.length === 0) return null;
             return (
                 <div key={key}>
                    <h3 className="text-slate-400 font-bold text-[13px] uppercase tracking-wider mb-2 pl-3">Other</h3>
                    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm">
                        {group.map((entry, idx) => renderEntry(entry, idx === group.length - 1))}
                    </div>
                 </div>
             )
        })}
    </div>
  );
};

export default FoodList;