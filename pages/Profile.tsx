import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS, MOCK_STATION_REQUESTS, AVAILABLE_STATIONS } from '../services/mockData';
import { User, FeedbackType } from '../types';
import { ChevronRight, User as UserIcon, LogOut, MessageSquare, Bell, Lock, MapPin, ArrowLeft, Camera, Send } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

type View = 'menu' | 'info' | 'password' | 'feedback' | 'notifications' | 'station-change';

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('menu');

  // Sub-component: Header
  const Header = ({ title }: { title: string }) => (
    <div className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
      <button onClick={() => setCurrentView('menu')} className="p-1 mr-2 text-gray-600">
        <ArrowLeft size={24} />
      </button>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
  );

  // VIEW: Main Menu
  if (currentView === 'menu') {
    return (
      <div className="pb-24">
        {/* User Card */}
        <div className="bg-blue-600 pt-10 pb-16 px-6 text-white relative">
          <div className="flex items-center gap-4">
            <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white/50" />
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-blue-100 text-sm">{user.orgName} | {user.id}</p>
            </div>
          </div>
          {/* Stats or Quick Info could go here */}
        </div>

        {/* Menu Items */}
        <div className="-mt-8 px-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <button onClick={() => setCurrentView('info')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><UserIcon size={20} /></div>
                  <span className="text-gray-700 font-medium">个人资料</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
             </button>
             <button onClick={() => setCurrentView('notifications')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Bell size={20} /></div>
                  <span className="text-gray-700 font-medium">系统消息</span>
                </div>
                {MOCK_NOTIFICATIONS.some(n => !n.read) && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                <ChevronRight size={20} className="text-gray-400" />
             </button>
             <button onClick={() => setCurrentView('station-change')} className="w-full flex items-center justify-between p-4 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><MapPin size={20} /></div>
                  <span className="text-gray-700 font-medium">申请变更站点</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
             </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <button onClick={() => setCurrentView('feedback')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><MessageSquare size={20} /></div>
                  <span className="text-gray-700 font-medium">意见反馈</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
             </button>
             <button onClick={() => setCurrentView('password')} className="w-full flex items-center justify-between p-4 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Lock size={20} /></div>
                  <span className="text-gray-700 font-medium">修改密码</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
             </button>
          </div>

          <button onClick={onLogout} className="w-full bg-white text-red-600 font-medium p-4 rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-red-50">
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>
    );
  }

  // VIEW: Info
  if (currentView === 'info') {
    return (
      <div className="min-h-screen bg-white">
        <Header title="个人资料" />
        <div className="p-4 space-y-6">
           <div className="text-center">
             <img src={user.avatarUrl} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-100" />
           </div>
           <div className="space-y-4">
             {[
               { label: '账号', value: user.id },
               { label: '姓名', value: user.name },
               { label: '所属组织', value: user.orgName },
               { label: '身份证号', value: user.idCard },
               { label: '手机号', value: user.phone },
               { label: '住址', value: user.address },
               { label: '上车站点', value: user.defaultOnStation },
               { label: '下车站点', value: user.defaultOffStation },
             ].map((item) => (
               <div key={item.label} className="border-b border-gray-100 pb-2">
                 <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                 <div className="text-gray-900 font-medium">{item.value}</div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // VIEW: Feedback
  if (currentView === 'feedback') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="意见反馈" />
        <div className="p-4 space-y-4">
           <div className="bg-white p-4 rounded-xl space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">问题类型</label>
               <div className="flex flex-wrap gap-2">
                 {Object.values(FeedbackType).map(type => (
                   <button key={type} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-100 hover:text-blue-600 focus:bg-blue-600 focus:text-white transition">
                     {type}
                   </button>
                 ))}
               </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">反馈内容</label>
                <textarea className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="请输入您的宝贵意见..."></textarea>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">图片上传</label>
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                   <Camera size={24} />
                   <span className="text-xs mt-1">添加</span>
                </div>
             </div>
             <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg mt-4 flex items-center justify-center gap-2">
               <Send size={18} /> 提交反馈
             </button>
           </div>
        </div>
      </div>
    );
  }

  // VIEW: Notifications
  if (currentView === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="系统消息" />
        <div className="p-4 space-y-3">
           {MOCK_NOTIFICATIONS.map(notif => (
             <div key={notif.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${notif.read ? 'border-gray-300' : 'border-blue-500'}`}>
                <div className="flex justify-between items-start mb-1">
                   <h3 className={`font-bold ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h3>
                   <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600">{notif.content}</p>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // VIEW: Change Station
  if (currentView === 'station-change') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="申请变更站点" />
        <div className="p-4 space-y-6">
           {/* Form */}
           <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800">提交新申请</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">上车站点</label>
                    <select className="w-full p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                       {AVAILABLE_STATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 block mb-1">下车站点</label>
                    <select className="w-full p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                       {AVAILABLE_STATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold">提交申请</button>
           </div>

           {/* List */}
           <div>
              <h3 className="font-bold text-gray-800 mb-2 px-1">申请记录</h3>
              <div className="space-y-3">
                 {MOCK_STATION_REQUESTS.map(req => (
                    <div key={req.id} className="bg-white p-3 rounded-lg border border-gray-100">
                       <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">{req.date}</span>
                          <span className={`px-2 rounded text-xs ${
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{req.status === 'Approved' ? '已通过' : '审核中'}</span>
                       </div>
                       <div className="flex items-center text-sm gap-2">
                          <span>{req.newOn}</span>
                          <span className="text-gray-400">→</span>
                          <span>{req.newOff}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // VIEW: Password (Simplified)
  if (currentView === 'password') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="修改密码" />
        <div className="p-4">
           <div className="bg-white p-4 rounded-xl space-y-4">
              <input type="password" placeholder="旧密码" className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" />
              <input type="password" placeholder="新密码" className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" />
              <input type="password" placeholder="确认新密码" className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" />
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">确认修改</button>
           </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Profile;