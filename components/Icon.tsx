import React from "react";

const paths: Record<string, React.ReactNode> = {
  gauge: <><path d="M12 13l4-3" /><path d="M5 19a9 9 0 1 1 14 0" /></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 14a6 6 0 0 1 4 6" /></>,
  tag: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  ruler: <><rect x="2" y="8" width="20" height="8" rx="1" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></>,
  box: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /></>,
  boxes: <><path d="M3 7l4-2 4 2-4 2-4-2zM13 7l4-2 4 2-4 2-4-2zM8 16l4-2 4 2-4 2-4-2z" /></>,
  download: <><path d="M12 3v12m0 0l-4-4m4 4l4-4" /><path d="M4 21h16" /></>,
  send: <><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>,
  clipboard: <><rect x="6" y="4" width="12" height="16" rx="1" /><path d="M9 4h6v3H9z" /><path d="M9 11h6M9 15h4" /></>,
  inbox: <><path d="M4 13l2-8h12l2 8" /><path d="M4 13v6h16v-6h-5l-1 2h-4l-1-2H4z" /></>,
  swap: <><path d="M7 7h13l-3-3M17 17H4l3 3" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="1" /><path d="M4 9h16M9 3v4M15 3v4" /></>,
  x: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  print: <><path d="M6 9V3h12v6M6 18h12v3H6z" /><rect x="3" y="9" width="18" height="9" rx="1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  check: <><path d="M20 6L9 17l-5-5" /></>,
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.box}
    </svg>
  );
}
