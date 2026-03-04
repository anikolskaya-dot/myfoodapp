/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  emoji: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: number; // 1.2 to 1.9
}

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number; // in ml
  steps: number;
}

export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  brand?: string;
  image?: string;
}

export interface LoggedFood extends FoodItem {
  logId: string;
  amount: number; // in grams
  timestamp: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Record<MealType, LoggedFood[]>;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};
