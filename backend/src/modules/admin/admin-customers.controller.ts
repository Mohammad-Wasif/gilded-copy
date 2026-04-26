import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as adminCustomersService from "./admin-customers.service";

// ─── Schemas ──────────────────────────────────────────────────────────

const getCustomersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  type: z.enum(["RETAIL", "WHOLESALE", "ARTISAN"]).optional(),
  status: z.enum(["NEW", "ACTIVE", "INACTIVE", "BLACKLISTED"]).optional(),
  country: z.string().optional(),
  minSpend: z.coerce.number().min(0).optional(),
  maxSpend: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["createdAt", "lifetimeSpend", "name", "lastOrderDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const updateCustomerSchema = z.object({
  phone: z.string().nullable().optional(),
  type: z.enum(["RETAIL", "WHOLESALE", "ARTISAN"]).optional(),
  status: z.enum(["NEW", "ACTIVE", "INACTIVE", "BLACKLISTED"]).optional(),
  businessName: z.string().nullable().optional(),
  gstVat: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const logCommunicationSchema = z.object({
  type: z.enum(["EMAIL", "WHATSAPP", "CALL", "MEETING"]),
  content: z.string().min(1),
  subject: z.string().optional(),
});

const bulkActionSchema = z.object({
  userIds: z.array(z.string()).min(1),
  action: z.enum(["updateStatus", "updateType"]),
  value: z.string()
});

// ─── Handlers ─────────────────────────────────────────────────────────

export async function handleGetCRMStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminCustomersService.getCRMStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getCustomersQuerySchema.parse(req.query);
    const result = await adminCustomersService.listAdminCustomers(params);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetCustomerProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const profile = await adminCustomersService.getCustomerProfile(id);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = updateCustomerSchema.parse(req.body);
    const updated = await adminCustomersService.updateCustomerDetails(id, data);
    res.json({
      success: true,
      data: updated,
      message: "Customer updated successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogCommunication(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = logCommunicationSchema.parse(req.body);
    const adminId = (req as any).user.id as string; // From requireAdmin middleware
    
    const log = await adminCustomersService.logCommunication(id, adminId, data.type, data.content, data.subject);
    res.status(201).json({
      success: true,
      data: log,
      message: "Communication logged successfully"
    });
  } catch (error) {
    next(error);
  }
}

export async function handleBulkAction(req: Request, res: Response, next: NextFunction) {
  try {
    const data = bulkActionSchema.parse(req.body);
    const result = await adminCustomersService.performBulkAction(data.userIds, data.action, data.value);
    res.json({
      success: true,
      data: result,
      message: "Bulk action completed successfully"
    });
  } catch (error) {
    next(error);
  }
}
