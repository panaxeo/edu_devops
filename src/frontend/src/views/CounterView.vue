<script setup lang="ts">
import { useCounterStore } from '../stores/counter'
const store = useCounterStore()
</script>

<template>
  <div class="counter">
    <div class="space">
      <button @click="store.increment" class="counter-btn">Clicked {{ store.count }}</button>
    </div>
    <div>
      <p>Double count is {{ store.doubleCount }}</p>
    </div>
  </div>
</template>

<style scoped>

.space {
  margin-right: 1rem;
}

@media (min-width: 1024px) {
  .counter {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
  }
}

.counter-btn {
  display: inline-block;
  outline: 0;
  cursor: pointer;
  padding: 5px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  vertical-align: middle;
  border: 1px solid;
  border-radius: 6px;
  color: #0366d6;
  background-color: #fafbfc;
  border-color: #1b1f2326;
  box-shadow: rgba(27, 31, 35, 0.04) 0px 1px 0px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px 0px inset;
  transition: 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  transition-property: color, background-color, border-color;
  :hover {
      color: #ffffff;
      background-color: #0366d6;
      border-color: #1b1f2326;
      box-shadow: rgba(27, 31, 35, 0.1) 0px 1px 0px 0px, rgba(255, 255, 255, 0.03) 0px 1px 0px 0px inset;
      transition-duration: 0.1s;
  }
}

</style>
