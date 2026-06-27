"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { eq } from "drizzle-orm";

export async function createCategory(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  try {
    await db.insert(categories).values({ id: createId(), name });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Category name already exists." };
    return { error: "Failed to save." };
  }
}

export async function updateCategory(fd: FormData): Promise<{ error?: string }> {
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  if (!id || !name) return { error: "Name is required." };
  try {
    await db.update(categories).set({ name }).where(eq(categories.id, id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Category name already exists." };
    return { error: "Failed to save." };
  }
}
