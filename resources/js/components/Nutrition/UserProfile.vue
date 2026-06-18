<script setup lang="ts">
import type { UserProfile as UserProfileType, BodyGoal } from '@/types/nutrition'
import { useRecommendations } from '@/composables/useRecommendations'
import { computed, toRef } from 'vue'

const props = defineProps<{
  profile: UserProfileType
}>()

const emit = defineEmits<{
  (e: 'update:profile', profile: UserProfileType): void
}>()

function updateField<K extends keyof UserProfileType>(key: K, value: UserProfileType[K]) {
  emit('update:profile', { ...props.profile, [key]: value })
}

const profileRef = toRef(props, 'profile')
const recommendations = useRecommendations(profileRef)

const bmiColor = computed(() => {
  const bmi = recommendations.value.bmi
  if (!bmi) return ''
  if (bmi < 18.5) return 'text-yellow-500'
  if (bmi < 25) return 'text-green-500'
  if (bmi < 30) return 'text-orange-500'
  return 'text-red-500'
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label class="text-sm font-medium text-foreground">Age</label>
        <input
          type="number" min="1" max="120"
          :value="profile.age"
          @input="updateField('age', Number(($event.target as HTMLInputElement).value))"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          placeholder="30"
        />
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Gender</label>
        <select
          :value="profile.gender"
          @change="updateField('gender', ($event.target as HTMLSelectElement).value as 'male' | 'female')"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Weight (kg)</label>
        <input
          type="number" min="1" max="500" step="0.1"
          :value="profile.weight"
          @input="updateField('weight', Number(($event.target as HTMLInputElement).value))"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          placeholder="70"
        />
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Height (cm)</label>
        <input
          type="number" min="1" max="300"
          :value="profile.height"
          @input="updateField('height', Number(($event.target as HTMLInputElement).value))"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          placeholder="175"
        />
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Activity Level</label>
        <select
          :value="profile.activity_level"
          @change="updateField('activity_level', ($event.target as HTMLSelectElement).value as UserProfileType['activity_level'])"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <option value="sedentary">Sedentary</option>
          <option value="light">Light (1-3x/wk)</option>
          <option value="moderate">Moderate (3-5x/wk)</option>
          <option value="heavy">Heavy (6-7x/wk)</option>
          <option value="athlete">Athlete (2x/day)</option>
        </select>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-4">
      <div>
        <label class="text-sm font-medium text-foreground">Target Weight (kg)</label>
        <div class="relative">
          <input
            type="number" min="1" max="500" step="0.1"
            :value="profile.target_weight ?? ''"
            @input="updateField('target_weight', Number(($event.target as HTMLInputElement).value) || undefined)"
            class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            placeholder="Same as current"
          />
        </div>
        <p v-if="recommendations.target_weight_warning" class="mt-1.5 flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
          <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
          <span>{{ recommendations.target_weight_warning }}</span>
        </p>
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Body Goal</label>
        <select
          :value="profile.body_goal ?? ''"
          @change="updateField('body_goal', (($event.target as HTMLSelectElement).value || undefined) as BodyGoal | undefined)"
          class="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <option value="">Not set</option>
          <option value="toned">Toned</option>
          <option value="bulking">Bulking</option>
          <option value="cutting">Cutting</option>
          <option value="maintain">Maintain</option>
          <option value="lean_bulk">Lean Bulk</option>
          <option value="shredding">Shredding</option>
        </select>
        <p v-if="profile.body_goal" class="mt-1 text-[10px] text-muted-foreground">
          {{ profile.body_goal === 'toned' ? 'Slight deficit, high protein for definition' :
             profile.body_goal === 'bulking' ? 'Surplus for muscle growth' :
             profile.body_goal === 'cutting' ? 'Deficit for fat loss' :
             profile.body_goal === 'maintain' ? 'Maintain current weight' :
             profile.body_goal === 'lean_bulk' ? 'Slight surplus for clean gains' :
             profile.body_goal === 'shredding' ? 'Aggressive deficit for maximum definition' : '' }}
        </p>
      </div>
      <div>
        <label class="text-sm font-medium text-foreground">Healthy Weight Range</label>
        <p class="mt-1.5 text-sm text-muted-foreground">
          {{ recommendations.healthy_weight_min }} – {{ recommendations.healthy_weight_max }} kg
        </p>
      </div>
    </div>

    <div v-if="recommendations.calories > 0" class="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">
      <h3 class="mb-3 text-sm font-semibold text-foreground">
        Daily Recommendations
        <span v-if="profile.body_goal" class="font-normal text-muted-foreground">
          – {{ profile.body_goal === 'toned' ? 'Toned' :
               profile.body_goal === 'bulking' ? 'Bulking' :
               profile.body_goal === 'cutting' ? 'Cutting' :
               profile.body_goal === 'maintain' ? 'Maintain' :
               profile.body_goal === 'lean_bulk' ? 'Lean Bulk' :
               profile.body_goal === 'shredding' ? 'Shredding' : '' }}
        </span>
      </h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div class="text-center">
          <div class="text-lg font-bold" :class="bmiColor">{{ recommendations.bmi }}</div>
          <div class="text-xs text-muted-foreground">BMI ({{ recommendations.bmi_status }})</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">{{ recommendations.tdee }}</div>
          <div class="text-xs text-muted-foreground">TDEE (kcal)</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-orange-500">{{ recommendations.target_calories }}</div>
          <div class="text-xs text-muted-foreground">
            <template v-if="profile.body_goal">Target (kcal)</template>
            <template v-else>Calories (kcal)</template>
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-blue-500">{{ recommendations.protein }}g</div>
          <div class="text-xs text-muted-foreground">Protein</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-amber-500">{{ recommendations.carbs }}g</div>
          <div class="text-xs text-muted-foreground">Carbs</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-purple-500">{{ recommendations.fat }}g</div>
          <div class="text-xs text-muted-foreground">Fat</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-emerald-500">{{ recommendations.fiber }}g</div>
          <div class="text-xs text-muted-foreground">Fiber</div>
        </div>
      </div>
    </div>
  </div>
</template>