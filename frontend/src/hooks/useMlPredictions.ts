import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MlPrediction {
  id: string;           // synthetic client-side id
  location: string;
  latitude: number;
  longitude: number;
  prediction: string;
  confidence: number;   // 0-100
  weather: {
    temp: number;
    humidity: number;
    wind: number;
    pressure: number;
    rain: number;
  };
  aqi: number;
  timestamp: string;
  source: string;
}

// ── Label metadata ────────────────────────────────────────────────────────────
export const PREDICTION_META: Record<
  string,
  { label: string; color: string; bg: string; emoji: string }
> = {
  none:       { label: "No Risk",      color: "#22c55e", bg: "rgba(34,197,94,0.12)",   emoji: "✅" },
  flood:      { label: "Flood Risk",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  emoji: "🌊" },
  drought:    { label: "Drought Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  emoji: "🌵" },
  wildfire:   { label: "Wildfire",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   emoji: "🔥" },
  storm:      { label: "Storm Risk",   color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  emoji: "⛈️" },
  heatwave:   { label: "Heat Wave",    color: "#f97316", bg: "rgba(249,115,22,0.12)",  emoji: "🌡️" },
  aqi_hazard: { label: "AQI Hazard",   color: "#6b7280", bg: "rgba(107,114,128,0.12)", emoji: "😷" },
  cyclone:    { label: "Cyclone",      color: "#ec4899", bg: "rgba(236,72,153,0.12)",  emoji: "🌀" },
  earthquake: { label: "Seismic",      color: "#dc2626", bg: "rgba(220,38,38,0.12)",   emoji: "🔴" },
};

export function getPredMeta(key: string) {
  return PREDICTION_META[key] ?? {
    label: key,
    color: "#94a3b8",
    bg:    "rgba(148,163,184,0.12)",
    emoji: "⚠️",
  };
}

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";
const WS_BASE  = API_BASE.replace(/^http/, "ws");

let _idCtr = 0;
const uid = () => `pred-${++_idCtr}-${Date.now()}`;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMlPredictions(maxHistory = 60) {
  const [predictions, setPredictions] = useState<MlPrediction[]>([]);
  const [connected,   setConnected]   = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const ws = new WebSocket("ws://localhost:8000/ws/events");
        wsRef.current = ws;

        ws.onopen  = () => setConnected(true);
        ws.onclose = () => {
          setConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };
        ws.onerror = () => {
          setConnected(false);
          ws.close();
        };

        ws.onmessage = (e) => {
          try {
            const batch: any[] = JSON.parse(e.data);
            const withIds = batch.map(p => ({ ...p, id: uid() } as MlPrediction));
            setPredictions(prev => [...withIds, ...prev].slice(0, maxHistory));
          } catch {}
        };
      } catch {}
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [maxHistory]);

  return { predictions, connected };
}
