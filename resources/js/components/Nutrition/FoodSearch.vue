<script setup lang="ts">
import type { Food } from '@/types/nutrition'
import { ref, computed } from 'vue'

const props = defineProps<{
  foods: Food[]
}>()

const emit = defineEmits<{
  (e: 'select', food: Food): void
}>()

const query = ref('')
const open = ref(false)
const selectedIndex = ref(0)

const results = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return props.foods
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, 10)
})

function select(food: Food) {
  query.value = food.name
  open.value = false
  emit('select', food)
}

function onInput() {
  open.value = true
  selectedIndex.value = 0
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && results.value[selectedIndex.value]) {
    e.preventDefault()
    select(results.value[selectedIndex.value])
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function clear() {
  query.value = ''
  open.value = false
  emit('select', null as unknown as Food)
}
</script>

<template>
  <div class="relative">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        v-model="query"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onInput"
        @blur="setTimeout(() => (open = false), 200)"
        type="text"
        class="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-8 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        placeholder="Search foods..."
      />
      <button
        v-if="query"
        @mousedown.prevent="clear"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
    <div
      v-if="open && results.length > 0"
      class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      <div
        v-for="(food, i) in results"
        :key="food.id"
        @mousedown.prevent="select(food)"
        :class="[
          'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors',
          i === selectedIndex ? 'bg-accent text-accent-foreground' : '',
          i === 0 ? 'rounded-t-md' : '',
          i === results.length - 1 ? 'rounded-b-md' : '',
        ]"
      >
        <span class="text-xs font-medium text-muted-foreground shrink-0 w-20 truncate">{{ food.category }}</span>
        <span class="font-medium truncate">{{ food.name }}</span>
        <span class="ml-auto text-xs text-muted-foreground shrink-0">{{ food.calories }} kcal/100g</span>
      </div>
    </div>
    <div v-if="open && query && results.length === 0" class="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground p-3 text-sm text-muted-foreground shadow-md">
      No foods found
    </div>
  </div>
</template>
