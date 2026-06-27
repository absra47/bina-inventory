"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icon";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col" style={{ background: "var(--sidebar)" }}>
      <div className="h-16 flex items-center gap-3 px-6 border-b" style={{ borderColor: "var(--card-border)" }}>
        <div
          className="h-8 w-8 rounded-md grid place-items-center font-bold text-white text-sm"
          style={{ background: "var(--bina-blue)" }}
        >
          B
        </div>
        <span className="font-semibold tracking-tight">Bina Software</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.heading && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                {group.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                      style={
                        active
                          ? { background: "var(--bina-blue)", color: "#fff" }
                          : { color: "var(--text-dim)" }
                      }
                    >
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
