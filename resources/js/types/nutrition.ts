export interface Food {
  id: number
  name: string
  category: string
  serving_description: string
  serving_weight_g: number
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  saturated_fat: number
  trans_fat: number
  cholesterol: number
  sodium: number
  potassium: number
  calcium: number
  iron: number
  magnesium: number
  phosphorus: number
  vitamin_a: number
  vitamin_c: number
  vitamin_d: number
  vitamin_b6: number
  vitamin_b12: number
  zinc: number
}

export type BodyGoal = 'toned' | 'bulking' | 'cutting' | 'maintain' | 'lean_bulk' | 'shredding'

export interface UserProfile {
  age: number
  gender: 'male' | 'female'
  weight: number
  height: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete'
  target_weight?: number
  body_goal?: BodyGoal
}

export interface DailyRecommendations {
  tdee: number
  bmi: number
  bmi_status: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  saturated_fat: number
  sodium: number
  target_calories: number
  target_weight_warning: string
  healthy_weight_min: number
  healthy_weight_max: number
}

export interface CalculatedNutrient {
  key: string
  label: string
  value: number
  unit: string
  daily_value: number
  daily_percent: number
  category: 'energy' | 'macros' | 'fats' | 'minerals' | 'vitamins'
}

export const NUTRIENT_META: { key: keyof Food; label: string; unit: string; category: CalculatedNutrient['category']; dv: number }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', category: 'energy', dv: 2000 },
  { key: 'protein', label: 'Protein', unit: 'g', category: 'macros', dv: 50 },
  { key: 'carbohydrates', label: 'Carbs', unit: 'g', category: 'macros', dv: 300 },
  { key: 'fat', label: 'Fat', unit: 'g', category: 'macros', dv: 65 },
  { key: 'fiber', label: 'Fiber', unit: 'g', category: 'macros', dv: 28 },
  { key: 'sugar', label: 'Sugar', unit: 'g', category: 'macros', dv: 50 },
  { key: 'saturated_fat', label: 'Saturated Fat', unit: 'g', category: 'fats', dv: 20 },
  { key: 'trans_fat', label: 'Trans Fat', unit: 'g', category: 'fats', dv: 0 },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', category: 'fats', dv: 300 },
  { key: 'sodium', label: 'Sodium', unit: 'mg', category: 'minerals', dv: 2300 },
  { key: 'potassium', label: 'Potassium', unit: 'mg', category: 'minerals', dv: 4700 },
  { key: 'calcium', label: 'Calcium', unit: 'mg', category: 'minerals', dv: 1300 },
  { key: 'iron', label: 'Iron', unit: 'mg', category: 'minerals', dv: 18 },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', category: 'minerals', dv: 420 },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', category: 'minerals', dv: 1250 },
  { key: 'vitamin_a', label: 'Vitamin A', unit: 'mcg RAE', category: 'vitamins', dv: 900 },
  { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg', category: 'vitamins', dv: 90 },
  { key: 'vitamin_d', label: 'Vitamin D', unit: 'mcg', category: 'vitamins', dv: 20 },
  { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg', category: 'vitamins', dv: 1.7 },
  { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'mcg', category: 'vitamins', dv: 2.4 },
  { key: 'zinc', label: 'Zinc', unit: 'mg', category: 'vitamins', dv: 11 },
]

export const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Meat & Poultry',
  'Fish',
  'Dairy & Eggs',
  'Grains',
  'Legumes & Nuts',
  'Oils & Others',
  'Beverages',
  'Alcoholic Beverages',
]
