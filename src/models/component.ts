export interface ComponentModel {
  id: number;
  name: string;
  equipmentId: number;
  lifespanDays: number;
  quantityOnStock: number;
  purchaseDate: string;
  lastReplacementDate: string;
}

export interface CreateComponentDto extends Omit<ComponentModel, "id"> {}
export interface UpdateComponentDto extends Partial<CreateComponentDto> {}
