import { getReceivedReport } from "@/lib/reports";
import { db } from "@/lib/db";
import { items, branches, issues } from "@/lib/db/schema";
import { PageHeader, Card, StatCard, StatusPill, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, qty, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [itemRows, branchRows] = await Promise.all([
    db.select().from(items),
    db.select().from(branches),
  ]);
  const report = await getReceivedReport();
  const k = report.kpi;
  const activeBranches = branchRows.filter((b) => b.active).length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of main store activity" icon={<Icon name="gauge" size={24} />} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <StatCard color="var(--blue)" icon={<Icon name="box" size={26} />} value={String(itemRows.length)} label="Items" />
        <StatCard color="var(--green)" icon={<Icon name="building" size={26} />} value={String(activeBranches)} label="Active Branches" sub={`${branchRows.length} total`} />
        <StatCard color="var(--gold)" icon={<Icon name="inbox" size={26} />} value={String(k.totalReceipts)} label="Receipts" sub={`${etb(k.receivedValue)} received`} />
        <StatCard color="var(--red)" icon={<Icon name="x" size={26} />} value={String(k.rejectedDeliveries)} label="Rejected Deliveries" sub={`${k.lineItemsRejected} line items`} />
      </div>

      <Card title="Recent Receipts">
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium text-right">Received</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </>
          }
        >
          {report.detail.slice(0, 8).map((d) => (
            <tr key={d.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{d.reference}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{d.branch}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{shortDate(d.issuedAt)}</td>
              <td className="py-2.5 pr-4 text-right">{qty(d.received)}</td>
              <td className="py-2.5 pr-4"><StatusPill status={d.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
