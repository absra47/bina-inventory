import { db } from "@/lib/db";
import { stockIns, issues, branches } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const [stockInRows, issueRows] = await Promise.all([
    db.select({ id: stockIns.id, reference: stockIns.reference, date: stockIns.date, supplier: stockIns.supplier }).from(stockIns),
    db
      .select({ id: issues.id, reference: issues.reference, date: issues.issuedAt, receivedAt: issues.receivedAt, status: issues.status, branch: branches.name })
      .from(issues)
      .leftJoin(branches, eq(issues.branchId, branches.id)),
  ]);

  const events = [
    ...stockInRows.map((r) => ({
      date: r.date,
      type: "STOCK_IN",
      ref: r.reference,
      detail: r.supplier ? `from ${r.supplier}` : "supplier delivery",
    })),
    ...issueRows.map((r) => ({
      date: r.date,
      type: "ISSUE_CREATED",
      ref: r.reference,
      detail: `to ${r.branch ?? "branch"} · ${r.status}`,
    })),
    ...issueRows
      .filter((r) => r.receivedAt)
      .map((r) => ({
        date: r.receivedAt!,
        type: "ISSUE_RECEIVED",
        ref: r.reference,
        detail: `received at ${r.branch ?? "branch"} · ${r.status}`,
      })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  const typeLabel: Record<string, string> = {
    STOCK_IN: "Stock In",
    ISSUE_CREATED: "Issue Created",
    ISSUE_RECEIVED: "Issue Received",
  };
  const typeColor: Record<string, { bg: string; fg: string }> = {
    STOCK_IN: { bg: "rgba(43,93,165,0.15)", fg: "#4a85d0" },
    ISSUE_CREATED: { bg: "rgba(230,168,23,0.15)", fg: "#e6b94a" },
    ISSUE_RECEIVED: { bg: "rgba(47,158,111,0.15)", fg: "#46c08a" },
  };

  return (
    <>
      <PageHeader title="Activity Log" subtitle={`${events.length} events`} icon={<Icon name="clock" size={24} />} />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Event</th>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 font-medium">Detail</th>
            </>
          }
        >
          {events.map((e, i) => {
            const c = typeColor[e.type] ?? typeColor.STOCK_IN;
            return (
              <tr key={i} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{e.date ? shortDate(e.date) : "—"}</td>
                <td className="py-2.5 pr-4">
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: c.bg, color: c.fg }}>
                    {typeLabel[e.type]}
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-medium">{e.ref}</td>
                <td className="py-2.5" style={{ color: "var(--text-dim)" }}>{e.detail}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
