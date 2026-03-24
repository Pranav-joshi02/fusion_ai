import { MainLayout } from "@/components/layout/MainLayout";
import { InteractiveGlobe } from "@/components/globe/InteractiveGlobe";
import { Cloud, Thermometer, Wind, Droplets, Eye, Shield } from "lucide-react";

const bottomStats = [
  { label: "Active Disasters", value: "24", icon: Eye, change: "+3" },
  { label: "Trust Score Avg", value: "87%", icon: Shield, change: "+2%" },
  { label: "AQI Global Avg", value: "142", icon: Wind, change: "-8" },
  { label: "Weather Alerts", value: "18", icon: Cloud, change: "+5" },
  { label: "Temperature Δ", value: "+1.2°C", icon: Thermometer, change: "+0.1" },
  { label: "Precipitation", value: "High", icon: Droplets, change: "↑" },
];

const Index = () => {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col grid-bg">
        {/* Globe center area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Layer toggles */}
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

        {/* Bottom info strip */}
        <div className="border-t border-border bg-card/30 backdrop-blur-sm px-6 py-3">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {bottomStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 group cursor-default">
                <div className="rounded-md bg-secondary/50 p-2 group-hover:bg-secondary transition-colors">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    <span className="text-[10px] font-mono text-primary">{stat.change}</span>
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
