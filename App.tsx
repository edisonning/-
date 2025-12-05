import React, { useState } from 'react';
import { Home as HomeIcon, CalendarDays, History as HistoryIcon, UserCircle } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import Booking from './pages/Booking';
import History from './pages/History';
import Profile from './pages/Profile';
import { CURRENT_USER, MOCK_RESERVATIONS } from './services/mockData';
import { User, Reservation } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'history' | 'profile'>('home');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = () => {
    setUser(CURRENT_USER);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  // Logic to find today's active reservation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservation = MOCK_RESERVATIONS.find(r => r.date === todayStr);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-gray-900 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Content Area */}
      <main className="h-full overflow-y-auto scrollbar-hide">
        {activeTab === 'home' && user && <Home user={user} todayReservation={todayReservation} />}
        {activeTab === 'booking' && <Booking />}
        {activeTab === 'history' && <History />}
        {activeTab === 'profile' && user && <Profile user={user} onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <HomeIcon size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">首页</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'booking' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <CalendarDays size={24} strokeWidth={activeTab === 'booking' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">预约</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <HistoryIcon size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">记录</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <UserCircle size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">我的</span>
        </button>
      </nav>
    </div>
  );
}

export default App;