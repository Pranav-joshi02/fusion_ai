import { MainLayout } from "@/components/layout/MainLayout";
import { InteractiveGlobe } from "@/components/globe/InteractiveGlobe";
import { Cloud, Thermometer, Wind, Droplets, Eye, Shield, AlertTriangle } from "lucide-react";
import { useDisasterEvents } from "@/hooks/useDisasterEvents";

const Index = () => {
  const { stats, events, connected } = useDisasterEvents();

  // Compute AQI average from events tagged as chronic/pollution
  const aqiEvents = events.filter(e => e.type.toLowerCase().includes("aqi") || e.type.toLowerCase().includes("pollution"));

  const bottomStats = [
    {
      label: "Active Disasters",
      value: stats ? String(stats.active)    : "—",
      icon:  Eye,
      change: stats ? `+${stats.critical} crit` : "live",
      highlight: stats && stats.critical > 0,
    },
    {
      label: "Critical Alerts",
      value: stats ? String(stats.critical)  : "—",
      icon:  AlertTriangle,
      change: stats ? `${stats.high} high`  : "live",
      highlight: stats && stats.critical > 3,
    },
    {
      label: "AQI Events",
      value: String(aqiEvents.length) || "—",
      icon:  Wind,
      change: aqiEvents.length > 0 ? "monitored" : "—",
      highlight: false,
    },
    {
      label: "Weather Alerts",
      value: stats ? String(stats.total)     : "—",
      icon:  Cloud,
      change: connected ? "LIVE" : "cached",
      highlight: false,
    },
    {
      label: "Trust Score Avg",
      value: events.length > 0
        ? `${(events.reduce((s, e) => s + e.confidence, 0) / events.length).toFixed(0)}%`
        : "87%",
      icon:  Shield,
      change: events.length > 0 ? "from api" : "default",
      highlight: false,
    },
    {
      label: "Precipitation",
      value: "High",
      icon:  Droplets,
      change: "↑",
      highlight: false,
    },
  ];

  return (
    <MainLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col grid-bg">
        {/* Globe */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {["Disasters", "AQI", "Weather", "Predictions"].map((layer) => (
              <button
                key={layer}
                className="text-[10px] font-mono px-3 py-1.5 rounded-md bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
              >
                {layer}
              </button>
            ))}
          </div>

          <InteractiveGlobe />
        </div>

        {/* Bottom strip */}
        <div className="border-t border-border bg-card/30 backdrop-blur-sm px-6 py-3">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {bottomStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 group cursor-default">
                <div className={`rounded-md p-2 group-hover:bg-secondary transition-colors ${stat.highlight ? "bg-destructive/20" : "bg-secondary/50"}`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.highlight ? "text-destructive" : "text-primary"}`} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    <span className={`text-[10px] font-mono ${stat.highlight ? "text-destructive" : "text-primary"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
