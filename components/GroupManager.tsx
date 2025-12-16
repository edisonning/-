
import React, { useState, useMemo } from 'react';
import { 
  Folder, FolderOpen, Plus, Trash2, 
  ChevronRight, ChevronDown, Car, ArrowRight, 
  Search, Users, FolderPlus, ArrowLeftRight, X,
  GripVertical
} from 'lucide-react';
import { Vehicle, VehicleGroup, VehicleStatus } from '../types';
import { INITIAL_VEHICLES, MOCK_GROUPS } from '../constants';

export const GroupManager: React.FC = () => {
  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [groups, setGroups] = useState<VehicleGroup[]>(MOCK_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set(['g_1']));
  
  // Selection State
  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState<Set<string>>(new Set());
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<Set<string>>(new Set());
  
  // UI State
  const [searchUnassigned, setSearchUnassigned] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Drag and Drop State
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [isDragOverUnassigned, setIsDragOverUnassigned] = useState(false);
  
  // Modals / Dialogs State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetGroupId, setTransferTargetGroupId] = useState<string>('');

  // Create Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [createGroupParentId, setCreateGroupParentId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  // --- Derived Data ---

  const unassignedVehicles = useMemo(() => {
    return vehicles.filter(v => 
      !v.groupId && 
      (v.plateNumber.includes(searchUnassigned) || v.vin.includes(searchUnassigned))
    );
  }, [vehicles, searchUnassigned]);

  const assignedVehicles = useMemo(() => {
    if (!selectedGroupId) return [];
    return vehicles.filter(v => v.groupId === selectedGroupId);
  }, [vehicles, selectedGroupId]);

  const groupStructure = useMemo(() => {
    const buildTree = (parentId: string | null): any[] => {
      return groups
        .filter(g => g.parentId === parentId)
        .map(g => ({
          ...g,
          children: buildTree(g.id)
        }));
    };
    return buildTree(null);
  }, [groups]);

  // --- Actions ---

  const openCreateGroupModal = (parentId: string | null) => {
    setCreateGroupParentId(parentId);
    setNewGroupName('');
    setShowCreateGroupModal(true);
  };

  const handleCreateGroupConfirm = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: VehicleGroup = {
      id: `g_${Date.now()}`,
      name: newGroupName.trim(),
      parentId: createGroupParentId
    };
    setGroups([...groups, newGroup]);
    if (createGroupParentId) {
      setExpandedGroupIds(new Set(expandedGroupIds).add(createGroupParentId));
    }
    setShowCreateGroupModal(false);
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Validation
    const hasChildren = groups.some(g => g.parentId === id);
    const hasVehicles = vehicles.some(v => v.groupId === id);
    
    if (hasChildren || hasVehicles) {
      alert("无法删除：该车组下仍有子车组或车辆。");
      return;
    }
    
    if (confirm("确定要删除该车组吗？")) {
      setGroups(groups.filter(g => g.id !== id));
      if (selectedGroupId === id) setSelectedGroupId(null);
    }
  };

  const startRename = (group: VehicleGroup) => {
    setEditingGroupId(group.id);
    setEditName(group.name);
  };

  const saveRename = () => {
    if (editingGroupId && editName.trim()) {
      setGroups(groups.map(g => g.id === editingGroupId ? { ...g, name: editName.trim() } : g));
    }
    setEditingGroupId(null);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedGroupIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedGroupIds(newSet);
  };

  // --- Vehicle Operations (Button Clicks) ---

  const handleAllocate = () => {
    if (!selectedGroupId) return;
    setVehicles(prev => prev.map(v => 
      selectedUnassignedIds.has(v.id) ? { ...v, groupId: selectedGroupId } : v
    ));
    setSelectedUnassignedIds(new Set());
  };

  const handleRemoveFromGroup = () => {
    setVehicles(prev => prev.map(v => 
      selectedAssignedIds.has(v.id) ? { ...v, groupId: null } : v
    ));
    setSelectedAssignedIds(new Set());
  };

  const handleTransferToGroup = () => {
    if (!transferTargetGroupId) return;
    setVehicles(prev => prev.map(v => 
      selectedAssignedIds.has(v.id) ? { ...v, groupId: transferTargetGroupId } : v
    ));
    setSelectedAssignedIds(new Set());
    setShowTransferModal(false);
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent, vehicle: Vehicle, source: 'UNASSIGNED' | 'ASSIGNED') => {
    // Determine which IDs are being dragged
    let idsToDrag: string[] = [];
    
    if (source === 'UNASSIGNED') {
      if (selectedUnassignedIds.has(vehicle.id)) {
        idsToDrag = Array.from(selectedUnassignedIds);
      } else {
        idsToDrag = [vehicle.id];
        // Auto-select the dragged item if it wasn't selected
        setSelectedUnassignedIds(new Set([vehicle.id])); 
      }
    } else {
      if (selectedAssignedIds.has(vehicle.id)) {
        idsToDrag = Array.from(selectedAssignedIds);
      } else {
        idsToDrag = [vehicle.id];
        setSelectedAssignedIds(new Set([vehicle.id]));
      }
    }

    e.dataTransfer.setData('application/json', JSON.stringify({ source, ids: idsToDrag }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image if needed, or rely on browser default
  };

  // Drag over Group Tree Item
  const handleDragOverGroup = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't highlight if dragging over the current group of the assigned items
    // But since we can't easily parse dataTransfer here in all browsers safely without dropping, 
    // we just allow visual feedback everywhere for simplicity, logic checks on drop.
    setDragOverGroupId(groupId);
    setIsDragOverUnassigned(false);
  };

  const handleDropOnGroup = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroupId(null);

    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const { source, ids } = JSON.parse(dataStr);
      const idsSet = new Set(ids);

      // Prevent dropping assigned vehicles onto their own current group
      if (source === 'ASSIGNED' && targetGroupId === selectedGroupId) return;

      setVehicles(prev => prev.map(v => {
        if (idsSet.has(v.id)) {
          return { ...v, groupId: targetGroupId };
        }
        return v;
      }));

      // Clear selection after successful move
      if (source === 'UNASSIGNED') setSelectedUnassignedIds(new Set());
      if (source === 'ASSIGNED') setSelectedAssignedIds(new Set());

    } catch (err) {
      console.error("Drop error", err);
    }
  };

  // Drag over Unassigned Area
  const handleDragOverUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUnassigned(true);
    setDragOverGroupId(null);
  };

  const handleDropOnUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUnassigned(false);

    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const { source, ids } = JSON.parse(dataStr);
      // Only allow 'ASSIGNED' vehicles to be dropped here (Removal)
      if (source !== 'ASSIGNED') return;

      const idsSet = new Set(ids);

      setVehicles(prev => prev.map(v => {
        if (idsSet.has(v.id)) {
          return { ...v, groupId: null };
        }
        return v;
      }));

      setSelectedAssignedIds(new Set());
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  // --- Renderers ---

  const renderTreeItem = (node: any, level: number = 0) => {
    const isExpanded = expandedGroupIds.has(node.id);
    const isSelected = selectedGroupId === node.id;
    const isEditing = editingGroupId === node.id;
    const isDragOver = dragOverGroupId === node.id;

    return (
      <div key={node.id}>
        <div 
          onClick={() => setSelectedGroupId(node.id)}
          onDoubleClick={(e) => { e.stopPropagation(); startRename(node); }}
          onDragOver={(e) => handleDragOverGroup(e, node.id)}
          onDrop={(e) => handleDropOnGroup(e, node.id)}
          onDragLeave={() => setDragOverGroupId(null)}
          className={`
            flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md transition-all group border
            ${isSelected ? 'bg-blue-100 text-blue-800 border-blue-100' : 'hover:bg-slate-100 text-slate-700 border-transparent'}
            ${isDragOver ? '!bg-blue-50 !border-blue-500 !text-blue-900 shadow-inner scale-[1.01]' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="flex items-center flex-1 overflow-hidden pointer-events-none"> 
            {/* pointer-events-none on children helps dragover consistency */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id, e); }}
              className="p-0.5 hover:bg-black/5 rounded mr-1 pointer-events-auto"
            >
              {node.children.length > 0 ? (
                isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : <div className="w-4 h-4" />}
            </button>
            
            {isEditing ? (
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveRename}
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                autoFocus
                className="w-full px-1 py-0.5 text-sm border border-blue-400 rounded focus:outline-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center truncate">
                {isExpanded ? <FolderOpen className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-600' : 'text-amber-500'}`} /> : <Folder className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-600' : 'text-amber-500'}`} />}
                <span className="text-sm font-medium truncate">{node.name}</span>
                <span className="ml-2 text-xs text-slate-400">({vehicles.filter(v => v.groupId === node.id).length})</span>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
               <button onClick={(e) => { e.stopPropagation(); openCreateGroupModal(node.id); }} title="新建子车组" className="p-1 hover:bg-blue-200 rounded text-blue-600">
                 <Plus className="w-3.5 h-3.5" />
               </button>
               <button onClick={(e) => handleDeleteGroup(node.id, e)} title="删除车组" className="p-1 hover:bg-red-200 rounded text-red-600 ml-1">
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          )}
        </div>
        
        {isExpanded && node.children.map((child: any) => renderTreeItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT COLUMN: Unassigned Vehicles (Drop Target for Removal) */}
      <div 
        className={`w-full md:w-1/4 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden transition-colors ${isDragOverUnassigned ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
        onDragOver={handleDragOverUnassigned}
        onDrop={handleDropOnUnassigned}
        onDragLeave={() => setIsDragOverUnassigned(false)}
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <Car className="w-4 h-4 mr-2 text-slate-500" />
            待分配车辆
          </h3>
          <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">{unassignedVehicles.length}</span>
        </div>
        
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索车牌..." 
              value={searchUnassigned}
              onChange={(e) => setSearchUnassigned(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-white/50 relative">
          {isDragOverUnassigned && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 z-10 pointer-events-none">
              <div className="text-red-500 font-medium flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                释放移出车组
              </div>
            </div>
          )}

          {unassignedVehicles.map(v => (
            <div 
              key={v.id}
              draggable
              onDragStart={(e) => handleDragStart(e, v, 'UNASSIGNED')}
              onClick={() => {
                const newSet = new Set(selectedUnassignedIds);
                if (newSet.has(v.id)) newSet.delete(v.id); else newSet.add(v.id);
                setSelectedUnassignedIds(newSet);
              }}
              className={`flex items-center p-2 rounded-lg mb-1 cursor-pointer border select-none group ${selectedUnassignedIds.has(v.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:bg-slate-50'}`}
            >
              <GripVertical className="w-4 h-4 text-slate-300 mr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center shrink-0 ${selectedUnassignedIds.has(v.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                {selectedUnassignedIds.has(v.id) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{v.plateNumber}</div>
                <div className="text-xs text-slate-400">{v.status === VehicleStatus.AUTHORIZED ? '已授权' : '未授权'}</div>
              </div>
            </div>
          ))}
          {unassignedVehicles.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">暂无车辆</div>}
        </div>
      </div>

      {/* RIGHT AREA: Group Management & Assigned Vehicles */}
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        
        {/* CENTER COLUMN: Group Tree (Drop Target for Allocation & Transfer) */}
        <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Users className="w-4 h-4 mr-2 text-slate-500" />
              车组架构
            </h3>
            <button onClick={() => openCreateGroupModal(null)} className="p-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors" title="新建根车组">
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 select-none">
            {groupStructure.length > 0 ? groupStructure.map(node => renderTreeItem(node)) : (
              <div className="text-center py-10 text-slate-400">
                <p>暂无车组</p>
                <button onClick={() => openCreateGroupModal(null)} className="mt-2 text-sm text-blue-600 hover:underline">点击创建</button>
              </div>
            )}
          </div>
          
          {selectedGroupId && (
             <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
               提示：拖拽车辆到上方车组可进行分配或调拨
             </div>
          )}
        </div>

        {/* RIGHT COLUMN: Selected Group Content */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {selectedGroupId ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <div className="flex items-center">
                    <h3 className="font-bold text-slate-800 text-lg mr-2">
                      {groups.find(g => g.id === selectedGroupId)?.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {assignedVehicles.length} 辆车
                    </span>
                 </div>
                 
                 <div className="flex space-x-2">
                    {selectedAssignedIds.size > 0 && (
                      <>
                        <button 
                          onClick={() => setShowTransferModal(true)}
                          className="flex items-center px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-medium rounded hover:bg-amber-50"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                          转移
                        </button>
                        <button 
                          onClick={handleRemoveFromGroup}
                          className="flex items-center px-3 py-1.5 bg-white border border-red-200 text-red-700 text-xs font-medium rounded hover:bg-red-50"
                        >
                          <ArrowRight className="w-3.5 h-3.5 mr-1 rotate-180" />
                          移出
                        </button>
                      </>
                    )}
                 </div>
              </div>

              {/* Allocation Action Bar */}
              {selectedUnassignedIds.size > 0 && (
                <div className="bg-blue-50 p-3 flex justify-between items-center border-b border-blue-100 animate-fade-in">
                  <span className="text-sm text-blue-800">
                    已选 {selectedUnassignedIds.size} 辆待分配车辆
                  </span>
                  <button 
                    onClick={handleAllocate}
                    className="flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    加入当前车组
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-0">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 bg-opacity-95 backdrop-blur">
                      <tr>
                        <th className="w-10 px-4 py-3"></th>
                        <th className="px-4 py-3 w-10">
                          <input type="checkbox" 
                            checked={assignedVehicles.length > 0 && selectedAssignedIds.size === assignedVehicles.length}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedAssignedIds(new Set(assignedVehicles.map(v => v.id)));
                              else setSelectedAssignedIds(new Set());
                            }}
                            className="rounded border-slate-300"
                          />
                        </th>
                        <th className="px-4 py-3">车牌号</th>
                        <th className="px-4 py-3">VIN</th>
                        <th className="px-4 py-3">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignedVehicles.map(v => (
                        <tr 
                          key={v.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, v, 'ASSIGNED')}
                          className="hover:bg-slate-50 group cursor-default"
                        >
                          <td className="px-4 py-3 text-center">
                            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
                          </td>
                          <td className="px-4 py-3">
                             <input type="checkbox" 
                               checked={selectedAssignedIds.has(v.id)}
                               onChange={() => {
                                 const newSet = new Set(selectedAssignedIds);
                                 if (newSet.has(v.id)) newSet.delete(v.id); else newSet.add(v.id);
                                 setSelectedAssignedIds(newSet);
                               }}
                               className="rounded border-slate-300"
                             />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{v.plateNumber}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.vin}</td>
                          <td className="px-4 py-3 text-xs">{v.status}</td>
                        </tr>
                      ))}
                      {assignedVehicles.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">该车组下暂无车辆</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <Users className="w-12 h-12 mb-3 text-slate-300" />
              <p>请在左侧选择一个车组以管理车辆</p>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-slate-800 mb-4">批量转移车辆</h3>
            <p className="text-sm text-slate-600 mb-4">将选中的 {selectedAssignedIds.size} 辆车转移到：</p>
            
            <div className="mb-6 max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
               {groups.filter(g => g.id !== selectedGroupId).map(g => (
                 <div 
                   key={g.id}
                   onClick={() => setTransferTargetGroupId(g.id)}
                   className={`px-4 py-3 cursor-pointer text-sm flex items-center ${transferTargetGroupId === g.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}
                 >
                   <Folder className="w-4 h-4 mr-2 text-slate-400" />
                   {g.name}
                 </div>
               ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button 
                disabled={!transferTargetGroupId}
                onClick={handleTransferToGroup} 
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                确认转移
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 animate-fade-in-up">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {createGroupParentId ? '新建子车组' : '新建根车组'}
                </h3>
                <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                   <X className="w-5 h-5" />
                </button>
             </div>
             
             {createGroupParentId && (
               <div className="mb-4 text-sm text-slate-500 flex items-center">
                 <span className="mr-2">父级车组:</span>
                 <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                   {groups.find(g => g.id === createGroupParentId)?.name}
                 </span>
               </div>
             )}

             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-2">车组名称</label>
               <input 
                 type="text" 
                 value={newGroupName}
                 onChange={(e) => setNewGroupName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleCreateGroupConfirm()}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 placeholder="输入车组名称"
                 autoFocus
               />
             </div>

             <div className="flex justify-end space-x-3">
                <button onClick={() => setShowCreateGroupModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
                <button 
                  onClick={handleCreateGroupConfirm} 
                  disabled={!newGroupName.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  创建
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
