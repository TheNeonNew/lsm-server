export interface Equipment {
  id: number;
  inventoryNumber: string;
  name: string;
  commissioningDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceHours: number;
  maintenanceNotes: string;
  maintenancePeriod: number;
  status: string;
}

export interface CreateEquipmentDto extends Omit<Equipment, "id"> {}
export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> {}
