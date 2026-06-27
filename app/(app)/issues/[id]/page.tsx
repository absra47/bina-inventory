import { db } from "@/lib/db";
import { issues, issueLines, branches, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader, Card, Table, StatusPill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, qty, shortDate } from "@/lib/format";
import Link from "next/link";
import { ReceiveForm } from "../ReceiveForm";

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Load issue with branch
  const [issue] = await db
    .select({
      id: issues.id,
      reference: issues.reference,
      status: issues.status,
      issuedAt: issues.issuedAt,
      receivedAt: issues.receivedAt,
      branch: branches.name,
    })
    .from(issues)
    .leftJoin(branches, eq(issues.branchId, branches.id))
    .where(eq(issues.id, id))
    .limit(1);

  if (!issue) notFound();

  // Load lines with item name
  const lines = await db
    .select({
      id: issueLines.id,
      itemName: items.name,
      itemSku: items.sku,
      qtyIssued: issueLines.qtyIssued,
      qtyReceived: issueLines.qtyReceived,
      qtyRejected: issueLines.qtyRejected,
      unitCost: issueLines.unitCost,
      status: issueLines.status,
    })
    .from(issueLines)
    .leftJoin(items, eq(issueLines.itemId, items.id))
    .where(eq(issueLines.issueId, id));

  const totalValue = lines.reduce((s, l) => s + l.qtyIssued * l.unitCost, 0);
  const isPending = issue.status === "PENDING";

  return (
    <>
      <PageHeader
        title={issue.reference}
        subtitle={`${issue.branch ?? "Unknown branch"} · Issued ${shortDate(issue.issuedAt)}`}
        icon={<Icon name="send" size={24} />}
        action={
          <div className="flex items-center gap-3">
            <StatusPill status={issue.status} />
            <Link
              href="/issues"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
              style={{ border: "1px solid var(--card-border)", color: "var(--text-dim)" }}
            >
              ← Back
            </Link>
          </div>
        }
      />

      {/* Line items card */}
      <Card>
        {isPending ? (
          <>
            <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-dim)" }}>
              Enter received and rejected quantities for each line:
            </h2>
            <ReceiveForm
              issueId={issue.id}
              lines={lines.map((l) => ({
                id: l.id,
                itemName: `${l.itemName ?? "Unknown"} (${l.itemSku ?? "—"})`,
                qtyIssued: l.qtyIssued,
              }))}
            />
          </>
        ) : (
          <>
            {issue.receivedAt && (
              <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
                Received on {shortDate(issue.receivedAt)}
              </p>
            )}
            <Table
              head={
                <>
                  <th className="py-2 pr-4 font-medium">Item</th>
                  <th className="py-2 pr-4 font-medium text-right">Issued</th>
                  <th className="py-2 pr-4 font-medium text-right">Received</th>
                  <th className="py-2 pr-4 font-medium text-right">Rejected</th>
                  <th className="py-2 pr-4 font-medium text-right">Value</th>
                  <th className="py-2 font-medium">Status</th>
                </>
              }
            >
              {lines.map((l) => (
                <tr key={l.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{l.itemName ?? "—"}</span>
                    <span className="ml-2 text-xs" style={{ color: "var(--text-dim)" }}>
                      {l.itemSku}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>
                    {qty(l.qtyIssued)}
                  </td>
                  <td className="py-2.5 pr-4 text-right">{qty(l.qtyReceived)}</td>
                  <td
                    className="py-2.5 pr-4 text-right"
                    style={{ color: l.qtyRejected > 0 ? "var(--red)" : undefined }}
                  >
                    {qty(l.qtyRejected)}
                  </td>
                  <td className="py-2.5 pr-4 text-right">{etb(l.qtyReceived * l.unitCost)}</td>
                  <td className="py-2.5">
                    <StatusPill status={l.status} />
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4" colSpan={4}>
                  Total
                </td>
                <td className="py-2.5 pr-4 text-right">{etb(totalValue)}</td>
                <td />
              </tr>
            </Table>
          </>
        )}
      </Card>
    </>
  );
}
