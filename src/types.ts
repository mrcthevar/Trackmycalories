export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  timestamp: number;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  items: FoodItem[];
  imageUrl?: string;
  totalCalories: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  waterIntake: number; // glasses
}

export type AppView = 'Landing' | 'Dashboard' | 'Analysis';
