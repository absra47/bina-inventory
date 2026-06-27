import { getReceivedReport } from "@/lib/reports";
import { PageHeader, Card, StatCard, StatusPill, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { etb, qty, shortDate } from "@/lib/format";
import { ReceivingTrendChart } from "./Chart";

export const dynamic = "force-dynamic";

export default async function ReceivedReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; branchId?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from ? new Date(sp.from) : undefined;
  const to = sp.to ? new Date(sp.to + "T23:59:59") : undefined;
  const branchId = sp.branchId || undefined;

  const report = await getReceivedReport({ from, to, branchId });
  const k = report.kpi;

  return (
    <>
      <PageHeader
        title="Received Items Report"
        subtitle="Items received by branches from the main store"
        icon={<Icon name="inbox" size={24} />}
        action={
          <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm" style={{ border: "1px solid var(--card-border)", color: "var(--bina-blue)" }}>
            <Icon name="print" size={16} /> Print Report
          </button>
        }
      />

      {/* Filters */}
      <Card className="mb-5">
        <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" method="get">
          <Field label="From Date">
            <input type="date" name="from" defaultValue={sp.from} className="input" />
          </Field>
          <Field label="To Date">
            <input type="date" name="to" defaultValue={sp.to} className="input" />
          </Field>
          <Field label="Branch">
            <select name="branchId" defaultValue={branchId} className="input">
              <option value="">All Branches</option>
              {report.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <button type="submit" className="rounded-md px-4 py-2 text-sm font-medium text-white flex items-center justify-center gap-2" style={{ background: "var(--bina-blue)" }}>
            <Icon name="search" size={16} /> Filter
          </button>
          <a href="/reports/received" className="rounded-md px-4 py-2 text-sm text-center" style={{ border: "1px solid var(--card-border)", color: "var(--text-dim)" }}>
            Reset
          </a>
        </form>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <StatCard
          color="var(--green)" icon={<Icon name="inbox" size={26} />}
          value={String(k.totalReceipts)} label="Total Receipts"
          sub={`${etb(k.receivedValue)} received`}
        />
        <StatCard
          color="var(--blue)" icon={<Icon name="clipboard" size={26} />}
          value={String(k.fullyReceived)} label="Fully Received"
          sub={`${k.partial} partial`}
        />
        <StatCard
          color="var(--red)" icon={<Icon name="x" size={26} />}
          value={String(k.rejectedDeliveries)} label="Rejected Deliveries"
          sub={`${k.lineItemsRejected} line items rejected`}
        />
        <StatCard
          color="var(--gold)" icon={<Icon name="box" size={26} />}
          value={qty(k.totalReceived)} label="Total Qty Received"
          sub={`of ${qty(k.totalIssued)} issued`}
        />
      </div>

      {/* Acceptance rate */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: "var(--text-dim)" }}>Overall Acceptance Rate</span>
          <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>{k.acceptanceRate.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
          <div className="h-full rounded-full" style={{ width: `${k.acceptanceRate}%`, background: "var(--green)" }} />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>
          Received {qty(k.totalReceived)} of {qty(k.totalIssued)} issued
        </p>
      </Card>

      {/* Trend */}
      <Card title="Daily Receiving Trend" className="mb-5">
        {report.trend.length ? (
          <ReceivingTrendChart data={report.trend} />
        ) : (
          <p className="text-sm py-10 text-center" style={{ color: "var(--text-dim)" }}>No data for the selected range.</p>
        )}
      </Card>

      {/* Detail table */}
      <Card title={`Receipts (${report.detail.length})`}>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Reference</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium text-right">Issued</th>
              <th className="py-2 pr-4 font-medium text-right">Received</th>
              <th className="py-2 pr-4 font-medium text-right">Rejected</th>
              <th className="py-2 pr-4 font-medium text-right">Value</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </>
          }
        >
          {report.detail.map((d) => (
            <tr key={d.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{d.reference}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{d.branch}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{shortDate(d.issuedAt)}</td>
              <td className="py-2.5 pr-4 text-right">{qty(d.issued)}</td>
              <td className="py-2.5 pr-4 text-right">{qty(d.received)}</td>
              <td className="py-2.5 pr-4 text-right" style={{ color: d.rejected > 0 ? "var(--red)" : undefined }}>{qty(d.rejected)}</td>
              <td className="py-2.5 pr-4 text-right">{etb(d.value)}</td>
              <td className="py-2.5 pr-4"><StatusPill status={d.status} /></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs mb-1.5" style={{ color: "var(--text-dim)" }}>{label}</span>
      {children}
    </label>
  );
}
