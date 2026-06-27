"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Dialog, type DialogHandle } from "@/components/Dialog";
import { shortDate } from "@/lib/format";
import { createBranch, updateBranch, toggleBranch } from "./actions";

type Branch = {
  id: string; name: string; code: string;
  location: string | null; phone: string | null; email: string | null;
  active: boolean; createdAt: Date;
};

export function BranchManager({ branches }: { branches: Branch[] }) {
  const dialogRef = useRef<DialogHandle>(null);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openNew() { setEditing(null); setError(null); dialogRef.current?.open(); }
  function openEdit(b: Branch) { setEditing(b); setError(null); dialogRef.current?.open(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = editing ? await updateBranch(fd) : await createBranch(fd);
    if (result.error) { setError(result.error); return; }
    dialogRef.current?.close();
    startTransition(() => router.refresh());
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleBranch(id, active);
    startTransition(() => router.refresh());
  }

  const active = branches.filter((b) => b.active).length;

  return (
    <>
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branches · ${active} active`}
        icon={<Icon name="building" size={24} />}
        action={
          <button onClick={openNew} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="plus" size={16} /> New Branch
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
              <th className="py-2" />
            </>
          }
        >
          {branches.map((b) => (
            <tr key={b.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium font-mono text-sm">{b.code}</td>
              <td className="py-2.5 pr-4">{b.name}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{b.location ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{b.phone ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{shortDate(b.createdAt)}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={b.active ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(138,160,189,0.15)", color: "#9fb3cd" }}>
                  {b.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(b)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: "var(--text)" }}>Edit</button>
                  <button onClick={() => handleToggle(b.id, b.active)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: b.active ? "var(--red)" : "#46c08a" }}>
                    {b.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Dialog ref={dialogRef} title={editing ? "Edit Branch" : "New Branch"}>
        <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="p-5 space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm mb-1.5">Branch Name *</label>
              <input name="name" className="input" defaultValue={editing?.name ?? ""} required autoFocus />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Code *</label>
              <input name="code" className="input uppercase" defaultValue={editing?.code ?? ""} placeholder="e.g. HQ" required />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Phone</label>
              <input name="phone" className="input" defaultValue={editing?.phone ?? ""} />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Location</label>
              <input name="location" className="input" defaultValue={editing?.location ?? ""} />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Email</label>
              <input name="email" type="email" className="input" defaultValue={editing?.email ?? ""} />
            </div>
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
