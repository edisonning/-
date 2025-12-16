import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, CornerDownLeft, ArrowRightLeft, 
  Sparkles, Package, Truck, CheckCircle, LayoutGrid, AlertCircle
} from 'lucide-react';
import { INITIAL_EQUIPMENT, MOCK_PROVIDERS } from '../constants';
import { Equipment, EquipmentStatus, ActionType, Stats } from '../types';
import { ActionModal } from './ActionModal';
import { StatsOverview } from './StatsOverview';
import { analyzeInventoryDistribution } from '../services/geminiService';

export const EquipmentManager: React.FC = () => {
  // State
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'ALL' | 'AVAILABLE' | 'ALLOCATED' | 'INSTALLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ActionType | null>(null);

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived Statistics
  const stats: Stats = useMemo(() => ({
    total: equipmentList.length,
    stat1: equipmentList.filter(e => e.status === EquipmentStatus.AVAILABLE).length,
    stat2: equipmentList.filter(e => e.status === EquipmentStatus.ALLOCATED).length,
    stat3: equipmentList.filter(e => e.status === EquipmentStatus.INSTALLED).length,
  }), [equipmentList]);

  // Derived Filtered List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
      // Tab Filter
      if (activeTab === 'AVAILABLE' && item.status !== EquipmentStatus.AVAILABLE) return false;
      if (activeTab === 'ALLOCATED' && (item.status === EquipmentStatus.AVAILABLE || item.status === EquipmentStatus.INSTALLED)) return false; // Strict Allocated
      if (activeTab === 'INSTALLED' && item.status !== EquipmentStatus.INSTALLED) return false;
      
      // Search Filter
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        item.serialNumber.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term) ||
        item.manufacturer.toLowerCase().includes(term) ||
        (item.providerId && MOCK_PROVIDERS.find(p => p.id === item.providerId)?.name.toLowerCase().includes(term));
      
      return matchesSearch;
    });
  }, [equipmentList, activeTab, searchQuery]);

  // Selection Logic Helpers
  const isRowSelectable = (item: Equipment) => {
    // Installed items are immutable for these operations
    return item.status !== EquipmentStatus.INSTALLED;
  };

  const getSelectionState = () => {
    if (selectedIds.size === 0) return 'EMPTY';
    
    const selectedItems = equipmentList.filter(e => selectedIds.has(e.id));
    const allAvailable = selectedItems.every(e => e.status === EquipmentStatus.AVAILABLE);
    const allAllocated = selectedItems.every(e => e.status === EquipmentStatus.ALLOCATED);
    
    if (allAvailable) return 'PURE_AVAILABLE';
    if (allAllocated) return 'PURE_ALLOCATED';
    return 'MIXED';
  };

  const selectionState = getSelectionState();

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Only select selectable items (skip Installed)
      const selectableIds = filteredEquipment
        .filter(isRowSelectable)
        .map(item => item.id);
      setSelectedIds(new Set(selectableIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const openActionModal = (type: ActionType) => {
    if (selectedIds.size === 0) return;
    setModalType(type);
    setModalOpen(true);
  };

  const executeAction = (targetProviderId: string | null) => {
    setEquipmentList(prev => prev.map(item => {
      if (!selectedIds.has(item.id)) return item;

      if (modalType === 'ALLOCATE') {
        if (item.status === EquipmentStatus.AVAILABLE && targetProviderId) {
          return { ...item, status: EquipmentStatus.ALLOCATED, providerId: targetProviderId };
        }
      } else if (modalType === 'RECLAIM') {
        if (item.status === EquipmentStatus.ALLOCATED) {
          return { ...item, status: EquipmentStatus.AVAILABLE, providerId: null, installDate: undefined };
        }
      } else if (modalType === 'TRANSFER') {
         if (item.status === EquipmentStatus.ALLOCATED && targetProviderId) {
           return { ...item, providerId: targetProviderId };
         }
      }
      return item;
    }));

    setModalOpen(false);
    setSelectedIds(new Set());
    setModalType(null);
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const insight = await analyzeInventoryDistribution(equipmentList, MOCK_PROVIDERS);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const getProviderName = (id: string | null) => {
    if (!id) return '-';
    return MOCK_PROVIDERS.find(p => p.id === id)?.name || '未知';
  };

  const StatusBadge = ({ status }: { status: EquipmentStatus }) => {
    const styles = {
      [EquipmentStatus.AVAILABLE]: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
      [EquipmentStatus.ALLOCATED]: 'bg-amber-100 text-amber-700 ring-amber-600/20',
      [EquipmentStatus.INSTALLED]: 'bg-slate-100 text-slate-500 ring-slate-400/20',
    };
    
    const label = {
      [EquipmentStatus.AVAILABLE]: '待分配',
      [EquipmentStatus.ALLOCATED]: '已分配',
      [EquipmentStatus.INSTALLED]: '已安装',
    };

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
        {label[status]}
      </span>
    );
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'ALL': return '全部设备';
      case 'AVAILABLE': return '待分配 (库存)';
      case 'ALLOCATED': return '已分配 (可调拨/回收)';
      case 'INSTALLED': return '已安装 (不可操作)';
      default: return tab;
    }
  };

  return (
    <div>
        {/* Statistics & AI Insight */}
        <div className="mb-8">
           <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-slate-800">设备总览</h2>
              <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="text-sm flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? "正在分析..." : "AI 库存智能洞察"}</span>
              </button>
           </div>

           <StatsOverview 
             stats={stats} 
             labels={{total: '设备总数', stat1: '待分配 (库存)', stat2: '已分配 (待安装)', stat3: '已安装 (激活)'}}
             icons={{
                stat1: <Package className="w-6 h-6 text-emerald-600" />,
                stat2: <Truck className="w-6 h-6 text-amber-600" />,
                stat3: <CheckCircle className="w-6 h-6 text-indigo-600" />
             }}
           />

           {aiInsight && (
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-slate-700 leading-relaxed shadow-sm animate-fade-in">
                <div className="flex items-start space-x-2">
                   <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                     <span className="font-semibold text-blue-800 block mb-1">Gemini 分析报告:</span>
                     {aiInsight}
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Action Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
              {(['ALL', 'AVAILABLE', 'ALLOCATED', 'INSTALLED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {getTabLabel(tab)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索序列号、服务商..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Bar */}
          {selectedIds.size > 0 && (
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between animate-fade-in">
              <span className="text-sm font-medium text-blue-900 flex items-center">
                 已选择 {selectedIds.size} 项
              </span>
              
              <div className="flex items-center space-x-2">
                {selectionState === 'PURE_AVAILABLE' && (
                  <button
                    onClick={() => openActionModal('ALLOCATE')}
                    className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    分配给服务商
                  </button>
                )}

                {selectionState === 'PURE_ALLOCATED' && (
                  <>
                    <button
                      onClick={() => openActionModal('TRANSFER')}
                      className="inline-flex items-center px-4 py-1.5 bg-white text-amber-700 text-xs font-medium rounded-lg border border-amber-200 hover:bg-amber-50 shadow-sm transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                      调拨设备
                    </button>
                    <button
                      onClick={() => openActionModal('RECLAIM')}
                      className="inline-flex items-center px-4 py-1.5 bg-white text-red-700 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 mr-1.5" />
                      回收设备
                    </button>
                  </>
                )}

                {selectionState === 'MIXED' && (
                   <div className="flex items-center text-amber-700 text-xs bg-amber-100 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    请选择状态一致的设备（仅“待分配”或仅“已分配”）
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      onChange={handleSelectAll}
                      checked={filteredEquipment.filter(isRowSelectable).length > 0 && filteredEquipment.filter(isRowSelectable).every(item => selectedIds.has(item.id))}
                      disabled={filteredEquipment.filter(isRowSelectable).length === 0}
                    />
                  </th>
                  <th className="px-6 py-4">终端厂商</th>
                  <th className="px-6 py-4">终端型号</th>
                  <th className="px-6 py-4">终端序列号</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">当前服务商</th>
                  <th className="px-6 py-4">安装日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item) => {
                    const selectable = isRowSelectable(item);
                    return (
                      <tr key={item.id} className={`transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50/50' : !selectable ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className={`rounded border-slate-300 text-blue-600 focus:ring-blue-500 ${!selectable ? 'cursor-not-allowed bg-slate-100' : ''}`}
                            checked={selectedIds.has(item.id)}
                            onChange={() => handleSelectRow(item.id)}
                            disabled={!selectable}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {item.manufacturer}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <div>{item.model}</div>
                          <div className="text-slate-400 text-xs">{item.batchNumber}</div>
                        </td>
                         <td className="px-6 py-4 font-mono text-slate-600">
                          {item.serialNumber}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.providerId ? (
                             <div className="flex items-center space-x-2">
                               <div className={`w-2 h-2 rounded-full ${item.status === EquipmentStatus.INSTALLED ? 'bg-slate-300' : 'bg-slate-400'}`}></div>
                               <span>{getProviderName(item.providerId)}</span>
                             </div>
                          ) : <span className="text-slate-400 italic">未分配</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{item.installDate || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <LayoutGrid className="w-10 h-10 mb-3 text-slate-300" />
                        <p>未找到符合条件的设备。</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      <ActionModal 
        isOpen={modalOpen}
        type={modalType}
        entityType="EQUIPMENT"
        selectedCount={selectedIds.size}
        providers={MOCK_PROVIDERS}
        onClose={() => setModalOpen(false)}
        onConfirm={executeAction}
      />
    </div>
  );
};