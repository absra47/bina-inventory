import { db } from "@/lib/db";
import { issueLines, issues, items, branches } from "@/lib/db/schema";
import { eq, gt } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { qty, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RejectedPage() {
  const rows = await db
    .select({
      issueRef: issues.reference,
      issuedAt: issues.issuedAt,
      branch: branches.name,
      itemName: items.name,
      itemSku: items.sku,
      qtyIssued: issueLines.qtyIssued,
      qtyRejected: issueLines.qtyRejected,
    })
    .from(issueLines)
    .leftJoin(issues, eq(issueLines.issueId, issues.id))
    .leftJoin(items, eq(issueLines.itemId, items.id))
    .leftJoin(branches, eq(issues.branchId, branches.id))
    .where(gt(issueLines.qtyRejected, 0));

  const totalRejected = rows.reduce((s, r) => s + r.qtyRejected, 0);
  const totalIssued = rows.reduce((s, r) => s + r.qtyIssued, 0);
  const rejectionRate = totalIssued > 0 ? (totalRejected / totalIssued) * 100 : 0;

  return (
    <>
      <PageHeader title="Rejected Items" subtitle="Issue lines with rejected quantities" icon={<Icon name="x" size={24} />} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Rejected Lines", value: String(rows.length), color: "#c0392b" },
          { label: "Total Qty Rejected", value: qty(totalRejected), color: "#c0392b" },
          { label: "Rejection Rate", value: `${rejectionRate.toFixed(1)}%`, color: rejectionRate > 10 ? "#c0392b" : "#e6a817" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>{s.label}</p>
            <p className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Issue Ref</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium text-right">Issued</th>
              <th className="py-2 pr-4 font-medium text-right">Rejected</th>
              <th className="py-2 font-medium text-right">Rate</th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr><td colSpan={7} className="py-10 text-center text-sm" style={{ color: "var(--text-dim)" }}>No rejections recorded.</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{r.issueRef ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.branch ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.issuedAt ? shortDate(r.issuedAt) : "—"}</td>
              <td className="py-2.5 pr-4">
                {r.itemName}
                <span className="ml-2 text-xs font-mono" style={{ color: "var(--text-dim)" }}>{r.itemSku}</span>
              </td>
              <td className="py-2.5 pr-4 text-right">{qty(r.qtyIssued)}</td>
              <td className="py-2.5 pr-4 text-right font-medium" style={{ color: "#e8716e" }}>{qty(r.qtyRejected)}</td>
              <td className="py-2.5 text-right font-medium" style={{ color: "#e8716e" }}>
                {((r.qtyRejected / r.qtyIssued) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
