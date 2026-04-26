import { Router } from "express";
import { requireAdmin } from "../../middleware/requireAdmin";
import {
  handleAdminCategoryTree,
  handleBulkUpdateCategories,
  handleCreateCategory,
  handleDashboardStats,
  handleDeleteCategory,
  handleHardDeleteCategory,
  handleRecentOrders,
  handleAllOrders,
  handleReorderCategories,
  handleUpdateCategory,
  handleUpdateCategoryStatus,
  handleUpdateOrderStatus,
  handleGetShopApplications,
  handleCreateShopApplication,
  handleUpdateShopApplication,
  handleDeleteShopApplication,
  handleGetShopApplicationProducts,
  handleUpdateShopApplicationProducts,
  handleSearchProductsForApplication
} from "./admin.controller";
import {
  handleListAdminProducts,
  handleGetProductStats,
  handleGetAdminProduct,
  handleCreateAdminProduct,
  handleUpdateAdminProduct,
  handleDeleteAdminProduct,
  handleDuplicateAdminProduct,
  handleQuickStockAdjust,
  handleBulkProductAction,
  handleGetProductLogs,
  handleGetStockOverview,
  handleBulkUpsertProducts,
} from "./admin-products.controller";
import {
  handleGetCRMStats,
  handleGetCustomers,
  handleGetCustomerProfile,
  handleUpdateCustomer,
  handleLogCommunication,
  handleBulkAction
} from "./admin-customers.controller";

export const adminRouter = Router();

// All admin routes require admin authentication
adminRouter.use(requireAdmin);

// ─── Dashboard & Orders ──────────────────────────────────────────────
adminRouter.get("/dashboard-stats", handleDashboardStats);
adminRouter.get("/recent-orders", handleRecentOrders);
adminRouter.get("/orders", handleAllOrders);
adminRouter.patch("/orders/:id/status", handleUpdateOrderStatus);

// ─── Categories ───────────────────────────────────────────────────────
adminRouter.get("/categories/tree", handleAdminCategoryTree);
adminRouter.post("/categories", handleCreateCategory);
adminRouter.put("/categories/reorder", handleReorderCategories);
adminRouter.post("/categories/bulk", handleBulkUpdateCategories);
adminRouter.put("/categories/:id", handleUpdateCategory);
adminRouter.patch("/categories/:id/status", handleUpdateCategoryStatus);
adminRouter.delete("/categories/:id", handleDeleteCategory);
adminRouter.delete("/categories/:id/hard", handleHardDeleteCategory);

// ─── Products ─────────────────────────────────────────────────────────
adminRouter.get("/products/stats", handleGetProductStats);
adminRouter.get("/products/stock-overview", handleGetStockOverview);
adminRouter.post("/products/import", handleBulkUpsertProducts);
adminRouter.get("/products", handleListAdminProducts);
adminRouter.post("/products/bulk", handleBulkProductAction);
adminRouter.get("/products/:id", handleGetAdminProduct);
adminRouter.post("/products", handleCreateAdminProduct);
adminRouter.put("/products/:id", handleUpdateAdminProduct);
adminRouter.delete("/products/:id", handleDeleteAdminProduct);
adminRouter.post("/products/:id/duplicate", handleDuplicateAdminProduct);
adminRouter.patch("/products/:id/stock", handleQuickStockAdjust);
adminRouter.get("/products/:id/logs", handleGetProductLogs);

// ─── Customers & CRM ──────────────────────────────────────────────────
adminRouter.get("/customers/stats", handleGetCRMStats);
adminRouter.get("/customers", handleGetCustomers);
adminRouter.post("/customers/bulk", handleBulkAction);
adminRouter.get("/customers/:id", handleGetCustomerProfile);
adminRouter.patch("/customers/:id", handleUpdateCustomer);
adminRouter.post("/customers/:id/communication", handleLogCommunication);

// ─── Misc Settings ────────────────────────────────────────────────────
adminRouter.get("/misc/applications", handleGetShopApplications);
adminRouter.post("/misc/applications", handleCreateShopApplication);
adminRouter.put("/misc/applications/:id", handleUpdateShopApplication);
adminRouter.delete("/misc/applications/:id", handleDeleteShopApplication);
adminRouter.get("/misc/applications/:id/products", handleGetShopApplicationProducts);
adminRouter.put("/misc/applications/:id/products", handleUpdateShopApplicationProducts);
adminRouter.get("/misc/products/search", handleSearchProductsForApplication);
