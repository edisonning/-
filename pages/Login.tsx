import React, { useState } from 'react';
import { Bus } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [empId, setEmpId] = useState('E001');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (empId && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Bus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">通勤约车</h1>
          <p className="text-gray-500">职工登录</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职工编号</label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="请输入工号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg active:scale-[0.98]"
          >
            登录
          </button>
        </form>
        
        <div className="text-center text-xs text-gray-400">
          Internal Commuter System v1.0
        </div>
      </div>
    </div>
  );
};

export default Login;