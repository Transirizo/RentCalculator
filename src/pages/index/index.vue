<template>
  <view class="container" @click="handlePageClick">
    <view class="room-list">
      <view class="hint-text" v-if="state.roomArray.length">
        · 长按房间可删除
      </view>
      <view
        class="room-item"
        v-for="(room, index) in state.roomArray"
        :key="room.roomId"
        @longpress="() => handleLongPress(index)"
      >
        <view
          class="room-content"
          :class="{ 'shake-animation': editingIndex === index }"
        >
          <view
            v-if="editingIndex === index"
            class="delete-icon"
            @tap.stop="deleteRoom(room.roomId, index)"
          >
            <text class="delete-x">×</text>
          </view>
          <text class="room-name">{{ room.roomName || "未命名房间" }}</text>
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
              class="action-btn settings"
              hover-class="btn-hover"
              @click="goToRoomSettings(room.roomId)"
            >
              房间设置
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
import { onMounted, ref } from "vue";
import { calculatorState } from "@/store/store";

const state = calculatorState();

const editingIndex = ref<number | null>(null);

const handleLongPress = (index: number) => {
  editingIndex.value = index;
};

const handlePageClick = () => {
  if (editingIndex.value !== null) {
    editingIndex.value = null;
  }
};

const calculateRoom = (roomId: string) => {
  state.selectRoom(roomId);
  uni.navigateTo({
    url: `/pages/calculator/calculator?roomId=${roomId}`,
  });
};

onMounted(() => {
  state.getRooms();
});

const addRoom = () => {
  state.addRoom();
};

const deleteRoom = (roomId: string, index: number) => {
  uni.showModal({
    title: "别删错了！",
    content: "确认房间正确，无法恢复！",
    success: function (res) {
      if (res.confirm) {
        state.deleteRoom(roomId);
        editingIndex.value = null;
      } else if (res.cancel) {
        editingIndex.value = null;
      }
    },
    complete: function () {
      editingIndex.value = null;
    },
  });
};

const goToRentRecords = (roomId: string) => {
  state.selectRoom(roomId);
  uni.navigateTo({
    url: "/pages/rent-records/rent-records",
  });
};

const goToRoomSettings = (roomId: string) => {
  state.selectRoom(roomId);
  uni.navigateTo({
    url: "/pages/room-setup/room-setup",
  });
};
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
}

.room-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.room-content {
  padding: 20px;
  position: relative;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-radius: 16px;
}

.room-name {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(210, 210, 215, 0.5);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  transition: opacity 0.3s ease;
  height: 44px;
  line-height: 44px;
  padding: 0;
}

.calculate {
  background: var(--primary-color);
  color: #ffffff;
}

.rent-record {
  background: rgba(0, 122, 255, 0.1);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.settings {
  background: rgba(0, 122, 255, 0.1);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
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

.delete-icon {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 24px;
  height: 24px;
  background: var(--danger-color);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.delete-x {
  font-size: 18px;
  font-weight: 300;
  line-height: 18px;
  transform: scale(1.2);
  font-family: system-ui, -apple-system, BlinkMacSystemFont;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

.shake-animation {
  animation: shake 0.3s infinite;
}

.room-content {
  padding: 20px;
  position: relative;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-radius: 16px;
}

.hint-text {
  font-size: 14px;
  color: var(--secondary-text);
  margin-bottom: 12px;
  padding: 0 4px;
}
</style>
