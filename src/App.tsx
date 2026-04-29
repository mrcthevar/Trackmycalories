/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AnalysisFlow from './components/AnalysisFlow';
import { AppView, Meal } from './types';

export default function App() {
  const [view, setView] = useState<AppView>('Landing');
  const [meals, setMeals] = useState<Meal[]>([]);

  // Load meals from localStorage on init
  useEffect(() => {
    const savedMeals = localStorage.getItem('calorie_meals');
    if (savedMeals) {
      try {
        setMeals(JSON.parse(savedMeals));
      } catch (e) {
        console.error("Failed to parse meals");
      }
    }
  }, []);

  // Save meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calorie_meals', JSON.stringify(meals));
  }, [meals]);

  const handleStart = () => setView('Dashboard');
  const handleAddNew = () => setView('Analysis');
  const handleCancelNew = () => setView('Dashboard');
  
  const handleSaveMeal = (meal: Meal) => {
    setMeals(prev => [meal, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'Landing' && (
        <LandingPage onStart={handleStart} />
      )}
      
      {view === 'Dashboard' && (
        <Dashboard 
          onAddNew={handleAddNew} 
          meals={meals} 
        />
      )}

      {view === 'Analysis' && (
        <AnalysisFlow 
          onCancel={handleCancelNew} 
          onSave={handleSaveMeal} 
        />
      )}
    </div>
  );
}
