import { MainLayout } from "@/components/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const historicalEvents = [
  { date: "2026-03-15", type: "Earthquake", location: "Nepal", severity: "critical", lives: "450+", cost: "$2.1B" },
  { date: "2026-03-10", type: "Flood", location: "Mumbai, India", severity: "high", lives: "23", cost: "$800M" },
  { date: "2026-02-28", type: "Wildfire", location: "Australia", severity: "high", lives: "12", cost: "$1.5B" },
  { date: "2026-02-14", type: "Cyclone", location: "Madagascar", severity: "critical", lives: "200+", cost: "$600M" },
  { date: "2026-01-22", type: "Tsunami", location: "Indonesia", severity: "critical", lives: "1200+", cost: "$4.2B" },
  { date: "2026-01-05", type: "Drought", location: "East Africa", severity: "moderate", lives: "—", cost: "$3.1B" },
];

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  moderate: "bg-primary/20 text-primary border-primary/30",
  low: "bg-success/20 text-success border-success/30",
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Disaster Calendar</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Historical disaster timeline & event archive</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="rounded-lg border border-border bg-card p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto"
            />
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Event History</p>
              <div className="flex gap-2">
                {["All", "Critical", "High"].map((f) => (
                  <button key={f} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {historicalEvents.map((event, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card/50 p-4 hover:bg-card transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{event.type}</span>
                      <Badge variant="outline" className={`text-[10px] ${severityStyles[event.severity]}`}>
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{event.date}</span>
                </div>
                <div className="flex gap-6 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground">Lives Affected</p>
                    <p className="text-xs font-medium text-foreground">{event.lives}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground">Est. Cost</p>
                    <p className="text-xs font-medium text-foreground">{event.cost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
