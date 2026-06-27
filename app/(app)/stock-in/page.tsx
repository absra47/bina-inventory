import { db } from "@/lib/db";
import { stockIns, stockInLines } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, shortDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StockInPage() {
  const rows = await db
    .select({
      id: stockIns.id,
      reference: stockIns.reference,
      supplier: stockIns.supplier,
      date: stockIns.date,
      totalValue: stockIns.totalValue,
      lineCount: count(stockInLines.id),
    })
    .from(stockIns)
    .leftJoin(stockInLines, eq(stockInLines.stockInId, stockIns.id))
    .groupBy(stockIns.id)
    .orderBy(desc(stockIns.date));

  return (
    <>
      <PageHeader
        title="Stock In"
        subtitle={`${rows.length} supplier ${rows.length === 1 ? "delivery" : "deliveries"}`}
        icon={<Icon name="download" size={24} />}
        action={
          <Link
            href="/stock-in/new"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--bina-blue)" }}
          >
            <Icon name="plus" size={16} /> New Stock In
          </Link>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 pr-4 font-medium">Supplier</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium text-right">Lines</th>
              <th className="py-2 pr-4 font-medium text-right">Total Value</th>
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-12 text-center text-sm"
                style={{ color: "var(--text-dim)" }}
              >
                No stock-ins yet.{" "}
                <Link href="/stock-in/new" style={{ color: "var(--bina-blue)" }}>
                  Record the first delivery.
                </Link>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4 font-medium">{r.reference}</td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {r.supplier ?? "—"}
                </td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {shortDate(r.date)}
                </td>
                <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>
                  {r.lineCount}
                </td>
                <td className="py-2.5 pr-4 text-right font-medium">{etb(r.totalValue)}</td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
