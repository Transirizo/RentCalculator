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
  gasUsage?: number;
  gasPrice?: number;
  gasFee?: number;
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
  gasPrice?: number;
  gasReading?: number;
  gasUsage?: number;
  gasFee?: number;
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
  gasPrice?: number;
  basicFees?: BasicFee[];
  rentRecords?: RentRecord[];
  record: RoomRecord[];
  calculateItem?: CalculateItem[];
  lastReadings: {
    water: number;
    electricity: number;
    gas?: number;
  };
  enableGas: boolean;
};

export const calculatorState = defineStore("calculator", {
  state: () => {
    return {
      roomArray: [] as RoomType[],
      roomInfo: {} as RoomType,
      roomId: "",
      waterPrice: 0,
      electricityPrice: 0,
      currentWater: "",
      currentElectricity: "",
      lastWater: 0,
      lastElectricity: 0,
      cachedRooms: {} as Record<string, RoomType>,
      gasPrice: 0,
      currentGas: "",
      lastGas: 0,
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
        gasPrice: 0,
        lastReadings: {
          water: 0,
          electricity: 0,
          gas: 0,
        },
        enableGas: false,
        record: [],
      };

      this.roomArray.push(newRoom);
      this.selectRoom(roomId); // 选中新创建的房间
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));
      uni.navigateTo({
        url: "/pages/room-setup/room-setup",
      });
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
        // 设置单价
        this.waterPrice = room.waterPrice || 0;
        this.electricityPrice = room.electricityPrice || 0;
        this.gasPrice = room.gasPrice || 0;

        // 设置上月读数（优先使用最近一次的记录，如果没有则使用初始读数）
        if (room.record && room.record.length > 0) {
          // 使用最近一次记录的读数
          this.lastWater = room.record[0].waterReading;
          this.lastElectricity = room.record[0].electricityReading;
          this.lastGas =
            room.record[0].gasReading || room.lastReadings.gas || 0;
        } else {
          // 使用初始设置的读数
          this.lastWater = room.lastReadings.water || 0;
          this.lastElectricity = room.lastReadings.electricity || 0;
          this.lastGas = room.lastReadings.gas || 0;
        }

        // 获取当前页面路径
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const isCalculatorPage = currentPage.route?.includes("calculator");

        // 只在计算页面时才设置 currentGas
        if (isCalculatorPage) {
          // 在计算页面时才根据启用状态设置 currentGas
          if (room.enableGas) {
            this.currentGas = String(this.lastGas);
          } else {
            this.currentGas = ""; // 只在计算页面清空当前输入
          }
        } else {
          // 在其他页面(如设置页面)保持 currentGas 为上次读数
          this.currentGas = String(this.lastGas);
        }
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
      // 先检查缓存
      if (this.cachedRooms[this.roomId]) {
        this.roomInfo = this.cachedRooms[this.roomId];
        return;
      }

      try {
        const res = await uni.getStorageSync(this.roomId);
        if (res) {
          this.roomInfo = typeof res === "string" ? JSON.parse(res) : res;
        }
      } catch (err) {
        console.error("解析房间信息失败:", err);
      }

      // 更新缓存
      this.cachedRooms[this.roomId] = this.roomInfo;
    },

    saveData() {
      // 验证必填字段
      if (this.currentWater === "" || this.currentElectricity === "") {
        throw new Error("请填写水电表读数");
      }

      if (!this.waterPrice || !this.electricityPrice) {
        throw new Error("请设置水电费单价");
      }

      // 只在启用燃气费时才验证燃气数据
      if (this.roomInfo.enableGas) {
        if (this.currentGas === "") {
          throw new Error("请填写燃气表读数");
        }
        if (!this.gasPrice) {
          throw new Error("请设置燃气费单价");
        }
      }

      // 验证数值合理性
      if (Number(this.currentWater) < this.lastWater) {
        throw new Error(
          `本月水表读数(${this.currentWater})不能小于上月读数(${this.lastWater})`
        );
      }

      if (Number(this.currentElectricity) < this.lastElectricity) {
        throw new Error(
          `本月电表读数(${this.currentElectricity})不能小于上月读数(${this.lastElectricity})`
        );
      }

      // 只在启用燃气费时验证燃气表读数
      if (
        this.roomInfo.enableGas &&
        this.currentGas !== "" &&
        Number(this.currentGas) < this.lastGas
      ) {
        throw new Error(
          `本月燃气表读数(${this.currentGas})不能小于上月读数(${this.lastGas})`
        );
      }

      if (!this.roomInfo.record) {
        this.roomInfo.record = [];
      }

      // 使用微信的时间API
      const currentTime = uni.getSystemInfoSync().system.includes("iOS")
        ? new Date()
            .toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, "-")
        : new Date().toLocaleDateString("zh-CN").replace(/\//g, "-");

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

      // 只在启用燃气费时计算燃气费用
      let gasUsage = 0;
      let gasFee = 0;
      if (this.roomInfo.enableGas) {
        gasUsage = Number(this.currentGas) - Number(this.lastGas);
        gasFee = gasUsage * Number(this.gasPrice);
      }

      const totalPrice =
        Number(this.roomInfo.rent) +
        waterFee +
        electricityFee +
        gasFee +
        basicFeesTotal;

      // 保存账单记录时也要区分是否启用燃气费
      const record: RoomRecord = {
        time: currentTime,
        water: waterUsage,
        electricity: electricityUsage,
        totalPrice: totalPrice,
        waterPrice: Number(this.waterPrice),
        electricityPrice: Number(this.electricityPrice),
        waterReading: Number(this.currentWater),
        electricityReading: Number(this.currentElectricity),
      };

      // 总是添加燃气相关数据,但未启用时使用上次读数
      Object.assign(record, {
        gasPrice: Number(this.gasPrice),
        gasReading: this.roomInfo.enableGas
          ? Number(this.currentGas)
          : this.lastGas,
        gasUsage: this.roomInfo.enableGas ? gasUsage : 0,
        gasFee: this.roomInfo.enableGas ? gasFee : 0,
      });

      this.roomInfo.record.unshift(record);

      // 更新 lastReadings
      const lastReadings: { water: number; electricity: number; gas?: number } =
        {
          water: Number(this.currentWater),
          electricity: Number(this.currentElectricity),
          gas: this.roomInfo.enableGas ? Number(this.currentGas) : this.lastGas, // 未启用时保持上次读数
        };

      this.roomInfo.lastReadings = lastReadings;

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
        gasUsage: gasUsage,
        gasPrice: Number(this.gasPrice),
        gasFee: gasFee,
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
      this.roomInfo.gasPrice = Number(this.gasPrice);

      // 更新数组中的房间信息
      const index = this.roomArray.findIndex(
        (room) => room.roomId === this.roomInfo.roomId
      );
      if (index !== -1) {
        this.roomArray[index] = this.roomInfo;
      }

      // 保存到本地存储
      uni.setStorageSync("rooms", JSON.stringify(this.roomArray));

      // 更新当前读数为新的上月读数
      this.lastWater = Number(this.currentWater);
      this.lastElectricity = Number(this.currentElectricity);
      this.lastGas = Number(this.currentGas);
      // 清空当前读数
      this.currentWater = "";
      this.currentElectricity = "";
      this.currentGas = "";
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
