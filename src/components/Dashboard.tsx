import React from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  TrendingUp, 
  History, 
  Target, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight,
  Plus,
  Droplets,
  Calendar,
  Camera,
  Upload
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Card, Progress, Button } from './UIComponents';
import { Meal, DailyLog } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  onAddNew: () => void;
  meals: Meal[];
}

const data = [
  { name: 'Mon', kcal: 1800 },
  { name: 'Tue', kcal: 2200 },
  { name: 'Wed:today', kcal: 1950 },
  { name: 'Thu', kcal: 1700 },
  { name: 'Fri', kcal: 1850 },
  { name: 'Sat:today', kcal: 1600 },
  { name: 'Sun', kcal: 2100 },
];

export default function Dashboard({ onAddNew, meals = [] }: DashboardProps) {
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0);
  const goal = 2200;
  
  const macros = meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
    });
    return acc;
  }, { protein: 0, carbs: 0, fats: 0 });

  const pieData = [
    { name: 'Protein', value: macros.protein, color: '#10b981' },
    { name: 'Carbs', value: macros.carbs, color: '#3b82f6' },
    { name: 'Fats', value: macros.fats, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-2xl tracking-tighter text-slate-800">Annam</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Search size={20} />} label="Food Library" />
          <NavItem icon={<Utensils size={20} />} label="Recipe Analysis" />
          <NavItem icon={<TrendingUp size={20} />} label="Progress" />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center font-bold text-orange-600 shadow-sm">
              AK
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Arjun Kapoor</p>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Pro Member</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-500 transition-colors font-semibold text-sm">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Namaste, Arjun <span className="text-2xl animate-pulse">🙏</span>
            </h1>
            <p className="text-slate-400 font-semibold text-sm capitalize">Wednesday, October 25th</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Indian meals..." 
                className="bg-white border border-slate-100 rounded-full py-3 px-12 w-80 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-sm shadow-sm"
              />
            </div>
            <Button onClick={onAddNew} variant="primary" className="flex items-center gap-2 py-3 px-8 text-sm">
              <Plus size={18} /> Log Meal
            </Button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="p-7">
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-[0.15em]">Calories Consumed</p>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-3xl font-extrabold text-slate-900">{totalCalories}</span>
              <span className="text-slate-400 font-semibold text-sm">/ {goal}</span>
            </div>
            <Progress value={totalCalories} max={goal} color="bg-emerald-500" className="h-2.5" />
          </Card>

          <StatCard label="Protein" value={macros.protein} target={90} color="bg-blue-500" unit="g" />
          <StatCard label="Carbs" value={macros.carbs} target={250} color="bg-orange-500" unit="g" />
          <StatCard label="Fats" value={macros.fats} target={70} color="bg-amber-500" unit="g" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Area */}
          <div className="lg:col-span-7 space-y-10">
            {/* Today's Meals */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Today's Logs</h3>
                <button className="text-emerald-600 font-bold text-sm tracking-tight hover:underline">View Report</button>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
                {meals.length > 0 ? meals.map(meal => (
                  <MealRow key={meal.id} meal={meal} />
                )) : (
                  <div className="p-16 text-center text-slate-400 font-semibold bg-white italic flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center opacity-50">
                       <Utensils size={32} />
                    </div>
                    No logs yet for today
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-10">
            {/* Smart Detect */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Smart Detect</h3>
              <div 
                onClick={onAddNew}
                className="bg-slate-900 rounded-[40px] relative flex flex-col items-center justify-center text-white overflow-hidden p-12 transition-all hover:scale-[1.02] cursor-pointer group min-h-[400px]"
              >
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1585937421612-70a0f295561a?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/20 group-hover:bg-white group-hover:text-slate-900 transition-all">
                    <Camera size={36} />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 tracking-tight">Scan Your Plate</h4>
                  <p className="text-slate-300 mb-8 font-medium max-w-[240px]">Instant detection for Dosa, Idli, Dal, Roti and more.</p>
                  <Button variant="outline" className="bg-white text-slate-900 border-none px-10 py-4 font-bold rounded-2xl shadow-xl">
                    Capture Photo
                  </Button>
                </div>
                {/* Scanning Overlay Animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_#10b981] animate-[scan_3s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* Nutrients Breakdown */}
            <Card className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Nutrient Balance</h3>
              <div className="h-56 relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Weekly</p>
                   <p className="text-3xl font-extrabold text-slate-900">74<span className="text-sm text-slate-400">%</span></p>
                </div>
              </div>
              <div className="space-y-4">
                <MacroLegend color="bg-emerald-500" label="Protein" value={macros.protein} percent="24%" />
                <MacroLegend color="bg-blue-500" label="Carbs" value={macros.carbs} percent="52%" />
                <MacroLegend color="bg-orange-500" label="Fats" value={macros.fats} percent="18%" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all",
      active ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-700/5" : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"
    )}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, target, color, unit }: { label: string; value: number; target: number; color: string; unit: string }) {
  return (
    <Card className="p-7">
      <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-5">
        <span className="text-2xl font-extrabold text-slate-900">{value}{unit}</span>
        <span className="text-slate-400 font-semibold text-xs">/ {target}{unit}</span>
      </div>
      <Progress value={value} max={target} color={color} className="h-2" />
    </Card>
  );
}

function MealRow({ meal }: { meal: Meal; key?: React.Key }) {
  const iconMap = {
    Breakfast: '🍳',
    Lunch: '🍛',
    Snack: '🥪',
    Dinner: '🍱'
  };
  
  return (
    <div className="flex items-center justify-between p-6 transition-all hover:bg-slate-50 cursor-pointer group">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100 overflow-hidden transition-transform group-hover:scale-105 group-hover:rotate-3">
          {meal.imageUrl ? <img src={meal.imageUrl} className="w-full h-full object-cover" /> : iconMap[meal.type]}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{meal.items.length > 1 ? meal.type : meal.items[0]?.name || meal.type}</h4>
          <p className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">
            <span className="text-emerald-500">{meal.type}</span> • {meal.items.length} Items • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="font-extrabold text-slate-900 text-lg">{meal.totalCalories} kcal</p>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            meal.totalCalories > 500 ? "text-orange-500" : "text-emerald-500"
          )}>
            {meal.totalCalories > 500 ? "High Calorie" : "Optimal"}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}

function MacroLegend({ color, label, value, percent }: { color: string; label: string; value: number; percent: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{value}g</span>
        <span className="text-xs font-bold text-slate-400">({percent})</span>
      </div>
    </div>
  );
}
