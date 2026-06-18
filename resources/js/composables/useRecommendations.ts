import { computed, type ComputedRef, type Ref } from 'vue'
import type { UserProfile, DailyRecommendations, BodyGoal } from '@/types/nutrition'

const GOAL_ADJUSTMENTS: Record<BodyGoal, { label: string; cal_adjust: number; protein_factor: number; desc: string }> = {
  maintain: { label: 'Maintain', cal_adjust: 0, protein_factor: 0.25, desc: 'Maintain current weight' },
  toned: { label: 'Toned', cal_adjust: -200, protein_factor: 0.3, desc: 'Slight deficit, high protein for definition' },
  lean_bulk: { label: 'Lean Bulk', cal_adjust: 200, protein_factor: 0.27, desc: 'Slight surplus for clean gains' },
  bulking: { label: 'Bulking', cal_adjust: 400, protein_factor: 0.25, desc: 'Surplus for muscle growth' },
  cutting: { label: 'Cutting', cal_adjust: -400, protein_factor: 0.35, desc: 'Deficit for fat loss' },
  shredding: { label: 'Shredding', cal_adjust: -600, protein_factor: 0.4, desc: 'Aggressive deficit for maximum definition' },
}

export function useRecommendations(profile: Ref<UserProfile> | ComputedRef<UserProfile>): ComputedRef<DailyRecommendations> {
  return computed(() => {
    const { age, gender, weight, height, activity_level, target_weight, body_goal } = profile.value
    if (!age || !weight || !height) {
      return {
        tdee: 0, bmi: 0, bmi_status: '',
        calories: 0, protein: 0, carbs: 0, fat: 0,
        fiber: 28, sugar: 50, saturated_fat: 20, sodium: 2300,
        target_calories: 0, target_weight_warning: '',
        healthy_weight_min: 0, healthy_weight_max: 0,
      }
    }

    const hm = height / 100
    const bmi = weight / (hm * hm)

    let bmi_status: string
    if (bmi < 18.5) bmi_status = 'Underweight'
    else if (bmi < 25) bmi_status = 'Normal'
    else if (bmi < 30) bmi_status = 'Overweight'
    else bmi_status = 'Obese'

    let bmr: number
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    const multipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, heavy: 1.725, athlete: 1.9,
    }
    const tdee = Math.round(bmr * (multipliers[activity_level] ?? 1.2))

    const healthy_weight_min = Math.round(18.5 * hm * hm * 10) / 10
    const healthy_weight_max = Math.round(24.9 * hm * hm * 10) / 10

    let target_weight_warning = ''
    if (target_weight && target_weight > 0) {
      if (target_weight < healthy_weight_min) {
        target_weight_warning = `Below healthy BMI range. Minimum healthy weight for your height: ${healthy_weight_min} kg`
      } else if (target_weight > healthy_weight_max) {
        target_weight_warning = `Above healthy BMI range. Maximum healthy weight for your height: ${healthy_weight_max} kg`
      }
    }

    let goal_cal_adjust = 0
    let goal_protein_factor = 0.25
    if (body_goal && GOAL_ADJUSTMENTS[body_goal]) {
      goal_cal_adjust = GOAL_ADJUSTMENTS[body_goal].cal_adjust
      goal_protein_factor = GOAL_ADJUSTMENTS[body_goal].protein_factor
    }

    const target_calories = Math.max(1200, tdee + goal_cal_adjust)

    return {
      tdee,
      bmi: Math.round(bmi * 10) / 10,
      bmi_status,
      calories: target_calories,
      protein: Math.round((target_calories * goal_protein_factor) / 4),
      carbs: Math.round((target_calories * 0.4) / 4),
      fat: Math.round((target_calories * 0.3) / 9),
      fiber: 28,
      sugar: Math.round(target_calories * 0.1 / 4),
      saturated_fat: Math.round(target_calories * 0.07 / 9),
      sodium: 2300,
      target_calories,
      target_weight_warning,
      healthy_weight_min,
      healthy_weight_max,
    }
  })
}
