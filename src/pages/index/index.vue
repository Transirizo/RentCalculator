<template>
  <view class="container" @click="handlePageClick">
    <view class="search-wrapper">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          v-model="searchText"
          placeholder="搜索房间"
          @input="handleSearch"
        />
        <text v-if="searchText" class="clear-btn" @click.stop="clearSearch">×</text>
      </view>
    </view>

    <view class="room-list">
      <view class="hint-text" v-if="filteredRooms.length">
        · 长按房间可删除
      </view>
      <view
        class="room-item"
        v-for="(room, index) in filteredRooms"
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

    <view class="empty search-empty" v-if="state.roomArray.length && !filteredRooms.length">
      <view class="empty-icon">
        <view class="no-result-icon"></view>
      </view>
      <view class="empty-content">
        <text class="empty-title">未找到相关房间</text>
        <text class="empty-text">试试其他搜索词</text>
      </view>
    </view>

    <view class="empty add-empty" v-if="!state.roomArray.length">
      <view class="empty-icon">
        <text class="add-hint-icon">+</text>
      </view>
      <text class="empty-title">添加房间</text>
      <text class="empty-text">点击右下角添加按钮创建新房间</text>
    </view>

    <button class="add-btn" hover-class="btn-hover" @click="addRoom">
      <text class="add-icon">+</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, defineExpose } from "vue";
import { calculatorState } from "@/store/store";
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
const state = calculatorState();
const searchText = ref("");

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

// 分享给朋友
onShareAppMessage(() => {
  return {
    title: '房租计算器',
    path: '/pages/index/index',
    imageUrl: '/static/share.jpg'
  }
});

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: '房租计算器',
    query: '',
    imageUrl: '/static/share.jpg'
  }
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

const filteredRooms = computed(() => {
  if (!searchText.value) return state.roomArray;
  const keyword = searchText.value.toLowerCase();
  return state.roomArray.filter(room => 
    room.roomName.toLowerCase().includes(keyword)
  );
});

const handleSearch = () => {
  // 搜索逻辑已通过 computed 属性实现
};

const clearSearch = () => {
  searchText.value = "";
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 20px 16px;
  box-sizing: border-box;
}

.room-list {
  padding: 4px 0 20px;
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
  padding-top: 20vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-result-icon {
  width: 40px;
  height: 40px;
  border: 2px solid var(--secondary-text);
  border-radius: 8px;
  position: relative;
  opacity: 0.3;
}

.no-result-icon::before,
.no-result-icon::after {
  content: '';
  position: absolute;
  background: var(--secondary-text);
  left: 50%;
  top: 50%;
}

.no-result-icon::before {
  width: 24px;
  height: 2px;
  transform: translate(-50%, -50%);
}

.no-result-icon::after {
  width: 2px;
  height: 24px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-color);
}

.empty-text {
  font-size: 15px;
  color: var(--secondary-text);
  line-height: 1.4;
}

.add-hint-icon {
  font-size: 32px;
  color: var(--secondary-text);
  opacity: 0.3;
  font-weight: 300;
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
  font-size: 13px;
  color: var(--secondary-text);
  margin-bottom: 16px;
  padding: 0 4px;
}

.search-wrapper {
  margin-bottom: 16px;
  padding: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.search-bar {
  position: relative;
  margin: 0;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: var(--secondary-text);
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 36px 0 40px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  font-size: 15px;
  color: var(--text-color);
  box-sizing: border-box;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  color: var(--secondary-text);
  font-size: 18px;
  font-weight: 300;
  background: #f0f0f0;
  border-radius: 50%;
}

</style>
