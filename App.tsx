import React, { useState, useEffect, useMemo } from 'react';
import NutritionCard from './components/NutritionCard';
import FoodList from './components/FoodList';
import AddFoodButton from './components/AddFoodButton';
import Onboarding from './components/Onboarding';
import DateSelector from './components/DateSelector';
import { FoodEntry, Nutrition, UserProfile } from './types';
import { Activity, Flame, Droplets } from 'lucide-react';

const DAILY_CALORIE_GOAL = 2500; 

const App: React.FC = () => {
  // --- State: User Profile ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trackmycalories_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // --- State: Data ---
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('trackmycalories_entries');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load entries from storage", e);
      return [];
    }
  });

  // --- State: Navigation ---
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // --- Effects ---
  useEffect(() => {
    try {
      localStorage.setItem('trackmycalories_entries', JSON.stringify(entries));
    } catch (e) {
      console.error("LocalStorage quota exceeded or error saving", e);
    }
  }, [entries]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('trackmycalories_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // --- Logic: Streak Calculation ---
  const updateStreak = (newEntryDate: number) => {
    if (!userProfile) return;

    const entryDate = new Date(newEntryDate);
    const todayStr = entryDate.toISOString().split('T')[0];
    
    // If already logged today, do nothing
    if (userProfile.lastLogDate === todayStr) return;

    const lastLog = new Date(userProfile.lastLogDate);
    const diffTime = Math.abs(entryDate.getTime() - lastLog.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    let newStreak = userProfile.streak;

    if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
    } else if (diffDays > 1) {
        // Broke streak
        newStreak = 1;
    } else if (userProfile.streak === 0) {
        // First log
        newStreak = 1;
    }

    setUserProfile({
        ...userProfile,
        lastLogDate: todayStr,
        streak: newStreak
    });
  };

  // --- Handlers ---
  const addEntry = (entry: FoodEntry) => {
    setEntries(prev => [...prev, entry]);
    setSelectedDate(new Date()); // Jump to today
    updateStreak(entry.timestamp);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleOnboardingComplete = (name: string) => {
    const newProfile: UserProfile = {
        name,
        streak: 0,
        lastLogDate: ''
    };
    setUserProfile(newProfile);
  };

  const handleQuickWater = () => {
    const waterEntry: FoodEntry = {
        id: Date.now().toString(),
        name: "Water",
        description: "Quick add (250ml)",
        nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            water: 250
        },
        timestamp: Date.now(),
        source: 'water'
    };
    addEntry(waterEntry);
  };

  // --- Derived State ---
  const displayedEntries = useMemo(() => {
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime();

    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetTime;
    });
  }, [entries, selectedDate]);

  const totalNutrition = useMemo<Nutrition>(() => {
    return displayedEntries.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.nutrition.calories,
        protein: acc.protein + curr.nutrition.protein,
        carbs: acc.carbs + curr.nutrition.carbs,
        fat: acc.fat + curr.nutrition.fat,
        fiber: (acc.fiber || 0) + (curr.nutrition.fiber || 0),
        sugar: (acc.sugar || 0) + (curr.nutrition.sugar || 0),
        water: (acc.water || 0) + (curr.nutrition.water || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, water: 0 }
    );
  }, [displayedEntries]);

  // --- Render ---

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white sm:shadow-2xl sm:shadow-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white z-10 sticky top-0 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Activity size={20} />
            </div>
            <div>
                 <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none mb-0.5">TrackMyCalories</h1>
                 <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                    <Flame size={12} fill="currentColor" />
                    <span>{userProfile.streak} Day Streak</span>
                 </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-100">
             <img 
               src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}&backgroundColor=e0e7ff`} 
               alt="User" 
               className="h-full w-full object-cover" 
             />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Hello, {userProfile.name}</h2>
                <p className="text-slate-500 text-sm">Keep up the good work!</p>
            </div>
            <button 
                onClick={handleQuickWater}
                className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
            >
                <Droplets size={14} fill="currentColor" />
                +250ml
            </button>
          </div>

          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />

          <NutritionCard 
            totalNutrition={totalNutrition} 
            dailyGoal={DAILY_CALORIE_GOAL} 
          />

          <FoodList 
            entries={displayedEntries} 
            onDelete={deleteEntry} 
          />
        </main>

        {/* Floating Action Button */}
        <AddFoodButton onAdd={addEntry} />
        
        {/* Subtle bottom gradient */}
        <div className="h-24 bg-gradient-to-t from-white to-transparent pointer-events-none fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto"></div>
      </div>
    </div>
  );
};

export default App;