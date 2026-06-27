"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function createUser(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "").trim();
  const role = String(fd.get("role") ?? "STAFF") as "ADMIN" | "MANAGER" | "STAFF";
  const branchId = String(fd.get("branchId") ?? "").trim() || null;
  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.insert(users).values({ id: createId(), name, email, password: hash, role, branchId });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Email already in use." };
    return { error: "Failed to save." };
  }
}

export async function updateUser(fd: FormData): Promise<{ error?: string }> {
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const role = String(fd.get("role") ?? "STAFF") as "ADMIN" | "MANAGER" | "STAFF";
  const branchId = String(fd.get("branchId") ?? "").trim() || null;
  const password = String(fd.get("password") ?? "").trim();
  if (!id || !name || !email) return { error: "Name and email are required." };
  const updates: Partial<typeof users.$inferInsert> = { name, email, role, branchId };
  if (password) {
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    updates.password = await bcrypt.hash(password, 10);
  }
  try {
    await db.update(users).set(updates).where(eq(users.id, id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Email already in use." };
    return { error: "Failed to save." };
  }
}

export async function toggleUser(id: string, active: boolean): Promise<void> {
  await db.update(users).set({ active: !active }).where(eq(users.id, id));
}
