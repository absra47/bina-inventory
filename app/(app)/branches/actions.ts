"use server";

import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { eq } from "drizzle-orm";

export async function createBranch(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const location = String(fd.get("location") ?? "").trim() || null;
  const phone = String(fd.get("phone") ?? "").trim() || null;
  const email = String(fd.get("email") ?? "").trim() || null;
  if (!name) return { error: "Name is required." };
  if (!code) return { error: "Code is required." };
  try {
    await db.insert(branches).values({ id: createId(), name, code, location, phone, email });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Branch code already exists." };
    return { error: "Failed to save." };
  }
}

export async function updateBranch(fd: FormData): Promise<{ error?: string }> {
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const location = String(fd.get("location") ?? "").trim() || null;
  const phone = String(fd.get("phone") ?? "").trim() || null;
  const email = String(fd.get("email") ?? "").trim() || null;
  if (!id || !name || !code) return { error: "Name and code are required." };
  try {
    await db.update(branches).set({ name, code, location, phone, email }).where(eq(branches.id, id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Branch code already exists." };
    return { error: "Failed to save." };
  }
}

export async function toggleBranch(id: string, active: boolean): Promise<void> {
  await db.update(branches).set({ active: !active }).where(eq(branches.id, id));
}
