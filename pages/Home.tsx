import React, { useState } from 'react';
import { MapPin, Clock, Users, Navigation, BusFront } from 'lucide-react';
import { User, Reservation, Route, ReservationStatus } from '../types';
import { MOCK_ROUTES, MOCK_PASSENGERS } from '../services/mockData';
import BaiduMap from '../components/BaiduMap';

interface HomeProps {
  user: User;
  todayReservation?: Reservation;
}

const Home: React.FC<HomeProps> = ({ user, todayReservation }) => {
  // Find route details if reservation exists
  const activeRoute = todayReservation 
    ? MOCK_ROUTES.find(r => r.id === todayReservation.routeId) 
    : null;

  const [passengers, setPassengers] = useState(MOCK_PASSENGERS);

  const toggleBoarding = (id: string) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, boarded: !p.boarded } : p));
  };

  if (!todayReservation || !activeRoute) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-gray-400">
        <BusFront size={64} className="mb-4 text-gray-300" />
        <p className="text-lg">今日暂无行程</p>
        <p className="text-sm mt-2">请前往“预约”页面进行订座</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-4 p-4">
      {/* Ticket Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{activeRoute.name}</h2>
            <div className="text-blue-100 text-xs mt-1 flex items-center gap-1">
              <Clock size={12} /> 发车: {activeRoute.startTime}
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {todayReservation.status}
          </div>
        </div>
        
        <div className="p-4 relative">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
               <div className="flex flex-col items-center mt-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-full bg-gray-200 min-h-[30px]"></div>
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
               </div>
               <div className="flex-1 space-y-6">
                  <div>
                    <div className="text-xs text-gray-500">上车</div>
                    <div className="font-semibold text-gray-900">{todayReservation.startStation}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">下车</div>
                    <div className="font-semibold text-gray-900">{todayReservation.endStation}</div>
                  </div>
               </div>
               <div className="text-right flex flex-col justify-center">
                  <div className="text-xs text-gray-500">车牌号</div>
                  <div className="font-bold text-xl text-blue-600">{todayReservation.plateNumber || '待定'}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Navigation size={18} className="text-blue-600" />
            车辆实时位置
          </h3>
        </div>
        <BaiduMap route={activeRoute} />
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <span className="font-bold">途经站点：</span>
          {activeRoute.stations.map((s, idx) => (
             <span key={s.id} className={s.passed ? 'text-gray-400' : 'text-gray-800'}>
               {s.name}{idx < activeRoute.stations.length - 1 ? ' → ' : ''}
             </span>
          ))}
        </div>
      </div>

      {/* Captain View: Passenger List */}
      {user.isCaptain && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              同乘人员 ({passengers.filter(p => p.boarded).length}/{passengers.length})
            </h3>
          </div>
          <div className="space-y-2">
            {passengers.map(passenger => (
              <div key={passenger.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">{passenger.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {passenger.onStation} <span className="text-gray-300">→</span> {passenger.offStation}
                  </div>
                </div>
                <button
                  onClick={() => toggleBoarding(passenger.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    passenger.boarded 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {passenger.boarded ? '已上车' : '未上车'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;