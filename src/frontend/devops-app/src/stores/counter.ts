import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const increment = () => incrementValue(count)

  return { count, doubleCount, increment }
})

export interface ICounter {
  value: number
}

export function incrementValue(count: ICounter) {
  count.value++
}
