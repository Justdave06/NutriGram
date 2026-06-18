<script setup lang="ts">
import type { Food, DailyRecommendations, CalculatedNutrient } from '@/types/nutrition'
import { NUTRIENT_META } from '@/types/nutrition'
import { computed } from 'vue'

const props = defineProps<{
  food: Food
  grams: number
  recommendations: DailyRecommendations
}>()

const multiplier = computed(() => props.grams / 100)

const nutrients = computed<CalculatedNutrient[]>(() => {
  return NUTRIENT_META.map((meta) => {
    const per100g = props.food[meta.key] as number
    const value = Math.round((per100g * multiplier.value) * 100) / 100
    const rec = props.recommendations
    let dv = meta.dv
    if (meta.key === 'calories' && rec.calories) dv = rec.calories
    else if (meta.key === 'protein' && rec.protein) dv = rec.protein
    else if (meta.key === 'carbohydrates' && rec.carbs) dv = rec.carbs
    else if (meta.key === 'fat' && rec.fat) dv = rec.fat
    else if (meta.key === 'fiber' && rec.fiber) dv = rec.fiber
    else if (meta.key === 'sugar' && rec.sugar) dv = rec.sugar
    else if (meta.key === 'saturated_fat' && rec.saturated_fat) dv = rec.saturated_fat
    else if (meta.key === 'sodium' && rec.sodium) dv = rec.sodium

    const daily_percent = dv > 0 ? Math.round((value / dv) * 100) : 0
    return { ...meta, value, daily_value: dv, daily_percent }
  })
})

const grouped = computed(() => {
  const groups: Record<string, CalculatedNutrient[]> = {}
  for (const n of nutrients.value) {
    if (!groups[n.category]) groups[n.category] = []
    groups[n.category].push(n)
  }
  return groups
})

const categoryLabels: Record<string, string> = {
  energy: 'Energy',
  macros: 'Macronutrients',
  fats: 'Fats',
  minerals: 'Minerals',
  vitamins: 'Vitamins',
}

const categoryColors: Record<string, string> = {
  energy: 'border-orange-200 dark:border-orange-900',
  macros: 'border-blue-200 dark:border-blue-900',
  fats: 'border-purple-200 dark:border-purple-900',
  minerals: 'border-emerald-200 dark:border-emerald-900',
  vitamins: 'border-amber-200 dark:border-amber-900',
}

const categoryAccents: Record<string, string> = {
  energy: 'text-orange-500',
  macros: 'text-blue-500',
  fats: 'text-purple-500',
  minerals: 'text-emerald-500',
  vitamins: 'text-amber-500',
}

const barColors: Record<string, string> = {
  energy: 'bg-orange-500',
  macros: 'bg-blue-500',
  fats: 'bg-purple-500',
  minerals: 'bg-emerald-500',
  vitamins: 'bg-amber-500',
}
</script>

<template>
  <div v-if="food" class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-foreground">{{ food.name }}</h3>
        <p class="text-sm text-muted-foreground">
          {{ food.serving_description }}
          &middot; {{ grams }}g
          &middot; {{ multiplier > 0 ? (multiplier * 100).toFixed(0) : 0 }}% of serving
        </p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-orange-500">{{ nutrients.find(n => n.key === 'calories')?.value ?? 0 }}</div>
        <div class="text-xs text-muted-foreground">kcal</div>
      </div>
    </div>

    <div v-for="(group, cat) in grouped" :key="cat" class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div :class="['border-l-4', categoryColors[cat], 'px-4 py-3']">
        <h4 :class="['text-xs font-semibold uppercase tracking-wider', categoryAccents[cat]]">
          {{ categoryLabels[cat] || cat }}
        </h4>
      </div>
      <div class="divide-y divide-border">
        <div v-for="n in group" :key="n.key" class="px-4 py-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-foreground">{{ n.label }}</span>
            <span class="text-sm font-semibold text-foreground">
              {{ n.value }} {{ n.unit }}
              <span v-if="n.daily_percent > 0" class="text-xs text-muted-foreground font-normal ml-1">
                ({{ n.daily_percent }}% of daily)
              </span>
            </span>
          </div>
          <div v-if="n.daily_value > 0" class="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all duration-300', barColors[cat]]"
              :style="{ width: Math.min(n.daily_percent, 100) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
