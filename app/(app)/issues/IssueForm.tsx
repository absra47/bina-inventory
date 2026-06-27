"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { etb } from "@/lib/format";
import { createIssue } from "./actions";

type Branch = { id: string; name: string };
type Item = { id: string; name: string; sku: string };
type Line = { itemId: string; qty: string; cost: string };

const blank = (): Line => ({ itemId: "", qty: "", cost: "" });

export function IssueForm({ branches, items }: { branches: Branch[]; items: Item[] }) {
  const [state, action, pending] = useActionState(createIssue, null);
  const [lines, setLines] = useState<Line[]>([blank()]);

  const update = (i: number, k: keyof Line, v: string) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));

  const remove = (i: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== i));

  const total = lines.reduce((s, l) => {
    const q = parseFloat(l.qty) || 0;
    const c = parseFloat(l.cost) || 0;
    return s + q * c;
  }, 0);

  return (
    <form action={action} className="space-y-6">
      {/* Header fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1.5">
            Branch <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <select name="branchId" className="input" required defaultValue="">
            <option value="" disabled>Select branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1.5">
            Date <span style={{ color: "var(--red)" }}>*</span>
          </label>
          <input
            name="date"
            type="date"
            className="input"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
      </div>

      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: "var(--text-dim)" }}>
              <th className="pb-2 pr-3 font-medium">Item</th>
              <th className="pb-2 pr-3 font-medium w-28">Qty Issued</th>
              <th className="pb-2 pr-3 font-medium w-36">Unit Cost (ETB)</th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2 pr-3">
                  <select
                    name={`item_${i}`}
                    value={line.itemId}
                    onChange={(e) => update(i, "itemId", e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Select item…</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.sku})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-3">
                  <input
                    name={`qty_${i}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.qty}
                    onChange={(e) => update(i, "qty", e.target.value)}
                    className="input"
                    placeholder="0"
                    required
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    name={`cost_${i}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.cost}
                    onChange={(e) => update(i, "cost", e.target.value)}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={lines.length === 1}
                    className="p-1 rounded disabled:opacity-25 transition-colors"
                    style={{ color: "var(--red)" }}
                    aria-label="Remove line"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setLines((prev) => [...prev, blank()])}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors"
        style={{ color: "var(--bina-blue)", border: "1px dashed var(--card-border)" }}
      >
        <Icon name="plus" size={15} /> Add Line
      </button>

      {/* Footer: error + total + submit */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div>
          {state?.error && (
            <p className="text-sm" style={{ color: "var(--red)" }}>
              {state.error}
            </p>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: "var(--text-dim)" }}>Total Value</p>
            <p className="text-lg font-semibold">{etb(total)}</p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--bina-blue)" }}
          >
            <Icon name="send" size={16} />
            {pending ? "Saving…" : "Create Issue"}
          </button>
        </div>
      </div>
    </form>
  );
}
