<template>
  <view class="content">
    <button class="addRoom" @click="addRoom">+</button>
    <div style="margin-top: 50px"></div>
    <div class="roomItem" v-for="(room, index) in state.roomArray">
      <input
        class="inputRoomName"
        :value="room.roomName"
        @input="(e) => changeRoomName(room.roomId, e)"
      />
      <div class="calculateRoom" @click="calculateRoom(room.roomId)">计算</div>
      <div class="roomRecord" @click="deleteRoom(room.roomId)">删除</div>
    </div>
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
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.inputRoomName {
  border-bottom: 1px solid;
}
.roomItem {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100vw;
  justify-content: space-evenly;
  margin: 10px 0;
}
.calculateRoom {
  border: 1px solid;
  background-color: blanchedalmond;
  padding: 10px;
  border-radius: 10px;
}
.addRoom {
  position: absolute;
  top: 10px;
  right: 10px;
}

.roomRecord {
  border: 1px solid;
  background-color: rgb(185, 203, 237);
  padding: 10px;
  border-radius: 10px;
}
</style>
