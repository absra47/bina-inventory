import { db } from "@/lib/db";
import { stockInLines, stockIns, items } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { qty, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ExpiryPage() {
  const rows = await db
    .select({
      ref: stockIns.reference,
      date: stockIns.date,
      itemName: items.name,
      itemSku: items.sku,
      quantity: stockInLines.quantity,
      expiryDate: stockInLines.expiryDate,
    })
    .from(stockInLines)
    .leftJoin(stockIns, eq(stockInLines.stockInId, stockIns.id))
    .leftJoin(items, eq(stockInLines.itemId, items.id))
    .where(isNotNull(stockInLines.expiryDate));

  const now = Date.now();
  const THIRTY = 30 * 24 * 60 * 60 * 1000;

  const data = rows
    .map((r) => {
      const exp = r.expiryDate ? new Date(r.expiryDate) : null;
      const daysLeft = exp ? Math.ceil((exp.getTime() - now) / (1000 * 60 * 60 * 24)) : null;
      return { ...r, exp, daysLeft };
    })
    .sort((a, b) => (a.exp?.getTime() ?? 0) - (b.exp?.getTime() ?? 0));

  const expired = data.filter((r) => r.daysLeft !== null && r.daysLeft < 0).length;
  const nearExpiry = data.filter((r) => r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= 30).length;

  return (
    <>
      <PageHeader title="Expiry Report" subtitle="Stock lines with tracked expiry dates" icon={<Icon name="calendar" size={24} />} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tracked Lines", value: String(data.length), color: "#2B5DA5" },
          { label: "Expired", value: String(expired), color: expired > 0 ? "#c0392b" : "#2f9e6f" },
          { label: "Expiring ≤ 30 days", value: String(nearExpiry), color: nearExpiry > 0 ? "#e6a817" : "#2f9e6f" },
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
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium">GRN Ref</th>
              <th className="py-2 pr-4 font-medium text-right">Qty</th>
              <th className="py-2 pr-4 font-medium">Expiry Date</th>
              <th className="py-2 font-medium">Status</th>
            </>
          }
        >
          {data.length === 0 ? (
            <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: "var(--text-dim)" }}>No expiry-tracked lines.</td></tr>
          ) : data.map((r, i) => {
            const isExpired = r.daysLeft !== null && r.daysLeft < 0;
            const isNear = !isExpired && r.daysLeft !== null && r.daysLeft <= 30;
            return (
              <tr key={i} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4">
                  {r.itemName}
                  <span className="ml-2 text-xs font-mono" style={{ color: "var(--text-dim)" }}>{r.itemSku}</span>
                </td>
                <td className="py-2.5 pr-4 font-medium">{r.ref ?? "—"}</td>
                <td className="py-2.5 pr-4 text-right">{qty(r.quantity)}</td>
                <td className="py-2.5 pr-4">{r.exp ? shortDate(r.exp) : "—"}</td>
                <td className="py-2.5">
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={
                    isExpired ? { background: "rgba(192,57,43,0.15)", color: "#e8716e" }
                    : isNear ? { background: "rgba(230,168,23,0.15)", color: "#e6b94a" }
                    : { background: "rgba(47,158,111,0.15)", color: "#46c08a" }
                  }>
                    {isExpired ? `Expired ${Math.abs(r.daysLeft!)}d ago` : isNear ? `${r.daysLeft}d left` : "OK"}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
