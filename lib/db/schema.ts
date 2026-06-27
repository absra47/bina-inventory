import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "../id";

// ---- Management ----

export const branches = sqliteTable("branches", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  location: text("location"),
  phone: text("phone"),
  email: text("email"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["ADMIN", "MANAGER", "STAFF"] }).notNull().default("STAFF"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  branchId: text("branch_id").references(() => branches.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull().unique(),
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull().unique(),
  abbreviation: text("abbreviation").notNull(),
});

export const items = sqliteTable("items", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: text("category_id").notNull().references(() => categories.id),
  unitId: text("unit_id").notNull().references(() => units.id),
  reorderLevel: real("reorder_level").notNull().default(0),
  expiryTracked: integer("expiry_tracked", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ---- Main store: goods received from suppliers ----

export const stockIns = sqliteTable("stock_ins", {
  id: text("id").primaryKey().$defaultFn(createId),
  reference: text("reference").notNull().unique(),
  supplier: text("supplier"),
  date: integer("date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  totalValue: real("total_value").notNull().default(0),
});

export const stockInLines = sqliteTable("stock_in_lines", {
  id: text("id").primaryKey().$defaultFn(createId),
  stockInId: text("stock_in_id").notNull().references(() => stockIns.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => items.id),
  quantity: real("quantity").notNull(),
  unitCost: real("unit_cost").notNull(),
  expiryDate: integer("expiry_date", { mode: "timestamp" }),
});

// ---- Issue from main store to a branch -> drives the Received Items Report ----

export const RECEIPT_STATUS = ["PENDING", "PARTIAL", "RECEIVED", "REJECTED"] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUS)[number];

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey().$defaultFn(createId),
  reference: text("reference").notNull().unique(),
  branchId: text("branch_id").notNull().references(() => branches.id),
  requestedById: text("requested_by_id").notNull().references(() => users.id),
  status: text("status", { enum: RECEIPT_STATUS }).notNull().default("PENDING"),
  issuedAt: integer("issued_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  receivedAt: integer("received_at", { mode: "timestamp" }),
});

export const issueLines = sqliteTable("issue_lines", {
  id: text("id").primaryKey().$defaultFn(createId),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => items.id),
  qtyIssued: real("qty_issued").notNull(),
  qtyReceived: real("qty_received").notNull().default(0),
  qtyRejected: real("qty_rejected").notNull().default(0),
  unitCost: real("unit_cost").notNull().default(0),
  status: text("status", { enum: RECEIPT_STATUS }).notNull().default("PENDING"),
});

// ---- Relations ----

export const branchRelations = relations(branches, ({ many }) => ({
  users: many(users),
  issues: many(issues),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
  issues: many(issues),
}));

export const itemRelations = relations(items, ({ one, many }) => ({
  category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
  unit: one(units, { fields: [items.unitId], references: [units.id] }),
  stockInLines: many(stockInLines),
  issueLines: many(issueLines),
}));

export const issueRelations = relations(issues, ({ one, many }) => ({
  branch: one(branches, { fields: [issues.branchId], references: [branches.id] }),
  requestedBy: one(users, { fields: [issues.requestedById], references: [users.id] }),
  lines: many(issueLines),
}));

export const issueLineRelations = relations(issueLines, ({ one }) => ({
  issue: one(issues, { fields: [issueLines.issueId], references: [issues.id] }),
  item: one(items, { fields: [issueLines.itemId], references: [items.id] }),
}));

export const stockInRelations = relations(stockIns, ({ many }) => ({
  lines: many(stockInLines),
}));

export const stockInLineRelations = relations(stockInLines, ({ one }) => ({
  stockIn: one(stockIns, { fields: [stockInLines.stockInId], references: [stockIns.id] }),
  item: one(items, { fields: [stockInLines.itemId], references: [items.id] }),
}));
