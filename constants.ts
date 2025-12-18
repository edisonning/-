
import { Equipment, EquipmentStatus, ServiceProvider, Vehicle, VehicleStatus, VehicleGroup, TerminalModel } from "./types";

export const MOCK_PROVIDERS: ServiceProvider[] = [
  { id: 'sp_1', name: '阿尔法技术服务', region: '北部大区' },
  { id: 'sp_2', name: '贝塔解决方案', region: '南部大区' },
  { id: 'sp_3', name: '伽马现场作业', region: '东部大区' },
  { id: 'sp_4', name: '德尔塔维护', region: '西部大区' },
];

export const MOCK_GROUPS: VehicleGroup[] = [
  { id: 'g_1', name: '第一车队', parentId: null },
  { id: 'g_2', name: '第二车队', parentId: null },
  { id: 'g_1_1', name: '危险品运输组', parentId: 'g_1' },
  { id: 'g_1_2', name: '普货运输组', parentId: 'g_1' },
];

export const INITIAL_MODELS: TerminalModel[] = [
  { id: 'm_1', name: 'BD-X100 型', createDate: '2023-10-12' },
  { id: 'm_2', name: 'BD-Pro-2000 型', createDate: '2023-11-05' },
  { id: 'm_3', name: 'BD-Lite-50 型', createDate: '2024-01-20' },
  { id: 'm_4', name: 'BD-Gen3-Ultra', createDate: '2024-03-15' },
];

const generateMockEquipment = (count: number): Equipment[] => {
  const equipments: Equipment[] = [];
  const manufacturers = ['北斗系统公司', '星网导航集团', '轨道装备科技'];
  const models = INITIAL_MODELS.map(m => m.name);

  for (let i = 0; i < count; i++) {
    const isAllocated = Math.random() > 0.4;
    const isInstalled = isAllocated && Math.random() > 0.5;
    
    let status = EquipmentStatus.AVAILABLE;
    let providerId: string | null = null;
    let installDate: string | undefined = undefined;

    if (isAllocated) {
      status = EquipmentStatus.ALLOCATED;
      providerId = MOCK_PROVIDERS[Math.floor(Math.random() * MOCK_PROVIDERS.length)].id;
      if (isInstalled) {
        status = EquipmentStatus.INSTALLED;
        installDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];
      }
    }

    equipments.push({
      id: `eq_${i + 1}`,
      serialNumber: `SN-${10000 + i}`,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      model: models[Math.floor(Math.random() * models.length)],
      batchNumber: `批次-${202400 + Math.floor(i / 20)}`,
      status,
      providerId,
      installDate,
    });
  }
  return equipments;
};

const generateMockVehicles = (count: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const platePrefixes = ['京', '津', '冀', '鲁'];
  
  for (let i = 0; i < count; i++) {
    const isAuthorized = Math.random() > 0.3;
    const isInstalled = isAuthorized && Math.random() > 0.5;

    let status = VehicleStatus.UNAUTHORIZED;
    let providerId: string | null = null;
    let boundEquipmentId: string | undefined = undefined;
    let groupId: string | null = null;

    if (isAuthorized) {
      status = VehicleStatus.AUTHORIZED;
      providerId = MOCK_PROVIDERS[Math.floor(Math.random() * MOCK_PROVIDERS.length)].id;
      if (isInstalled) {
        status = VehicleStatus.INSTALLED;
        boundEquipmentId = `eq_linked_${i}`;
      }
      
      // Randomly assign to a group if authorized
      if (Math.random() > 0.6) {
         const groups = ['g_1', 'g_2', 'g_1_1', 'g_1_2'];
         groupId = groups[Math.floor(Math.random() * groups.length)];
      }
    }

    const plate = `${platePrefixes[Math.floor(Math.random() * platePrefixes.length)]}B${Math.floor(1000 + Math.random() * 9000)}`;
    
    vehicles.push({
      id: `vh_${i + 1}`,
      plateNumber: plate,
      plateColor: Math.random() > 0.7 ? 'Yellow' : (Math.random() > 0.5 ? 'Blue' : 'Green'),
      vin: `L${Math.random().toString(36).substring(2, 10).toUpperCase()}1234${i}`,
      status,
      providerId,
      boundEquipmentId,
      groupId
    });
  }
  return vehicles;
};

export const INITIAL_EQUIPMENT = generateMockEquipment(50);
export const INITIAL_VEHICLES = generateMockVehicles(60);
