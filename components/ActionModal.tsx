import React, { useState } from 'react';
import { ActionModalProps, ActionType } from '../types';
import { X, AlertTriangle, ArrowRightLeft, Upload, Download, AlertOctagon } from 'lucide-react';

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  type,
  entityType,
  selectedCount,
  providers,
  onClose,
  onConfirm,
  hasRiskWarning
}) => {
  const [targetProviderId, setTargetProviderId] = useState<string>('');

  if (!isOpen || !type) return null;

  const isReclaim = type === 'RECLAIM';
  const needsProviderSelection = type === 'ALLOCATE' || type === 'TRANSFER';

  const getTitle = () => {
    const entityName = entityType === 'EQUIPMENT' ? '设备' : '车辆授权';
    switch (type) {
      case 'ALLOCATE': return `${entityName}分配`;
      case 'RECLAIM': return `${entityName}回收`;
      case 'TRANSFER': return `${entityName}调拨`;
      default: return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'ALLOCATE': return <Upload className="w-5 h-5 text-blue-600" />;
      case 'RECLAIM': return <Download className="w-5 h-5 text-red-600" />;
      case 'TRANSFER': return <ArrowRightLeft className="w-5 h-5 text-amber-600" />;
    }
  };

  const getActionName = (actionType: ActionType) => {
    switch (actionType) {
      case 'ALLOCATE': return entityType === 'EQUIPMENT' ? '分配' : '授权';
      case 'RECLAIM': return '回收';
      case 'TRANSFER': return '调拨';
      default: return '';
    }
  };

  const handleConfirm = () => {
    if (needsProviderSelection && !targetProviderId) return;
    onConfirm(needsProviderSelection ? targetProviderId : null);
    setTargetProviderId(''); // Reset
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
              {getIcon()}
            </div>
            <h3 className="font-semibold text-slate-800">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              你即将 <span className="font-bold">{getActionName(type)}</span> <span className="font-bold">{selectedCount}</span> {entityType === 'EQUIPMENT' ? '台设备' : '辆车'}。
              {entityType === 'EQUIPMENT' && type !== 'ALLOCATE' && " 仅对“未安装”状态的设备生效。"}
            </p>
          </div>

          {hasRiskWarning && (
            <div className="flex items-start space-x-3 mb-6 p-4 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold mb-1">警告：解除绑定风险</p>
                <p>
                  检测到部分选中的车辆已安装设备。
                  {type === 'RECLAIM' 
                    ? '回收授权将自动解除车辆与当前设备的绑定关系。' 
                    : '转移授权将自动解除与旧设备的绑定关系。'}
                </p>
              </div>
            </div>
          )}

          {needsProviderSelection && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {type === 'ALLOCATE' ? '选择服务商' : '调拨至服务商'}
              </label>
              <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={targetProviderId}
                onChange={(e) => setTargetProviderId(e.target.value)}
              >
                <option value="">-- 请选择服务商 --</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.region})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isReclaim && (
             <p className="text-sm text-slate-600">
               {entityType === 'EQUIPMENT' 
                  ? '这些设备将被退回到“待分配”库存池中。' 
                  : '这些车辆将恢复为“待授权”状态。'}
             </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            disabled={needsProviderSelection && !targetProviderId}
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center shadow-sm
              ${needsProviderSelection && !targetProviderId ? 'bg-slate-400 cursor-not-allowed' : hasRiskWarning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            确认{getActionName(type)}
          </button>
        </div>
      </div>
    </div>
  );
};