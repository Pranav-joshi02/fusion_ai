import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { continents } from "./continentData";

interface DisasterPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  location: string;
  details: string;
  severity: "critical" | "high" | "moderate" | "low";
  confidence: number;
  category: "sudden" | "chronic" | "predicted";
  date: string;
}

interface ProjectedPoint extends DisasterPoint {
  screenX: number;
  screenY: number;
  z: number;
  visible: boolean;
}

const categoryColor: Record<string, string> = {
  sudden: "#ef4444",
  chronic: "#f59e0b",
  predicted: "#3b82f6",
};

const severityLabel: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  moderate: "MOD",
  low: "LOW",
};

// Mock data until backend is ready
const mockPoints: DisasterPoint[] = [
  { id: "1", lat: 37, lng: 35, type: "Earthquake", location: "Turkey", details: "Magnitude 6.4, 120+ affected", severity: "critical", confidence: 94, category: "sudden", date: "2026-03-24" },
  { id: "2", lat: 24, lng: 90, type: "Flood", location: "Bangladesh", details: "Severe flooding, 50K displaced", severity: "high", confidence: 88, category: "sudden", date: "2026-03-23" },
  { id: "3", lat: 36, lng: -119, type: "Wildfire", location: "California, USA", details: "5000 acres, 30% contained", severity: "moderate", confidence: 92, category: "chronic", date: "2026-03-24" },
  { id: "4", lat: 12, lng: 123, type: "Cyclone", location: "Philippines", details: "Category 3, landfall expected", severity: "high", confidence: 86, category: "predicted", date: "2026-03-22" },
  { id: "5", lat: 41, lng: 65, type: "Drought", location: "Central Asia", details: "Water levels critically low", severity: "moderate", confidence: 78, category: "chronic", date: "2026-03-20" },
  { id: "6", lat: -33, lng: -70, type: "Volcanic", location: "Chile", details: "Increased seismic activity", severity: "low", confidence: 72, category: "predicted", date: "2026-03-21" },
  { id: "7", lat: -1, lng: 37, type: "Flood", location: "Kenya", details: "Dam overflow, evacuation ordered", severity: "high", confidence: 84, category: "sudden", date: "2026-03-24" },
  { id: "8", lat: -41, lng: 174, type: "Tsunami Warning", location: "New Zealand", details: "7.1 undersea quake detected", severity: "critical", confidence: 96, category: "sudden", date: "2026-03-24" },
  { id: "9", lat: 28, lng: 77, type: "AQI Spike", location: "Delhi, India", details: "AQI 420, hazardous levels", severity: "high", confidence: 91, category: "chronic", date: "2026-03-24" },
  { id: "10", lat: 35, lng: 139, type: "Seismic Alert", location: "Tokyo, Japan", details: "Predicted M5.2 within 72h", severity: "moderate", confidence: 67, category: "predicted", date: "2026-03-25" },
];

function latLngTo3D(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function InteractiveGlobe() {
  const [points] = useState<DisasterPoint[]>(mockPoints);
  const [hovered, setHovered] = useState<ProjectedPoint | null>(null);
  const [layers, setLayers] = useState({
    sudden: true,
    chronic: true,
    predicted: true,
    heatmap: false,
  });
  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: -15, y: 0 });

  const globeRadius = 200;

  // Auto-rotate
  useEffect(() => {
    let frame: number;
    let running = true;
    const animate = () => {
      if (!running) return;
      if (!isDragging && !isHovering) {
        rotationRef.current.y += 0.12;
        setRotation({ ...rotationRef.current });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(frame); };
  }, [isDragging, isHovering]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    rotationRef.current = {
      x: Math.max(-60, Math.min(60, rotationRef.current.x - dy * 0.3)),
      y: rotationRef.current.y + dx * 0.3,
    };
    setRotation({ ...rotationRef.current });
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const filtered = useMemo(() => points.filter(p => layers[p.category]), [points, layers]);

  const projected: ProjectedPoint[] = useMemo(() => filtered.map(p => {
    const pos = latLngTo3D(p.lat, p.lng, globeRadius);
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;
    const y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
    const z1 = pos.y * Math.sin(radX) + pos.z * Math.cos(radX);
    const x2 = pos.x * Math.cos(radY) + z1 * Math.sin(radY);
    const z2 = -pos.x * Math.sin(radY) + z1 * Math.cos(radY);
    return { ...p, screenX: x2, screenY: y1, z: z2, visible: z2 > -10 };
  }), [filtered, rotation, globeRadius]);

  // Generate graticule lines
  const latLines = useMemo(() => [-60, -30, 0, 30, 60].map(lat => {
    const pos = latLngTo3D(lat, 0, globeRadius);
    const radX = (rotation.x * Math.PI) / 180;
    const y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
    const ringR = globeRadius * Math.cos((lat * Math.PI) / 180);
    const ry = ringR * Math.abs(Math.sin(radX)) + 1;
    return { lat, cy: y1, rx: ringR, ry };
  }), [rotation.x, globeRadius]);

  const lonLines = useMemo(() => [0, 30, 60, 90, 120, 150].map(lng => {
    const pts: string[] = [];
    for (let lat = -90; lat <= 90; lat += 4) {
      const pos = latLngTo3D(lat, lng + rotation.y, globeRadius);
      const radX = (rotation.x * Math.PI) / 180;
      const y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
      pts.push(`${pos.x},${y1}`);
    }
    return { lng, points: pts.join(" ") };
  }), [rotation, globeRadius]);

  // Project continent outlines
  const projectedContinents = useMemo(() => continents.map(continent => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;
    const segments: { path: string; visible: boolean }[] = [];
    let currentPath: string[] = [];
    let wasVisible = false;

    continent.coords.forEach((coord, i) => {
      const pos = latLngTo3D(coord[0], coord[1], globeRadius);
      const y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
      const z1 = pos.y * Math.sin(radX) + pos.z * Math.cos(radX);
      const x2 = pos.x * Math.cos(radY) + z1 * Math.sin(radY);
      const z2 = -pos.x * Math.sin(radY) + z1 * Math.cos(radY);
      const isVisible = z2 > 0;

      if (isVisible) {
        currentPath.push(`${i === 0 || !wasVisible ? 'M' : 'L'}${x2.toFixed(1)},${y1.toFixed(1)}`);
      } else if (wasVisible && currentPath.length > 0) {
        segments.push({ path: currentPath.join(' '), visible: true });
        currentPath = [];
      }
      wasVisible = isVisible;
    });

    if (currentPath.length > 1) {
      segments.push({ path: currentPath.join(' ') + 'Z', visible: true });
    }

    return { name: continent.name, segments };
  }), [rotation, globeRadius]);

  const layerLabels: Record<string, { label: string; color: string }> = {
    sudden: { label: "Sudden", color: categoryColor.sudden },
    chronic: { label: "Chronic", color: categoryColor.chronic },
    predicted: { label: "Predicted", color: categoryColor.predicted },
    heatmap: { label: "Heatmap", color: "#8b5cf6" },
  };

  return (
    <div
      className="globe-container relative flex items-center justify-center w-full h-full select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setIsDragging(false); setHovered(null); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Layer controls */}
      <div className="absolute left-4 top-4 z-50 flex flex-col gap-1.5">
        {Object.entries(layerLabels).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            className={`flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-md border transition-all ${
              layers[key as keyof typeof layers]
                ? "bg-secondary/80 text-foreground border-border"
                : "bg-secondary/30 text-muted-foreground border-transparent opacity-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layers[key as keyof typeof layers] ? color : "transparent", border: `1px solid ${color}` }} />
            {label}
          </button>
        ))}
      </div>

      <div className="relative globe-glow">
        <svg
          viewBox={`${-globeRadius - 40} ${-globeRadius - 40} ${(globeRadius + 40) * 2} ${(globeRadius + 40) * 2}`}
          className="w-[340px] h-[340px] md:w-[440px] md:h-[440px] lg:w-[500px] lg:h-[500px]"
        >
          <defs>
            <radialGradient id="globeGrad" cx="35%" cy="28%" r="60%">
              <stop offset="0%" stopColor="hsl(220, 18%, 16%)" />
              <stop offset="50%" stopColor="hsl(220, 20%, 9%)" />
              <stop offset="100%" stopColor="hsl(220, 24%, 4%)" />
            </radialGradient>
            <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="94%" stopColor="hsl(174, 72%, 52%, 0.10)" />
              <stop offset="100%" stopColor="hsl(174, 72%, 52%, 0.02)" />
            </radialGradient>
            <radialGradient id="specular" cx="35%" cy="28%" r="40%">
              <stop offset="0%" stopColor="hsl(210, 20%, 98%, 0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="globeClip">
              <circle cx="0" cy="0" r={globeRadius} />
            </clipPath>
          </defs>

          {/* Outer atmosphere */}
          <circle cx="0" cy="0" r={globeRadius + 25} fill="url(#atmosphereGrad)" />
          <circle cx="0" cy="0" r={globeRadius + 10} fill="none" stroke="hsl(174, 72%, 52%, 0.06)" strokeWidth="1" />

          {/* Globe body */}
          <circle cx="0" cy="0" r={globeRadius} fill="url(#globeGrad)" />

          {/* Graticule */}
          <g clipPath="url(#globeClip)" opacity="0.25">
            {latLines.map(l => (
              <ellipse key={`lat-${l.lat}`} cx="0" cy={l.cy} rx={l.rx} ry={l.ry} fill="none" stroke="hsl(174, 72%, 52%, 0.07)" strokeWidth="0.5" />
            ))}
            {lonLines.map(l => (
              <polyline key={`lng-${l.lng}`} points={l.points} fill="none" stroke="hsl(174, 72%, 52%, 0.05)" strokeWidth="0.4" />
            ))}
          </g>

          {/* Continent outlines */}
          <g clipPath="url(#globeClip)">
            {projectedContinents.map(c =>
              c.segments.map((seg, i) => (
                <path
                  key={`${c.name}-${i}`}
                  d={seg.path}
                  fill="hsl(174, 72%, 52%, 0.06)"
                  stroke="hsl(174, 72%, 52%, 0.18)"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              ))
            )}
          </g>

          {/* Specular highlight */}
          <circle cx={-globeRadius * 0.2} cy={-globeRadius * 0.25} r={globeRadius * 0.55} fill="url(#specular)" />

          {/* Globe rim */}
          <circle cx="0" cy="0" r={globeRadius} fill="none" stroke="hsl(174, 72%, 52%, 0.12)" strokeWidth="0.7" />

          {/* Heatmap layer */}
          {layers.heatmap && (
            <g clipPath="url(#globeClip)" opacity="0.6">
              {projected.filter(p => p.visible).map(p => (
                <circle key={`heat-${p.id}`} cx={p.screenX} cy={p.screenY} r={30} fill={categoryColor[p.category]} opacity={0.06} filter="url(#softGlow)" />
              ))}
            </g>
          )}

          {/* Disaster points */}
          {projected
            .filter(p => p.visible)
            .sort((a, b) => a.z - b.z)
            .map(point => {
              const depthFactor = (point.z + globeRadius) / (2 * globeRadius);
              const scale = 0.5 + depthFactor * 0.6;
              const opacity = 0.35 + depthFactor * 0.65;
              const r = 4.5 * scale;
              const isHovered = hovered?.id === point.id;

              return (
                <g key={point.id} filter="url(#pointGlow)">
                  {/* Pulse ring for critical */}
                  {point.severity === "critical" && (
                    <circle cx={point.screenX} cy={point.screenY} r={r * 2} fill="none" stroke={categoryColor[point.category]} strokeWidth="0.6" opacity={opacity * 0.4}>
                      <animate attributeName="r" from={r * 1.2} to={r * 4} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Hover ring */}
                  {isHovered && (
                    <circle cx={point.screenX} cy={point.screenY} r={r * 2.5} fill="none" stroke={categoryColor[point.category]} strokeWidth="0.8" opacity={0.5} />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={point.screenX}
                    cy={point.screenY}
                    r={isHovered ? r * 1.4 : r}
                    fill={categoryColor[point.category]}
                    opacity={opacity * 0.9}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHovered(point)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {/* Center dot */}
                  <circle cx={point.screenX} cy={point.screenY} r={r * 0.3} fill="white" opacity={opacity * 0.7} className="pointer-events-none" />
                </g>
              );
            })}
        </svg>
      </div>

      {/* Tooltip panel */}
      {hovered && hovered.visible && (
        <div
          className="absolute z-50 pointer-events-none transition-all duration-200"
          style={{
            left: `calc(50% + ${hovered.screenX * 0.62}px + 24px)`,
            top: `calc(50% + ${hovered.screenY * 0.62}px - 24px)`,
          }}
        >
          <div className="rounded-lg border border-border bg-card/95 backdrop-blur-xl p-3 shadow-2xl min-w-[230px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: categoryColor[hovered.category] }} />
                <span className="text-xs font-semibold text-foreground">{hovered.type}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase tracking-wider">
                {severityLabel[hovered.severity]}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{hovered.location}</p>
            <p className="text-[11px] text-foreground mt-1 leading-relaxed">{hovered.details}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-secondary/60 uppercase" style={{ color: categoryColor[hovered.category] }}>
                  {hovered.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{hovered.date}</span>
              </div>
              <span className="text-[10px] font-mono text-primary">
                {hovered.confidence}% conf
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Drag hint */}
      {!isDragging && isHovering && !hovered && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/40 animate-pulse">
          drag to rotate · hover points for details
        </div>
      )}
    </div>
  );
}
