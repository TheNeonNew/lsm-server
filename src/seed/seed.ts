import db from "../db/database.ts";
import * as logService from "../services/logService.ts";
import { createUser } from "../services/userService.ts";
import type { Equipment } from "../models/equipment.ts";
import type { ComponentModel } from "../models/component.ts";
import type { Maintenance } from "../models/maintenance.ts";
import type { User } from "../models/user.ts";

export interface SeedImportPayload {
  equipment?: Array<Partial<Equipment> & { id?: number }>;
  components?: Array<Partial<ComponentModel> & { id?: number }>;
  maintenance?: Array<Partial<Maintenance> & { id?: number }>;
  users?: Array<Partial<Omit<User, "id">> & { id?: number; password?: string }>;
}

export interface SeedExportResult {
  equipment: Equipment[];
  components: ComponentModel[];
  maintenance: Maintenance[];
  users: Array<User & { password: string }>;
}

function normalizeEquipment(row: any): Equipment {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    inventoryNumber: String(row.inventoryNumber || ""),
    name: String(row.name || ""),
    commissioningDate: String(row.commissioningDate || ""),
    lastMaintenanceDate: String(row.lastMaintenanceDate || ""),
    nextMaintenanceDate: String(row.nextMaintenanceDate || ""),
    maintenanceHours: Number(row.maintenanceHours ?? 0),
    maintenanceNotes: String(row.maintenanceNotes || ""),
    maintenancePeriod: Number(row.maintenancePeriod ?? 0),
    status: String(row.status || ""),
  };
}

function normalizeComponent(row: any): ComponentModel {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    name: String(row.name || ""),
    equipmentId: Number(row.equipmentId ?? 0),
    lifespanDays: Number(row.lifespanDays ?? 0),
    quantityOnStock: Number(row.quantityOnStock ?? 0),
    purchaseDate: String(row.purchaseDate || ""),
    lastReplacementDate: String(row.lastReplacementDate || ""),
  };
}

function normalizeMaintenance(row: any): Maintenance {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    equipmentId: Number(row.equipmentId ?? 0),
    date: String(row.date || ""),
    type: String(row.type || ""),
    workPerformed: String(row.workPerformed || ""),
    performedBy: String(row.performedBy || ""),
    checkedBy: String(row.checkedBy || ""),
    hoursSpent: Number(row.hoursSpent ?? 0),
    notes: row.notes == null ? null : String(row.notes),
  };
}

function normalizeUser(row: any): User & { password: string } {
  return {
    id: Number(row.id ?? row.Id ?? row.rowid),
    name: String(row.name || ""),
    surname: String(row.surname || ""),
    patronymic: String(row.patronymic || ""),
    email: String(row.email || ""),
    position: String(row.position || ""),
    password: String(row.password || ""),
  };
}

export async function clearAllData(): Promise<void> {
  db.exec(`
    DELETE FROM Maintenance;
    DELETE FROM Component;
    DELETE FROM Equipment;
    DELETE FROM User;
    DELETE FROM sqlite_sequence WHERE name IN ('Maintenance', 'Component', 'Equipment', 'User');
  `);

  logService.recordServiceOperation(
    "clear",
    "Database",
    null,
    "Cleared all tables and reset primary key sequences."
  );
}

export async function seedTestData(): Promise<SeedExportResult> {
  await clearAllData();

  const equipmentSample: Array<Partial<Equipment>> = [
    {
      inventoryNumber: "ИСП-2025-001",
      name: "Supec 7000 Inductively Coupled Plasma - Mass Spectrometer (ICP-MC)",
      commissioningDate: "2024-03-15",
      lastMaintenanceDate: "2025-01-10",
      nextMaintenanceDate: "2025-04-10",
      maintenanceHours: 8,
      maintenancePeriod: 3,
      maintenanceNotes: "Требуется регулярная калибровка и проверка вакуумной системы",
      status: "Активный",
    },
    {
      inventoryNumber: "ИБП-2025-002",
      name: "Источник бесперебойного питания Эксперт-10000",
      commissioningDate: "2024-02-20",
      lastMaintenanceDate: "2025-02-20",
      nextMaintenanceDate: "2025-08-20",
      maintenanceHours: 2,
      maintenancePeriod: 6,
      maintenanceNotes: "Проверка батарей и электроники",
      status: "Активный",
    },
    {
      inventoryNumber: "РЦ-2025-003",
      name: "Рециркулятор CW-200",
      commissioningDate: "2024-01-15",
      lastMaintenanceDate: "2025-01-15",
      nextMaintenanceDate: "2025-04-15",
      maintenanceHours: 1,
      maintenancePeriod: 3,
      maintenanceNotes: "Замена ламп и фильтров",
      status: "Активный",
    },
    {
      inventoryNumber: "ТМН-2025-004",
      name: "Турбомолекулярный насос Leybol Sogevac SV40 B / B1",
      commissioningDate: "2023-11-10",
      lastMaintenanceDate: "2025-02-10",
      nextMaintenanceDate: "2025-05-10",
      maintenanceHours: 4,
      maintenancePeriod: 3,
      maintenanceNotes: "Замена масла Leybonol Special Synthenic LVO 700",
      status: "Активный",
    },
    {
      inventoryNumber: "МФ-2025-005",
      name: "Магистральные фильтры на основной водопровод",
      commissioningDate: "2024-01-25",
      lastMaintenanceDate: "2025-01-25",
      nextMaintenanceDate: "2025-04-25",
      maintenanceHours: 2,
      maintenancePeriod: 3,
      maintenanceNotes: "Замена картриджей фильтров",
      status: "Активный",
    },
    {
      inventoryNumber: "БД-2025-006",
      name: "Бидистиллятор Ливам БЭ-12",
      commissioningDate: "2023-12-05",
      lastMaintenanceDate: "2025-03-05",
      nextMaintenanceDate: "2025-06-05",
      maintenanceHours: 3,
      maintenancePeriod: 3,
      maintenanceNotes: "Очистка от накипи, проверка нагревательных элементов",
      status: "Активный",
    },
    {
      inventoryNumber: "СВ-2025-007",
      name: "Лабораторная система получения сверхчистой воды Hydrurus Ultra Fljw Pro",
      commissioningDate: "2024-02-15",
      lastMaintenanceDate: "2025-02-15",
      nextMaintenanceDate: "2025-05-15",
      maintenanceHours: 4,
      maintenancePeriod: 3,
      maintenanceNotes: "Замена фильтров и мембран",
      status: "Активный",
    },
    {
      inventoryNumber: "ПВ-2025-008",
      name: "Приточная вентиляция Tion Breezer 4S",
      commissioningDate: "2023-10-20",
      lastMaintenanceDate: "2025-01-20",
      nextMaintenanceDate: "2025-04-20",
      maintenanceHours: 2,
      maintenancePeriod: 3,
      maintenanceNotes: "Очистка фильтров, проверка электроники",
      status: "Активный",
    },
    {
      inventoryNumber: "ВА-2025-009",
      name: "Весы аналитические Bell Engineering",
      commissioningDate: "2024-01-10",
      lastMaintenanceDate: "2025-01-10",
      nextMaintenanceDate: "2025-07-10",
      maintenanceHours: 2,
      maintenancePeriod: 6,
      maintenanceNotes: "Калибровка, проверка точности",
      status: "Активный",
    },
    {
      inventoryNumber: "ВУ-2025-010",
      name: "Ванна ультразвуковая Stegler",
      commissioningDate: "2023-11-15",
      lastMaintenanceDate: "2025-02-15",
      nextMaintenanceDate: "2025-08-15",
      maintenanceHours: 1,
      maintenancePeriod: 6,
      maintenanceNotes: "Проверка генератора ультразвука",
      status: "Активный",
    },
    {
      inventoryNumber: "ММ-2025-011",
      name: "Магнитные мешалки Dlab MS-T- S 15",
      commissioningDate: "2024-02-01",
      lastMaintenanceDate: "2025-02-01",
      nextMaintenanceDate: "2025-08-01",
      maintenanceHours: 1,
      maintenancePeriod: 6,
      maintenanceNotes: "Проверка магнитной системы и электроники",
      status: "Активный",
    },
    {
      inventoryNumber: "МП-2025-012",
      name: "Муфельная печь Loip LF-15/13, G2",
      commissioningDate: "2023-09-10",
      lastMaintenanceDate: "2025-03-10",
      nextMaintenanceDate: "2025-09-10",
      maintenanceHours: 3,
      maintenancePeriod: 6,
      maintenanceNotes: "Проверка нагревательных элементов и термопар",
      status: "Активный",
    },
    {
      inventoryNumber: "АОК-2025-013",
      name: "Аппарат для очистки кислот, Госметр",
      commissioningDate: "2024-01-30",
      lastMaintenanceDate: "2025-01-30",
      nextMaintenanceDate: "2025-04-30",
      maintenanceHours: 4,
      maintenancePeriod: 3,
      maintenanceNotes: "Проверка системы дистилляции, замена уплотнений",
      status: "Активный",
    },
  ];

  const maintenanceSample: Array<Partial<Maintenance>> = [
    {
      equipmentId: 1,
      date: "2025-01-10",
      type: "Плановое обслуживание",
      workPerformed: "Калибровка масс-спектрометра, проверка вакуумной системы",
      performedBy: "Иванов И.И., инженер",
      checkedBy: "Петров П.П., старший инженер",
      hoursSpent: 8,
      notes: "Система работает в штатном режиме",
    },
    {
      equipmentId: 4,
      date: "2025-02-10",
      type: "Замена расходных материалов",
      workPerformed: "Замена масла в турбомолекулярном насосе",
      performedBy: "Сидоров С.С., техник",
      checkedBy: "Иванов И.И., инженер",
      hoursSpent: 4,
      notes: "Насос работает стабильно после замены масла",
    },
    {
      equipmentId: 6,
      date: "2025-03-05",
      type: "Техническое обслуживание",
      workPerformed: "Очистка от накипи, замена нагревательного элемента",
      performedBy: "Николаев Н.Н., лаборант",
      checkedBy: "Сидоров С.С., техник",
      hoursSpent: 3,
      notes: "Бидистиллятор работает с полной производительностью",
    },
    {
      equipmentId: 12,
      date: "2025-03-10",
      type: "Калибровка",
      workPerformed: "Калибровка температурного режима, замена термопары",
      performedBy: "Сидоров С.С., техник",
      checkedBy: "Петров П.П., старший инженер",
      hoursSpent: 3,
      notes: "Печь откалибрована, точность температуры в пределах нормы",
    },
  ];

  const componentsSample: Array<Partial<ComponentModel>> = [
    {
      name: "Масло Leybonol Special Synthenic LVO 700",
      equipmentId: 4,
      lifespanDays: 90,
      quantityOnStock: 5,
      purchaseDate: "2025-01-15",
      lastReplacementDate: "2025-02-10",
    },
    {
      name: "Фильтр для магистрального водопровода",
      equipmentId: 5,
      lifespanDays: 90,
      quantityOnStock: 6,
      purchaseDate: "2025-01-10",
      lastReplacementDate: "2025-01-25",
    },
    {
      name: "Нагревательный элемент для бидистиллятора",
      equipmentId: 6,
      lifespanDays: 365,
      quantityOnStock: 2,
      purchaseDate: "2024-11-20",
      lastReplacementDate: "2025-03-05",
    },
    {
      name: "Мембрана для системы очистки воды",
      equipmentId: 7,
      lifespanDays: 180,
      quantityOnStock: 3,
      purchaseDate: "2025-01-05",
      lastReplacementDate: "2025-02-15",
    },
    {
      name: "HEPA фильтр для Tion Breezer 4S",
      equipmentId: 8,
      lifespanDays: 90,
      quantityOnStock: 4,
      purchaseDate: "2025-01-10",
      lastReplacementDate: "2025-01-20",
    },
    {
      name: "Калибровочные гири для весов",
      equipmentId: 9,
      lifespanDays: 730,
      quantityOnStock: 1,
      purchaseDate: "2024-06-15",
      lastReplacementDate: "2025-01-10",
    },
    {
      name: "Магнитный якорь для мешалки",
      equipmentId: 11,
      lifespanDays: 365,
      quantityOnStock: 8,
      purchaseDate: "2024-12-10",
      lastReplacementDate: "2025-02-01",
    },
    {
      name: "Термопара для муфельной печи",
      equipmentId: 12,
      lifespanDays: 730,
      quantityOnStock: 2,
      purchaseDate: "2024-08-15",
      lastReplacementDate: "2025-03-10",
    },
    {
      name: "Уплотнения для аппарата очистки кислот",
      equipmentId: 13,
      lifespanDays: 180,
      quantityOnStock: 10,
      purchaseDate: "2025-01-15",
      lastReplacementDate: "2025-01-30",
    },
    {
      name: "Лампа для рециркулятора CW-200",
      equipmentId: 3,
      lifespanDays: 180,
      quantityOnStock: 4,
      purchaseDate: "2024-12-20",
      lastReplacementDate: "2025-01-15",
    },
  ];

  equipmentSample.forEach(insertEquipment);
  maintenanceSample.forEach(insertMaintenance);
  componentsSample.forEach(insertComponent);

  await createUser({
    name: "Иван",
    surname: "Иванов",
    patronymic: "Иванович",
    email: "ivan@example.com",
    password: "password123",
    position: "Инженер",
  });

  const result = await exportData();

  logService.recordServiceOperation(
    "seed",
    "Database",
    null,
    `Seeded test data: ${result.equipment.length} equipment, ${result.components.length} components, ${result.maintenance.length} maintenance records, ${result.users.length} users.`
  );

  return result;
}

export async function exportData(): Promise<SeedExportResult> {
  const equipmentRows = db
    .query(
      `SELECT
         rowid AS id,
         InventoryNumber AS inventoryNumber,
         Name AS name,
         CommissioningDate AS commissioningDate,
         LastMaintenanceDate AS lastMaintenanceDate,
         NextMaintenanceDate AS nextMaintenanceDate,
         MaintenanceHours AS maintenanceHours,
         MaintenanceNotes AS maintenanceNotes,
         MaintenancePeriod AS maintenancePeriod,
         Status AS status
       FROM Equipment
       ORDER BY rowid`
    )
    .all();

  const componentRows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         EquipmentId AS equipmentId,
         LifeSpanInDays AS lifespanDays,
         QuantityOnStock AS quantityOnStock,
         PurchaseDate AS purchaseDate,
         LastReplacementDate AS lastReplacementDate
       FROM Component
       ORDER BY rowid`
    )
    .all();

  const maintenanceRows = db
    .query(
      `SELECT
         rowid AS id,
         EquipmentId AS equipmentId,
         MaintenanceDate AS date,
         MaintenanceType AS type,
         PerfomedWork AS workPerformed,
         PerfomedBy AS performedBy,
         CheckedBy AS checkedBy,
         SpentHoursTotal AS hoursSpent,
         Notes AS notes
       FROM Maintenance
       ORDER BY rowid`
    )
    .all();

  const userRows = db
    .query(
      `SELECT
         rowid AS id,
         Name AS name,
         Surname AS surname,
         Patronymic AS patronymic,
         Email AS email,
         Position AS position,
         Password AS password
       FROM User
       ORDER BY rowid`
    )
    .all();

  return {
    equipment: equipmentRows.map(normalizeEquipment),
    components: componentRows.map(normalizeComponent),
    maintenance: maintenanceRows.map(normalizeMaintenance),
    users: userRows.map(normalizeUser),
  };
}

function insertEquipment(item: Partial<Equipment> & { id?: number }) {
  if (item.id != null) {
    db.query(
      `INSERT INTO Equipment (Id, InventoryNumber, Name, CommissioningDate, LastMaintenanceDate, NextMaintenanceDate, MaintenanceHours, MaintenanceNotes, MaintenancePeriod, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.id,
      item.inventoryNumber ?? "",
      item.name ?? "",
      item.commissioningDate ?? "",
      item.lastMaintenanceDate ?? "",
      item.nextMaintenanceDate ?? "",
      item.maintenanceHours ?? 0,
      item.maintenanceNotes ?? "",
      item.maintenancePeriod ?? 0,
      item.status ?? ""
    );
  } else {
    db.query(
      `INSERT INTO Equipment (InventoryNumber, Name, CommissioningDate, LastMaintenanceDate, NextMaintenanceDate, MaintenanceHours, MaintenanceNotes, MaintenancePeriod, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.inventoryNumber ?? "",
      item.name ?? "",
      item.commissioningDate ?? "",
      item.lastMaintenanceDate ?? "",
      item.nextMaintenanceDate ?? "",
      item.maintenanceHours ?? 0,
      item.maintenanceNotes ?? "",
      item.maintenancePeriod ?? 0,
      item.status ?? ""
    );
  }
}

function insertComponent(item: Partial<ComponentModel> & { id?: number }) {
  if (item.id != null) {
    db.query(
      `INSERT INTO Component (Id, Name, EquipmentId, LifeSpanInDays, QuantityOnStock, PurchaseDate, LastReplacementDate) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.id,
      item.name ?? "",
      item.equipmentId ?? 0,
      item.lifespanDays ?? 0,
      item.quantityOnStock ?? 0,
      item.purchaseDate ?? "",
      item.lastReplacementDate ?? ""
    );
  } else {
    db.query(
      `INSERT INTO Component (Name, EquipmentId, LifeSpanInDays, QuantityOnStock, PurchaseDate, LastReplacementDate) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      item.name ?? "",
      item.equipmentId ?? 0,
      item.lifespanDays ?? 0,
      item.quantityOnStock ?? 0,
      item.purchaseDate ?? "",
      item.lastReplacementDate ?? ""
    );
  }
}

function insertMaintenance(item: Partial<Maintenance> & { id?: number }) {
  if (item.id != null) {
    db.query(
      `INSERT INTO Maintenance (Id, EquipmentId, MaintenanceDate, MaintenanceType, PerfomedWork, PerfomedBy, CheckedBy, SpentHoursTotal, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.id,
      item.equipmentId ?? 0,
      item.date ?? "",
      item.type ?? "",
      item.workPerformed ?? "",
      item.performedBy ?? "",
      item.checkedBy ?? "",
      item.hoursSpent ?? 0,
      item.notes ?? null
    );
  } else {
    db.query(
      `INSERT INTO Maintenance (EquipmentId, MaintenanceDate, MaintenanceType, PerfomedWork, PerfomedBy, CheckedBy, SpentHoursTotal, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.equipmentId ?? 0,
      item.date ?? "",
      item.type ?? "",
      item.workPerformed ?? "",
      item.performedBy ?? "",
      item.checkedBy ?? "",
      item.hoursSpent ?? 0,
      item.notes ?? null
    );
  }
}

function insertUser(item: Partial<Omit<User, "id">> & { id?: number; password?: string }) {
  if (item.id != null) {
    db.query(
      `INSERT INTO User (Id, Name, Surname, Patronymic, Email, Password, Position) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.id,
      item.name ?? "",
      item.surname ?? "",
      item.patronymic ?? "",
      item.email ?? "",
      item.password ?? "",
      item.position ?? ""
    );
  } else {
    db.query(
      `INSERT INTO User (Name, Surname, Patronymic, Email, Password, Position) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      item.name ?? "",
      item.surname ?? "",
      item.patronymic ?? "",
      item.email ?? "",
      item.password ?? "",
      item.position ?? ""
    );
  }
}

export async function importData(payload: SeedImportPayload): Promise<SeedExportResult> {
  db.exec("BEGIN;");
  await clearAllData();

  if (payload.equipment) {
    payload.equipment.forEach(insertEquipment);
  }

  if (payload.components) {
    payload.components.forEach(insertComponent);
  }

  if (payload.maintenance) {
    payload.maintenance.forEach(insertMaintenance);
  }

  if (payload.users) {
    payload.users.forEach(insertUser);
  }

  db.exec("COMMIT;");

  const result = await exportData();
  logService.recordServiceOperation(
    "import",
    "Database",
    null,
    `Imported test payload: ${payload.equipment?.length ?? 0} equipment, ${payload.components?.length ?? 0} components, ${payload.maintenance?.length ?? 0} maintenance, ${payload.users?.length ?? 0} users.`
  );

  return result;
}
