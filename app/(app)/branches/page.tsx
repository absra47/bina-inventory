import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const rows = await db.select().from(branches);

  return (
    <>
      <PageHeader
        title="Branches"
        subtitle={`${rows.length} branches`}
        icon={<Icon name="building" size={24} />}
        action={
          <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="building" size={16} /> New Branch
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Code</th>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Location</th>
              <th className="py-2 pr-4 font-medium">Phone</th>
              <th className="py-2 pr-4 font-medium">Created</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </>
          }
        >
          {rows.map((b) => (
            <tr key={b.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{b.code}</td>
              <td className="py-2.5 pr-4">{b.name}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{b.location ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{b.phone ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{shortDate(b.createdAt)}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={b.active ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(138,160,189,0.15)", color: "#9fb3cd" }}>
                  {b.active ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
