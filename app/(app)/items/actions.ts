"use server";

import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { eq } from "drizzle-orm";

export async function createItem(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  const sku = String(fd.get("sku") ?? "").trim().toUpperCase();
  const categoryId = String(fd.get("categoryId") ?? "").trim();
  const unitId = String(fd.get("unitId") ?? "").trim();
  const reorderLevel = parseFloat(String(fd.get("reorderLevel") ?? "0")) || 0;
  const expiryTracked = fd.get("expiryTracked") === "true";
  if (!name) return { error: "Name is required." };
  if (!sku) return { error: "SKU is required." };
  if (!categoryId) return { error: "Category is required." };
  if (!unitId) return { error: "Unit is required." };
  try {
    await db.insert(items).values({ id: createId(), name, sku, categoryId, unitId, reorderLevel, expiryTracked });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "SKU already exists." };
    return { error: "Failed to save." };
  }
}

export async function updateItem(fd: FormData): Promise<{ error?: string }> {
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  const sku = String(fd.get("sku") ?? "").trim().toUpperCase();
  const categoryId = String(fd.get("categoryId") ?? "").trim();
  const unitId = String(fd.get("unitId") ?? "").trim();
  const reorderLevel = parseFloat(String(fd.get("reorderLevel") ?? "0")) || 0;
  const expiryTracked = fd.get("expiryTracked") === "true";
  if (!id || !name || !sku || !categoryId || !unitId) return { error: "All required fields must be filled." };
  try {
    await db.update(items).set({ name, sku, categoryId, unitId, reorderLevel, expiryTracked }).where(eq(items.id, id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "SKU already exists." };
    return { error: "Failed to save." };
  }
}

export async function toggleItem(id: string, active: boolean): Promise<void> {
  await db.update(items).set({ active: !active }).where(eq(items.id, id));
}
