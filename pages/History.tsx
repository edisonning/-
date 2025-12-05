import React, { useState } from 'react';
import { MOCK_RESERVATIONS } from '../services/mockData';
import { ReservationStatus } from '../types';
import { Bus, Calendar, MapPin, Search } from 'lucide-react';

const statusColors: Record<ReservationStatus, string> = {
  [ReservationStatus.SUBMITTED]: 'bg-blue-100 text-blue-700',
  [ReservationStatus.CANCELLED]: 'bg-gray-100 text-gray-500 line-through',
  [ReservationStatus.REVOKED]: 'bg-red-100 text-red-700',
  [ReservationStatus.SCHEDULING]: 'bg-yellow-100 text-yellow-700',
  [ReservationStatus.NO_TICKET]: 'bg-orange-100 text-orange-700',
  [ReservationStatus.PENDING]: 'bg-green-100 text-green-700 border border-green-200',
  [ReservationStatus.COMPLETED]: 'bg-gray-200 text-gray-600',
  [ReservationStatus.EXPIRED]: 'bg-gray-100 text-gray-400',
};

const History: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  const filteredReservations = MOCK_RESERVATIONS.filter(res => {
    if (filter === 'all') return true;
    return res.status === filter;
  });

  return (
    <div className="pb-24 p-4 space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', ...Object.values(ReservationStatus)].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {status === 'all' ? '全部' : status}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
           <div className="text-center py-10 text-gray-400">
             <Search size={48} className="mx-auto mb-2 opacity-50" />
             <p>暂无相关记录</p>
           </div>
        ) : (
          filteredReservations.map(res => (
            <div key={res.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="flex justify-between items-start mb-3">
                 <div>
                    <div className="font-bold text-lg text-gray-800">{res.date}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {res.startTime} 发车
                    </div>
                 </div>
                 <div className={`px-2 py-1 rounded text-xs font-bold ${statusColors[res.status]}`}>
                   {res.status}
                 </div>
               </div>
               
               <div className="flex items-center gap-3 my-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-0.5 h-6 bg-gray-200"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm text-gray-700">{res.startStation}</div>
                    <div className="text-sm text-gray-700">{res.endStation}</div>
                  </div>
               </div>

               <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bus size={16} className="text-blue-500" />
                    <span>{res.routeName}</span>
                  </div>
                  {res.plateNumber && (
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono font-bold">
                      {res.plateNumber}
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;