import { LayoutDashboard, History, ClipboardList, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { id: "status", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "History", icon: History },
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

interface Props {
  active: string;
}

export default function MobileNav({ active }: Props) {
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`mobile-nav-item${active === id ? " active" : ""}`}
        >
          <Icon size={20} strokeWidth={1.75} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
