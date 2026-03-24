import { NavLink } from "@/components/NavLink";
import { Globe, Calendar, FileText, AlertTriangle, BarChart3, Send } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Globe },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/report-disaster", label: "Report", icon: Send },
];

export function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">S</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            sankat<span className="text-primary">.ai</span>
          </span>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground"
              activeClassName="bg-secondary text-foreground"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>
    </header>
  );
}
