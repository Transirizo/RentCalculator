<template>
  <div class="recordItemArea">
    <div>{{ props.time }}</div>
    <div>{{ props.water }}吨</div>
    <div>{{ props.electricity }}度</div>
    <div>{{ props.price }}元</div>
  </div>
</template>

<script setup lang="ts">
import { calculatorState } from '@/store/store'
const props = defineProps(['time', 'water', 'electricity', 'price'])
</script>

<style scoped>
.recordItemArea {
  margin: 10px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
