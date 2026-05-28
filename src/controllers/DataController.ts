import type { Request, Response } from "express";
import { equipmentRepository } from "../repositories/EquipmentRepository.ts";
import { componentRepository } from "../repositories/ComponentRepository.ts";
import { maintenanceRepository } from "../repositories/MaintenanceRepository.ts";
import { serviceLogRepository } from "../repositories/ServiceLogRepository.ts";

export class EquipmentController {
  async getAll(req: Request, res: Response) {
    try {
      const equipment = equipmentRepository.getAll();
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipment = equipmentRepository.getById(id);
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found." });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { inventoryNumber, name, commissioningDate, lastMaintenanceDate, nextMaintenanceDate, maintenancePeriod, status } = req.body;

      if (!inventoryNumber || !name || !commissioningDate) {
        return res.status(400).json({ error: "Required fields are missing." });
      }

      const equipment = equipmentRepository.create({
        inventoryNumber,
        name,
        commissioningDate,
        lastMaintenanceDate: lastMaintenanceDate || "",
        nextMaintenanceDate: nextMaintenanceDate || "",
        maintenanceHours: 0,
        maintenanceNotes: "",
        maintenancePeriod: maintenancePeriod || 0,
        status: status || "Активный",
      });

      serviceLogRepository.create({
        action: "create",
        entity: "Equipment",
        entityId: equipment.id,
        details: `Equipment created: ${name}`,
      });

      res.status(201).json(equipment);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipment = equipmentRepository.getById(id);
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found." });
      }

      equipmentRepository.update(id, req.body);
      const updated = equipmentRepository.getById(id);

      serviceLogRepository.create({
        action: "update",
        entity: "Equipment",
        entityId: id,
        details: `Equipment updated`,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const equipment = equipmentRepository.getById(id);
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found." });
      }

      equipmentRepository.delete(id);

      serviceLogRepository.create({
        action: "delete",
        entity: "Equipment",
        entityId: id,
        details: `Equipment deleted`,
      });

      res.json({ message: "Equipment deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export class ComponentController {
  async getAll(req: Request, res: Response) {
    try {
      const components = componentRepository.getAll();
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const component = componentRepository.getById(id);
      if (!component) {
        return res.status(404).json({ error: "Component not found." });
      }
      res.json(component);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, equipmentId, lifespanDays, quantityOnStock, purchaseDate, lastReplacementDate } = req.body;

      if (!name || !equipmentId) {
        return res.status(400).json({ error: "Required fields are missing." });
      }

      const component = componentRepository.create({
        name,
        equipmentId,
        lifespanDays: lifespanDays || 0,
        quantityOnStock: quantityOnStock || 0,
        purchaseDate: purchaseDate || "",
        lastReplacementDate: lastReplacementDate || "",
      });

      serviceLogRepository.create({
        action: "create",
        entity: "Component",
        entityId: component.id,
        details: `Component created: ${name}`,
      });

      res.status(201).json(component);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const component = componentRepository.getById(id);
      if (!component) {
        return res.status(404).json({ error: "Component not found." });
      }

      componentRepository.update(id, req.body);
      const updated = componentRepository.getById(id);

      serviceLogRepository.create({
        action: "update",
        entity: "Component",
        entityId: id,
        details: `Component updated`,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const component = componentRepository.getById(id);
      if (!component) {
        return res.status(404).json({ error: "Component not found." });
      }

      componentRepository.delete(id);

      serviceLogRepository.create({
        action: "delete",
        entity: "Component",
        entityId: id,
        details: `Component deleted`,
      });

      res.json({ message: "Component deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export class MaintenanceController {
  async getAll(req: Request, res: Response) {
    try {
      const maintenance = maintenanceRepository.getAll();
      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const maintenance = maintenanceRepository.getById(id);
      if (!maintenance) {
        return res.status(404).json({ error: "Maintenance record not found." });
      }
      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async getByEquipmentId(req: Request, res: Response) {
    try {
      const equipmentId = Number(req.params.equipmentId);
      const maintenance = maintenanceRepository.getByEquipmentId(equipmentId);
      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { equipmentId, date, type, workPerformed, performedBy, checkedBy, hoursSpent, notes } = req.body;

      if (!equipmentId || !date) {
        return res.status(400).json({ error: "Required fields are missing." });
      }

      const maintenance = maintenanceRepository.create({
        equipmentId,
        date,
        type: type || "",
        workPerformed: workPerformed || "",
        performedBy: performedBy || "",
        checkedBy: checkedBy || "",
        hoursSpent: hoursSpent || 0,
        notes: notes || null,
      });

      serviceLogRepository.create({
        action: "create",
        entity: "Maintenance",
        entityId: maintenance.id,
        details: `Maintenance record created for equipment ${equipmentId}`,
      });

      res.status(201).json(maintenance);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const maintenance = maintenanceRepository.getById(id);
      if (!maintenance) {
        return res.status(404).json({ error: "Maintenance record not found." });
      }

      maintenanceRepository.update(id, req.body);
      const updated = maintenanceRepository.getById(id);

      serviceLogRepository.create({
        action: "update",
        entity: "Maintenance",
        entityId: id,
        details: `Maintenance record updated`,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const maintenance = maintenanceRepository.getById(id);
      if (!maintenance) {
        return res.status(404).json({ error: "Maintenance record not found." });
      }

      maintenanceRepository.delete(id);

      serviceLogRepository.create({
        action: "delete",
        entity: "Maintenance",
        entityId: id,
        details: `Maintenance record deleted`,
      });

      res.json({ message: "Maintenance record deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

export const equipmentController = new EquipmentController();
export const componentController = new ComponentController();
export const maintenanceController = new MaintenanceController();
