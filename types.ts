
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE', // In stock, not allocated
  ALLOCATED = 'ALLOCATED', // Assigned to a service provider
  INSTALLED = 'INSTALLED', // Installed by the service provider (Immutable for allocation)
}

export enum VehicleStatus {
  UNAUTHORIZED = 'UNAUTHORIZED', // Not authorized to any provider
  AUTHORIZED = 'AUTHORIZED',     // Authorized to a provider, no device bound
  INSTALLED = 'INSTALLED',       // Authorized AND device bound
}

export interface ServiceProvider {
  id: string;
  name: string;
  region: string;
}

export interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: EquipmentStatus;
  providerId: string | null; // null if AVAILABLE
  installDate?: string; // Present if INSTALLED
  batchNumber: string;
}

export interface VehicleGroup {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  plateColor: 'Yellow' | 'Blue' | 'Green';
  vin: string;
  status: VehicleStatus;
  providerId: string | null;
  boundEquipmentId?: string; // Linked equipment if INSTALLED
  groupId?: string | null; // New: Belonging to a vehicle group
}

export type ActionType = 'ALLOCATE' | 'RECLAIM' | 'TRANSFER';

export interface ActionModalProps {
  isOpen: boolean;
  type: ActionType | null;
  entityType: 'EQUIPMENT' | 'VEHICLE';
  selectedCount: number;
  providers: ServiceProvider[];
  onClose: () => void;
  onConfirm: (targetProviderId: string | null) => void;
  hasRiskWarning?: boolean; // New: For Vehicle unbinding warning
}

export interface Stats {
  total: number;
  stat1: number; // Generic names for flexibility (e.g., Available / Unauthorized)
  stat2: number; // e.g., Allocated / Authorized
  stat3: number; // e.g., Installed / Bound
}
