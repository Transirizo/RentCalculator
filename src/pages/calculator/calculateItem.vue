<template>
  <div class="calculatorArea">
    <div class="calculateItem">
      <div class="calculateName">
        {{ state.roomItems[props.index].type === 'electricity' ? '电' : '水' }}：
      </div>
      <input type="digit" class="calculateInput" v-model="state.roomItems[props.index].now" />
      <div>-</div>
      <input type="digit" class="calculateInput" v-model="state.roomItems[props.index].before" />
      <div>*</div>
      <input
        type="digit"
        class="calculateInput"
        v-model="state.roomItems[props.index].singlePrice"
      />
      <div>=</div>
      <div class="text">{{ state.getResultByIndex(props.index) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculatorState } from '@/store/store'

const props = defineProps(['index'])
const state = calculatorState()
</script>

<style scoped>
.calculatorArea {
  width: 100vw;
}
.calculateItem {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 30px;
  justify-content: space-evenly;
  width: 100%;
  margin: 10px 0;
}

.calculateName {
}

.calculateInput {
  text-align: center;
  width: 50px;
  height: 30px;
  border-bottom: 1px solid;
}
</style>
