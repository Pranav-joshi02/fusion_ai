import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DisasterEvent {
  id: string;
  type: string;
  category: "sudden" | "chronic" | "predicted";
  source: string;
  latitude: number;
  longitude: number;
  severity: "critical" | "high" | "moderate" | "low";
  confidence: number;
  location?: string;
  timestamp?: string;
}

export interface EventStats {
  total: number;
  active: number;
  critical: number;
  high: number;
}

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";
const WS_BASE  = API_BASE.replace(/^http/, "ws");

// ── Helpers ───────────────────────────────────────────────────────────────────
function normSeverity(s: string): DisasterEvent["severity"] {
  if (s === "critical") return "critical";
  if (s === "high")     return "high";
  if (s === "low")      return "low";
  return "moderate";
}

function normEvent(raw: any): DisasterEvent {
  return {
    id:         String(raw.id ?? Math.random()),
    type:       raw.type       ?? "unknown",
    category:   raw.category   ?? "sudden",
    source:     raw.source     ?? "api",
    latitude:   Number(raw.latitude),
    longitude:  Number(raw.longitude),
    severity:   normSeverity(raw.severity ?? "moderate"),
    confidence: Number(raw.confidence ?? 80),
    location:   raw.location   ?? undefined,
    timestamp:  raw.timestamp  ?? undefined,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDisasterEvents() {
  const [events,    setEvents]    = useState<DisasterEvent[]>([]);
  const [stats,     setStats]     = useState<EventStats | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // REST fetch ─────────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const [evRes, stRes] = await Promise.all([
        fetch(`${API_BASE}/events?limit=300`),
        fetch(`${API_BASE}/events/stats`),
      ]);
      if (evRes.ok) {
        const data: any[] = await evRes.json();
        setEvents(data.map(normEvent));
      }
      if (stRes.ok) {
        setStats(await stRes.json());
      }
    } catch (err) {
      // Backend not reachable → keep whatever we have (or mock data)
      console.warn("[useDisasterEvents] REST unavailable:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchEvents();

    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_BASE}/ws/events`);
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
            const incoming: any[] = JSON.parse(e.data);
            const fresh = incoming.map(normEvent);
            setEvents(prev => {
              const ids = new Set(prev.map(ev => ev.id));
              const novel = fresh.filter(ev => !ids.has(ev.id));
              if (!novel.length) return prev;
              return [...novel, ...prev].slice(0, 600);
            });
          } catch {}
        };
      } catch {}
    };

    connect();

    // Periodic REST refresh as backup
    const poll = setInterval(fetchEvents, 60_000);

    return () => {
      clearTimeout(reconnectTimer);
      clearInterval(poll);
      wsRef.current?.close();
    };
  }, [fetchEvents]);

  return { events, stats, connected, loading };
}
