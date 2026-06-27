"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Dialog, type DialogHandle } from "@/components/Dialog";
import { shortDate } from "@/lib/format";
import { createUser, updateUser, toggleUser } from "./actions";

type User = {
  id: string; name: string; email: string; role: string;
  active: boolean; createdAt: Date; branch: string | null; branchId: string | null;
};
type Branch = { id: string; name: string };

const ROLES = ["ADMIN", "MANAGER", "STAFF"] as const;

export function UserManager({ users, branches }: { users: User[]; branches: Branch[] }) {
  const dialogRef = useRef<DialogHandle>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openNew() { setEditing(null); setError(null); dialogRef.current?.open(); }
  function openEdit(u: User) { setEditing(u); setError(null); dialogRef.current?.open(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = editing ? await updateUser(fd) : await createUser(fd);
    if (result.error) { setError(result.error); return; }
    dialogRef.current?.close();
    startTransition(() => router.refresh());
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleUser(id, active);
    startTransition(() => router.refresh());
  }

  const active = users.filter((u) => u.active).length;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${users.length} users · ${active} active`}
        icon={<Icon name="users" size={24} />}
        action={
          <button onClick={openNew} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="plus" size={16} /> New User
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 pr-4 font-medium">Branch</th>
              <th className="py-2 pr-4 font-medium">Created</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2" />
            </>
          }
        >
          {users.map((u) => (
            <tr key={u.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-medium">{u.name}</td>
              <td className="py-2.5 pr-4 text-sm" style={{ color: "var(--text-dim)" }}>{u.email}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(43,93,165,0.15)", color: "#4a85d0" }}>
                  {u.role}
                </span>
              </td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{u.branch ?? "—"}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{shortDate(u.createdAt)}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={u.active ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(138,160,189,0.15)", color: "#9fb3cd" }}>
                  {u.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(u)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: "var(--text)" }}>Edit</button>
                  <button onClick={() => handleToggle(u.id, u.active)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: u.active ? "var(--red)" : "#46c08a" }}>
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Dialog ref={dialogRef} title={editing ? "Edit User" : "New User"}>
        <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="p-5 space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm mb-1.5">Full Name *</label>
              <input name="name" className="input" defaultValue={editing?.name ?? ""} required autoFocus />
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1.5">Email *</label>
              <input name="email" type="email" className="input" defaultValue={editing?.email ?? ""} required />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Role *</label>
              <select name="role" className="input" defaultValue={editing?.role ?? "STAFF"}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5">Branch</label>
              <select name="branchId" className="input" defaultValue={editing?.branchId ?? ""}>
                <option value="">No branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1.5">
                Password {editing ? "(leave blank to keep current)" : "*"}
              </label>
              <input
                name="password"
                type="password"
                className="input"
                minLength={editing ? undefined : 6}
                required={!editing}
                placeholder={editing ? "••••••••" : "Min 6 characters"}
              />
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
