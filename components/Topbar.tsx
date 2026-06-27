import { Icon } from "./Icon";
import { logout } from "@/app/actions";

export function Topbar({ userName }: { userName: string }) {
  return (
    <header
      className="h-16 shrink-0 flex items-center justify-between px-6 text-white"
      style={{ background: "var(--bina-blue)" }}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold">Bina Software</span>
      </div>
      <div className="flex items-center gap-5">
        <button className="opacity-90 hover:opacity-100" aria-label="Notifications">
          <Icon name="bell" size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center text-sm font-semibold">
            {userName.charAt(0)}
          </div>
          <span className="text-sm">{userName}</span>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-1.5 text-sm opacity-90 hover:opacity-100" type="submit">
            <Icon name="logout" size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
