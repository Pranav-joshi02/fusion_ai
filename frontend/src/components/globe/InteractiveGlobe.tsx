import { useState, useCallback, useRef, useEffect } from "react";

interface DisasterPoint {
  id: number;
  lat: number;
  lng: number;
  type: string;
  location: string;
  severity: "critical" | "high" | "moderate" | "low";
  details: string;
  trust: number;
  date: string;
}

const disasterPoints: DisasterPoint[] = [
  { id: 1, lat: 37, lng: 35, type: "Earthquake", location: "Turkey", severity: "critical", details: "Magnitude 6.4, 120+ affected", trust: 94, date: "2026-03-24" },
  { id: 2, lat: 24, lng: 90, type: "Flood", location: "Bangladesh", severity: "high", details: "Severe flooding, 50K displaced", trust: 88, date: "2026-03-23" },
  { id: 3, lat: 36, lng: -119, type: "Wildfire", location: "California, USA", severity: "moderate", details: "5000 acres, 30% contained", trust: 92, date: "2026-03-24" },
  { id: 4, lat: 12, lng: 123, type: "Cyclone", location: "Philippines", severity: "high", details: "Category 3, landfall expected", trust: 86, date: "2026-03-22" },
  { id: 5, lat: 41, lng: 65, type: "Drought", location: "Central Asia", severity: "moderate", details: "Water levels critically low", trust: 78, date: "2026-03-20" },
  { id: 6, lat: -33, lng: -70, type: "Volcanic", location: "Chile", severity: "low", details: "Increased seismic activity", trust: 72, date: "2026-03-21" },
  { id: 7, lat: -1, lng: 37, type: "Flood", location: "Kenya", severity: "high", details: "Dam overflow, evacuation ordered", trust: 84, date: "2026-03-24" },
  { id: 8, lat: -41, lng: 174, type: "Tsunami Warning", location: "New Zealand", severity: "critical", details: "7.1 undersea quake detected", trust: 96, date: "2026-03-24" },
];

const severityColor: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  moderate: "#38d9a9",
  low: "#22c55e",
};

function latLngTo3D(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}
interface ProjectedPoint extends DisasterPoint {
  screenX: number;
  screenY: number;
  z: number;
  visible: boolean;
}

export function InteractiveGlobe() {
  const [hovered, setHovered] = useState<ProjectedPoint | null>(null);
  const [rotation, setRotation] = useState({ x: -15, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -15, y: 0 });

  // Auto-rotate when not hovering
  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      if (!isHovering && !isDragging) {
        rotationRef.current.y += 0.15;
        setRotation({ ...rotationRef.current });
      }
      animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animFrame.current); };
  }, [isHovering, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotationRef.current = {
        x: Math.max(-60, Math.min(60, rotationRef.current.x - dy * 0.3)),
        y: rotationRef.current.y + dx * 0.3,
      };
      setRotation({ ...rotationRef.current });
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const globeRadius = 200;

  // Project disaster points
  const projectedPoints = disasterPoints.map((p) => {
    const pos = latLngTo3D(p.lat, p.lng, globeRadius);
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;
    // Rotate around X
    let y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
    let z1 = pos.y * Math.sin(radX) + pos.z * Math.cos(radX);
    // Rotate around Y
    let x2 = pos.x * Math.cos(radY) + z1 * Math.sin(radY);
    let z2 = -pos.x * Math.sin(radY) + z1 * Math.cos(radY);
    return { ...p, screenX: x2, screenY: y1, z: z2, visible: z2 > -20 };
  });

  return (
    <div
      ref={containerRef}
      className="globe-container relative flex items-center justify-center w-full h-full select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setIsDragging(false); setHovered(null); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div className="relative globe-glow">
        <svg
          viewBox={`${-globeRadius - 40} ${-globeRadius - 40} ${(globeRadius + 40) * 2} ${(globeRadius + 40) * 2}`}
          className="w-[340px] h-[340px] md:w-[440px] md:h-[440px] lg:w-[500px] lg:h-[500px]"
        >
          <defs>
            <radialGradient id="globeGrad" cx="38%" cy="32%" r="58%">
              <stop offset="0%" stopColor="hsl(220 18% 18%)" />
              <stop offset="60%" stopColor="hsl(220 20% 10%)" />
              <stop offset="100%" stopColor="hsl(220 22% 5%)" />
            </radialGradient>
            <radialGradient id="glowOuter" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="transparent" />
              <stop offset="95%" stopColor="hsl(174 72% 52% / 0.06)" />
              <stop offset="100%" stopColor="hsl(174 72% 52% / 0.02)" />
            </radialGradient>
            <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
              <stop offset="88%" stopColor="transparent" />
              <stop offset="96%" stopColor="hsl(174 72% 52% / 0.12)" />
              <stop offset="100%" stopColor="hsl(174 72% 52% / 0.03)" />
            </radialGradient>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="globeClip">
              <circle cx="0" cy="0" r={globeRadius} />
            </clipPath>
          </defs>

          {/* Atmosphere ring */}
          <circle cx="0" cy="0" r={globeRadius + 20} fill="url(#atmosphereGrad)" />
          <circle cx="0" cy="0" r={globeRadius + 8} fill="none" stroke="hsl(174 72% 52% / 0.08)" strokeWidth="1" />

          {/* Main globe */}
          <circle cx="0" cy="0" r={globeRadius} fill="url(#globeGrad)" />

          {/* Grid lines (graticule) clipped to globe */}
          <g clipPath="url(#globeClip)" opacity="0.3">
            {/* Latitude lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const pos = latLngTo3D(lat, 0, globeRadius);
              const radX = (rotation.x * Math.PI) / 180;
              const y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
              const ringR = globeRadius * Math.cos((lat * Math.PI) / 180);
              return (
                <ellipse
                  key={`lat-${lat}`}
                  cx="0"
                  cy={y1}
                  rx={ringR}
                  ry={ringR * Math.abs(Math.sin((rotation.x * Math.PI) / 180)) + 1}
                  fill="none"
                  stroke="hsl(174 72% 52% / 0.08)"
                  strokeWidth="0.5"
                />
              );
            })}
            {/* Longitude lines */}
            {[0, 30, 60, 90, 120, 150].map((lng) => {
              const points: string[] = [];
              for (let lat = -90; lat <= 90; lat += 5) {
                const pos = latLngTo3D(lat, lng + rotation.y, globeRadius);
                const radX = (rotation.x * Math.PI) / 180;
                let y1 = pos.y * Math.cos(radX) - pos.z * Math.sin(radX);
                let z1 = pos.y * Math.sin(radX) + pos.z * Math.cos(radX);
                let x2 = pos.x * Math.cos(0) + z1 * Math.sin(0);
                if (z1 > 0 || true) points.push(`${pos.x},${y1}`);
              }
              return (
                <polyline
                  key={`lng-${lng}`}
                  points={points.join(" ")}
                  fill="none"
                  stroke="hsl(174 72% 52% / 0.05)"
                  strokeWidth="0.4"
                />
              );
            })}
          </g>

          {/* Specular highlight */}
          <circle cx={-globeRadius * 0.25} cy={-globeRadius * 0.3} r={globeRadius * 0.6} fill="hsl(210 20% 98% / 0.02)" />

          {/* Globe edge ring */}
          <circle cx="0" cy="0" r={globeRadius} fill="none" stroke="hsl(174 72% 52% / 0.15)" strokeWidth="0.8" />

          {/* Disaster points */}
          {projectedPoints
            .filter((p) => p.visible)
            .sort((a, b) => a.z - b.z)
            .map((point) => {
              const scale = 0.6 + ((point.z + globeRadius) / (2 * globeRadius)) * 0.5;
              const opacity = 0.4 + ((point.z + globeRadius) / (2 * globeRadius)) * 0.6;
              const r = 5 * scale;
              return (
                <g key={point.id} filter="url(#pointGlow)">
                  {point.severity === "critical" && (
                    <>
                      <circle cx={point.screenX} cy={point.screenY} r={r * 3} fill="none" stroke={severityColor[point.severity]} strokeWidth="0.5" opacity={opacity * 0.3}>
                        <animate attributeName="r" from={r * 1.5} to={r * 4} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  <circle
                    cx={point.screenX}
                    cy={point.screenY}
                    r={r}
                    fill={severityColor[point.severity]}
                    opacity={opacity * 0.9}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(point)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  <circle cx={point.screenX} cy={point.screenY} r={r * 0.35} fill="white" opacity={opacity * 0.8} className="pointer-events-none" />
                </g>
              );
            })}
        </svg>
      </div>

      {/* Tooltip */}
      {hovered && hovered.visible && (
        <div
          className="absolute z-50 pointer-events-none transition-all duration-150"
          style={{
            left: `calc(50% + ${hovered.screenX * 0.65}px + 20px)`,
            top: `calc(50% + ${hovered.screenY * 0.65}px - 20px)`,
          }}
        >
          <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md p-3 shadow-2xl min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: severityColor[hovered.severity] }} />
                <span className="text-xs font-semibold text-foreground">{hovered.type}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                {hovered.severity}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{hovered.location}</p>
            <p className="text-[11px] text-foreground mt-1">{hovered.details}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-[10px] font-mono text-muted-foreground">{hovered.date}</span>
              <span className="text-[10px] font-mono text-primary">Trust: {hovered.trust}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Drag hint */}
      {!isDragging && isHovering && !hovered && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/50 animate-pulse">
          drag to rotate · hover points for details
        </div>
      )}
    </div>
  );
}
