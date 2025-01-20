<template>
  <view class="container">
    <view class="content">
      <view class="room-header">
        <text class="room-title">房间设置</text>
      </view>

      <!-- 基本信息卡片 -->
      <view class="card">
        <text class="card-title">基本信息</text>
        <view class="switch-group">
          <text class="label">启用燃气费</text>
          <switch
            :checked="state.roomInfo.enableGas"
            @change="(e) => toggleGas(e.detail.value)"
            color="var(--primary-color)"
          />
        </view>
        <view class="input-group">
          <text class="label">房间名称</text>
          <input
            class="input"
            type="text"
            v-model="state.roomInfo.roomName"
            placeholder="输入房间名称"
          />
        </view>
        <view class="input-group">
          <text class="label">房租金额</text>
          <input
            class="input"
            type="digit"
            :value="state.roomInfo.rent || ''"
            @input="(e) => updateRent(e.detail.value)"
            placeholder="输入房租金额"
          />
        </view>
      </view>

      <!-- 初始读数卡片 -->
      <view class="card">
        <text class="card-title">初始表读数</text>
        <view class="input-group">
          <text class="label">水表读数</text>
          <input
            class="input"
            type="digit"
            :value="state.lastWater || ''"
            @input="(e) => updateLastWater(e.detail.value)"
            placeholder="输入水表读数"
          />
        </view>
        <view class="input-group">
          <text class="label">电表读数</text>
          <input
            class="input"
            type="digit"
            :value="state.lastElectricity || ''"
            @input="(e) => updateLastElectricity(e.detail.value)"
            placeholder="输入电表读数"
          />
        </view>
        <template v-if="state.roomInfo.enableGas">
          <view class="input-group">
            <text class="label">燃气表读数</text>
            <input
              class="input"
              type="digit"
              :value="state.lastGas || ''"
              @input="(e) => updateLastGas(e.detail.value)"
              placeholder="输入燃气表读数"
            />
          </view>
        </template>
      </view>

      <!-- 费用单价卡片 -->
      <view class="card">
        <text class="card-title">费用单价</text>
        <view class="input-group">
          <text class="label">水费单价</text>
          <input
            class="input"
            type="digit"
            :value="state.waterPrice || ''"
            @input="(e) => updateWaterPrice(e.detail.value)"
            placeholder="输入水费单价"
          />
        </view>
        <view class="input-group">
          <text class="label">电费单价</text>
          <input
            class="input"
            type="digit"
            :value="state.electricityPrice || ''"
            @input="(e) => updateElectricityPrice(e.detail.value)"
            placeholder="输入电费单价"
          />
        </view>
        <template v-if="state.roomInfo.enableGas">
          <view class="input-group">
            <text class="label">燃气费单价</text>
            <input
              class="input"
              type="digit"
              :value="state.gasPrice || ''"
              @input="(e) => updateGasPrice(e.detail.value)"
              placeholder="输入燃气费单价"
            />
          </view>
        </template>
      </view>

      <button class="save-btn" hover-class="btn-hover" @click="saveAndReturn">
        完成设置
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { calculatorState } from "@/store/store";

const state = calculatorState();

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

const updateLastWater = (value: string) => {
  if (value === "" || value === "0") {
    state.lastWater = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.lastWater = Number(value);
};

const updateLastElectricity = (value: string) => {
  if (value === "" || value === "0") {
    state.lastElectricity = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.lastElectricity = Number(value);
};

const updateLastGas = (value: string) => {
  if (value === "" || value === "0") {
    state.lastGas = 0;
    return;
  }
  if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
    value = value.replace(/^0+/, "");
  }
  state.lastGas = Number(value);
  // 同时更新 lastReadings
  state.roomInfo.lastReadings.gas = Number(value);
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

const toggleGas = (value: boolean) => {
  state.roomInfo.enableGas = value;
};

const saveAndReturn = () => {
  // 保存房间信息
  const index = state.roomArray.findIndex(
    (room) => room.roomId === state.roomInfo.roomId
  );
  if (index !== -1) {
    // 更新房间信息中的表读数
    state.roomInfo.lastReadings = {
      water: state.lastWater,
      electricity: state.lastElectricity,
      gas: state.lastGas,
    };

    // 更新房间信息中的单价
    state.roomInfo.waterPrice = state.waterPrice;
    state.roomInfo.electricityPrice = state.electricityPrice;
    state.roomInfo.gasPrice = state.gasPrice;

    state.roomArray[index] = state.roomInfo;
  }
  uni.setStorageSync("rooms", JSON.stringify(state.roomArray));

  // 返回首页
  uni.reLaunch({
    url: "/pages/index/index",
  });
};
</script>

<style scoped>
/* 复用 calculator.vue 的样式 */
.container {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20px 16px;
}

.content {
  padding: 0;
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
  margin-bottom: 16px;
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

.switch-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

/* 调整基础信息卡片中开关的样式 */
.card-title + .switch-group {
  margin-top: -8px;
}
</style>
