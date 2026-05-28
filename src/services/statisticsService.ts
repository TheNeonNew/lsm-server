import db from "../db/database.ts";

export interface EquipmentStatistics {
  total: number;
  active: number;
  inactive: number;
  maintenance_overdue: number;
  maintenance_due_soon: number;
}

export interface ComponentStatistics {
  total: number;
  replacement_needed: number;
  in_stock_count: number;
}

export interface MaintenanceStatistics {
  total_hours: number;
  average_hours: number;
  total_records: number;
  by_type: Record<string, number>;
}

export interface ChartData {
  label: string;
  value: number;
  percentage: number;
}

export interface StatisticsResponse {
  equipment: EquipmentStatistics;
  components: ComponentStatistics;
  maintenance: MaintenanceStatistics;
  equipment_status_chart: ChartData[];
  maintenance_distribution: ChartData[];
  component_health: ChartData[];
}

export async function getStatistics(): Promise<StatisticsResponse> {
  const now = new Date();

  // Equipment Statistics
  const equipmentRows = db
    .query(
      `SELECT
         rowid AS id,
         Status AS status,
         NextMaintenanceDate AS nextMaintenanceDate
       FROM Equipment`
    )
    .all();

  const totalEquipment = equipmentRows.length;
  const activeEquipment = equipmentRows.filter((e: any) => e.status === "Активный").length;
  const inactiveEquipment = totalEquipment - activeEquipment;
  
  let maintenanceOverdue = 0;
  let maintenanceDueSoon = 0;
  
  equipmentRows.forEach((e: any) => {
    const nextDate = new Date(e.nextMaintenanceDate);
    const daysUntil = Math.ceil((nextDate.valueOf() - now.valueOf()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) {
      maintenanceOverdue++;
    } else if (daysUntil <= 30) {
      maintenanceDueSoon++;
    }
  });

  // Component Statistics
  const componentRows = db
    .query(
      `SELECT
         rowid AS id,
         QuantityOnStock AS quantityOnStock,
         LifeSpanInDays AS lifespanDays,
         LastReplacementDate AS lastReplacementDate
       FROM Component`
    )
    .all();

  const totalComponents = componentRows.length;
  let replacementNeeded = 0;
  let inStockSum = 0;

  componentRows.forEach((c: any) => {
    const quantityOnStock = Number(c.quantityOnStock ?? 0);
    inStockSum += quantityOnStock;
    
    const lastReplacementDate = new Date(c.lastReplacementDate);
    const lifespanDays = Number(c.lifespanDays ?? 0);
    const dueDate = new Date(lastReplacementDate);
    dueDate.setDate(dueDate.getDate() + lifespanDays);
    
    if (dueDate <= now) {
      replacementNeeded++;
    }
  });

  // Maintenance Statistics
  const maintenanceRows = db
    .query(
      `SELECT
         SpentHoursTotal AS hoursSpent,
         MaintenanceType AS type
       FROM Maintenance`
    )
    .all();

  let totalHours = 0;
  const typeMap: Record<string, number> = {};

  maintenanceRows.forEach((m: any) => {
    const hours = Number(m.hoursSpent ?? 0);
    totalHours += hours;
    const type = String(m.type || "Прочее");
    typeMap[type] = (typeMap[type] ?? 0) + 1;
  });

  const averageHours = maintenanceRows.length > 0 ? totalHours / maintenanceRows.length : 0;

  // Chart Data
  const equipmentStatusChart: ChartData[] = [
    {
      label: "Активное",
      value: activeEquipment,
      percentage: totalEquipment > 0 ? Math.round((activeEquipment / totalEquipment) * 100) : 0,
    },
    {
      label: "Неактивное",
      value: inactiveEquipment,
      percentage: totalEquipment > 0 ? Math.round((inactiveEquipment / totalEquipment) * 100) : 0,
    },
  ];

  const maintenanceDistribution: ChartData[] = Object.entries(typeMap).map(([type, count]) => ({
    label: type,
    value: count,
    percentage: maintenanceRows.length > 0 ? Math.round((count / maintenanceRows.length) * 100) : 0,
  }));

  const componentHealth: ChartData[] = [
    {
      label: "В наличии",
      value: Math.max(totalComponents - replacementNeeded, 0),
      percentage: totalComponents > 0 ? Math.round(((totalComponents - replacementNeeded) / totalComponents) * 100) : 0,
    },
    {
      label: "Нужна замена",
      value: replacementNeeded,
      percentage: totalComponents > 0 ? Math.round((replacementNeeded / totalComponents) * 100) : 0,
    },
  ];

  return {
    equipment: {
      total: totalEquipment,
      active: activeEquipment,
      inactive: inactiveEquipment,
      maintenance_overdue: maintenanceOverdue,
      maintenance_due_soon: maintenanceDueSoon,
    },
    components: {
      total: totalComponents,
      replacement_needed: replacementNeeded,
      in_stock_count: inStockSum,
    },
    maintenance: {
      total_hours: totalHours,
      average_hours: Math.round(averageHours * 10) / 10,
      total_records: maintenanceRows.length,
      by_type: typeMap,
    },
    equipment_status_chart: equipmentStatusChart,
    maintenance_distribution: maintenanceDistribution,
    component_health: componentHealth,
  };
}
