import React, { useState, useEffect, useMemo } from 'react';
import NutritionCard from './components/NutritionCard';
import FoodList from './components/FoodList';
import AddFoodButton from './components/AddFoodButton';
import Onboarding from './components/Onboarding';
import DateSelector from './components/DateSelector';
import InsightsView from './components/InsightsView';
import { Logo } from './components/Logo';
import { FoodEntry, Nutrition, UserProfile, MealType } from './types';
import { Flame, Droplets, LayoutGrid, BookOpen } from 'lucide-react';

const DAILY_CALORIE_GOAL = 2500; 

const App: React.FC = () => {
  // --- State: User Profile ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trackmycalories_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // --- State: View Navigation ---
  const [currentView, setCurrentView] = useState<'journal' | 'insights'>('journal');

  // --- State: Data ---
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('trackmycalories_entries');
      const loadedEntries: FoodEntry[] = saved ? JSON.parse(saved) : [];

      // Storage Optimization: Clear images from previous days
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const cleanedEntries = loadedEntries.map(entry => {
        // If the entry is before today (start of day), remove the image data to save space
        if (entry.timestamp < startOfToday.getTime() && entry.imageUrl) {
            const { imageUrl, ...rest } = entry;
            return rest as FoodEntry;
        }
        return entry;
      });
      
      return cleanedEntries;
    } catch (e) {
      console.error("Failed to load entries from storage", e);
      return [];
    }
  });

  // --- State: Journal Navigation ---
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
    setCurrentView('journal'); // Switch back to journal on add
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
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let type: MealType = 'Snack';
    if (currentMinutes >= 300 && currentMinutes <= 750) type = 'Breakfast';
    else if (currentMinutes >= 751 && currentMinutes <= 1019) type = 'Lunch';
    else if (currentMinutes >= 1020 && currentMinutes <= 1319) type = 'Dinner';

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
        source: 'water',
        mealType: type
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
    // Background: Subtle warm gray/white mix to let colors pop
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 font-sans selection:bg-pink-100 selection:text-pink-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F2F2F7] sm:shadow-2xl sm:shadow-slate-300 overflow-hidden relative border-x border-slate-200/50">
        
        {/* Header: Glassmorphism with Color */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20 bg-[#F2F2F7]/85 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* App Icon with Gradient */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-2.5 rounded-[14px] shadow-lg shadow-purple-500/20 flex items-center justify-center">
                <Logo size={20} className="text-white" />
            </div>
            <div>
                 <h1 className="text-[15px] font-bold tracking-tight text-slate-900 leading-none mb-0.5">TrackMyCalories</h1>
                 <div className="flex items-center gap-1 text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 uppercase tracking-wide">
                    <Flame size={10} className="text-orange-500" fill="currentColor" />
                    <span>{userProfile.streak} Day Streak</span>
                 </div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-100">
             <img 
               src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile.name}&backgroundColor=e0e7ff`} 
               alt="User" 
               className="h-full w-full object-cover" 
             />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-5 py-6 overflow-y-auto no-scrollbar scroll-smooth">
          
          <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Hello, {userProfile.name}</h2>
                <p className="text-slate-500 text-[15px] font-medium">Your daily nutrition at a glance.</p>
            </div>
            {/* Quick Water: Colorful Button */}
            <button 
                onClick={handleQuickWater}
                className="bg-cyan-50 text-cyan-600 active:bg-cyan-100 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-cyan-100 border border-cyan-100"
            >
                <Droplets size={14} fill="currentColor" />
                +250ml
            </button>
          </div>

          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />

          {/* iOS Segmented Control: Colorful Active State */}
          <div className="flex p-1 bg-[#E5E5EA] rounded-[14px] mb-8 mx-0 relative">
             <button 
                onClick={() => setCurrentView('journal')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[11px] text-[13px] font-bold transition-all z-10 ${
                    currentView === 'journal' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <BookOpen size={15} /> Journal
             </button>
             <button 
                onClick={() => setCurrentView('insights')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[11px] text-[13px] font-bold transition-all z-10 ${
                    currentView === 'insights' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <LayoutGrid size={15} /> Insights
             </button>
          </div>

          {currentView === 'journal' ? (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-4">
              <NutritionCard 
                totalNutrition={totalNutrition} 
                dailyGoal={DAILY_CALORIE_GOAL} 
              />

              <FoodList 
                entries={displayedEntries} 
                onDelete={deleteEntry} 
              />
              
              {/* Spacer for FAB */}
              <div className="h-28"></div>
            </div>
          ) : (
            <InsightsView entries={entries} />
          )}

        </main>

        {/* Floating Action Button */}
        <AddFoodButton onAdd={addEntry} />
        
        {/* Bottom Fade Gradient for content clipping */}
        <div className="h-16 bg-gradient-to-t from-[#F2F2F7] to-transparent pointer-events-none fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto z-10"></div>
      </div>
    </div>
  );
};

export default App;