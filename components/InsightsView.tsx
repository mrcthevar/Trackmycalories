import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { Download, TrendingUp, Droplets, Flame, Calendar, ChevronDown } from 'lucide-react';
import { FoodEntry } from '../types';

interface InsightsViewProps {
  entries: FoodEntry[];
}

type TimeRange = '1W' | '1M' | '3M' | '1Y';

const InsightsView: React.FC<InsightsViewProps> = ({ entries }) => {
  const [range, setRange] = useState<TimeRange>('1W');

  // --- Helpers ---
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    // Reset hours to encompass full days
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    switch (range) {
      case '1W': start.setDate(end.getDate() - 6); break;
      case '1M': start.setDate(end.getDate() - 29); break;
      case '3M': start.setDate(end.getDate() - 89); break;
      case '1Y': start.setDate(end.getDate() - 364); break;
    }
    return { start, end };
  };

  // --- Data Processing ---
  const filteredData = useMemo(() => {
    const { start, end } = getDateRange();
    const rangeEntries = entries.filter(e => {
        const d = new Date(e.timestamp);
        return d >= start && d <= end;
    });

    // Group by Date for Chart
    const dailyMap = new Map<string, { date: string; calories: number; water: number }>();
    
    // Initialize all days in range with 0 (for clean charts)
    const iter = new Date(start);
    while (iter <= end) {
        const key = iter.toISOString().split('T')[0];
        dailyMap.set(key, { date: key, calories: 0, water: 0 });
        iter.setDate(iter.getDate() + 1);
    }

    let totalCals = 0;
    let totalWater = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    rangeEntries.forEach(e => {
        const key = new Date(e.timestamp).toISOString().split('T')[0];
        const day = dailyMap.get(key);
        if (day) {
            day.calories += e.nutrition.calories;
            day.water += e.nutrition.water;
        }
        totalCals += e.nutrition.calories;
        totalWater += e.nutrition.water;
        totalProtein += e.nutrition.protein;
        totalCarbs += e.nutrition.carbs;
        totalFat += e.nutrition.fat;
    });

    const chartData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    // Format Dates for X-Axis
    const formattedChartData = chartData.map(d => {
        const dateObj = new Date(d.date); // This assumes input is YYYY-MM-DD
        // Fix timezone issue for display by treating YYYY-MM-DD as local
        const [y, m, day] = d.date.split('-').map(Number);
        const localDate = new Date(y, m - 1, day);
        
        let label = '';
        if (range === '1W') label = localDate.toLocaleDateString('en-US', { weekday: 'short' });
        else if (range === '1Y') label = localDate.toLocaleDateString('en-US', { month: 'short' }); // Simply showing months might need aggregation, but daily works for sparklines
        else label = localDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        return { ...d, label };
    });

    return {
        entries: rangeEntries,
        chartData: formattedChartData,
        totals: { calories: totalCals, water: totalWater, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        daysCount: chartData.length
    };
  }, [entries, range]);

  // --- Export Logic ---
  const handleExport = () => {
    const headers = ["Date", "Time", "Food Name", "Type", "Source", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Water (ml)", "Fiber (g)", "Sugar (g)"];
    
    const rows = filteredData.entries.map(e => {
        const d = new Date(e.timestamp);
        return [
            d.toLocaleDateString(),
            d.toLocaleTimeString(),
            `"${e.name.replace(/"/g, '""')}"`, // Escape quotes
            e.mealType || 'Snack',
            e.source || 'image',
            e.nutrition.calories,
            e.nutrition.protein,
            e.nutrition.carbs,
            e.nutrition.fat,
            e.nutrition.water,
            e.nutrition.fiber || 0,
            e.nutrition.sugar || 0
        ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nutrition_report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Visuals ---
  const avgCals = Math.round(filteredData.totals.calories / (filteredData.daysCount || 1));
  
  const macroData = [
    { name: 'Protein', value: filteredData.totals.protein, color: '#3b82f6' },
    { name: 'Carbs', value: filteredData.totals.carbs, color: '#10b981' },
    { name: 'Fat', value: filteredData.totals.fat, color: '#f59e0b' },
  ];

  return (
    <div className="pb-6 animate-in fade-in duration-500">
      
      {/* Time Filter */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex justify-between mb-6">
        {(['1W', '1M', '3M', '1Y'] as TimeRange[]).map((r) => (
            <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    range === r 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                {r}
            </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Flame size={16} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wide">Avg Cals</span>
            </div>
            <div className="text-2xl font-black text-slate-800">{avgCals}</div>
            <div className="text-[10px] text-slate-400 font-medium">Daily average</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Droplets size={16} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wide">Water</span>
            </div>
            <div className="text-2xl font-black text-slate-800">{(filteredData.totals.water / 1000).toFixed(1)}L</div>
            <div className="text-[10px] text-slate-400 font-medium">Total volume</div>
        </div>
      </div>

      {/* Calorie Trend Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            Calorie Trend
        </h3>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8'}} 
                        interval={range === '1W' ? 0 : 'preserveStartEnd'}
                    />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        formatter={(val: number) => [`${val} kcal`, 'Calories']}
                    />
                    <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                        {filteredData.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.calories > 2500 ? '#f87171' : '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Macro Distribution */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
         <h3 className="text-sm font-bold text-slate-800 mb-2">Macro Distribution</h3>
         <div className="flex items-center">
            <div className="h-32 w-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={macroData}
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 ml-4">
                {macroData.map(m => (
                    <div key={m.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{background: m.color}} />
                            <span className="text-xs font-medium text-slate-500">{m.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{Math.round(m.value)}g</span>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Export Button */}
      <button 
        onClick={handleExport}
        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-indigo-100"
      >
        <Download size={20} />
        Export {range} Report (CSV)
      </button>

      <p className="text-center text-[10px] text-slate-400 mt-4">
        Report generated on {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default InsightsView;