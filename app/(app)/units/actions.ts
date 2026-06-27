"use server";

import { db } from "@/lib/db";
import { units } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { eq } from "drizzle-orm";

export async function createUnit(fd: FormData): Promise<{ error?: string }> {
  const name = String(fd.get("name") ?? "").trim();
  const abbreviation = String(fd.get("abbreviation") ?? "").trim();
  if (!name) return { error: "Name is required." };
  if (!abbreviation) return { error: "Abbreviation is required." };
  try {
    await db.insert(units).values({ id: createId(), name, abbreviation });
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Unit name already exists." };
    return { error: "Failed to save." };
  }
}

export async function updateUnit(fd: FormData): Promise<{ error?: string }> {
  const id = String(fd.get("id") ?? "").trim();
  const name = String(fd.get("name") ?? "").trim();
  const abbreviation = String(fd.get("abbreviation") ?? "").trim();
  if (!id || !name || !abbreviation) return { error: "All fields are required." };
  try {
    await db.update(units).set({ name, abbreviation }).where(eq(units.id, id));
    return {};
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: "Unit name already exists." };
    return { error: "Failed to save." };
  }
}
