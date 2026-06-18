<script setup lang="ts">
import type { Food } from '@/types/nutrition'
import { computed } from 'vue'

const props = defineProps<{
  grams: number
  selectedFood: Food | null
}>()

const emit = defineEmits<{
  (e: 'update:grams', grams: number): void
}>()

const presets = computed(() => {
  if (!props.selectedFood) return []
  return [
    { label: '1 serving', value: props.selectedFood.serving_weight_g },
    { label: '50g', value: 50 },
    { label: '100g', value: 100 },
    { label: '200g', value: 200 },
  ]
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <button
        @click="emit('update:grams', Math.max(1, grams - 10))"
        class="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-foreground hover:bg-accent transition-colors"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" /></svg>
      </button>
      <div class="relative flex-1">
        <input
          type="number"
          min="1"
          max="5000"
          :value="grams"
          @input="emit('update:grams', Math.max(1, Number(($event.target as HTMLInputElement).value) || 1))"
          class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-center text-lg font-bold shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-normal">grams</span>
      </div>
      <button
        @click="emit('update:grams', grams + 10)"
        class="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-foreground hover:bg-accent transition-colors"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
      </button>
    </div>

    <div v-if="selectedFood" class="flex flex-wrap gap-2">
      <button
        v-for="preset in presets"
        :key="preset.label"
        @click="emit('update:grams', preset.value)"
        :class="[
          'inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          grams === preset.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ]"
      >
        {{ preset.label }}
      </button>
    </div>

    <div v-if="selectedFood" class="w-full">
      <input
        type="range"
        min="1"
        max="500"
        :value="grams"
        @input="emit('update:grams', Number(($event.target as HTMLInputElement).value))"
        class="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
      />
      <div class="flex justify-between text-xs text-muted-foreground mt-1">
        <span>1g</span>
        <span>500g</span>
      </div>
    </div>
  </div>
</template>
