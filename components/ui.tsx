import React from "react";

export function PageHeader({
  title, subtitle, icon, action,
}: { title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2.5">
          {icon}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl ${className ?? ""}`}
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      {title && (
        <div className="px-5 py-3.5 border-b text-sm font-semibold" style={{ borderColor: "var(--card-border)" }}>
          {title}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  value, label, sub, color, icon,
}: { value: string; label: string; sub?: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 text-white" style={{ background: color }}>
      <div className="flex justify-center mb-2 opacity-90">{icon}</div>
      <div className="text-3xl font-bold text-center leading-none">{value}</div>
      <div className="text-center text-sm mt-2 font-medium opacity-95">{label}</div>
      {sub && <div className="text-center text-sm mt-1 font-semibold">{sub}</div>}
    </div>
  );
}

const pillColors: Record<string, { bg: string; fg: string }> = {
  RECEIVED: { bg: "rgba(47,158,111,0.15)", fg: "#46c08a" },
  PARTIAL: { bg: "rgba(224,168,46,0.15)", fg: "#e6b94a" },
  REJECTED: { bg: "rgba(216,80,77,0.15)", fg: "#e8716e" },
  PENDING: { bg: "rgba(138,160,189,0.15)", fg: "#9fb3cd" },
};

export function StatusPill({ status }: { status: string }) {
  const c = pillColors[status] ?? pillColors.PENDING;
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: c.bg, color: c.fg }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function Table({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: "var(--text-dim)" }}>{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
