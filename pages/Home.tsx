import React, { useState } from 'react';
import { Clock, Navigation, BusFront, ArrowLeft, ChevronRight, Users, MapPin } from 'lucide-react';
import { User, Reservation } from '../types';
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

  const [passengers] = useState(MOCK_PASSENGERS);
  const [showPassengerList, setShowPassengerList] = useState(false);

  if (!todayReservation || !activeRoute) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-gray-400">
        <BusFront size={64} className="mb-4 text-gray-300" />
        <p className="text-lg">今日暂无行程</p>
        <p className="text-sm mt-2">请前往“预约”页面进行订座</p>
      </div>
    );
  }

  // Dedicated Passenger List View
  if (showPassengerList) {
    return (
      <div className="pb-24 min-h-full bg-white animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm">
          <button 
            onClick={() => setShowPassengerList(false)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">同乘人员名单</h2>
            <div className="text-xs text-gray-500">
                当前车次: {activeRoute.name}
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end">
             <span className="text-2xl font-bold text-blue-600">
                {passengers.length}
                <span className="text-sm text-gray-400 font-normal">人</span>
             </span>
             <span className="text-xs text-gray-400">共计</span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
            {passengers.map(passenger => (
              <div 
                key={passenger.id} 
                className="flex items-center justify-between p-4 rounded-xl border bg-white border-gray-100 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-900">
                        {passenger.name}
                      </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={12}/>
                    {passenger.onStation} <span className="text-gray-300">→</span> {passenger.offStation}
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded text-xs font-medium border ${
                  passenger.boarded 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}>
                  {passenger.boarded ? '已上车' : '未上车'}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Normal Home View
  return (
    <div className="pb-24 space-y-4 p-4">
      {/* Ticket Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <div className="flex justify-between items-start">
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

          {/* Captain Access Link */}
          {user.isCaptain && (
             <div 
                className="mt-4 pt-3 border-t border-blue-500/50 flex items-center justify-between cursor-pointer hover:bg-blue-700/20 -mx-4 px-4 -mb-4 pb-4 transition-colors" 
                onClick={() => setShowPassengerList(true)}
             >
                <div className="flex items-center gap-2 text-sm font-medium text-blue-50">
                    <Users size={18} />
                    <span>查看同乘人员</span>
                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {passengers.length}
                    </span>
                </div>
                <ChevronRight size={18} className="text-blue-300" />
             </div>
          )}
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
    </div>
  );
};

export default Home;