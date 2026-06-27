import { db } from "@/lib/db";
import { branches, users, items, stockIns, issues } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [[b], [u], [it], [si], [iss]] = await Promise.all([
    db.select({ n: count() }).from(branches),
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(items),
    db.select({ n: count() }).from(stockIns),
    db.select({ n: count() }).from(issues),
  ]);

  const stats = [
    { label: "Branches", value: b.n, icon: "building" },
    { label: "Users", value: u.n, icon: "users" },
    { label: "Items", value: it.n, icon: "box" },
    { label: "Stock-In Records", value: si.n, icon: "download" },
    { label: "Issues", value: iss.n, icon: "send" },
  ] as const;

  return (
    <>
      <PageHeader title="Settings" subtitle="System information and configuration" icon={<Icon name="cog" size={24} />} />

      <div className="space-y-4">
        <Card title="System Information">
          <dl className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {[
              { label: "Application", value: "Bina Inventory" },
              { label: "Database", value: "SQLite via Turso / libsql" },
              { label: "Framework", value: "Next.js 16 · App Router · Turbopack" },
              { label: "Auth", value: "JWT (HS256) · 7-day session" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-3 text-sm">
                <dt style={{ color: "var(--text-dim)" }}>{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Database Stats">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg p-4 text-center" style={{ background: "var(--canvas)", border: "1px solid var(--card-border)" }}>
                <Icon name={s.icon} size={20} className="mx-auto mb-2 opacity-60" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
