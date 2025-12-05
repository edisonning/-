import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { MOCK_ROUTES } from '../services/mockData';
import { Route } from '../types';

const Booking: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simple 7-day calendar generator
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) { // Next 2 weeks
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      setSelectedDates(prev => [...prev, dateStr]);
    }
  };

  const handleBooking = () => {
    if (selectedDates.length === 0 || !selectedRoute) return;
    
    // Simulate API Call
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDates([]);
      setSelectedRoute(null);
    }, 2000);
  };

  return (
    <div className="pb-24 p-4 space-y-6">
      
      {/* 1. Date Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-600" />
          选择日期 (可多选)
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {dates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDates.includes(dateStr);
            const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
            
            return (
              <button
                key={dateStr}
                onClick={() => toggleDate(dateStr)}
                className={`p-2 rounded-lg text-center border transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-xs opacity-80">{date.getMonth() + 1}/{date.getDate()}</div>
                <div className="font-bold text-sm">周{dayName}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Route Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" />
          选择班次
        </h2>
        <div className="space-y-3">
          {MOCK_ROUTES.map(route => (
            <div 
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`bg-white p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                selectedRoute?.id === route.id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-transparent shadow-sm hover:border-gray-200'
              }`}
            >
              {selectedRoute?.id === route.id && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white p-1 rounded-bl-lg">
                  <CheckCircle2 size={16} />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{route.name}</h3>
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  <Clock size={14} className="mr-1" />
                  {route.startTime} - {route.endTime}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {route.startStation}
                <span className="text-gray-300">→</span>
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {route.endStation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Summary & Submit */}
      <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg-up z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">已选 <span className="text-blue-600 font-bold">{selectedDates.length}</span> 天</div>
              <div className="text-sm font-medium text-gray-800">{selectedRoute ? selectedRoute.name : '未选班次'}</div>
            </div>
            <button
              onClick={handleBooking}
              disabled={selectedDates.length === 0 || !selectedRoute}
              className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                selectedDates.length === 0 || !selectedRoute 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              立即预约
            </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-2xl animate-bounce-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">预约成功</h3>
            <p className="text-gray-500">请在记录中查看详情</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;