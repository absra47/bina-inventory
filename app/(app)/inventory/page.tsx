import { db } from "@/lib/db";
import { items, categories, units, stockInLines, issueLines } from "@/lib/db/schema";
import { sql, sum, eq, asc } from "drizzle-orm";
import { PageHeader, Card, StatCard, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, qty } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  // Aggregate stock-in quantities per item (subquery avoids cross-join multiplier)
  const siAgg = db
    .select({
      itemId: stockInLines.itemId,
      totalQty: sum(stockInLines.quantity).as("total_qty"),
      totalCost: sum(sql<number>`${stockInLines.quantity} * ${stockInLines.unitCost}`).as("total_cost"),
    })
    .from(stockInLines)
    .groupBy(stockInLines.itemId)
    .as("si_agg");

  // Aggregate issued quantities per item
  const ilAgg = db
    .select({
      itemId: issueLines.itemId,
      totalIssued: sum(issueLines.qtyIssued).as("total_issued"),
    })
    .from(issueLines)
    .groupBy(issueLines.itemId)
    .as("il_agg");

  const rows = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      category: categories.name,
      unit: units.abbreviation,
      reorderLevel: items.reorderLevel,
      totalQty: siAgg.totalQty,
      totalCost: siAgg.totalCost,
      totalIssued: ilAgg.totalIssued,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(units, eq(items.unitId, units.id))
    .leftJoin(siAgg, eq(siAgg.itemId, items.id))
    .leftJoin(ilAgg, eq(ilAgg.itemId, items.id))
    .where(eq(items.active, true))
    .orderBy(asc(items.name));

  const data = rows.map((r) => {
    const totalQty = Number(r.totalQty ?? 0);
    const totalIssued = Number(r.totalIssued ?? 0);
    const totalCost = Number(r.totalCost ?? 0);
    const onHand = totalQty - totalIssued;
    const avgUnitCost = totalQty > 0 ? totalCost / totalQty : 0;
    const value = Math.max(0, onHand) * avgUnitCost;
    const belowReorder = onHand < r.reorderLevel;
    return { ...r, onHand, avgUnitCost, value, belowReorder };
  });

  const totalValue = data.reduce((s, r) => s + r.value, 0);
  const reorderCount = data.filter((r) => r.belowReorder).length;

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Live on-hand balances from the main store"
        icon={<Icon name="boxes" size={24} />}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          value={String(data.length)}
          label="Active Items"
          color="#2B5DA5"
          icon={<Icon name="box" size={22} />}
        />
        <StatCard
          value={etb(totalValue)}
          label="Total Inventory Value"
          color="#2f9e6f"
          icon={<Icon name="tag" size={22} />}
        />
        <StatCard
          value={String(reorderCount)}
          label="Items Below Reorder Level"
          color={reorderCount > 0 ? "#c0392b" : "#2f9e6f"}
          icon={<Icon name="inbox" size={22} />}
        />
      </div>

      {/* Inventory table */}
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Unit</th>
              <th className="py-2 pr-4 font-medium text-right">On Hand</th>
              <th className="py-2 pr-4 font-medium text-right">Avg Cost</th>
              <th className="py-2 pr-4 font-medium text-right">Value</th>
              <th className="py-2 font-medium">Status</th>
            </>
          }
        >
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="py-12 text-center text-sm"
                style={{ color: "var(--text-dim)" }}
              >
                No active items found.
              </td>
            </tr>
          ) : (
            data.map((r) => (
              <tr
                key={r.id}
                className="border-t"
                style={{
                  borderColor: "var(--card-border)",
                  background: r.belowReorder ? "rgba(216,80,77,0.04)" : undefined,
                }}
              >
                <td className="py-2.5 pr-4 font-medium">{r.name}</td>
                <td className="py-2.5 pr-4 text-xs font-mono" style={{ color: "var(--text-dim)" }}>
                  {r.sku}
                </td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {r.category ?? "—"}
                </td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {r.unit ?? "—"}
                </td>
                <td
                  className="py-2.5 pr-4 text-right font-medium"
                  style={{ color: r.onHand <= 0 ? "var(--red)" : undefined }}
                >
                  {qty(r.onHand)}
                </td>
                <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>
                  {etb(r.avgUnitCost)}
                </td>
                <td className="py-2.5 pr-4 text-right font-medium">{etb(r.value)}</td>
                <td className="py-2.5">
                  {r.belowReorder ? (
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "rgba(216,80,77,0.15)", color: "#e8716e" }}
                    >
                      Reorder
                    </span>
                  ) : (
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "rgba(47,158,111,0.15)", color: "#46c08a" }}
                    >
                      OK
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
