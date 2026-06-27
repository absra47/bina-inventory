import { db } from "@/lib/db";
import { items, categories, units, stockInLines, issueLines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { qty } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InventoryReportPage() {
  const [itemRows, stockLines, issuedLines] = await Promise.all([
    db
      .select({
        id: items.id,
        name: items.name,
        sku: items.sku,
        reorderLevel: items.reorderLevel,
        category: categories.name,
        unit: units.abbreviation,
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .leftJoin(units, eq(items.unitId, units.id)),
    db.select().from(stockInLines),
    db.select().from(issueLines),
  ]);

  const stockedIn = new Map<string, number>();
  for (const l of stockLines) stockedIn.set(l.itemId, (stockedIn.get(l.itemId) ?? 0) + l.quantity);

  const issuedOut = new Map<string, number>();
  for (const l of issuedLines) issuedOut.set(l.itemId, (issuedOut.get(l.itemId) ?? 0) + l.qtyIssued);

  const rows = itemRows.map((it) => {
    const onHand = (stockedIn.get(it.id) ?? 0) - (issuedOut.get(it.id) ?? 0);
    return { ...it, onHand, low: onHand <= it.reorderLevel };
  });

  return (
    <>
      <PageHeader title="Inventory Report" subtitle="Current main-store balance (stock in − issued)" icon={<Icon name="clipboard" size={24} />} />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium text-right">On Hand</th>
              <th className="py-2 pr-4 font-medium text-right">Reorder Level</th>
              <th className="py-2 pr-4 font-medium">Flag</th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{r.sku}</td>
              <td className="py-2.5 pr-4">{r.name}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.category}</td>
              <td className="py-2.5 pr-4 text-right">{qty(r.onHand)} {r.unit}</td>
              <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>{qty(r.reorderLevel)}</td>
              <td className="py-2.5 pr-4">
                {r.low && (
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(216,80,77,0.15)", color: "#e8716e" }}>
                    Low stock
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
