"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Dialog, type DialogHandle } from "@/components/Dialog";
import { createUnit, updateUnit } from "./actions";

type Unit = { id: string; name: string; abbreviation: string };

export function UnitManager({ units }: { units: Unit[] }) {
  const dialogRef = useRef<DialogHandle>(null);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openNew() { setEditing(null); setError(null); dialogRef.current?.open(); }
  function openEdit(u: Unit) { setEditing(u); setError(null); dialogRef.current?.open(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = editing ? await updateUnit(fd) : await createUnit(fd);
    if (result.error) { setError(result.error); return; }
    dialogRef.current?.close();
    startTransition(() => router.refresh());
  }

  return (
    <>
      <PageHeader
        title="Units of Measure"
        subtitle={`${units.length} units`}
        icon={<Icon name="ruler" size={24} />}
        action={
          <button onClick={openNew} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="plus" size={16} /> New Unit
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Abbreviation</th>
              <th className="py-2" />
            </>
          }
        >
          {units.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-10 text-center text-sm" style={{ color: "var(--text-dim)" }}>No units yet.</td>
            </tr>
          ) : (
            units.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4 font-medium">{u.name}</td>
                <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{u.abbreviation}</td>
                <td className="py-2.5 text-right">
                  <button onClick={() => openEdit(u)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: "var(--text)" }}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Dialog ref={dialogRef} title={editing ? "Edit Unit" : "New Unit"}>
        <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="p-5 space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-sm mb-1.5">Name *</label>
            <input name="name" className="input" defaultValue={editing?.name ?? ""} required autoFocus />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Abbreviation *</label>
            <input name="abbreviation" className="input" defaultValue={editing?.abbreviation ?? ""} placeholder="e.g. kg, pcs, L" required />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            {error && <p className="text-sm mr-auto" style={{ color: "var(--red)" }}>{error}</p>}
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 text-sm rounded-md" style={{ border: "1px solid var(--card-border)" }}>Cancel</button>
            <button type="submit" disabled={pending} className="px-4 py-2 text-sm rounded-md font-medium text-white disabled:opacity-60" style={{ background: "var(--bina-blue)" }}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
