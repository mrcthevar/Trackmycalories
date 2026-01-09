import React, { useState, useEffect, useMemo } from 'react';
import NutritionCard from './components/NutritionCard';
import FoodList from './components/FoodList';
import AddFoodButton from './components/AddFoodButton';
import Onboarding from './components/Onboarding';
import DateSelector from './components/DateSelector';
import { FoodEntry, Nutrition } from './types';
import { Activity } from 'lucide-react';

const DAILY_CALORIE_GOAL = 2500; 

const App: React.FC = () => {
  // --- State: User Profile ---
  const [userName, setUserName] = useState<string | null>(() => {
    return localStorage.getItem('snapcal_username');
  });

  // --- State: Data ---
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('snapcal_entries');
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
      localStorage.setItem('snapcal_entries', JSON.stringify(entries));
    } catch (e) {
      console.error("LocalStorage quota exceeded or error saving", e);
      // Optional: Alert user or remove oldest entries, but for now just preventing crash
      if (entries.length > 0) {
          alert("Warning: Storage full. Some older data might not be saved.");
      }
    }
  }, [entries]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('snapcal_username', userName);
    }
  }, [userName]);

  // --- Handlers ---
  const addEntry = (entry: FoodEntry) => {
    setEntries(prev => [...prev, entry]);
    // Always jump back to today when adding a new entry so the user sees it
    setSelectedDate(new Date());
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
  };

  // --- Derived State ---
  const displayedEntries = useMemo(() => {
    // Normalize selected date to midnight
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
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [displayedEntries]);

  // --- Render ---

  if (!userName) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white sm:shadow-2xl sm:shadow-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Activity size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SnapCal</h1>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
             <img 
               src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=e0e7ff`} 
               alt="User" 
               className="h-full w-full object-cover" 
             />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Hello, {userName}</h2>
            <p className="text-slate-500">Track your meals for a healthier day.</p>
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