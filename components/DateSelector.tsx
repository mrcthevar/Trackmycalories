import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const formatDisplayDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Create date from YYYY-MM-DD string while avoiding timezone shifts
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onDateChange(newDate);
    }
  };

  // Convert date to YYYY-MM-DD for input value
  const dateString = selectedDate.toLocaleDateString('en-CA');

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-slate-100 mb-6">
      <button 
        onClick={handlePrevDay}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="relative">
             <input 
                ref={dateInputRef}
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={dateString}
                onChange={handleCalendarChange}
            />
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <CalendarIcon size={16} className="text-indigo-600" />
                <span className="font-bold text-slate-700 min-w-[5rem] text-center">
                    {formatDisplayDate(selectedDate)}
                </span>
            </button>
        </div>
      </div>

      <button 
        onClick={handleNextDay}
        disabled={isToday(selectedDate)}
        className={`p-2 rounded-xl transition-colors ${
            isToday(selectedDate) 
            ? 'text-slate-200 cursor-not-allowed' 
            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateSelector;