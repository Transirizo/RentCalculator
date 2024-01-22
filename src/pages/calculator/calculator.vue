<template>
  <div class="calculatorTitle">
    <div class="name">项目</div>
    <div class="now">本月</div>
    <div class="before">上月</div>
    <div class="price">单价</div>
    <div class="result">结果</div>
  </div>
  <calculateItem v-for="(item, index) in state.roomItems" :index="index" />
  <div class="rentPrice">
    <span>房租：</span>
    <input class="rentInput" type="digit" v-model="state.roomInfo.rent" />
  </div>
  <div class="totalPrice">总额：{{ state.getTotal }}</div>
  <div class="finish" @click="finishAndSave">完成</div>
  <div class="record">
    <div class="recordTitle">
      <div>月份</div>
      <div>水</div>
      <div>电</div>
      <div>金额</div>
    </div>
    <recordItem
      v-for="(item, index) in state.roomInfo.record"
      :key="index"
      :water="item.water"
      :electricity="item.electricity"
      :price="item.totalPrice"
      :time="item.time"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import calculateItem from './calculateItem.vue'
import recordItem from './recordItem.vue'
import { calculatorState } from '@/store/store'

const state = calculatorState()

const finishAndSave = () => {
  uni.showModal({
    title: '别填错了！',
    content: '确认数据正确，没有删除！',
    success: function (res) {
      if (res.confirm) {
        state.saveData()
        uni.navigateBack()
      } else if (res.cancel) {
      }
    },
  })
}
onMounted(() => {})
</script>

<style scoped>
.calculatorTitle {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  align-content: center;
}

.name {
  margin-left: 15px;
}

.now {
  margin-left: 28px;
}

.before {
  margin-left: 60px;
}
.price {
  margin-left: 63px;
}

.result {
  margin-left: 40px;
}

.rentPrice {
  margin-top: 20px;
  margin-left: 10px;
  font-size: 20px;
  display: flex;
  flex-direction: row;
}

.rentInput {
  margin-left: 5px;
  width: 100px;
  border-bottom: 1px solid #000;
  text-align: center;
}

.finish {
  position: absolute;
  right: 20px;
  margin-top: 20px;
  width: 70px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border: 1px solid #2c30a5;
  border-radius: 4px;
  font-size: 30px;
  background-color: #47eb45;
}

.totalPrice {
  width: 100vw;
  text-align: center;
  font-size: 40px;
  margin-top: 20px;
}

.record {
  width: 100vw;
  height: 50vh;
  position: absolute;
  bottom: 0;
  border-top: 1px solid #000;
  padding: 10px;
  overflow-y: auto;
}
.recordTitle {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
</style>
