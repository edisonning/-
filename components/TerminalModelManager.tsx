
import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Smartphone, 
  LayoutGrid, X, Calendar, AlertCircle
} from 'lucide-react';
import { INITIAL_MODELS } from '../constants';
import { TerminalModel } from '../types';

export const TerminalModelManager: React.FC = () => {
  const [models, setModels] = useState<TerminalModel[]>(INITIAL_MODELS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<TerminalModel | null>(null);
  const [inputName, setInputName] = useState('');

  // Filtered list
  const filteredModels = useMemo(() => {
    return models.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingModel(null);
    setInputName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model: TerminalModel) => {
    setEditingModel(model);
    setInputName(model.name);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!inputName.trim()) return;

    if (editingModel) {
      // Update
      setModels(prev => prev.map(m => 
        m.id === editingModel.id ? { ...m, name: inputName.trim() } : m
      ));
    } else {
      // Create
      const newModel: TerminalModel = {
        id: `m_${Date.now()}`,
        name: inputName.trim(),
        createDate: new Date().toISOString().split('T')[0]
      };
      setModels(prev => [newModel, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该终端型号吗？此操作不可撤销。')) {
      setModels(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">终端型号管理</h2>
          <p className="text-sm text-slate-500">维护系统中可分配的北斗终端型号列表</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增型号
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索型号名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">型号名称</th>
                <th className="px-6 py-4">创建日期</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2 text-slate-400" />
                        {model.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2" />
                        {model.createDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(model)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="修改"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(model.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <LayoutGrid className="w-10 h-10 mb-3 text-slate-300" />
                      <p>未找到相关型号</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800">
                {editingModel ? '修改终端型号' : '新增终端型号'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-lg flex items-start space-x-3 text-amber-800 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>请确保录入准确。</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">终端型号名称</label>
                <input
                  type="text"
                  autoFocus
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="例如: BD-Pro-Max 3000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!inputName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingModel ? '保存修改' : '立即创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
