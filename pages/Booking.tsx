import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_ROUTES } from '../services/mockData';
import { Route } from '../types';

const Booking: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateBookable = (date: Date) => {
    const now = new Date();
    // Normalize today to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate the last day of the *actual* current month
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);
    
    // Normalize the target date to start of day
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // 1. Past dates
    if (targetDate < today) return { bookable: false, reason: '过期' };
    
    // 2. Future dates beyond current month
    if (targetDate > endOfCurrentMonth) return { bookable: false, reason: '不可约' };
    
    // Weekends are now bookable for the current month
    return { bookable: true, reason: '可预约' };
  };

  const toggleDate = (dateStr: string, bookable: boolean) => {
    if (!bookable) return;
    
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = formatDate(year, month, i);
      const { bookable, reason } = isDateBookable(dateObj);
      const isSelected = selectedDates.includes(dateStr);

      days.push(
        <button
          key={dateStr}
          onClick={() => toggleDate(dateStr, bookable)}
          disabled={!bookable}
          className={`h-16 flex flex-col items-center justify-center rounded-lg border transition-all relative ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-600 shadow-md z-10'
              : bookable
              ? 'bg-white text-gray-800 border-gray-100 hover:border-blue-300'
              : 'bg-gray-50 text-gray-400 border-transparent cursor-not-allowed'
          }`}
        >
          <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{i}</span>
          <span className={`text-[10px] scale-90 ${
            isSelected ? 'text-blue-100' : bookable ? 'text-green-600' : 'text-gray-400'
          }`}>
            {isSelected ? '已选' : reason}
          </span>
          {isSelected && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="pb-24 p-4 space-y-6">
      
      {/* 1. Date Selection (Calendar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" />
            选择日期
          </h2>
          <div className="flex items-center gap-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
             <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                <ChevronLeft size={18} />
             </button>
             <span className="text-sm font-bold text-gray-800">
                {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
             </span>
             <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                <ChevronRight size={18} />
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
           {/* Weekday Headers */}
           <div className="grid grid-cols-7 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
                <div key={day} className={`text-center text-xs font-medium ${idx === 0 || idx === 6 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {day}
                </div>
              ))}
           </div>
           
           {/* Calendar Grid */}
           <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
           </div>
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
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{route.name}</h3>
                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  <Clock size={14} className="mr-1" />
                  {route.startTime} - {route.endTime}
                </div>
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