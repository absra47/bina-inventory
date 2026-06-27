export type NavItem = { label: string; href: string; icon: string };
export type NavGroup = { heading?: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/", icon: "gauge" }],
  },
  {
    heading: "Management",
    items: [
      { label: "Branches", href: "/branches", icon: "building" },
      { label: "Users", href: "/users", icon: "users" },
      { label: "Categories", href: "/categories", icon: "tag" },
      { label: "Units", href: "/units", icon: "ruler" },
      { label: "Items", href: "/items", icon: "box" },
    ],
  },
  {
    heading: "Main Store",
    items: [
      { label: "Main Inventory", href: "/inventory", icon: "boxes" },
      { label: "Stock In", href: "/stock-in", icon: "download" },
      { label: "Issue Materials", href: "/issues", icon: "send" },
    ],
  },
  {
    heading: "Reports",
    items: [
      { label: "Inventory Report", href: "/reports/inventory", icon: "clipboard" },
      { label: "Received Report", href: "/reports/received", icon: "inbox" },
      { label: "Stock Movement", href: "/reports/movement", icon: "swap" },
      { label: "Expiry Report", href: "/reports/expiry", icon: "calendar" },
      { label: "Rejected Items", href: "/reports/rejected", icon: "x" },
    ],
  },
  {
    heading: "Settings",
    items: [
      { label: "Activity Logs", href: "/logs", icon: "clock" },
      { label: "System Settings", href: "/settings", icon: "cog" },
    ],
  },
];
