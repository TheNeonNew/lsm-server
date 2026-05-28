export interface Maintenance {
  id: number;
  equipmentId: number;
  date: string;
  type: string;
  workPerformed: string;
  performedBy: string;
  checkedBy: string;
  hoursSpent: number;
  notes: string | null;
}

export interface CreateMaintenanceDto extends Omit<Maintenance, "id"> {}
export interface UpdateMaintenanceDto extends Partial<CreateMaintenanceDto> {}
