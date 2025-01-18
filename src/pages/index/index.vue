<template>
  <view class="container">
    <view class="room-list">
      <view 
        class="room-item" 
        v-for="(room, index) in state.roomArray"
        :key="room.roomId"
      >
        <view class="room-content">
          <input
            class="room-name"
            :value="room.roomName"
            placeholder="输入房间名称"
            placeholder-style="color: #86868b"
            @input="(e) => changeRoomName(room.roomId, e)"
          />
          <view class="room-actions">
            <button 
              class="action-btn calculate" 
              hover-class="btn-hover"
              @click="calculateRoom(room.roomId)"
            >
              计算费用
            </button>
            <button 
              class="action-btn rent-record" 
              hover-class="btn-hover"
              @click="goToRentRecords(room.roomId)"
            >
              房租记录
            </button>
            <button 
              class="action-btn delete" 
              hover-class="btn-hover"
              @click="deleteRoom(room.roomId)"
            >
              删除
            </button>
          </view>
        </view>
      </view>
    </view>

    <view class="empty" v-if="!state.roomArray.length">
      <text class="empty-title">添加房间</text>
      <text class="empty-text">点击右下角添加按钮创建新房间</text>
    </view>

    <button class="add-btn" hover-class="btn-hover" @click="addRoom">
      <text class="add-icon">+</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { calculatorState } from '@/store/store'

const state = calculatorState()

const calculateRoom = (roomId: string) => {
  state.selectRoom(roomId)
  uni.navigateTo({
    url: `/pages/calculator/calculator?roomId=${roomId}`,
  })
}

onMounted(() => {
  state.getRooms()
})

const addRoom = () => {
  state.addRoom()
}

const changeRoomName = (roomId: string, event: Event) => {
  state.changeRoomName(roomId, event)
}

const deleteRoom = (roomId: string) => {
  uni.showModal({
    title: '别删错了！',
    content: '确认房间正确，无法恢复！',
    success: function (res) {
      if (res.confirm) {
        state.deleteRoom(roomId)
      } else if (res.cancel) {
      }
    },
  })
}

const goToRentRecords = (roomId: string) => {
  state.selectRoom(roomId)
  uni.navigateTo({
    url: '/pages/rent-records/rent-records'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20px 16px;
}

.room-list {
  padding-bottom: 20px;
}

.room-item {
  margin-bottom: 16px;
  border-radius: 16px;
  background: var(--card-bg);
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.room-content {
  padding: 20px;
}

.room-name {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(210, 210, 215, 0.5);
  background: transparent;
}

.room-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  transition: opacity 0.3s ease;
}

.calculate {
  background: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
}

.rent-record {
  background: rgba(0, 122, 255, 0.1);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.delete {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
}

.add-btn {
  position: fixed;
  right: 16px;
  bottom: 32px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
  z-index: 10;
}

.add-icon {
  color: #ffffff;
  font-size: 32px;
  font-weight: 300;
  line-height: 32px;
}

.btn-hover {
  opacity: 0.8;
}

.empty {
  padding-top: 25vh;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.empty-text {
  font-size: 17px;
  color: var(--secondary-text);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 100px;
}

.record-btn {
  color: var(--primary-color);
  background: rgba(0, 122, 255, 0.1);
}

.calculate-btn {
  color: #fff;
  background: var(--primary-color);
}

.action-buttons,
.action-btn.record-btn,
.action-btn.calculate-btn {
  display: none;
}
</style>
