export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  water: number; // in grams/ml
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodEntry {
  id: string;
  name: string;
  description?: string;
  nutrition: Nutrition;
  healthTip?: string;
  timestamp: number;
  imageUrl?: string;
  source?: 'image' | 'text' | 'label' | 'water';
  mealType: MealType;
}

export interface UserProfile {
  name: string;
  streak: number;
  lastLogDate: string; // YYYY-MM-DD
}

export interface AnalysisResult {
  foodName: string;
  description: string;
  healthTip: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  water: number;
}