<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref, computed, watch, onMounted } from 'vue'
import type { Food, UserProfile as UserProfileType } from '@/types/nutrition'
import { NUTRIENT_META, CATEGORIES } from '@/types/nutrition'
import { useRecommendations } from '@/composables/useRecommendations'
import * as XLSX from 'xlsx'
import UserProfile from '@/components/Nutrition/UserProfile.vue'
import FoodSearch from '@/components/Nutrition/FoodSearch.vue'
import CategoryFilter from '@/components/Nutrition/CategoryFilter.vue'
import NutrientGrid from '@/components/Nutrition/NutrientGrid.vue'
import foodsData from '@/data/foods.json'

interface MealEntry {
  id: number
  food: Food
  grams: number
}

const foods = ref<Food[]>([])
const loading = ref(true)
const mealEntries = ref<MealEntry[]>([])
let nextId = 1

const profile = ref<UserProfileType>({
  age: 30,
  gender: 'male',
  weight: 70,
  height: 175,
  activity_level: 'moderate',
})

const recommendations = useRecommendations(profile)

const selectedCategory = ref<string | null>(null)
const expandedFoods = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  const s = new Set(expandedFoods.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedFoods.value = s
}

const filteredFoods = computed(() => {
  if (!selectedCategory.value) return foods.value
  return foods.value.filter((f) => f.category === selectedCategory.value)
})

const quickFoods = computed(() => filteredFoods.value.slice(0, 12))

function addFood(food: Food) {
  if (mealEntries.value.some((e) => e.food.id === food.id)) return
  mealEntries.value.push({ id: nextId++, food, grams: 0 })
}

function removeFood(entryId: number) {
  mealEntries.value = mealEntries.value.filter((e) => e.id !== entryId)
  const s = new Set(expandedFoods.value)
  s.delete(entryId)
  expandedFoods.value = s
}

function updateGrams(entryId: number, grams: number) {
  const entry = mealEntries.value.find((e) => e.id === entryId)
  if (entry) entry.grams = Math.max(0, grams)
}

const totalNutrients = computed(() => {
  if (mealEntries.value.length === 0) return null
  const totals: Record<string, number> = {}
  for (const meta of NUTRIENT_META) {
    totals[meta.key] = 0
  }
  for (const entry of mealEntries.value) {
    const mult = entry.grams / 100
    for (const meta of NUTRIENT_META) {
      totals[meta.key] += (entry.food[meta.key] as number || 0) * mult
    }
  }
  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 100) / 100
  }
  return totals
})

const totalFood = computed<Food | null>(() => {
  if (!totalNutrients.value) return null
  return {
    id: 0,
    name: 'Meal Total',
    category: '',
    serving_description: `${mealEntries.value.length} food${mealEntries.value.length > 1 ? 's' : ''}`,
    serving_weight_g: 100,
    ...totalNutrients.value,
  } as Food
})

const totalCalories = computed(() => totalNutrients.value?.calories ?? 0)
const totalProtein = computed(() => totalNutrients.value?.protein ?? 0)
const totalCarbs = computed(() => totalNutrients.value?.carbohydrates ?? 0)
const totalFat = computed(() => totalNutrients.value?.fat ?? 0)

const canDownload = computed(() => mealEntries.value.length > 0 && mealEntries.value.some(e => e.grams > 0))

function downloadExcel() {
  if (!canDownload.value) return
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const nu = (key: string) => totalNutrients.value?.[key] ?? 0

  const sorted = [...mealEntries.value].sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.food.category as any)
    const cb = CATEGORIES.indexOf(b.food.category as any)
    return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb)
  })

  const H = ['Food', 'Category', 'g', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar', 'Sodium', 'Potassium', 'Calcium', 'Iron']
  const COL_KEYS: (keyof Food | '')[] = ['name', 'category', '', 'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium', 'potassium', 'calcium', 'iron']
  const CC = H.length

  const data: (string | number | null)[][] = []
  data.push(['NUTRIGRAM'])
  data.push(['My Daily Intake'])
  data.push([])
  data.push(['Date: ' + today])
  data.push([])
  data.push([...H])

  for (const e of sorted) {
    const m = e.grams / 100
    const row: (string | number | null)[] = [e.food.name, e.food.category, Math.round(e.grams)]
    for (let ci = 3; ci < CC; ci++) {
      const val = (e.food[COL_KEYS[ci] as keyof Food] as number || 0) * m
      row.push(Math.round(val * 100) / 100)
    }
    data.push(row)
  }

  const tr = data.length
  data.push(['GRAND TOTAL'])
  for (let ci = 1; ci < CC; ci++) {
    data[tr].push('')
  }
  for (let ci = 3; ci < CC; ci++) {
    data[tr][ci] = nu(COL_KEYS[ci] as string)
  }

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 6 }, { wch: 9 }, { wch: 9 }, { wch: 8 }, { wch: 7 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 7 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: CC - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: CC - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: CC - 1 } },
  ]

  const cBlue = '2F5496'
  const cHdrBg = 'D6E4F0'
  const cGray = 'F2F2F2'
  const cTotal = 'E8EDF5'
  const cBorder = 'D0D0D0'

  function s(r: number, c: number, o: Record<string, any>) {
    const cell = XLSX.utils.encode_cell({ r, c })
    if (!ws[cell]) ws[cell] = { t: 's', v: '' }
    ws[cell].s = {
      font: { name: 'Calibri', size: 10, ...o.f },
      alignment: { vertical: 'center', ...o.a },
      fill: o.bg ? { fgColor: { rgb: o.bg }, patternType: 'solid' } : undefined,
      border: { top: { style: 'thin', color: { rgb: cBorder } }, bottom: { style: 'thin', color: { rgb: cBorder } }, left: { style: 'thin', color: { rgb: cBorder } }, right: { style: 'thin', color: { rgb: cBorder } } },
    }
  }

  function rowStyle(r: number, bg: string, bold = false, color = '333333', sz = 10) {
    for (let ci = 0; ci < CC; ci++) {
      s(r, ci, { f: { bold, color, sz }, a: { horizontal: ci < 2 ? 'left' : 'right' }, bg })
    }
  }

  s(0, 0, { f: { bold: true, size: 14, color: cBlue }, a: { horizontal: 'center' } })
  s(1, 0, { f: { size: 11, color: '666666' }, a: { horizontal: 'center' } })
  s(3, 0, { f: { size: 10, color: '888888' }, a: { horizontal: 'left' } })

  rowStyle(5, cHdrBg, true, cBlue)

  for (let ri = 0; ri < sorted.length; ri++) {
    rowStyle(6 + ri, ri % 2 === 0 ? 'FFFFFF' : cGray)
  }

  rowStyle(tr, cTotal, true, cBlue)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Intake')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nutrigram-meal.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  foods.value = foodsData as Food[]
  loading.value = false
  const saved = localStorage.getItem('nutrigram_profile')
  if (saved) {
    try { profile.value = JSON.parse(saved) } catch {}
  }
})

watch(profile, (val) => {
  localStorage.setItem('nutrigram_profile', JSON.stringify(val))
}, { deep: true })
</script>

<template>
  <Head title="Nutrigram" />

  <div class="min-h-screen bg-background">
    <header class="border-b border-border">
      <div class="mx-auto flex h-14 max-w-7xl items-center px-4">
        <span class="text-lg font-bold tracking-tight text-foreground">Nutrigram</span>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Nutrition Calculator</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Add foods &amp; their weight to see the full nutritional breakdown
        </p>
      </div>

      <div class="mb-6 rounded-xl border bg-card text-card-foreground shadow-sm">
        <details class="group">
          <summary class="flex cursor-pointer items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground select-none [&::-webkit-details-marker]:hidden">
            <svg class="h-4 w-4 transition-transform group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
            Your Profile
          </summary>
          <div class="px-6 pb-5">
            <UserProfile v-model:profile="profile" />
          </div>
        </details>
      </div>

      <div class="mb-6 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h2 class="mb-3 text-sm font-semibold text-foreground">Search Foods</h2>
        <FoodSearch :foods="foods" @select="addFood" />
        <div class="mt-4">
          <CategoryFilter :foods="foods" :selected-category="selectedCategory" @select="(c: string | null) => selectedCategory = c" />
        </div>
        <div v-if="!loading && quickFoods.length > 0" class="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
          <button
            v-for="food in quickFoods"
            :key="food.id"
            @click="addFood(food)"
            :class="[
              'rounded-lg border px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent',
              mealEntries.some(e => e.food.id === food.id) ? 'border-primary bg-primary/5' : 'border-border',
            ]"
          >
            <div class="font-medium text-foreground truncate">{{ food.name }}</div>
            <div class="text-muted-foreground mt-0.5">{{ food.calories }} kcal/100g</div>
          </button>
        </div>
        <div v-if="loading" class="py-6 text-center text-sm text-muted-foreground">Loading foods data...</div>
      </div>

      <div v-if="mealEntries.length > 0" class="space-y-4">
        <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div class="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-foreground">Selected Foods ({{ mealEntries.length }})</h2>
            <div class="flex items-center gap-2">
              <button @click="downloadExcel" :disabled="!canDownload" class="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium shadow-xs transition-colors" :class="canDownload ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'">
                <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m8 16 2-2-2-2"/><path d="m16 16-2-2 2-2"/></svg>
                Download Report
              </button>
              <button @click="mealEntries = []" class="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
            </div>
          </div>
          <div class="divide-y divide-border">
            <div v-for="entry in mealEntries" :key="entry.id" class="px-5 py-3">
              <div class="flex items-center gap-3">
                <button @click="toggleExpand(entry.id)" class="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  <svg class="h-4 w-4 transition-transform" :class="expandedFoods.has(entry.id) ? 'rotate-90' : ''" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
                </button>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-foreground truncate">{{ entry.food.name }}</span>
                    <span class="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{{ entry.food.category }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button @click="updateGrams(entry.id, entry.grams - 10)" class="flex h-7 w-7 items-center justify-center rounded border border-input bg-transparent text-foreground hover:bg-accent transition-colors">
                    <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" /></svg>
                  </button>
                  <input
                    type="number"
                    min="0"
                    :value="entry.grams"
                    @input="updateGrams(entry.id, Number(($event.target as HTMLInputElement).value) || 0)"
                    class="h-7 w-16 rounded border border-input bg-transparent px-1 text-center text-sm font-semibold tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span class="text-xs text-muted-foreground w-7">g</span>
                  <button @click="updateGrams(entry.id, entry.grams + 10)" class="flex h-7 w-7 items-center justify-center rounded border border-input bg-transparent text-foreground hover:bg-accent transition-colors">
                    <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  </button>
                </div>
                <button @click="removeFood(entry.id)" class="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
              <div v-if="expandedFoods.has(entry.id)" class="mt-3 pl-7">
                <NutrientGrid :food="entry.food" :grams="entry.grams" :recommendations="recommendations" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalFood" class="rounded-xl border-2 border-primary/20 bg-card text-card-foreground shadow-sm overflow-hidden">
          <div class="border-b border-border bg-primary/5 px-5 py-3">
            <h2 class="text-sm font-semibold text-foreground">Total Meal Nutrition</h2>
          </div>
          <div class="px-5 py-4">
            <div class="grid grid-cols-4 gap-3 mb-4">
              <div class="rounded-lg bg-secondary/50 p-3 text-center">
                <div class="text-xl font-bold text-orange-500">{{ Math.round(totalCalories) }}</div>
                <div class="text-[10px] text-muted-foreground uppercase tracking-wider">Calories</div>
              </div>
              <div class="rounded-lg bg-secondary/50 p-3 text-center">
                <div class="text-xl font-bold text-blue-500">{{ totalProtein.toFixed(1) }}<span class="text-sm">g</span></div>
                <div class="text-[10px] text-muted-foreground uppercase tracking-wider">Protein</div>
              </div>
              <div class="rounded-lg bg-secondary/50 p-3 text-center">
                <div class="text-xl font-bold text-amber-500">{{ totalCarbs.toFixed(1) }}<span class="text-sm">g</span></div>
                <div class="text-[10px] text-muted-foreground uppercase tracking-wider">Carbs</div>
              </div>
              <div class="rounded-lg bg-secondary/50 p-3 text-center">
                <div class="text-xl font-bold text-purple-500">{{ totalFat.toFixed(1) }}<span class="text-sm">g</span></div>
                <div class="text-[10px] text-muted-foreground uppercase tracking-wider">Fat</div>
              </div>
            </div>
            <NutrientGrid :food="totalFood" :grams="100" :recommendations="recommendations" />
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl border border-dashed border-border bg-card text-card-foreground p-12">
        <div class="text-center">
          <svg class="mx-auto h-10 w-10 text-muted-foreground/40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2v6a2 2 0 0 0 2 2h2" /><path d="M14 2v6a2 2 0 0 0 2 2h2" /><path d="M18 2v2" /><path d="M10 2v2" /><path d="M6 14v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" /><path d="M6 10h12" /><path d="M12 14v4" /><path d="M10 17h4" />
          </svg>
          <p class="mt-3 text-sm text-muted-foreground">Search and add foods above to build your meal</p>
        </div>
      </div>

      <footer class="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground">
        <p>Nutrition data per 100g &middot; Based on USDA standard reference</p>
      </footer>
    </main>
  </div>
</template>
