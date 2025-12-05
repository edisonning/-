import { User, Route, Reservation, ReservationStatus, Passenger, Notification, StationChangeRequest } from '../types';

export const CURRENT_USER: User = {
  id: 'E001',
  name: '张三',
  isCaptain: true, // Change to false to test regular employee
  orgName: '研发部',
  idCard: '110101199001011234',
  phone: '13800138000',
  address: '北京市海淀区中关村软件园',
  defaultOnStation: '回龙观东大街',
  defaultOffStation: '软件园二期',
  avatarUrl: 'https://picsum.photos/200/200'
};

export const MOCK_ROUTES: Route[] = [
  {
    id: 'R001',
    name: '早班1号线',
    startTime: '08:00',
    endTime: '09:00',
    startStation: '回龙观东大街',
    endStation: '软件园二期',
    stations: [
      { id: 'S1', name: '回龙观东大街', time: '08:00', passed: true, lat: 40.076, lng: 116.368 },
      { id: 'S2', name: '龙泽', time: '08:15', passed: true, lat: 40.078, lng: 116.328 },
      { id: 'S3', name: '西二旗', time: '08:30', passed: false, lat: 40.057, lng: 116.312 },
      { id: 'S4', name: '软件园二期', time: '09:00', passed: false, lat: 40.046, lng: 116.295 }
    ]
  },
  {
    id: 'R002',
    name: '晚班1号线',
    startTime: '18:00',
    endTime: '19:00',
    startStation: '软件园二期',
    endStation: '回龙观东大街',
    stations: [
      { id: 'S4', name: '软件园二期', time: '18:00', passed: false, lat: 40.046, lng: 116.295 },
      { id: 'S3', name: '西二旗', time: '18:15', passed: false, lat: 40.057, lng: 116.312 },
      { id: 'S1', name: '回龙观东大街', time: '19:00', passed: false, lat: 40.076, lng: 116.368 }
    ]
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES001',
    date: new Date().toISOString().split('T')[0], // Today
    routeId: 'R001',
    routeName: '早班1号线',
    startTime: '08:00',
    startStation: '回龙观东大街',
    endStation: '软件园二期',
    status: ReservationStatus.PENDING,
    plateNumber: '京A·88888'
  },
  {
    id: 'RES002',
    date: '2023-10-25',
    routeId: 'R001',
    routeName: '早班1号线',
    startTime: '08:00',
    startStation: '回龙观东大街',
    endStation: '软件园二期',
    status: ReservationStatus.COMPLETED,
    plateNumber: '京A·88888'
  },
  {
    id: 'RES003',
    date: '2023-10-26',
    routeId: 'R002',
    routeName: '晚班1号线',
    startTime: '18:00',
    startStation: '软件园二期',
    endStation: '回龙观东大街',
    status: ReservationStatus.CANCELLED
  },
  {
    id: 'RES004',
    date: '2023-10-28',
    routeId: 'R001',
    routeName: '早班1号线',
    startTime: '08:00',
    startStation: '回龙观东大街',
    endStation: '软件园二期',
    status: ReservationStatus.SCHEDULING
  }
];

export const MOCK_PASSENGERS: Passenger[] = [
  { id: 'P1', name: '李四', onStation: '回龙观东大街', offStation: '西二旗', boarded: true },
  { id: 'P2', name: '王五', onStation: '龙泽', offStation: '软件园二期', boarded: true },
  { id: 'P3', name: '赵六', onStation: '西二旗', offStation: '软件园二期', boarded: false },
  { id: 'P4', name: '孙七', onStation: '西二旗', offStation: '软件园二期', boarded: false },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N1', title: '预约成功', content: '您预约的2023-10-27早班车已出票，车牌号京A·88888。', time: '10:30', read: false },
  { id: 'N2', title: '系统通知', content: '系统将于今晚进行维护。', time: '昨天', read: true }
];

export const MOCK_STATION_REQUESTS: StationChangeRequest[] = [
  { id: 'REQ1', oldOn: '回龙观', newOn: '西二旗', oldOff: '软件园', newOff: '软件园', status: 'Pending', date: '2023-10-27' },
  { id: 'REQ2', oldOn: '天通苑', newOn: '回龙观', oldOff: '软件园', newOff: '西二旗', status: 'Approved', date: '2023-10-20' }
];

export const AVAILABLE_STATIONS = [
  '回龙观东大街', '龙泽', '西二旗', '软件园二期', '霍营', '立水桥', '北苑'
];