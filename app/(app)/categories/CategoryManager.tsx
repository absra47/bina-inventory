"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Table } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { Dialog, type DialogHandle } from "@/components/Dialog";
import { createCategory, updateCategory } from "./actions";

type Category = { id: string; name: string };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const dialogRef = useRef<DialogHandle>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function openNew() {
    setEditing(null);
    setError(null);
    dialogRef.current?.open();
  }

  function openEdit(c: Category) {
    setEditing(c);
    setError(null);
    dialogRef.current?.open();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = editing ? await updateCategory(fd) : await createCategory(fd);
    if (result.error) { setError(result.error); return; }
    dialogRef.current?.close();
    startTransition(() => router.refresh());
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        icon={<Icon name="tag" size={24} />}
        action={
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--bina-blue)" }}
          >
            <Icon name="plus" size={16} /> New Category
          </button>
        }
      />
      <Card>
        <Table
          head={
            <>
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2" />
            </>
          }
        >
          {categories.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-10 text-center text-sm" style={{ color: "var(--text-dim)" }}>
                No categories yet.
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                <td className="py-2.5 pr-4 font-medium">{c.name}</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs px-3 py-1 rounded"
                    style={{ background: "var(--card-border)", color: "var(--text)" }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Dialog ref={dialogRef} title={editing ? "Edit Category" : "New Category"}>
        <form key={editing?.id ?? "new"} onSubmit={handleSubmit} className="p-5 space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="block text-sm mb-1.5">Name *</label>
            <input name="name" className="input" defaultValue={editing?.name ?? ""} required autoFocus />
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            {error && <p className="text-sm mr-auto" style={{ color: "var(--red)" }}>{error}</p>}
            <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 text-sm rounded-md" style={{ border: "1px solid var(--card-border)" }}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="px-4 py-2 text-sm rounded-md font-medium text-white disabled:opacity-60" style={{ background: "var(--bina-blue)" }}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
