import { UserProfile, Macros } from './types';

export function calculateMacros(profile: UserProfile): Macros {
  // Mifflin-St Jeor Equation
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const tdee = bmr * profile.activityLevel;
  
  const targetCalories = tdee + (profile.goal === 'lose' ? -500 : profile.goal === 'gain' ? 500 : 0);

  // Simple macro split: 30% protein, 30% fat, 40% carbs
  const protein = (targetCalories * 0.3) / 4;
  const fat = (targetCalories * 0.3) / 9;
  const carbs = (targetCalories * 0.4) / 4;

  // Recommendations
  // Water: ~30-35ml per kg of body weight
  const water = profile.weight * 33;
  
  // Steps: based on activity level
  // 1.2 (sedentary) -> 5000
  // 1.375 (light) -> 8000
  // 1.55 (moderate) -> 10000
  // 1.725 (active) -> 12000
  // 1.9 (very active) -> 15000
  let steps = 10000;
  if (profile.activityLevel <= 1.2) steps = 5000;
  else if (profile.activityLevel <= 1.375) steps = 8000;
  else if (profile.activityLevel <= 1.55) steps = 10000;
  else if (profile.activityLevel <= 1.725) steps = 12000;
  else steps = 15000;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    water: Math.round(water),
    steps,
  };
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
