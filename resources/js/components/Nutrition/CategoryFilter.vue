<script setup lang="ts">
import type { Food } from '@/types/nutrition'
import { CATEGORIES } from '@/types/nutrition'
import { computed } from 'vue'

const props = defineProps<{
  foods: Food[]
  selectedCategory: string | null
}>()

const emit = defineEmits<{
  (e: 'select', category: string | null): void
}>()

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const f of props.foods) {
    counts[f.category] = (counts[f.category] || 0) + 1
  }
  return counts
})

const sortedCategories = computed(() => {
  return [...CATEGORIES].filter((c) => categoryCounts.value[c])
})
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      @click="emit('select', null)"
      :class="[
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        !selectedCategory
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ]"
    >
      All
    </button>
    <button
      v-for="cat in sortedCategories"
      :key="cat"
      @click="emit('select', cat)"
      :class="[
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        selectedCategory === cat
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ]"
    >
      {{ cat }}
      <span class="ml-1.5 opacity-60">({{ categoryCounts[cat] }})</span>
    </button>
  </div>
</template>
