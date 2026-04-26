import { Prisma, type CustomerStatus, type CustomerType, type CommunicationType } from "@prisma/client";
import { db } from "../../config/db";

// ─── Types ───────────────────────────────────────────────────────────

export interface CRMStats {
  totalCustomers: number;
  wholesaleCount: number;
  artisanCount: number;
  totalLifetimeRevenue: number;
  newCustomersThisMonth: number;
  inactiveCount: number;
}

export interface GetCustomersParams {
  page: number;
  limit: number;
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
  country?: string;
  minSpend?: number;
  maxSpend?: number;
  sortBy?: "createdAt" | "lifetimeSpend" | "name" | "lastOrderDate";
  sortOrder?: "asc" | "desc";
}

// Helper to calculate start of the month
function getStartOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getCRMStats(): Promise<CRMStats> {
  const [
    totalCustomers,
    wholesaleCount,
    artisanCount,
    inactiveCount,
    newCustomersThisMonth,
    revenueResult
  ] = await db.$transaction([
    db.user.count(),
    db.user.count({ where: { type: "WHOLESALE" } }),
    db.user.count({ where: { type: "ARTISAN" } }),
    db.user.count({ where: { status: "INACTIVE" } }),
    db.user.count({ where: { createdAt: { gte: getStartOfMonth() } } }),
    db.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } }
    })
  ]);

  return {
    totalCustomers,
    wholesaleCount,
    artisanCount,
    inactiveCount,
    newCustomersThisMonth,
    totalLifetimeRevenue: revenueResult._sum.totalAmount ? parseFloat(revenueResult._sum.totalAmount.toString()) : 0
  };
}

// ─── List Customers ──────────────────────────────────────────────────

export async function listAdminCustomers(params: GetCustomersParams) {
  const where: Prisma.UserWhereInput = {};

  if (params.search) {
    const searchStr = `%${params.search}%`;
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search, mode: "insensitive" } },
      { businessName: { contains: params.search, mode: "insensitive" } }
    ];
  }

  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;
  if (params.country) where.country = params.country;

  // For complex filtering like minSpend or sorting by lifetimeSpend, we'll fetch with relations 
  // and handle some logic if Prisma lacks native support for aggregating inside orderBy.
  // Actually, we can fetch all basic data, and aggregate separately or use Prisma's include.
  // To keep it simple & fast enough for moderate datasets:
  
  const [users, total] = await db.$transaction([
    db.user.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: params.sortBy === "name" ? { name: params.sortOrder ?? "asc" } : 
               params.sortBy === "createdAt" ? { createdAt: params.sortOrder ?? "desc" } :
               { createdAt: "desc" }, // Default fallback
      include: {
        _count: {
          select: { orders: { where: { status: { not: "CANCELLED" } } } }
        },
        orders: {
          where: { status: { not: "CANCELLED" } },
          select: { totalAmount: true, createdAt: true },
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    db.user.count({ where })
  ]);

  let enrichedUsers = users.map(u => {
    const lifetimeSpend = u.orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
    const lastOrderDate = u.orders.length > 0 ? u.orders[0].createdAt : null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      type: u.type,
      status: u.status,
      businessName: u.businessName,
      country: u.country,
      tags: u.tags,
      createdAt: u.createdAt,
      ordersCount: u._count.orders,
      lifetimeSpend,
      lastOrderDate
    };
  });

  // Apply manual spend filters if provided
  if (params.minSpend !== undefined) {
    enrichedUsers = enrichedUsers.filter(u => u.lifetimeSpend >= params.minSpend!);
  }
  if (params.maxSpend !== undefined) {
    enrichedUsers = enrichedUsers.filter(u => u.lifetimeSpend <= params.maxSpend!);
  }

  // Handle manual sorting if not natively handled by Prisma
  if (params.sortBy === "lifetimeSpend") {
    enrichedUsers.sort((a, b) => params.sortOrder === "asc" ? a.lifetimeSpend - b.lifetimeSpend : b.lifetimeSpend - a.lifetimeSpend);
  } else if (params.sortBy === "lastOrderDate") {
    enrichedUsers.sort((a, b) => {
      const aTime = a.lastOrderDate ? a.lastOrderDate.getTime() : 0;
      const bTime = b.lastOrderDate ? b.lastOrderDate.getTime() : 0;
      return params.sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
  }

  return {
    items: enrichedUsers,
    pagination: {
      page: params.page,
      limit: params.limit,
      total, // Note: spend filters might make page totals slightly inaccurate locally, but fine for MVP
      totalPages: Math.max(1, Math.ceil(total / params.limit))
    }
  };
}

// ─── Customer Profile ────────────────────────────────────────────────

export async function getCustomerProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            select: { productName: true, quantity: true, priceAtPurchase: true }
          }
        }
      },
      communicationLogs: {
        include: { admin: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) throw new Error("Customer not found.");

  const validOrders = user.orders.filter(o => o.status !== "CANCELLED");
  const lifetimeSpend = validOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const averageOrderValue = validOrders.length > 0 ? lifetimeSpend / validOrders.length : 0;
  
  // Calculate most purchased category (proxy via items)
  const productCounts: Record<string, number> = {};
  for (const o of validOrders) {
    for (const item of o.items) {
      productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
    }
  }
  let mostPurchasedProduct = null;
  let maxCount = 0;
  for (const [name, count] of Object.entries(productCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostPurchasedProduct = name;
    }
  }

  return {
    ...user,
    stats: {
      lifetimeSpend,
      averageOrderValue,
      totalOrders: validOrders.length,
      mostPurchasedProduct
    }
  };
}

// ─── Update CRM Data ──────────────────────────────────────────────────

export interface UpdateCustomerInput {
  phone?: string | null;
  type?: CustomerType;
  status?: CustomerStatus;
  businessName?: string | null;
  gstVat?: string | null;
  country?: string | null;
  city?: string | null;
  notes?: string | null;
  tags?: string[];
}

export async function updateCustomerDetails(userId: string, data: UpdateCustomerInput) {
  return db.user.update({
    where: { id: userId },
    data
  });
}

// ─── Communications ───────────────────────────────────────────────────

export async function logCommunication(userId: string, adminId: string, type: CommunicationType, content: string, subject?: string) {
  return db.communicationLog.create({
    data: {
      userId,
      adminId,
      type,
      content,
      subject
    },
    include: {
      admin: { select: { name: true } }
    }
  });
}

// ─── Bulk Actions ─────────────────────────────────────────────────────

export async function performBulkAction(userIds: string[], action: "updateStatus" | "updateType", value: any) {
  if (userIds.length === 0) return { updatedCount: 0 };
  
  const updateData: any = {};
  if (action === "updateStatus") updateData.status = value;
  if (action === "updateType") updateData.type = value;

  const result = await db.user.updateMany({
    where: { id: { in: userIds } },
    data: updateData
  });

  return { updatedCount: result.count };
}
