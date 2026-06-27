"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { qty } from "@/lib/format";
import { receiveIssue } from "./actions";

type ReceiveLine = { id: string; itemName: string; qtyIssued: number };
type LineState = { received: string; rejected: string };

export function ReceiveForm({ issueId, lines }: { issueId: string; lines: ReceiveLine[] }) {
  const [state, action, pending] = useActionState(receiveIssue, null);
  const [inputs, setInputs] = useState<Record<string, LineState>>(
    Object.fromEntries(lines.map((l) => [l.id, { received: "", rejected: "" }]))
  );

  function set(id: string, k: keyof LineState, v: string) {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [k]: v } }));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="issueId" value={issueId} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: "var(--text-dim)" }}>
              <th className="pb-2 pr-3 font-medium">Item</th>
              <th className="pb-2 pr-3 font-medium w-28 text-right">Issued</th>
              <th className="pb-2 pr-3 font-medium w-32">Received</th>
              <th className="pb-2 pr-3 font-medium w-32">Rejected</th>
              <th className="pb-2 pr-3 font-medium w-24 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const inp = inputs[line.id] ?? { received: "", rejected: "" };
              const r = parseFloat(inp.received) || 0;
              const j = parseFloat(inp.rejected) || 0;
              const remaining = line.qtyIssued - r - j;
              const over = remaining < 0;
              return (
                <tr key={line.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                  <td className="py-2.5 pr-3 font-medium">{line.itemName}</td>
                  <td className="py-2.5 pr-3 text-right" style={{ color: "var(--text-dim)" }}>
                    {qty(line.qtyIssued)}
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      name={`received_${line.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      max={line.qtyIssued}
                      value={inp.received}
                      onChange={(e) => set(line.id, "received", e.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      name={`rejected_${line.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      max={line.qtyIssued}
                      value={inp.rejected}
                      onChange={(e) => set(line.id, "rejected", e.target.value)}
                      className="input"
                      placeholder="0"
                    />
                  </td>
                  <td
                    className="py-2.5 pr-3 text-right text-sm font-medium"
                    style={{ color: over ? "var(--red)" : "var(--text-dim)" }}
                  >
                    {over ? "Over!" : qty(remaining)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
          <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            Leave all zeros to mark as partially received / pending.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: "var(--bina-blue)" }}
        >
          <Icon name="check" size={16} />
          {pending ? "Saving…" : "Confirm Receipt"}
        </button>
      </div>
    </form>
  );
}
