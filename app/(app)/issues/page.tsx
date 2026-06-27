import { db } from "@/lib/db";
import { issues, issueLines, branches } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { PageHeader, Card, Table, StatusPill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const rows = await db
    .select({
      id: issues.id,
      reference: issues.reference,
      status: issues.status,
      issuedAt: issues.issuedAt,
      branch: branches.name,
      lineCount: count(issueLines.id),
    })
    .from(issues)
    .leftJoin(branches, eq(issues.branchId, branches.id))
    .leftJoin(issueLines, eq(issueLines.issueId, issues.id))
    .groupBy(issues.id)
    .orderBy(desc(issues.issuedAt));

  return (
    <>
      <PageHeader
        title="Issue Materials"
        subtitle={`${rows.length} ${rows.length === 1 ? "issue" : "issues"}`}
        icon={<Icon name="send" size={24} />}
        action={
          <Link
            href="/issues/new"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--bina-blue)" }}
          >
            <Icon name="plus" size={16} /> New Issue
          </Link>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Issued</th>
              <th className="py-2 pr-4 font-medium text-right">Lines</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2" />
            </>
          }
        >
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-sm"
                style={{ color: "var(--text-dim)" }}
              >
                No issues yet.{" "}
                <Link href="/issues/new" style={{ color: "var(--bina-blue)" }}>
                  Create the first issue.
                </Link>
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4 font-medium">{r.reference}</td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {r.branch ?? "—"}
                </td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>
                  {shortDate(r.issuedAt)}
                </td>
                <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>
                  {r.lineCount}
                </td>
                <td className="py-2.5 pr-4">
                  <StatusPill status={r.status} />
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/issues/${r.id}`}
                    className="text-xs px-3 py-1 rounded font-medium"
                    style={{
                      background: r.status === "PENDING" ? "var(--bina-blue)" : "var(--card-border)",
                      color: r.status === "PENDING" ? "#fff" : "var(--text)",
                    }}
                  >
                    {r.status === "PENDING" ? "Receive" : "View"}
                  </Link>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
