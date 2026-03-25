import { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BarChart3, TrendingUp, MapPin, Zap, CloudRain, Flame, Wind, Satellite, Activity, Database, Radio } from "lucide-react";
import { useMlPredictions, getPredMeta } from "@/hooks/useMlPredictions";
import { useDisasterEvents } from "@/hooks/useDisasterEvents";

// ── Static display data ───────────────────────────────────────────────────────
const trendData = [
  { month: "Oct", events: 18 },
  { month: "Nov", events: 24 },
  { month: "Dec", events: 31 },
  { month: "Jan", events: 22 },
  { month: "Feb", events: 28 },
  { month: "Mar", events: 35 },
];
const maxEvents = Math.max(...trendData.map(d => d.events));

const predictionModels = [
  {
    icon: CloudRain,
    title: "Flood Prediction",
    description: "Combines real-time precipitation data, river gauge levels, soil saturation indices, and historical flood patterns to predict risk 48-72 hours ahead.",
    dataSources: ["OpenWeatherMap", "River Gauge API", "Soil Moisture", "Historical"],
    accuracy: "91%",
  },
  {
    icon: Flame,
    title: "Wildfire Risk",
    description: "Analyzes temperature, humidity, wind speed, NDVI from satellite, and lightning strike data to generate fire spread probability maps.",
    dataSources: ["NASA FIRMS", "NDVI Satellite", "Weather API", "Lightning"],
    accuracy: "88%",
  },
  {
    icon: Wind,
    title: "AQI Forecasting",
    description: "Uses atmospheric dispersion models combined with real-time sensors, traffic patterns, industrial activity, and wind forecasts.",
    dataSources: ["AQI Sensors", "Wind Models", "Traffic Data", "Industrial"],
    accuracy: "85%",
  },
  {
    icon: Activity,
    title: "Seismic Risk",
    description: "Monitors micro-seismic activity patterns, tectonic plate stress, and historical sequences to estimate probability windows.",
    dataSources: ["USGS Seismic", "Tectonic Models", "GPS Deformation", "Catalog"],
    accuracy: "72%",
  },
];

const dataFlow = [
  { label: "Weather APIs",      icon: CloudRain, desc: "Real-time atmospheric data" },
  { label: "Satellite Imagery", icon: Satellite, desc: "NASA, ESA earth observation" },
  { label: "Sensor Networks",   icon: Activity,  desc: "IoT ground-level sensors" },
  { label: "Fusion Engine",     icon: Database,  desc: "Cross-correlates all sources" },
];

// ── Prediction ticker card ────────────────────────────────────────────────────
function PredictionCard({ pred, isNew }: { pred: any; isNew: boolean }) {
  const meta = getPredMeta(pred.prediction);
  const time = new Date(pred.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div
      className={`rounded-lg border p-3 transition-all duration-500 ${isNew ? "scale-[1.01]" : "scale-100"}`}
      style={{
        borderColor: meta.color + "44",
        backgroundColor: meta.bg,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.emoji}</span>
          <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">{time}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-foreground font-medium">{pred.location}</span>
        <span className="text-[10px] font-mono" style={{ color: meta.color }}>
          {pred.confidence.toFixed(1)}% conf
        </span>
      </div>
      {pred.weather && (
        <div className="mt-1.5 flex gap-3 text-[9px] font-mono text-muted-foreground">
          <span>🌡️ {pred.weather.temp?.toFixed(1)}°C</span>
          <span>💧 {pred.weather.humidity?.toFixed(0)}%</span>
          <span>💨 {pred.weather.wind?.toFixed(1)} km/h</span>
          {pred.aqi > 0 && <span>AQI {pred.aqi?.toFixed(0)}</span>}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { predictions, connected: predConnected } = useMlPredictions(40);
  const { events, stats }                          = useDisasterEvents();
  const feedRef = useRef<HTMLDivElement>(null);

  // Track newest prediction id to animate it
  const [latestId, setLatestId] = useState<string | null>(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (predictions.length > prevLengthRef.current && predictions[0]) {
      setLatestId(predictions[0].id);
      prevLengthRef.current = predictions.length;
      // Auto-scroll feed to top
      feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [predictions]);

  // Compute live high-risk zones from real events
  const riskZones = (() => {
    if (!events.length) return [
      { zone: "Southeast Asia",  risk: 92, trend: "↑" },
      { zone: "South Asia",      risk: 87, trend: "↑" },
      { zone: "East Africa",     risk: 78, trend: "→" },
      { zone: "Central America", risk: 72, trend: "↓" },
      { zone: "Mediterranean",   risk: 65, trend: "↑" },
    ];
    // Build zone scores from live events
    const zoneMap: Record<string, number> = {};
    events.forEach(ev => {
      const lat = ev.latitude, lng = ev.longitude;
      let zone = "Other";
      if (lat > 0 && lng > 60 && lng < 150) zone = "Southeast/South Asia";
      else if (lat < 0 && lng > 20 && lng < 55) zone = "East Africa";
      else if (lat > 5 && lng < -50 && lng > -100) zone = "Central America";
      else if (lat > 30 && lng > -10 && lng < 40) zone = "Mediterranean";
      const sevScore = ev.severity === "critical" ? 30 : ev.severity === "high" ? 20 : 10;
      zoneMap[zone] = (zoneMap[zone] || 40) + sevScore;
    });
    return Object.entries(zoneMap)
      .map(([zone, risk]) => ({ zone, risk: Math.min(risk, 99), trend: "↑" }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);
  })();

  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Analytics & Predictions</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Trends · AI-powered predictions · live ML inference stream
          </p>
        </div>

        {/* ── TOP ROW: ML Prediction Stream ──────────────────────────────── */}
        <div className="mb-6 rounded-lg border border-border bg-card/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Live ML Predictions</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                {predictions.length} received
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: predConnected ? "#22c55e" : "#f59e0b" }}
              />
              <span className="text-[9px] font-mono text-muted-foreground">
                {predConnected ? "LIVE · ws/predictions" : "OFFLINE · waiting…"}
              </span>
            </div>
          </div>

          {predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Activity className="h-8 w-8 text-muted-foreground/30 animate-pulse" />
              <p className="text-xs font-mono text-muted-foreground">
                Waiting for pipeline to run… (every 5 min)
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Predictions will stream here automatically once the backend pipeline fires.
              </p>
            </div>
          ) : (
            <div
              ref={feedRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[340px] overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {predictions.map((pred, i) => (
                <PredictionCard
                  key={pred.id}
                  pred={pred}
                  isNew={pred.id === latestId && i === 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── CHARTS ROW ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend chart */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Event Trend (6 months)</span>
              {stats && (
                <span className="ml-auto text-[10px] font-mono text-primary">
                  {stats.active} active · {stats.critical} critical
                </span>
              )}
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
              {events.length > 0 && (
                <span className="text-[9px] font-mono text-primary ml-auto">live</span>
              )}
            </div>
            <div className="space-y-3">
              {riskZones.map((zone) => (
                <div key={zone.zone}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{zone.zone}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {zone.risk}% {zone.trend}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${zone.risk}%`,
                        backgroundColor:
                          zone.risk > 85
                            ? "hsl(var(--destructive))"
                            : zone.risk > 70
                            ? "#f59e0b"
                            : "hsl(var(--primary))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KEY INSIGHTS ──────────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-foreground">Key Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {stats ? `${stats.active} active events` : "Flood events up 40% YoY"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats
                  ? `${stats.critical} critical · ${stats.high} high severity across all sources.`
                  : "Concentrated in South & Southeast Asia due to delayed monsoon patterns."}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-sm font-medium text-foreground">AI filter accuracy: 94.2%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Misinformation detection improved by 8% after model update v3.1.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {predictions.length > 0
                  ? `${predictions.length} ML predictions received`
                  : "Avg response time: 4.2min"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {predictions.length > 0
                  ? `Latest: ${getPredMeta(predictions[0]?.prediction ?? "none").label} @ ${predictions[0]?.location}`
                  : "Critical alerts reach first responders within target SLA."}
              </p>
            </div>
          </div>
        </div>

        {/* ── PREDICTION ENGINE SECTION ──────────────────────────────────── */}
        <div className="mt-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Prediction Engine</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              How we predict disasters using weather, satellite, and sensor APIs
            </p>
          </div>

          {/* Data flow */}
          <div className="rounded-lg border border-border bg-card/50 p-5 mb-4">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Data Pipeline
            </p>
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

          {/* Model cards */}
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
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {model.accuracy} accuracy
                      </span>
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
