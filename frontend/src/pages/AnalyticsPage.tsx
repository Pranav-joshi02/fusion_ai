import { MainLayout } from "@/components/layout/MainLayout";
import { BarChart3, TrendingUp, MapPin, Zap, CloudRain, Flame, Wind, Satellite, Activity, Database } from "lucide-react";

const trendData = [
  { month: "Oct", events: 18 },
  { month: "Nov", events: 24 },
  { month: "Dec", events: 31 },
  { month: "Jan", events: 22 },
  { month: "Feb", events: 28 },
  { month: "Mar", events: 35 },
];

const maxEvents = Math.max(...trendData.map(d => d.events));

const highRiskZones = [
  { zone: "Southeast Asia", risk: 92, trend: "↑" },
  { zone: "South Asia", risk: 87, trend: "↑" },
  { zone: "East Africa", risk: 78, trend: "→" },
  { zone: "Central America", risk: 72, trend: "↓" },
  { zone: "Mediterranean", risk: 65, trend: "↑" },
];

const insights = [
  { title: "Flood events up 40% YoY", description: "Concentrated in South & Southeast Asia due to delayed monsoon patterns." },
  { title: "AI filter accuracy: 94.2%", description: "Misinformation detection improved by 8% after model update v3.1." },
  { title: "Avg response time: 4.2min", description: "Critical alerts reach first responders within target SLA." },
];

const predictionModels = [
  {
    icon: CloudRain,
    title: "Flood Prediction",
    description: "Combines real-time precipitation data from OpenWeatherMap API, river gauge levels, soil saturation indices, and historical flood patterns to predict flood risk 48-72 hours ahead.",
    dataSources: ["OpenWeatherMap", "River Gauge API", "Soil Moisture Data", "Historical Records"],
    accuracy: "91%",
  },
  {
    icon: Flame,
    title: "Wildfire Risk",
    description: "Analyzes temperature, humidity, wind speed, vegetation dryness index (NDVI from satellite), and lightning strike data to generate fire spread probability maps.",
    dataSources: ["NASA FIRMS", "NDVI Satellite", "Weather API", "Lightning Network"],
    accuracy: "88%",
  },
  {
    icon: Wind,
    title: "AQI Forecasting",
    description: "Uses atmospheric dispersion models combined with real-time sensor data, traffic patterns, industrial activity, and wind forecasts to predict Air Quality Index up to 5 days ahead.",
    dataSources: ["AQI Sensors", "Wind Models", "Traffic Data", "Industrial Reports"],
    accuracy: "85%",
  },
  {
    icon: Activity,
    title: "Seismic Risk Analysis",
    description: "Monitors micro-seismic activity patterns, tectonic plate stress indicators, and historical earthquake sequences to estimate probability windows for significant seismic events.",
    dataSources: ["USGS Seismic API", "Tectonic Models", "GPS Deformation", "Historical Catalog"],
    accuracy: "72%",
  },
];

const dataFlow = [
  { label: "Weather APIs", icon: CloudRain, desc: "Real-time atmospheric data" },
  { label: "Satellite Imagery", icon: Satellite, desc: "NASA, ESA earth observation" },
  { label: "Sensor Networks", icon: Activity, desc: "IoT ground-level sensors" },
  { label: "Fusion Engine", icon: Database, desc: "Cross-correlates all sources" },
];

export default function AnalyticsPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Analytics & Predictions</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Trends, AI-powered predictions & high-risk zone analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend chart */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Event Trend (6 months)</span>
            </div>
            <div className="flex items-end gap-3 h-40">
              {trendData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-primary">{d.events}</span>
                  <div
                    className="w-full rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors relative"
                    style={{ height: `${(d.events / maxEvents) * 100}%` }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-primary/60"
                      style={{ height: `${(d.events / maxEvents) * 60}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High risk zones */}
          <div className="rounded-lg border border-border bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-foreground">High-Risk Zones</span>
            </div>
            <div className="space-y-3">
              {highRiskZones.map((zone) => (
                <div key={zone.zone}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{zone.zone}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{zone.risk}% {zone.trend}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${zone.risk}%`,
                        backgroundColor: zone.risk > 85 ? "hsl(var(--destructive))" : zone.risk > 70 ? "hsl(var(--warning))" : "hsl(var(--primary))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-foreground">Key Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Engine Section */}
        <div className="mt-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Prediction Engine</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">How we predict disasters using weather, satellite, and sensor APIs</p>
          </div>

          {/* Data flow diagram */}
          <div className="rounded-lg border border-border bg-card/50 p-5 mb-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Data Pipeline</p>
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {dataFlow.map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground text-center">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground text-center">{item.desc}</span>
                  </div>
                  {i < dataFlow.length - 1 && (
                    <div className="text-primary/40 text-lg shrink-0">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prediction models grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictionModels.map((model, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/50 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-lg bg-secondary/50 p-2">
                    <model.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">{model.title}</h3>
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{model.accuracy} accuracy</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{model.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {model.dataSources.map((src) => (
                    <span key={src} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
