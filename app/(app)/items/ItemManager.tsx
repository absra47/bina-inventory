"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Dialog, type DialogHandle } from "@/components/Dialog";
import { qty } from "@/lib/format";
import { createItem, updateItem, toggleItem } from "./actions";

type Item = {
  id: string; name: string; sku: string; reorderLevel: number;
  expiryTracked: boolean; active: boolean; category: string | null; unit: string | null;
  categoryId: string; unitId: string;
};
type Category = { id: string; name: string };
type Unit = { id: string; name: string; abbreviation: string };

export function ItemManager({
  items, categories, units,
}: {
  items: Item[]; categories: Category[]; units: Unit[];
}) {
  const dialogRef = useRef<DialogHandle>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [expiryTracked, setExpiryTracked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openNew() {
    setEditing(null); setExpiryTracked(false); setError(null); dialogRef.current?.open();
  }
  function openEdit(i: Item) {
    setEditing(i); setExpiryTracked(i.expiryTracked); setError(null); dialogRef.current?.open();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("expiryTracked", String(expiryTracked));
    const result = editing ? await updateItem(fd) : await createItem(fd);
    if (result.error) { setError(result.error); return; }
    dialogRef.current?.close();
    startTransition(() => router.refresh());
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleItem(id, active);
    startTransition(() => router.refresh());
  }

  const active = items.filter((i) => i.active).length;

  return (
    <>
      <PageHeader
        title="Items"
        subtitle={`${items.length} items · ${active} active`}
        icon={<Icon name="box" size={24} />}
        action={
          <button onClick={openNew} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--bina-blue)" }}>
            <Icon name="plus" size={16} /> New Item
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Unit</th>
              <th className="py-2 pr-4 font-medium text-right">Reorder</th>
              <th className="py-2 pr-4 font-medium">Expiry</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2" />
            </>
          }
        >
          {items.map((i) => (
            <tr key={i.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="py-2.5 pr-4 font-mono text-xs font-medium">{i.sku}</td>
              <td className="py-2.5 pr-4">{i.name}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{i.category}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{i.unit}</td>
              <td className="py-2.5 pr-4 text-right" style={{ color: "var(--text-dim)" }}>{qty(i.reorderLevel)}</td>
              <td className="py-2.5 pr-4" style={{ color: "var(--text-dim)" }}>{i.expiryTracked ? "Tracked" : "—"}</td>
              <td className="py-2.5 pr-4">
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={i.active ? { background: "rgba(47,158,111,0.15)", color: "#46c08a" } : { background: "rgba(138,160,189,0.15)", color: "#9fb3cd" }}>
                  {i.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-2.5">
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(i)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: "var(--text)" }}>Edit</button>
                  <button onClick={() => handleToggle(i.id, i.active)} className="text-xs px-3 py-1 rounded" style={{ background: "var(--card-border)", color: i.active ? "var(--red)" : "#46c08a" }}>
                    {i.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Dialog ref={dialogRef} title={editing ? "Edit Item" : "New Item"}>
        <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="p-5 space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm mb-1.5">Item Name *</label>
              <input name="name" className="input" defaultValue={editing?.name ?? ""} required autoFocus />
            </div>
            <div>
              <label className="block text-sm mb-1.5">SKU *</label>
              <input name="sku" className="input uppercase" defaultValue={editing?.sku ?? ""} required />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Reorder Level</label>
              <input name="reorderLevel" type="number" min="0" step="0.01" className="input" defaultValue={editing?.reorderLevel ?? 0} />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Category *</label>
              <select name="categoryId" className="input" defaultValue={editing?.categoryId ?? ""} required>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5">Unit *</label>
              <select name="unitId" className="input" defaultValue={editing?.unitId ?? ""} required>
                <option value="">Select…</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={expiryTracked}
                  onChange={(e) => setExpiryTracked(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Track expiry date for this item
              </label>
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
