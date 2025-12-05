export enum ReservationStatus {
  SUBMITTED = '已提交',
  CANCELLED = '已取消',
  REVOKED = '被取消',
  SCHEDULING = '排班中',
  NO_TICKET = '未出票',
  PENDING = '待出行',
  COMPLETED = '已完成',
  EXPIRED = '已失效'
}

export enum FeedbackType {
  RESERVATION = '预约问题',
  VEHICLE = '车辆问题',
  ROUTE = '线路问题',
  DRIVER = '司机服务',
  SYSTEM = '系统建议',
  OTHER = '其他'
}

export interface Station {
  id: string;
  name: string;
  time?: string; // Estimated arrival time
  passed: boolean;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  startStation: string;
  endStation: string;
  stations: Station[];
  plateNumber?: string; // Assigned only when scheduled
}

export interface Passenger {
  id: string;
  name: string;
  onStation: string;
  offStation: string;
  boarded: boolean;
}

export interface Reservation {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  startTime: string;
  startStation: string;
  endStation: string;
  status: ReservationStatus;
  plateNumber?: string;
}

export interface User {
  id: string;
  name: string;
  isCaptain: boolean;
  orgName: string;
  idCard: string;
  phone: string;
  address: string;
  defaultOnStation: string;
  defaultOffStation: string;
  avatarUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface StationChangeRequest {
  id: string;
  oldOn: string;
  newOn: string;
  oldOff: string;
  newOff: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}