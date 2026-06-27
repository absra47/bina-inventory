import "server-only";
import { and, gte, lte, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { issues, issueLines, branches, items } from "@/lib/db/schema";

export type ReceivedFilters = {
  from?: Date;
  to?: Date;
  branchId?: string;
};

export async function getReceivedReport(filters: ReceivedFilters = {}) {
  const conds = [];
  if (filters.from) conds.push(gte(issues.issuedAt, filters.from));
  if (filters.to) conds.push(lte(issues.issuedAt, filters.to));
  if (filters.branchId) conds.push(eq(issues.branchId, filters.branchId));

  const issueRows = await db
    .select()
    .from(issues)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(issues.issuedAt));

  const ids = issueRows.map((i) => i.id);
  const lines = ids.length
    ? await db.select().from(issueLines)
    : [];
  const linesByIssue = new Map<string, typeof lines>();
  for (const l of lines) {
    if (!ids.includes(l.issueId)) continue;
    const arr = linesByIssue.get(l.issueId) ?? [];
    arr.push(l);
    linesByIssue.set(l.issueId, arr);
  }

  const branchRows = await db.select().from(branches);
  const branchName = new Map(branchRows.map((b) => [b.id, b.name]));

  let totalReceipts = issueRows.length;
  let fullyReceived = 0;
  let partial = 0;
  let rejectedDeliveries = 0;
  let lineItemsRejected = 0;
  let totalIssued = 0;
  let totalReceived = 0;

  const trend = new Map<string, { value: number; count: number }>();

  const detail = issueRows.map((iss) => {
    const ls = linesByIssue.get(iss.id) ?? [];
    const issued = ls.reduce((s, l) => s + l.qtyIssued, 0);
    const received = ls.reduce((s, l) => s + l.qtyReceived, 0);
    const rejected = ls.reduce((s, l) => s + l.qtyRejected, 0);
    const rejLines = ls.filter((l) => l.qtyRejected > 0).length;
    const value = ls.reduce((s, l) => s + l.qtyReceived * l.unitCost, 0);

    totalIssued += issued;
    totalReceived += received;
    lineItemsRejected += rejLines;
    if (iss.status === "RECEIVED") fullyReceived++;
    if (iss.status === "PARTIAL") partial++;
    if (rejected > 0) rejectedDeliveries++;

    const day = iss.issuedAt.toISOString().slice(0, 10);
    const t = trend.get(day) ?? { value: 0, count: 0 };
    t.value += value;
    t.count += 1;
    trend.set(day, t);

    return {
      id: iss.id,
      reference: iss.reference,
      branch: branchName.get(iss.branchId) ?? "—",
      issuedAt: iss.issuedAt,
      status: iss.status,
      issued,
      received,
      rejected,
      value,
    };
  });

  const trendArr = [...trend.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ day, value: Math.round(v.value), count: v.count }));

  return {
    kpi: {
      totalReceipts,
      fullyReceived,
      partial,
      rejectedDeliveries,
      lineItemsRejected,
      totalIssued,
      totalReceived,
      receivedValue: detail.reduce((s, d) => s + d.value, 0),
      acceptanceRate: totalIssued ? (totalReceived / totalIssued) * 100 : 0,
    },
    detail,
    trend: trendArr,
    branches: branchRows,
  };
}

export async function getInventorySummary() {
  const itemRows = await db.select().from(items);
  return { itemCount: itemRows.length };
}
