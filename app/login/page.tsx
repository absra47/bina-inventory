"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--sidebar)" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg grid place-items-center font-bold text-white" style={{ background: "var(--bina-blue)" }}>
            B
          </div>
          <span className="text-xl font-semibold">Bina Software</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">
            Multi-branch inventory,<br />in one place.
          </h1>
          <p className="mt-4 max-w-md" style={{ color: "var(--text-dim)" }}>
            Track stock from the main store to every branch — receipts, issues,
            rejections, expiry and movement, with reports that reconcile to the unit.
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>© 2026 Bina Software. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8" style={{ background: "var(--canvas)" }}>
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-dim)" }}>
            Use the demo account below to explore.
          </p>

          <form action={action} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm mb-1.5" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" required defaultValue="admin@bina.et"
                className="w-full rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" required defaultValue="admin123"
                className="w-full rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              />
            </div>

            {state?.error && (
              <p className="text-sm" style={{ color: "var(--red)" }}>{state.error}</p>
            )}

            <button
              type="submit" disabled={pending}
              className="w-full rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-60"
              style={{ background: "var(--bina-blue)" }}
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs" style={{ color: "var(--text-dim)" }}>
            Demo: admin@bina.et · admin123
          </p>
        </div>
      </div>
    </div>
  );
}
