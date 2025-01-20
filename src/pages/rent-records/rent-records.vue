<template>
  <view class="container">
    <view class="content">
      <!-- 房间标题 -->
      <view class="room-header">
        <text class="room-title">{{
          state.roomInfo?.roomName || "未命名房间"
        }}</text>
      </view>

      <!-- 房租记录列表 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">房租记录</text>
        </view>

        <view class="rent-records" v-if="state.roomInfo.rentRecords?.length">
          <view
            v-for="(record, index) in state.roomInfo.rentRecords"
            :key="index"
            class="rent-record-item"
          >
            <view class="rent-record-wrapper">
              <view
                class="rent-record-content"
                @touchstart="handleTouchStart($event, index)"
                @touchmove="handleTouchMove($event, index)"
                @touchend="handleTouchEnd(index)"
                :style="{
                  transform: `translateX(${slideWidths[index] || 0}px)`,
                }"
              >
                <view class="rent-record-left">
                  <text class="rent-record-date">{{ record.date }}</text>
                  <view class="rent-record-details">
                    <text class="detail-item"
                      >房租：¥{{
                        record.amount - getBasicFeesTotal(record.basicFees)
                      }}</text
                    >
                    <template v-if="record.basicFees?.length">
                      <text
                        class="detail-item"
                        v-for="(fee, i) in record.basicFees"
                        :key="i"
                      >
                        {{ fee.name }}：¥{{ fee.amount }}
                      </text>
                    </template>
                    <text class="detail-item"
                      >水费：¥{{ record.waterFee?.toFixed(2) }} ({{
                        record.waterUsage
                      }}吨)</text
                    >
                    <text class="detail-item"
                      >电费：¥{{ record.electricityFee?.toFixed(2) }} ({{
                        record.electricityUsage
                      }}度)</text
                    >
                    <text class="detail-item" v-if="record.gasFee && record.gasFee > 0"
                      >燃气费：¥{{ record.gasFee?.toFixed(2) }} ({{
                        record.gasUsage
                      }}立方)</text
                    >
                    <text class="detail-total"
                      >总计：¥{{ record.totalAmount }}</text
                    >
                  </view>
                </view>
                <view
                  :class="[
                    'rent-record-status',
                    record.isPaid ? 'paid' : 'unpaid',
                  ]"
                  @tap.stop="togglePayStatus(index)"
                >
                  {{ record.isPaid ? "已缴费" : "未缴费" }}
                </view>
              </view>
              <view class="delete-btn" @tap.stop="deleteRecord(index)"
                >删除</view
              >
            </view>
          </view>
        </view>

        <!-- 无记录提示 -->
        <view v-else class="no-records">
          <text class="no-records-text">暂无房租记录</text>
          <text class="no-records-hint">保存账单后自动生成记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { calculatorState } from "@/store/store";

const state = calculatorState();

// 左滑删除相关
const slideWidths = ref<{ [key: number]: number }>({});
let startX = 0;
const deleteWidth = 80;

const handleTouchStart = (event: any, index: number) => {
  startX = event.touches[0].clientX;
  slideWidths.value[index] = slideWidths.value[index] || 0;
};

const handleTouchMove = (event: any, index: number) => {
  const moveX = event.touches[0].clientX;
  const distance = moveX - startX;

  if (distance < 0) {
    slideWidths.value[index] = Math.max(distance, -deleteWidth);
  } else if (distance > 0 && slideWidths.value[index] < 0) {
    slideWidths.value[index] = Math.min(0, slideWidths.value[index] + distance);
    startX = moveX;
  }
};

const handleTouchEnd = (index: number) => {
  if (slideWidths.value[index] < -deleteWidth / 2) {
    slideWidths.value[index] = -deleteWidth;
  } else {
    slideWidths.value[index] = 0;
  }
};

// 删除记录
const deleteRecord = (index: number) => {
  uni.showModal({
    title: "确认删除",
    content: "删除后无法恢复，是否继续？",
    success: function (res) {
      if (res.confirm) {
        if (!state.roomInfo.rentRecords) return;
        state.roomInfo.rentRecords.splice(index, 1);
        state.saveRentRecords();
        slideWidths.value[index] = 0;

        uni.showToast({
          title: "删除成功",
          icon: "success",
          duration: 2000,
        });
      } else {
        slideWidths.value[index] = 0;
      }
    },
  });
};

// 只保留切换缴费状态的功能
const togglePayStatus = (index: number) => {
  if (!state.roomInfo.rentRecords) return;
  state.roomInfo.rentRecords[index].isPaid =
    !state.roomInfo.rentRecords[index].isPaid;
  state.saveRentRecords();

  uni.showToast({
    title: state.roomInfo.rentRecords[index].isPaid
      ? "已标记为已缴费"
      : "已标记为未缴费",
    icon: "none",
    duration: 2000,
  });
};

// 计算基础费用总和
const getBasicFeesTotal = (
  basicFees?: Array<{ name: string; amount: number }>
) => {
  return basicFees?.reduce((sum, fee) => sum + Number(fee.amount || 0), 0) || 0;
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20px 16px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.add-record-btn,
.add-record-icon {
  display: none;
}

.rent-records {
  margin-top: 8px;
}

.rent-record-item {
  margin-bottom: 12px;
}

.rent-record-item:last-child {
  margin-bottom: 0;
}

.rent-record-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
  pointer-events: auto;
}

.rent-record-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #fff;
  transform: translateX(0);
  transition: transform 0.3s ease;
  z-index: 2;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  pointer-events: auto;
}

.rent-record-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rent-record-date {
  font-size: 17px;
  color: var(--text-color);
}

.rent-record-amount {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.rent-record-status {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 14px;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.rent-record-status.paid {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.rent-record-status.unpaid {
  background: rgba(255, 69, 58, 0.1);
  color: #ff453a;
}

.no-records {
  padding: 32px 0;
  text-align: center;
}

.no-records-text {
  font-size: 15px;
  color: var(--secondary-text);
  margin-bottom: 8px;
  display: block;
}

.no-records-hint {
  font-size: 14px;
  color: var(--secondary-text);
  opacity: 0.8;
}

.btn-hover {
  opacity: 0.8;
}

.rent-record-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.detail-item {
  font-size: 14px;
  color: var(--secondary-text);
}

.detail-total {
  font-size: 15px;
  color: var(--text-color);
  font-weight: 500;
  margin-top: 4px;
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
  pointer-events: auto;
}
</style>
