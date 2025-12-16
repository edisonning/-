import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, CornerDownLeft, ArrowRightLeft, 
  Car, ShieldCheck, Link, LayoutGrid, AlertCircle
} from 'lucide-react';
import { INITIAL_VEHICLES, MOCK_PROVIDERS } from '../constants';
import { Vehicle, VehicleStatus, ActionType, Stats } from '../types';
import { ActionModal } from './ActionModal';
import { StatsOverview } from './StatsOverview';

export const VehicleManager: React.FC = () => {
  // State
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNAUTHORIZED' | 'AUTHORIZED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ActionType | null>(null);

  // Derived Statistics
  const stats: Stats = useMemo(() => ({
    total: vehicleList.length,
    stat1: vehicleList.filter(e => e.status === VehicleStatus.UNAUTHORIZED).length,
    stat2: vehicleList.filter(e => e.status === VehicleStatus.AUTHORIZED).length,
    stat3: vehicleList.filter(e => e.status === VehicleStatus.INSTALLED).length,
  }), [vehicleList]);

  // Filter Logic
  const filteredVehicles = useMemo(() => {
    return vehicleList.filter(item => {
      // Tab Filter
      if (activeTab === 'UNAUTHORIZED' && item.status !== VehicleStatus.UNAUTHORIZED) return false;
      if (activeTab === 'AUTHORIZED' && item.status !== VehicleStatus.AUTHORIZED) return false;
      
      // Search
      const term = searchQuery.toLowerCase();
      return (
        item.plateNumber.toLowerCase().includes(term) ||
        item.vin.toLowerCase().includes(term) ||
        (item.providerId && MOCK_PROVIDERS.find(p => p.id === item.providerId)?.name.toLowerCase().includes(term))
      );
    });
  }, [vehicleList, activeTab, searchQuery]);

  // Selection Logic
  // Unlike Equipment, vehicles CAN be selected even if Installed, because we can force unbind.
  const isRowSelectable = (item: Vehicle) => true;

  const getSelectionState = () => {
    if (selectedIds.size === 0) return 'EMPTY';
    
    const selectedItems = vehicleList.filter(e => selectedIds.has(e.id));
    const allUnauthorized = selectedItems.every(e => e.status === VehicleStatus.UNAUTHORIZED);
    // Authorized AND Installed can be grouped for Transfer/Reclaim actions
    const allAuthorizedOrInstalled = selectedItems.every(e => e.status === VehicleStatus.AUTHORIZED || e.status === VehicleStatus.INSTALLED);
    
    if (allUnauthorized) return 'PURE_UNAUTHORIZED';
    if (allAuthorizedOrInstalled) return 'PURE_AUTHORIZED';
    return 'MIXED';
  };

  const selectionState = getSelectionState();
  const hasInstalledInSelection = useMemo(() => {
    return vehicleList.filter(v => selectedIds.has(v.id) && v.status === VehicleStatus.INSTALLED).length > 0;
  }, [selectedIds, vehicleList]);

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredVehicles.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const openActionModal = (type: ActionType) => {
    if (selectedIds.size === 0) return;
    setModalType(type);
    setModalOpen(true);
  };

  const executeAction = (targetProviderId: string | null) => {
    setVehicleList(prev => prev.map(item => {
      if (!selectedIds.has(item.id)) return item;

      // Authorize (UNAUTHORIZED -> AUTHORIZED)
      if (modalType === 'ALLOCATE') {
        if (item.status === VehicleStatus.UNAUTHORIZED && targetProviderId) {
          return { ...item, status: VehicleStatus.AUTHORIZED, providerId: targetProviderId };
        }
      } 
      // Reclaim (AUTHORIZED/INSTALLED -> UNAUTHORIZED)
      else if (modalType === 'RECLAIM') {
        if (item.status !== VehicleStatus.UNAUTHORIZED) {
          // If Installed, we remove binding info
          return { 
            ...item, 
            status: VehicleStatus.UNAUTHORIZED, 
            providerId: null, 
            boundEquipmentId: undefined 
          };
        }
      } 
      // Transfer (AUTHORIZED/INSTALLED -> AUTHORIZED[New Provider])
      else if (modalType === 'TRANSFER') {
         if (item.status !== VehicleStatus.UNAUTHORIZED && targetProviderId) {
           // If Installed, we assume the physical device is from old provider, so we UNBIND it and set to Authorized
           const isInstalled = item.status === VehicleStatus.INSTALLED;
           return { 
             ...item, 
             status: VehicleStatus.AUTHORIZED, // Reverts to Authorized (no device bound yet for new provider)
             providerId: targetProviderId,
             boundEquipmentId: undefined 
            };
         }
      }
      return item;
    }));

    setModalOpen(false);
    setSelectedIds(new Set());
    setModalType(null);
  };

  const getProviderName = (id: string | null) => {
    if (!id) return '-';
    return MOCK_PROVIDERS.find(p => p.id === id)?.name || '未知';
  };

  const StatusBadge = ({ status }: { status: VehicleStatus }) => {
    const styles = {
      [VehicleStatus.UNAUTHORIZED]: 'bg-slate-100 text-slate-600 ring-slate-400/20',
      [VehicleStatus.AUTHORIZED]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      [VehicleStatus.INSTALLED]: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    };
    
    const label = {
      [VehicleStatus.UNAUTHORIZED]: '待授权',
      [VehicleStatus.AUTHORIZED]: '已授权',
      [VehicleStatus.INSTALLED]: '已安装',
    };

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
        {status === VehicleStatus.INSTALLED && <Link className="w-3 h-3 mr-1" />}
        {label[status]}
      </span>
    );
  };

  const PlateBadge = ({ plate, color }: { plate: string, color: 'Yellow' | 'Blue' | 'Green' }) => {
    const colorStyles = {
        Yellow: 'bg-amber-400 text-black border-amber-500',
        Blue: 'bg-blue-600 text-white border-blue-700',
        Green: 'bg-emerald-500 text-white border-emerald-600'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colorStyles[color]}`}>
            {plate}
        </span>
    );
  };

  return (
    <div>
        {/* Statistics */}
        <div className="mb-8">
           <h2 className="text-lg font-semibold text-slate-800 mb-4">车辆总览</h2>
           <StatsOverview 
             stats={stats} 
             labels={{total: '车辆总数', stat1: '待授权', stat2: '已授权 (未安装)', stat3: '已授权 (已安装)'}}
             icons={{
                stat1: <Car className="w-6 h-6 text-slate-500" />,
                stat2: <ShieldCheck className="w-6 h-6 text-blue-600" />,
                stat3: <Link className="w-6 h-6 text-emerald-600" />
             }}
           />
        </div>

        {/* Action Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
              {(['ALL', 'UNAUTHORIZED', 'AUTHORIZED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedIds(new Set());
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab === 'ALL' ? '全部车辆' : tab === 'UNAUTHORIZED' ? '待授权' : '已授权'}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索车牌、VIN、服务商..."
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
            <div className={`px-4 py-3 border-b flex items-center justify-between animate-fade-in ${hasInstalledInSelection ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
              <span className={`text-sm font-medium flex items-center ${hasInstalledInSelection ? 'text-amber-900' : 'text-blue-900'}`}>
                 已选择 {selectedIds.size} 项 
                 {hasInstalledInSelection && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">包含已安装车辆</span>}
              </span>
              
              <div className="flex items-center space-x-2">
                {selectionState === 'PURE_UNAUTHORIZED' && (
                  <button
                    onClick={() => openActionModal('ALLOCATE')}
                    className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    授权给服务商
                  </button>
                )}

                {selectionState === 'PURE_AUTHORIZED' && (
                  <>
                    <button
                      onClick={() => openActionModal('TRANSFER')}
                      className="inline-flex items-center px-4 py-1.5 bg-white text-amber-700 text-xs font-medium rounded-lg border border-amber-200 hover:bg-amber-50 shadow-sm transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                      转移授权
                    </button>
                    <button
                      onClick={() => openActionModal('RECLAIM')}
                      className="inline-flex items-center px-4 py-1.5 bg-white text-red-700 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 mr-1.5" />
                      回收授权
                    </button>
                  </>
                )}

                {selectionState === 'MIXED' && (
                  <div className="flex items-center text-amber-700 text-xs bg-amber-100 px-3 py-1.5 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    请选择状态一致的车辆（仅“待授权”或仅“已授权/已安装”）
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
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={filteredVehicles.length > 0 && filteredVehicles.every(item => selectedIds.has(item.id))}
                    />
                  </th>
                  <th className="px-6 py-4">车牌号</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">授权服务商</th>
                  <th className="px-6 py-4">绑定设备</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((item) => (
                    <tr key={item.id} className={`transition-colors ${selectedIds.has(item.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <PlateBadge plate={item.plateNumber} color={item.plateColor} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.providerId ? (
                           <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full bg-slate-400`}></div>
                             <span>{getProviderName(item.providerId)}</span>
                           </div>
                        ) : <span className="text-slate-400 italic">未授权</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {item.boundEquipmentId ? (
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                {item.boundEquipmentId}
                            </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <LayoutGrid className="w-10 h-10 mb-3 text-slate-300" />
                        <p>未找到符合条件的车辆。</p>
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
        entityType="VEHICLE"
        selectedCount={selectedIds.size}
        providers={MOCK_PROVIDERS}
        hasRiskWarning={hasInstalledInSelection && (modalType === 'RECLAIM' || modalType === 'TRANSFER')}
        onClose={() => setModalOpen(false)}
        onConfirm={executeAction}
      />
    </div>
  );
};