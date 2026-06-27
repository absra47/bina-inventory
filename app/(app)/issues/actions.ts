"use server";

import { db } from "@/lib/db";
import { issues, issueLines } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, like, count } from "drizzle-orm";

export async function createIssue(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const branchId = String(formData.get("branchId") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "").trim();

  if (!branchId) return { error: "Branch is required." };
  if (!dateStr) return { error: "Date is required." };
  const issuedAt = new Date(dateStr);
  if (isNaN(issuedAt.getTime())) return { error: "Invalid date." };

  // Auto-generate reference ISS-YYYY-NNNN
  const year = issuedAt.getFullYear();
  const [{ n }] = await db
    .select({ n: count() })
    .from(issues)
    .where(like(issues.reference, `ISS-${year}-%`));
  const reference = `ISS-${year}-${String((n ?? 0) + 1).padStart(4, "0")}`;

  // Parse line items
  const lines: { itemId: string; qtyIssued: number; unitCost: number }[] = [];
  for (let i = 0; formData.has(`item_${i}`); i++) {
    const itemId = String(formData.get(`item_${i}`) ?? "").trim();
    const qtyIssued = parseFloat(String(formData.get(`qty_${i}`) ?? ""));
    const unitCost = parseFloat(String(formData.get(`cost_${i}`) ?? ""));

    if (!itemId) continue;
    if (!(qtyIssued > 0)) return { error: `Line ${i + 1}: quantity must be greater than 0.` };
    if (isNaN(unitCost) || unitCost < 0) return { error: `Line ${i + 1}: unit cost must be ≥ 0.` };

    lines.push({ itemId, qtyIssued, unitCost });
  }

  if (lines.length === 0) return { error: "Add at least one line item." };

  const id = createId();
  try {
    await db.insert(issues).values({
      id,
      reference,
      branchId,
      requestedById: session.userId,
      status: "PENDING",
      issuedAt,
    });
    await db.insert(issueLines).values(
      lines.map((l) => ({ id: createId(), issueId: id, ...l, status: "PENDING" as const }))
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE")) return { error: `Reference "${reference}" already exists.` };
    return { error: "Failed to save. Please try again." };
  }

  redirect("/issues");
}

export async function receiveIssue(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated." };

  const issueId = String(formData.get("issueId") ?? "").trim();
  if (!issueId) return { error: "Invalid issue." };

  // Verify issue exists and is PENDING
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1);
  if (!issue) return { error: "Issue not found." };
  if (issue.status !== "PENDING") return { error: "This issue has already been received." };

  // Load lines
  const lines = await db.select().from(issueLines).where(eq(issueLines.issueId, issueId));
  if (lines.length === 0) return { error: "Issue has no lines." };

  // Parse and validate each line
  const updates: typeof lines = [];
  for (const line of lines) {
    const qtyReceived = parseFloat(String(formData.get(`received_${line.id}`) ?? "0")) || 0;
    const qtyRejected = parseFloat(String(formData.get(`rejected_${line.id}`) ?? "0")) || 0;

    if (qtyReceived < 0) return { error: "Received quantity cannot be negative." };
    if (qtyRejected < 0) return { error: "Rejected quantity cannot be negative." };
    if (qtyReceived + qtyRejected > line.qtyIssued)
      return { error: `Line "${line.id.slice(0, 6)}…": received + rejected exceeds issued (${line.qtyIssued}).` };

    const lineStatus =
      qtyRejected > 0 ? "REJECTED" :
      qtyReceived < line.qtyIssued ? "PARTIAL" :
      "RECEIVED";

    updates.push({ ...line, qtyReceived, qtyRejected, status: lineStatus });
  }

  // Roll up issue status: any rejected → REJECTED; any short → PARTIAL; else RECEIVED
  const hasRejection = updates.some((u) => u.qtyRejected > 0);
  const hasShort = updates.some((u) => u.qtyReceived < u.qtyIssued);
  const issueStatus = hasRejection ? "REJECTED" : hasShort ? "PARTIAL" : "RECEIVED";

  await Promise.all(
    updates.map((u) =>
      db
        .update(issueLines)
        .set({ qtyReceived: u.qtyReceived, qtyRejected: u.qtyRejected, status: u.status })
        .where(eq(issueLines.id, u.id))
    )
  );
  await db
    .update(issues)
    .set({ status: issueStatus, receivedAt: new Date() })
    .where(eq(issues.id, issueId));

  redirect(`/issues/${issueId}`);
}
