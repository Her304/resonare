"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Kept in sync with the helper in Resonare.tsx — the trailing comma-separated
// segment of a "venue, city" string is treated as the city.
function cityFromVenue(venue: string) {
  const parts = venue.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : venue.trim();
}

export interface MapConcert {
  id: string;
  artist: string;
  showName: string;
  venue: string;
  date: string;
}

interface CityGroup {
  city: string;
  concerts: MapConcert[];
}

interface GeoPoint extends CityGroup {
  lat: number;
  lng: number;
}

const CACHE_PREFIX = "resonare:geo:v1:";

// localStorage-cached Nominatim lookup. A `null` result is cached too, so we
// don't re-query cities that can't be geocoded. Returns undefined only on error.
async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null | undefined> {
  const key = CACHE_PREFIX + city.toLowerCase();
  try {
    const cached = localStorage.getItem(key);
    if (cached !== null) return JSON.parse(cached);
  } catch {
    /* ignore malformed cache */
  }
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(city)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return undefined;
    const data = (await res.json()) as { lat: string; lon: string }[];
    const hit = data[0];
    const result = hit ? { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) } : null;
    try {
      localStorage.setItem(key, JSON.stringify(result));
    } catch {
      /* ignore quota errors */
    }
    return result;
  } catch {
    return undefined;
  }
}

function pinIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      transform: translate(-50%, -100%);
      display: flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
      background: #FF6B35; border: 2px solid #F2ECE0;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35); rotate: -45deg;
    "><span style="rotate: 45deg; color: #fff; font-size: 12px; font-weight: 700; font-family: sans-serif;">${count}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [0, 0],
  });
}

// Keeps the viewport framed around all pins whenever they change.
function FitBounds({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 10);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [points, map]);
  return null;
}

export default function ConcertMap({ concerts }: { concerts: MapConcert[] }) {
  const groups = useMemo<CityGroup[]>(() => {
    const byCity = new Map<string, CityGroup>();
    for (const c of concerts) {
      const city = cityFromVenue(c.venue);
      if (!city) continue;
      const existing = byCity.get(city.toLowerCase());
      if (existing) existing.concerts.push(c);
      else byCity.set(city.toLowerCase(), { city, concerts: [c] });
    }
    return Array.from(byCity.values());
  }, [concerts]);

  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const runId = useRef(0);

  useEffect(() => {
    const id = ++runId.current;
    if (groups.length === 0) {
      setPoints([]);
      setStatus("done");
      return;
    }
    setStatus("loading");
    const collected: GeoPoint[] = [];
    (async () => {
      for (const g of groups) {
        if (runId.current !== id) return; // superseded by a newer run
        const coords = await geocodeCity(g.city);
        if (coords) {
          collected.push({ ...g, ...coords });
          setPoints([...collected]);
        }
        // Nominatim asks for <= 1 request/second; only paced for uncached hits.
        if (coords === undefined || !localStorage.getItem(CACHE_PREFIX + g.city.toLowerCase())) {
          await new Promise((r) => setTimeout(r, 1100));
        }
      }
      if (runId.current === id) setStatus("done");
    })();
  }, [groups]);

  const label = { fontFamily: "var(--font-inter), sans-serif" };

  if (groups.length === 0) {
    return (
      <div style={{ ...label, padding: "24px 10px", textAlign: "center", color: "rgba(242,236,224,0.5)", fontSize: 13 }}>
        add a venue with a city to see it on the map
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          height: 260,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(15,94,94,0.35)",
          position: "relative",
          // Establish a stacking context so Leaflet's internal panes/controls
          // (z-index up to 1000) stay contained below fixed overlays like the
          // profile stat sheet, instead of painting over them.
          zIndex: 0,
        }}
      >
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#0b2b2b" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {points.map((p) => (
            <Marker key={p.city} position={[p.lat, p.lng]} icon={pinIcon(p.concerts.length)}>
              <Popup>
                <div style={{ ...label, minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                    {p.city} · {p.concerts.length} show{p.concerts.length === 1 ? "" : "s"}
                  </div>
                  {p.concerts.slice(0, 6).map((c) => (
                    <div key={c.id} style={{ fontSize: 12, color: "#333" }}>
                      {c.artist}
                      {c.showName ? ` — ${c.showName}` : ""}
                    </div>
                  ))}
                  {p.concerts.length > 6 && (
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>+{p.concerts.length - 6} more</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          <FitBounds points={points} />
        </MapContainer>
      </div>
      <div style={{ ...label, fontSize: 11.5, color: "rgba(242,236,224,0.5)", marginTop: 8, textAlign: "center" }}>
        {status === "loading"
          ? `mapping your cities… (${points.length}/${groups.length})`
          : `${points.length} cit${points.length === 1 ? "y" : "ies"} on the map`}
      </div>
    </div>
  );
}
