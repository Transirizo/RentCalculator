<template>
  <view class="container">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    <view v-else class="content">
      <!-- 添加房间号显示 -->
      <view class="room-header">
        <text class="room-title">{{
          state.roomInfo?.roomName || "未命名房间"
        }}</text>
      </view>

      <!-- 基础费用卡片 -->
      <view class="card">
        <view class="card-header">
          <view class="title-group">
            <text class="card-title">基础费用</text>
            <text class="hint-text" v-if="state.roomInfo.basicFees?.length"
              >· 左滑删除</text
            >
          </view>
          <view class="header-right">
            <button
              class="record-btn"
              hover-class="btn-hover"
              @click="goToRentRecords"
            >
              房租记录
            </button>
            <button
              class="add-fee-btn"
              hover-class="btn-hover"
              @click="addBasicFee"
            >
              <text class="add-fee-icon">+</text>
            </button>
          </view>
        </view>

        <view class="input-group">
          <text class="label">房租</text>
          <input
            class="input"
            type="digit"
            :value="state.roomInfo.rent || ''"
            @input="(e) => updateRent(e.detail.value)"
            placeholder="输入房租金额"
          />
        </view>

        <!-- 动态费用项 -->
        <block v-if="state.roomInfo.basicFees?.length">
          <view
            v-for="(fee, index) in state.roomInfo.basicFees"
            :key="index"
            class="fee-group"
          >
            <view class="fee-wrapper">
              <view
                class="fee-content"
                @touchstart="(e) => touchStart(e, index)"
                @touchmove="(e) => touchMove(e, index)"
                @touchend="() => touchEnd(index)"
                :style="{
                  transform: `translateX(${slideWidths[index] || 0}px)`,
                }"
              >
                <input
                  class="fee-name-input"
                  v-model="fee.name"
                  placeholder="费用名称"
                />
                <input
                  class="fee-amount-input"
                  type="digit"
                  :value="fee.amount || ''"
                  @input="(e) => updateFeeAmount(index, e.detail.value)"
                  placeholder="0"
                />
              </view>
              <view class="delete-btn" @click="deleteBasicFee(index)"
                >删除</view
              >
            </view>
          </view>
        </block>

        <!-- 基础费用小计 -->
        <view class="result-row">
          <text class="label">基础费用小计</text>
          <text class="amount">¥{{ calculateBasicTotal() }}</text>
        </view>
      </view>

      <!-- 水费计算卡片 -->
      <view class="card">
        <text class="card-title">水费计算</text>
        <view class="input-group">
          <text class="label">水费单价</text>
          <text class="price">¥{{ state.waterPrice || 0 }}</text>
        </view>
        <view class="input-group">
          <text class="label">本月读数</text>
          <input
            class="input"
            type="digit"
            :value="state.currentWater || ''"
            @input="(e) => updateCurrentWater(e.detail.value)"
            placeholder="输入本月读数"
          />
        </view>
        <view class="input-group">
          <text class="label">上月读数</text>
          <text class="last-reading highlight">{{ state.lastWater }}</text>
        </view>
        <view class="result-row">
          <text class="label">用水量</text>
          <text class="sub-amount">{{ getWaterUsage() }} 吨</text>
        </view>
        <view class="result-row">
          <text class="label">水费</text>
          <text class="amount">¥{{ calculateWater() }}</text>
        </view>
      </view>

      <!-- 电费计算卡片 -->
      <view class="card">
        <text class="card-title">电费计算</text>
        <view class="input-group">
          <text class="label">电费单价</text>
          <text class="price">¥{{ state.electricityPrice || 0 }}</text>
        </view>
        <view class="input-group">
          <text class="label">本月读数</text>
          <input
            class="input"
            type="digit"
            :value="state.currentElectricity || ''"
            @input="(e) => updateCurrentElectricity(e.detail.value)"
            placeholder="输入本月读数"
          />
        </view>
        <view class="input-group">
          <text class="label">上月读数</text>
          <text class="last-reading highlight">{{ state.lastElectricity }}</text>
        </view>
        <view class="result-row">
          <text class="label">用电量</text>
          <text class="sub-amount">{{ getElectricityUsage() }} 度</text>
        </view>
        <view class="result-row">
          <text class="label">电费</text>
          <text class="amount">¥{{ calculateElectricity() }}</text>
        </view>
      </view>

      <!-- 燃气费计算卡片 -->
      <view class="card" v-if="state.roomInfo.enableGas">
        <text class="card-title">燃气费计算</text>
        <view class="input-group">
          <text class="label">燃气费单价</text>
          <text class="price">¥{{ state.gasPrice || 0 }}</text>
        </view>
        <view class="input-group">
          <text class="label">本月读数</text>
          <input
            class="input"
            type="digit"
            :value="state.currentGas || ''"
            @input="(e) => updateCurrentGas(e.detail.value)"
            placeholder="输入本月读数"
          />
        </view>
        <view class="input-group">
          <text class="label">上月读数</text>
          <text class="last-reading highlight">{{ state.lastGas }}</text>
        </view>
        <view class="result-row">
          <text class="label">用气量</text>
          <text class="sub-amount">{{ getGasUsage() }} 立方</text>
        </view>
        <view class="result-row">
          <text class="label">燃气费</text>
          <text class="amount">¥{{ calculateGas() }}</text>
        </view>
      </view>

      <!-- 总计卡片 -->
      <view class="total-card">
        <view class="total-content">
          <text class="total-label">本月总计</text>
          <text class="total-amount">¥{{ calculateTotal() }}</text>
        </view>
        <text class="total-hint"
          >包含房租、水费、电费{{
            state.roomInfo.enableGas ? "和燃气费" : ""
          }}</text
        >
      </view>

      <button class="save-btn" hover-class="btn-hover" @click="finishAndSave">
        保存账单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { calculatorState } from "@/store/store";

const state = calculatorState();
const loading = ref(false);

// 在页面加载时清空所有当月读数输入框
onMounted(() => {
  // 清空所有当月读数，等待用户输入
  state.currentWater = "";
  state.currentElectricity = "";
  if (state.roomInfo.enableGas) {
    state.currentGas = "";
  }
});

const calculateWater = () => {
  const usage = Number(state.currentWater || 0) - Number(state.lastWater || 0);
  const price = Number(state.waterPrice || 0);
  return (usage * price).toFixed(2);
};

const calculateElectricity = () => {
  const usage =
    Number(state.currentElectricity || 0) - Number(state.lastElectricity || 0);
  const price = Number(state.electricityPrice || 0);
  return (usage * price).toFixed(2);
};

const calculateGas = () => {
  const usage = Number(state.currentGas || 0) - Number(state.lastGas || 0);
  const price = Number(state.gasPrice || 0);
  return (usage * price).toFixed(2);
};

const calculateTotal = () => {
  const rent = Number(state.roomInfo.rent || 0);
  const water = Number(calculateWater());
  const electricity = Number(calculateElectricity());
  const gas = Number(calculateGas());

  // 计算基础费用总和
  const basicFeesTotal =
    state.roomInfo.basicFees?.reduce((sum, fee) => {
      return sum + Number(fee.amount || 0);
    }, 0) || 0;

  return (rent + water + electricity + gas + basicFeesTotal).toFixed(2);
};

const finishAndSave = () => {
  // 检查水电用量是否已填写
  if (!state.currentWater) {
    uni.showToast({
      title: "请输入本月水表读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  if (!state.currentElectricity) {
    uni.showToast({
      title: "请输入本月电表读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  if (!state.currentGas && state.roomInfo.enableGas) {
    uni.showToast({
      title: "请输入本月燃气表读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 检查水电用量是否小于上月读数
  if (Number(state.currentWater) < Number(state.lastWater)) {
    uni.showToast({
      title: "本月水表读数不能小于上月读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  if (Number(state.currentElectricity) < Number(state.lastElectricity)) {
    uni.showToast({
      title: "本月电表读数不能小于上月读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  if (state.roomInfo.enableGas && Number(state.currentGas) < Number(state.lastGas)) {
    uni.showToast({
      title: "本月燃气表读数不能小于上月读数",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 如果所有检查都通过，显示确认对话框
  uni.showModal({
    title: "确认保存",
    content: "请确认所有数据输入正确",
    success: function (res) {
      if (res.confirm) {
        saveData();
        uni.redirectTo({
          url: "/pages/rent-records/rent-records",
        });
      }
    },
  });
};

const getLastWaterPrice = () => {
  return state.roomInfo.waterPrice
    ? `上次单价: ${state.roomInfo.waterPrice}`
    : "输入单价";
};

const getLastElectricityPrice = () => {
  return state.roomInfo.electricityPrice
    ? `上次单价: ${state.roomInfo.electricityPrice}`
    : "输入单价";
};

const getLastGasPrice = () => {
  return state.roomInfo.gasPrice
    ? `上次单价: ${state.roomInfo.gasPrice}`
    : "输入单价";
};

const getWaterUsage = () => {
  return (
    Number(state.currentWater || 0) - Number(state.lastWater || 0)
  ).toFixed(1);
};

const getElectricityUsage = () => {
  return (
    Number(state.currentElectricity || 0) - Number(state.lastElectricity || 0)
  ).toFixed(1);
};

const getGasUsage = () => {
  return (Number(state.currentGas || 0) - Number(state.lastGas || 0)).toFixed(
    1
  );
};

const updateWaterPrice = (value: string) => {
  if (value === "" || value === "0") {
    state.waterPrice = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.waterPrice = Number(value);
};

const updateCurrentWater = (value: string) => {
  if (value === "" || value === "0") {
    state.currentWater = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.currentWater = Number(value);
};

const updateElectricityPrice = (value: string) => {
  if (value === "" || value === "0") {
    state.electricityPrice = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.electricityPrice = Number(value);
};

const updateCurrentElectricity = (value: string) => {
  if (value === "" || value === "0") {
    state.currentElectricity = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.currentElectricity = Number(value);
};

const updateGasPrice = (value: string) => {
  if (value === "" || value === "0") {
    state.gasPrice = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.gasPrice = Number(value);
};

const updateCurrentGas = (value: string) => {
  if (value === "" || value === "0") {
    state.currentGas = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.currentGas = Number(value);
};

// 添加基础费用项
const addBasicFee = () => {
  if (!state.roomInfo.basicFees) {
    state.roomInfo.basicFees = [];
  }
  state.roomInfo.basicFees.push({
    name: "",
    amount: undefined,
  });
};

// 删除基础费用项
const deleteBasicFee = (index: number) => {
  state.roomInfo.basicFees.splice(index, 1);
  delete slideWidths.value[index];
};

// 计算基础费用总计
const calculateBasicTotal = () => {
  const rent = Number(state.roomInfo.rent || 0);
  const basicFeesTotal =
    state.roomInfo.basicFees?.reduce((sum, fee) => {
      return sum + Number(fee.amount || 0);
    }, 0) || 0;
  return (rent + basicFeesTotal).toFixed(2);
};

// 左滑删除相关
const slideWidths = ref<{ [key: number]: number }>({});
let startX = 0;
const deleteWidth = 80;

const touchStart = (event: TouchEvent, index: number) => {
  startX = event.touches[0].clientX;
  slideWidths.value[index] = slideWidths.value[index] || 0;
};

const touchMove = (event: TouchEvent, index: number) => {
  const moveX = event.touches[0].clientX;
  const distance = moveX - startX;

  if (distance < 0) {
    slideWidths.value[index] = Math.max(distance, -deleteWidth);
  } else if (distance > 0 && slideWidths.value[index] < 0) {
    slideWidths.value[index] = Math.min(0, slideWidths.value[index] + distance);
    startX = moveX;
  }
};

const touchEnd = (index: number) => {
  if (slideWidths.value[index] < -deleteWidth / 2) {
    slideWidths.value[index] = -deleteWidth;
  } else {
    slideWidths.value[index] = 0;
  }
};

const updateFeeAmount = (index: number, value: string) => {
  if (!state.roomInfo.basicFees) return;

  if (value === "" || value === "0") {
    state.roomInfo.basicFees[index].amount = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.roomInfo.basicFees[index].amount = Number(value);
};

const updateRent = (value: string) => {
  if (value === "" || value === "0") {
    state.roomInfo.rent = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.roomInfo.rent = Number(value);
};

const goToRentRecords = () => {
  uni.navigateTo({
    url: "/pages/rent-records/rent-records",
  });
};

// 添加加载状态处理
const saveData = async () => {
  loading.value = true;
  try {
    await state.saveData();
    uni.showToast({ title: "保存成功" });
  } catch (error) {
    uni.showToast({
      title: error.message || "保存失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20px 16px;
  padding-bottom: 100px;
}

.content {
  padding: 0;
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 28px;
  margin-bottom: 0;
}

.input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.label {
  font-size: 17px;
  color: var(--text-color);
  opacity: 0.9;
}

.input {
  width: 150px;
  text-align: right;
  padding: 8px 12px;
  font-size: 17px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.amount {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.total-card {
  background: var(--primary-color);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.total-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.total-label {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
}

.total-amount {
  font-size: 34px;
  font-weight: 600;
  color: #ffffff;
}

.total-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.save-btn {
  width: 100%;
  background: var(--primary-color);
  color: #fff;
  padding: 16px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.btn-hover {
  opacity: 0.8;
}

.last-reading {
  font-size: 17px;
  padding: 8px 12px;
}

.last-reading.highlight {
  color: var(--text-color);
  font-weight: 500;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
}

.sub-amount {
  font-size: 17px;
  color: var(--text-color);
  font-weight: 500;
}

.back-btn,
.back-icon,
.back-text {
  display: none;
}

.room-header {
  margin-bottom: 20px;
  text-align: center;
}

.room-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  height: 28px;
}

.add-fee-btn {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-fee-icon {
  color: #ffffff;
  font-size: 20px;
  font-weight: 300;
  line-height: 20px;
}

.fee-group {
  margin-bottom: 12px;
}

.fee-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.fee-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #fff;
  transform: translateX(0);
  transition: transform 0.3s ease;
  z-index: 2;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
}

.delete-btn {
  position: absolute;
  top: 1px;
  right: 1px;
  bottom: 1px;
  width: 80px;
  background: var(--danger-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  z-index: 1;
  border-radius: 0 8px 8px 0;
}

.fee-name-input {
  flex: 1;
  text-align: left;
  padding: 8px 12px;
  font-size: 17px;
  color: var(--text-color);
  background: #f5f5f7;
  border: none;
  border-radius: 8px;
}

.fee-amount-input {
  width: 120px;
  text-align: right;
  padding: 8px 12px;
  font-size: 17px;
  color: var(--text-color);
  background: #f5f5f7;
  border: none;
  border-radius: 8px;
}

.swipe-hint {
  display: none;
}

.hint-text {
  font-size: 14px;
  color: var(--secondary-text);
  line-height: 28px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 28px;
}

/* 添加房租记录相关样式 */
.rent-records,
.rent-record-item,
.rent-record-left,
.rent-record-date,
.rent-record-amount,
.rent-record-status,
.rent-record-status.paid,
.rent-record-status.unpaid,
.no-records,
.no-records-text {
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
}

.record-btn {
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  font-size: 14px;
  color: var(--primary-color);
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-fee-btn {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-fee-icon {
  color: #ffffff;
  font-size: 20px;
  font-weight: 300;
  line-height: 20px;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.price {
  font-size: 17px;
  color: var(--text-color);
  font-weight: 500;
}
</style>
