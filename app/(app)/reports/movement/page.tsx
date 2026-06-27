import { db } from "@/lib/db";
import { stockInLines, stockIns, issueLines, issues, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, qty, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MovementPage() {
  const [ins, outs] = await Promise.all([
    db
      .select({
        date: stockIns.date,
        ref: stockIns.reference,
        itemName: items.name,
        itemSku: items.sku,
        quantity: stockInLines.quantity,
        unitCost: stockInLines.unitCost,
      })
      .from(stockInLines)
      .leftJoin(stockIns, eq(stockInLines.stockInId, stockIns.id))
      .leftJoin(items, eq(stockInLines.itemId, items.id)),
    db
      .select({
        date: issues.issuedAt,
        ref: issues.reference,
        itemName: items.name,
        itemSku: items.sku,
        quantity: issueLines.qtyIssued,
        unitCost: issueLines.unitCost,
      })
      .from(issueLines)
      .leftJoin(issues, eq(issueLines.issueId, issues.id))
      .leftJoin(items, eq(issueLines.itemId, items.id)),
  ]);

  const movements = [
    ...ins.map((r) => ({ ...r, type: "IN" as const })),
    ...outs.map((r) => ({ ...r, type: "OUT" as const })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  const totalIn = ins.reduce((s, r) => s + r.quantity * r.unitCost, 0);
  const totalOut = outs.reduce((s, r) => s + r.quantity * r.unitCost, 0);

  return (
    <>
      <PageHeader title="Stock Movement" subtitle={`${movements.length} movements`} icon={<Icon name="swap" size={24} />} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Received", value: etb(totalIn), color: "#2B5DA5" },
          { label: "Total Issued", value: etb(totalOut), color: "#c0392b" },
          { label: "Net Value", value: etb(totalIn - totalOut), color: "#2f9e6f" },
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
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium text-right">Qty</th>
              <th className="py-2 font-medium text-right">Value</th>
            </>
          }
        >
          {movements.map((m, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{m.date ? shortDate(m.date) : "—"}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={m.type === "IN" ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(192,57,43,0.15)", color: "#e8716e" }}>
                  {m.type === "IN" ? "Stock In" : "Issued"}
                </span>
              </td>
              <td className="py-2.5 pr-4 font-medium">{m.ref ?? "—"}</td>
              <td className="py-2.5 pr-4">
                {m.itemName}
                <span className="ml-2 text-xs font-mono" style={{ color: "var(--text-dim)" }}>{m.itemSku}</span>
              </td>
              <td className="py-2.5 pr-4 text-right">{qty(m.quantity)}</td>
              <td className="py-2.5 text-right font-medium">{etb(m.quantity * m.unitCost)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
