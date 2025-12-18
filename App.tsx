
import React, { useState } from 'react';
import { Server, Truck, Users, Smartphone } from 'lucide-react';
import { EquipmentManager } from './components/EquipmentManager';
import { VehicleManager } from './components/VehicleManager';
import { GroupManager } from './components/GroupManager';
import { TerminalModelManager } from './components/TerminalModelManager';

type ViewMode = 'EQUIPMENT' | 'VEHICLE' | 'GROUP' | 'MODEL';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('EQUIPMENT');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full z-40 hidden md:block">
        <div className="p-6">
           <div className="flex items-center space-x-3 mb-8">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Server className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">北斗资产管理</h1>
           </div>
           
           <nav className="space-y-1">
             <button 
               onClick={() => setCurrentView('EQUIPMENT')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'EQUIPMENT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               <Server className="w-5 h-5" />
               <span className="font-medium">设备分配</span>
             </button>

             <button 
               onClick={() => setCurrentView('MODEL')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'MODEL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               <Smartphone className="w-5 h-5" />
               <span className="font-medium">终端型号</span>
             </button>
             
             <button 
               onClick={() => setCurrentView('VEHICLE')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'VEHICLE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               <Truck className="w-5 h-5" />
               <span className="font-medium">车辆授权</span>
             </button>

             <button 
               onClick={() => setCurrentView('GROUP')}
               className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === 'GROUP' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               <Users className="w-5 h-5" />
               <span className="font-medium">车组管理</span>
             </button>
           </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
           <div className="flex items-center space-x-3">
             <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
               JD
             </div>
             <div>
               <p className="text-sm font-medium text-white">管理员</p>
               <p className="text-xs text-slate-500">申报主体 / 运输企业</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 md:hidden">
          <div className="px-4 py-4 flex justify-between items-center">
             <span className="font-bold text-slate-800">北斗资产管理</span>
             <div className="flex space-x-2">
                <button 
                   onClick={() => setCurrentView('EQUIPMENT')}
                   className={`p-2 rounded-lg ${currentView === 'EQUIPMENT' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                  <Server className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setCurrentView('MODEL')}
                   className={`p-2 rounded-lg ${currentView === 'MODEL' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                  <Smartphone className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setCurrentView('VEHICLE')}
                   className={`p-2 rounded-lg ${currentView === 'VEHICLE' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                  <Truck className="w-5 h-5" />
                </button>
                <button 
                   onClick={() => setCurrentView('GROUP')}
                   className={`p-2 rounded-lg ${currentView === 'GROUP' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                >
                  <Users className="w-5 h-5" />
                </button>
             </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
           {currentView === 'EQUIPMENT' && <EquipmentManager />}
           {currentView === 'MODEL' && <TerminalModelManager />}
           {currentView === 'VEHICLE' && <VehicleManager />}
           {currentView === 'GROUP' && <GroupManager />}
        </main>
      </div>
    </div>
  );
};

export default App;
