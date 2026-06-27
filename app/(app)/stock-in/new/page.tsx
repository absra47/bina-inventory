import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { StockInForm } from "../StockInForm";

export const dynamic = "force-dynamic";

export default async function NewStockInPage() {
  const itemRows = await db
    .select({
      id: items.id,
      name: items.name,
      sku: items.sku,
      expiryTracked: items.expiryTracked,
    })
    .from(items)
    .where(eq(items.active, true))
    .orderBy(asc(items.name));

  return (
    <>
      <PageHeader
        title="New Stock In"
        subtitle="Record a supplier delivery into the main store"
        icon={<Icon name="download" size={24} />}
        action={
          <Link
            href="/stock-in"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
            style={{ border: "1px solid var(--card-border)", color: "var(--text-dim)" }}
          >
            ← Back
          </Link>
        }
      />

      {itemRows.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-dim)" }}>
            No active items in the catalogue.{" "}
            <Link href="/items" style={{ color: "var(--bina-blue)" }}>
              Add items first.
            </Link>
          </p>
        </Card>
      ) : (
        <Card>
          <StockInForm items={itemRows} />
        </Card>
      )}
    </>
  );
}
