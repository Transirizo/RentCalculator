import { generateUUID } from "@/utils/uuid";
import { defineStore } from "pinia";

// 房租记录类型
type RentRecord = {
  date: string;
  amount: number;
  isPaid: boolean;
  waterUsage?: number;
  waterPrice?: number;
  waterFee?: number;
  electricityUsage?: number;
  electricityPrice?: number;
  electricityFee?: number;
  totalAmount: number;
  basicFees?: BasicFee[];
};

// 基础费用类型
type BasicFee = {
  name: string;
  amount: number;
};

// 房间记录类型
type RoomRecord = {
  time: string;
  water: number;
  electricity: number;
  totalPrice: number;
  waterPrice: number;
  electricityPrice: number;
  waterReading: number;
  electricityReading: number;
};

// 计算项类型
type CalculateItem = {
  type: string;
  before: number;
  now: number;
  singlePrice: number;
};

// 房间类型
type RoomType = {
  roomId: string;
  roomName: string;
  rent: number;
  waterPrice?: number;
  electricityPrice?: number;
  basicFees?: BasicFee[];
  rentRecords?: RentRecord[];
  record: RoomRecord[];
  calculateItem?: CalculateItem[];
};

export const calculatorState = defineStore("calculator", {
  state: () => {
    return {
      roomArray: [] as RoomType[],
      roomInfo: {} as RoomType,
      roomId: "",
      waterPrice: 0,
      electricityPrice: 0,
      currentWater: 0,
      currentElectricity: 0,
      lastWater: 0,
      lastElectricity: 0,
    };
  },
  getters: {
    roomItems: (state) => {
      return state.roomInfo.calculateItem || [];
    },
    getResultByIndex() {
      return (index: number) => {
        if (!this.roomItems[index]) return "0.00";
        return (
          (this.roomItems[index].now - this.roomItems[index].before) *
          this.roomItems[index].singlePrice
        ).toFixed(2);
      };
    },
    getTotal(state) {
      let total = 0;
      if (this.roomItems) {
        this.roomItems.forEach((item, index) => {
          total += Number(this.getResultByIndex(index));
        });
      }
      total += Number(state.roomInfo.rent || 0);
      return total.toFixed(2);
    },
  },
  actions: {
    addRoom() {
      const roomId = generateUUID();
      const newRoom: RoomType = {
        roomName: `${this.roomArray.length + 1}`,
        roomId: roomId,
        rent: 0,
        waterPrice: 0,
        electricityPrice: 0,
        record: [], // 初始化空数组
      };

      this.roomArray.push(newRoom);
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
    },

    deleteRoom(roomId: string) {
      this.roomArray = this.roomArray.filter((item) => item.roomId !== roomId);
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
      uni.removeStorageSync(roomId);
    },

    selectRoom(roomId: string) {
      this.roomId = roomId;
      const room = this.roomArray.find((room) => room.roomId === roomId);
      if (room) {
        this.roomInfo = room;
        // 设置单价（使用保存的单价或默认值）
        this.waterPrice = room.waterPrice || 0;
        this.electricityPrice = room.electricityPrice || 0;

        // 设置上月读数（使用最近一次的读数）
        if (room.record && room.record.length > 0) {
          this.lastWater = room.record[0].waterReading || 0;
          this.lastElectricity = room.record[0].electricityReading || 0;
        } else {
          this.lastWater = 0;
          this.lastElectricity = 0;
        }

        // 清空当月读数，等待输入
        this.currentWater = 0;
        this.currentElectricity = 0;
      }
    },

    changeRoomName(roomId: string, event: Event) {
      const val = (event.target as HTMLInputElement).value;
      this.roomArray.forEach((item) => {
        if (item.roomId === roomId) {
          item.roomName = val;
        }
      });
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
    },

    async getRooms() {
      const res = await uni.getStorageSync("rooms");
      if (!res) return;
      try {
        // 添加错误处理
        this.roomArray = typeof res === "string" ? JSON.parse(res) : res;
      } catch (err) {
        console.error("解析房间数据失败:", err);
        this.roomArray = [];
      }
    },

    async getRoomInfo() {
      try {
        const res = await uni.getStorageSync(this.roomId);
        if (res) {
          this.roomInfo = typeof res === "string" ? JSON.parse(res) : res;
        }
      } catch (err) {
        console.error("解析房间信息失败:", err);
      }
    },

    saveData() {
      if (!this.roomInfo.record) {
        this.roomInfo.record = [];
      }

      const currentTime = new Date().toISOString().split("T")[0];
      const waterUsage = Number(this.currentWater) - Number(this.lastWater);
      const electricityUsage =
        Number(this.currentElectricity) - Number(this.lastElectricity);

      // 计算费用
      const waterFee = waterUsage * Number(this.waterPrice);
      const electricityFee = electricityUsage * Number(this.electricityPrice);
      const basicFeesTotal =
        this.roomInfo.basicFees?.reduce((sum, fee) => {
          return sum + Number(fee.amount || 0);
        }, 0) || 0;
      const totalPrice =
        Number(this.roomInfo.rent) + waterFee + electricityFee + basicFeesTotal;

      // 保存账单记录
      this.roomInfo.record.unshift({
        time: currentTime,
        water: waterUsage,
        electricity: electricityUsage,
        totalPrice: totalPrice,
        waterPrice: Number(this.waterPrice),
        electricityPrice: Number(this.electricityPrice),
        waterReading: Number(this.currentWater),
        electricityReading: Number(this.currentElectricity),
      });

      // 同时保存到房租记录
      if (!this.roomInfo.rentRecords) {
        this.roomInfo.rentRecords = [];
      }

      // 创建新的房租记录，包含基础费用
      const newRentRecord: RentRecord = {
        date: currentTime,
        amount: Number(this.roomInfo.rent || 0) + basicFeesTotal,
        isPaid: false,
        waterUsage: waterUsage,
        waterPrice: Number(this.waterPrice),
        waterFee: waterFee,
        electricityUsage: electricityUsage,
        electricityPrice: Number(this.electricityPrice),
        electricityFee: electricityFee,
        totalAmount: totalPrice,
        basicFees: this.roomInfo.basicFees
          ? [...this.roomInfo.basicFees]
          : undefined,
      };

      // 添加到房租记录列表
      this.roomInfo.rentRecords.unshift(newRentRecord);

      // 更新房间信息
      this.roomInfo.waterPrice = Number(this.waterPrice);
      this.roomInfo.electricityPrice = Number(this.electricityPrice);

      // 更新数组中的房间信息
      const index = this.roomArray.findIndex(
        (room) => room.roomId === this.roomInfo.roomId
      );
      if (index !== -1) {
        this.roomArray[index] = this.roomInfo;
      }

      // 保存到本地存储
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
    },

    saveRentRecords() {
      const index = this.roomArray.findIndex(
        (room) => room.roomId === this.roomInfo.roomId
      );
      if (index !== -1) {
        this.roomArray[index] = this.roomInfo;
      }

      // 保存到本地存储
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
    },
  },
});
