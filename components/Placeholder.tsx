import { PageHeader, Card } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function Placeholder({ title, icon, note }: { title: string; icon: string; note?: string }) {
  return (
    <>
      <PageHeader title={title} icon={<Icon name={icon} size={24} />} />
      <Card>
        <div className="py-16 text-center">
          <div className="inline-grid place-items-center h-14 w-14 rounded-full mb-4" style={{ background: "var(--canvas)", color: "var(--text-dim)" }}>
            <Icon name={icon} size={26} />
          </div>
          <h2 className="text-lg font-medium">{title} — coming next</h2>
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--text-dim)" }}>
            {note ?? "This module is scaffolded in the data model and ready to build. The schema, auth, and report layer it depends on are already in place."}
          </p>
        </div>
      </Card>
    </>
  );
}
