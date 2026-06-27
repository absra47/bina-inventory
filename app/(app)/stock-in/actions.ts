"use server";

import { db } from "@/lib/db";
import { stockIns, stockInLines } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { redirect } from "next/navigation";
import { like, count } from "drizzle-orm";

export async function createStockIn(_prev: unknown, formData: FormData) {
  let ref = String(formData.get("reference") ?? "").trim();
  const supplier = String(formData.get("supplier") ?? "").trim() || null;
  const dateStr = String(formData.get("date") ?? "").trim();

  if (!dateStr) return { error: "Date is required." };
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { error: "Invalid date." };

  // Auto-generate reference if left blank
  if (!ref) {
    const year = date.getFullYear();
    const [{ n }] = await db
      .select({ n: count() })
      .from(stockIns)
      .where(like(stockIns.reference, `GRN-${year}-%`));
    ref = `GRN-${year}-${String((n ?? 0) + 1).padStart(3, "0")}`;
  }

  // Parse lines: item_0, qty_0, cost_0, expiry_0, …
  const lines: { itemId: string; quantity: number; unitCost: number; expiryDate: Date | null }[] = [];
  for (let i = 0; formData.has(`item_${i}`); i++) {
    const itemId = String(formData.get(`item_${i}`) ?? "").trim();
    const quantity = parseFloat(String(formData.get(`qty_${i}`) ?? ""));
    const unitCost = parseFloat(String(formData.get(`cost_${i}`) ?? ""));
    const expiryStr = String(formData.get(`expiry_${i}`) ?? "").trim();

    if (!itemId) continue;
    if (!(quantity > 0)) return { error: `Line ${i + 1}: quantity must be greater than 0.` };
    if (!(unitCost > 0)) return { error: `Line ${i + 1}: unit cost must be greater than 0.` };

    lines.push({ itemId, quantity, unitCost, expiryDate: expiryStr ? new Date(expiryStr) : null });
  }

  if (lines.length === 0) return { error: "Add at least one line item." };

  const totalValue = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);
  const id = createId();

  try {
    await db.insert(stockIns).values({ id, reference: ref, supplier, date, totalValue });
    await db.insert(stockInLines).values(
      lines.map((l) => ({ id: createId(), stockInId: id, ...l }))
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: `Reference "${ref}" already exists.` };
    return { error: "Failed to save. Please try again." };
  }

  redirect("/stock-in");
}
