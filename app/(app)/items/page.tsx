import { db } from "@/lib/db";
import { items, categories, units } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { qty } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const rows = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      reorderLevel: items.reorderLevel,
      expiryTracked: items.expiryTracked,
      active: items.active,
      category: categories.name,
      unit: units.abbreviation,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(units, eq(items.unitId, units.id));

  return (
    <>
      <PageHeader
        title="Items"
        subtitle={`${rows.length} items in the catalogue`}
        icon={<Icon name="box" size={24} />}
        action={
          <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="box" size={16} /> New Item
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Unit</th>
              <th className="py-2 pr-4 font-medium text-right">Reorder Level</th>
              <th className="py-2 pr-4 font-medium">Expiry</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{r.sku}</td>
              <td className="py-2.5 pr-4">{r.name}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.category}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.unit}</td>
              <td className="py-2.5 pr-4 text-right">{qty(r.reorderLevel)}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{r.expiryTracked ? "Tracked" : "—"}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={r.active ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(138,160,189,0.15)", color: "#9fb3cd" }}>
                  {r.active ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
