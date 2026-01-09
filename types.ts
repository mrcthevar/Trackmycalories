export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  description?: string;
  nutrition: Nutrition;
  timestamp: number;
  imageUrl?: string;
}

export interface AnalysisResult {
  foodName: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}