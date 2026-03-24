import { AlertTriangle, TrendingUp, Activity, ChevronRight, X } from "lucide-react";
import { useState } from "react";

const recentAlerts = [
  { id: 1, type: "Earthquake", location: "Turkey", severity: "critical", time: "2m ago", magnitude: "6.4" },
  { id: 2, type: "Flood", location: "Bangladesh", severity: "high", time: "15m ago", magnitude: "Severe" },
  { id: 3, type: "Wildfire", location: "California", severity: "moderate", time: "1h ago", magnitude: "Active" },
  { id: 4, type: "Cyclone", location: "Philippines", severity: "high", time: "3h ago", magnitude: "Cat 3" },
];

const severityColor: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  moderate: "bg-primary",
  low: "bg-success",
};

export function RightSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-20 z-40 rounded-l-lg bg-card border border-r-0 border-border p-2 hover:bg-secondary transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
      </button>
    );
  }

  return (
    <aside className="w-72 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Live Feed</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-border">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Active</p>
          <p className="text-lg font-semibold text-foreground">24</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase">Critical</p>
          <p className="text-lg font-semibold text-destructive">7</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase mb-3">Recent Alerts</p>
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-lg border border-border bg-secondary/30 p-3 hover:bg-secondary/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${severityColor[alert.severity]}`} />
                <span className="text-xs font-medium text-foreground">{alert.type}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{alert.time}</span>
            </div>
            <div className="mt-1.5 ml-4">
              <p className="text-[11px] text-muted-foreground">{alert.location}</p>
              <p className="text-[10px] font-mono text-primary mt-0.5">{alert.magnitude}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-warning" />
          <span className="text-[10px] font-mono">+12% events this week</span>
        </div>
      </div>
    </aside>
  );
}
