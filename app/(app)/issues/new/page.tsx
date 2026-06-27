import { db } from "@/lib/db";
import { branches, items } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";
import Link from "next/link";
import { IssueForm } from "../IssueForm";

export const dynamic = "force-dynamic";

export default async function NewIssuePage() {
  const [branchRows, itemRows] = await Promise.all([
    db
      .select({ id: branches.id, name: branches.name })
      .from(branches)
      .orderBy(asc(branches.name)),
    db
      .select({ id: items.id, name: items.name, sku: items.sku })
      .from(items)
      .where(eq(items.active, true))
      .orderBy(asc(items.name)),
  ]);

  return (
    <>
      <PageHeader
        title="New Issue"
        subtitle="Dispatch materials from the main store to a branch"
        icon={<Icon name="send" size={24} />}
        action={
          <Link
            href="/issues"
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
          <IssueForm branches={branchRows} items={itemRows} />
        </Card>
      )}
    </>
  );
}
