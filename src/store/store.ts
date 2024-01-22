import { generateUUID } from '@/utils/uuid'
import { defineStore } from 'pinia'

type RoomType = {
  roomName: string
  roomId: string
}

type RoomInfoItemType = { type: string; before: number; singlePrice: number; now: number }

type RoomRecordType = { time: string; totalPrice: number; water: number; electricity: number }

type RoomInfoType = {
  calculateItem: RoomInfoItemType[]
  rent: number
  record: RoomRecordType[]
}

export const calculatorState = defineStore('state', {
  state: () => {
    return {
      roomArray: [] as RoomType[],
      roomInfo: {} as RoomInfoType,
      roomId: '',
    }
  },
  getters: {
    roomItems: (state) => {
      return state.roomInfo.calculateItem
    },
    getResultByIndex() {
      return (index: number) => {
        return (
          (this.roomItems[index].now - this.roomItems[index].before) *
          this.roomItems[index].singlePrice
        ).toFixed(2)
      }
    },
    getTotal(state) {
      let total = 0
      this.roomItems.forEach((item, index) => {
        total += Number(this.getResultByIndex(index))
      })
      total += Number(state.roomInfo.rent)
      return total.toFixed(2)
    },
  },
  actions: {
    addRoom() {
      const roomId = generateUUID()
      this.roomArray.push({ roomName: `${this.roomArray.length + 1}`, roomId: roomId })
      uni.setStorageSync('rooms', JSON.stringify(this.roomArray))
      uni.setStorageSync(
        roomId,
        JSON.stringify({
          calculateItem: [
            { type: 'electricity', before: 0, singlePrice: 0, now: 0 },
            { type: 'water', before: 0, singlePrice: 0, now: 0 },
          ],
          rent: 0,
          record: [],
        })
      )
    },

    deleteRoom(roomId: string) {
      this.roomArray = this.roomArray.filter((item) => item.roomId !== roomId)
      uni.setStorageSync('rooms', JSON.stringify(this.roomArray))
      uni.removeStorageSync(roomId)
    },

    selectRoom(roomId: string) {
      this.roomId = roomId
      this.getRoomInfo()
    },

    changeRoomName(roomId: string, event: Event) {
      const val = (event.target as HTMLInputElement).value
      this.roomArray.forEach((item) => {
        if (item.roomId === roomId) {
          item.roomName = val
        }
      })
      uni.setStorageSync('rooms', JSON.stringify(this.roomArray))
    },

    async getRooms() {
      const res = await uni.getStorageSync('rooms')
      console.log(res)
      if (!res) return
      const rooms = JSON.parse(res) as RoomType[]
      this.roomArray = rooms
    },

    async getRoomInfo() {
      try {
        const res = await uni.getStorageSync(this.roomId)
        const data = JSON.parse(res) as RoomInfoType
        this.roomInfo = data
      } catch (err) {
        console.log(err)
      }
    },

    async saveData() {
      try {
        let water = 0
        let electricity = 0
        const total = this.getTotal
        const month = new Date().getMonth() + 1
        console.log(month)
        this.roomItems.forEach((item) => {
          item.type === 'water' ? (water = Number(item.now)) : (electricity = Number(item.now))
          item.before = Number(item.now)
          item.now = 0
        })
        const record: RoomRecordType = {
          time: `${month}月`,
          totalPrice: total,
          water: water,
          electricity: electricity,
        }
        this.roomInfo.record.push(record)
        await uni.setStorageSync(this.roomId, JSON.stringify(this.roomInfo))
      } catch (err) {
        console.log(err)
      }
    },
  },
})
