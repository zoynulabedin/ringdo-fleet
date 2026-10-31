import { useEffect, useRef, useState } from "react";
import type { Seller } from "../data/preview";
import { Icon } from "./icon";
import { useWorkspace } from "./shell";
import type { Map as MapInstance } from "maplibre-gl";

export function LivingMap({
  sellers,
  selected,
  onSelect,
  radius,
  point,
  onPoint,
}: {
  sellers: Seller[];
  selected: string | null;
  onSelect: (seller: Seller) => void;
  radius: number;
  point: { lat: number; lng: number } | null;
  onPoint: (point: { lat: number; lng: number }) => void;
}) {
  const { preview, t, mapStyle } = useWorkspace();
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MapInstance | null>(null);
  const [ready, setReady] = useState(0);
  const [error, setError] = useState("");
  const [pendingPoint, setPendingPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  useEffect(() => {
    setError("");
    setPendingPoint(null);
    if (preview || !mapRef.current) return;
    let disposed = false;
    let map: { remove: () => void } | null = null;
    void import("maplibre-gl")
      .then(({ Map, NavigationControl }) => {
        if (disposed || !mapRef.current) return;
        const instance = new Map({
          container: mapRef.current,
          style: mapStyle || {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [{ id: "osm", type: "raster", source: "osm" }],
          },
          center: point ? [point.lng, point.lat] : [90.1, 23.8],
          zoom: point
            ? radius <= 500
              ? 15
              : radius <= 1000
                ? 14
                : radius <= 2000
                  ? 13
                  : 12
            : 6.1,
          attributionControl: { compact: true },
        });
        map = instance;
        instanceRef.current = instance;
        instance.addControl(new NavigationControl(), "bottom-right");
        instance.on("load", () => {
          if (disposed) return;
          if (point) {
            const latDelta = radius / 111_320;
            const lngDelta =
              latDelta / Math.max(0.01, Math.cos((point.lat * Math.PI) / 180));
            const coordinates = Array.from({ length: 65 }, (_, i) => {
              const angle = (i * Math.PI * 2) / 64;
              return [
                point.lng + lngDelta * Math.cos(angle),
                point.lat + latDelta * Math.sin(angle),
              ];
            });
            instance.addSource("radar", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "Polygon", coordinates: [coordinates] },
              },
            });
            instance.addLayer({
              id: "radar-fill",
              type: "fill",
              source: "radar",
              paint: { "fill-color": "#ef6b3f", "fill-opacity": 0.08 },
            });
            instance.addLayer({
              id: "radar-edge",
              type: "line",
              source: "radar",
              paint: {
                "line-color": "#ef6b3f",
                "line-width": 1.5,
                "line-dasharray": [3, 4],
              },
            });
          }
          setReady((value) => value + 1);
        });
        instance.on("click", (e) =>
          setPendingPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng }),
        );
        instance.on("error", () =>
          setError(
            t(
              "Map could not be fully loaded. The list remains available.",
              "ম্যাপ পুরোপুরি লোড হয়নি। তালিকা ব্যবহার করতে পারেন।",
            ),
          ),
        );
      })
      .catch(() =>
        setError(
          t(
            "Map is unavailable. Please use the list.",
            "ম্যাপ পাওয়া যাচ্ছে না। তালিকা ব্যবহার করুন।",
          ),
        ),
      );
    return () => {
      disposed = true;
      instanceRef.current = null;
      map?.remove();
    };
  }, [preview, mapStyle, point?.lat, point?.lng, radius]);
  const markerKey = sellers.map((s) => `${s.id}:${s.lat}:${s.lng}`).join("|");
  useEffect(() => {
    const map = instanceRef.current;
    if (preview || !map || !ready) return;
    let disposed = false;
    const markers: { remove: () => void }[] = [];
    void import("maplibre-gl").then(({ Marker }) => {
      if (disposed) return;
      for (const seller of sellers) {
        if (seller.lat === undefined || seller.lng === undefined) continue;
        const button = document.createElement("button");
        button.className = `live-marker ${selected === seller.id ? "live-marker-selected" : ""}`;
        button.textContent = seller.name.en
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("");
        button.setAttribute(
          "aria-label",
          `${seller.name.en}, ${seller.distance} metres`,
        );
        button.title = seller.name.en;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelect(seller);
        });
        markers.push(
          new Marker({ element: button })
            .setLngLat([seller.lng, seller.lat])
            .addTo(map),
        );
      }
    });
    return () => {
      disposed = true;
      markers.forEach((marker) => marker.remove());
    };
  }, [preview, ready, markerKey, selected]);
  return (
    <div className={`living-map ${preview ? "map-demo" : ""}`}>
      {preview ? (
        <>
          <svg
            viewBox="0 0 900 610"
            preserveAspectRatio="xMidYMid slice"
            className="map-art"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="blocks"
                width="128"
                height="112"
                patternUnits="userSpaceOnUse"
              >
                <rect width="128" height="112" fill="#eeede6" />
                <rect
                  x="10"
                  y="12"
                  width="44"
                  height="30"
                  rx="5"
                  fill="#e1e2d9"
                />
                <rect
                  x="66"
                  y="12"
                  width="50"
                  height="30"
                  rx="5"
                  fill="#e4e3da"
                />
                <rect
                  x="10"
                  y="55"
                  width="44"
                  height="42"
                  rx="5"
                  fill="#dedfd7"
                />
                <rect
                  x="66"
                  y="55"
                  width="50"
                  height="42"
                  rx="5"
                  fill="#e2e3da"
                />
              </pattern>
              <radialGradient id="radar-fill">
                <stop offset="0" stopColor="#ef6b3f" stopOpacity=".02" />
                <stop offset="1" stopColor="#ef6b3f" stopOpacity=".12" />
              </radialGradient>
            </defs>
            <rect width="900" height="610" fill="url(#blocks)" />
            <path
              d="M720-20C590 100 700 210 600 310S650 510 510 650"
              stroke="#c1d9d3"
              strokeWidth="115"
              fill="none"
            />
            <path
              d="M750-20C620 100 730 210 630 310S680 510 540 650"
              stroke="#cee2dd"
              strokeWidth="75"
              fill="none"
            />
            <path
              d="M-30 290L950 130 M80-20L400 650 M-20 540L700-30 M-20 420L940 530"
              stroke="#fffef9"
              strokeWidth="22"
              fill="none"
            />
            <path
              d="M-30 290L950 130 M80-20L400 650 M-20 540L700-30 M-20 420L940 530"
              stroke="#e5d1a8"
              strokeWidth="2"
              fill="none"
            />
            <rect
              x="315"
              y="310"
              width="115"
              height="78"
              rx="30"
              fill="#c8d5b9"
            />
            <rect
              x="75"
              y="110"
              width="100"
              height="65"
              rx="20"
              fill="#d1dbbf"
            />
            <text
              x="340"
              y="350"
              fill="#859875"
              fontSize="12"
              fontFamily="sans-serif"
            >
              GREEN PARK
            </text>
            <text
              x="210"
              y="240"
              fill="#9b998b"
              fontSize="14"
              fontFamily="sans-serif"
              letterSpacing="3"
            >
              SAMPLE NEIGHBOURHOOD
            </text>
            <text
              x="705"
              y="350"
              fill="#87a99f"
              fontSize="14"
              fontFamily="sans-serif"
              transform="rotate(65 705 350)"
            >
              RIVERSIDE
            </text>
            <circle
              cx="450"
              cy="305"
              r={
                radius === 500
                  ? 115
                  : radius === 1000
                    ? 195
                    : radius === 2000
                      ? 260
                      : 340
              }
              fill="url(#radar-fill)"
              stroke="#e78b6b"
              strokeWidth="1.4"
              strokeDasharray="6 7"
            />
          </svg>
          <span className="map-home-pin">
            <span />
            <Icon name="location" size={22} />
          </span>
          {sellers.map((s) => (
            <button
              key={s.id}
              className={`map-marker ${selected === s.id ? "map-marker-selected" : ""}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={() => onSelect(s)}
              aria-label={`${s.name.en}, ${s.distance} metres, preview`}
            >
              <span className="marker-roof" style={{ background: s.color }} />
              <span className="marker-body">
                <Icon name={s.icon} size={22} />
              </span>
              <span className="marker-label">
                {s.kind === "professional"
                  ? s.name.en.split(" ")[0]
                  : s.kind === "shop"
                    ? "Fresh shop"
                    : "Kitchen"}
              </span>
            </button>
          ))}
          <div className="map-scale">
            <span />
            {t(
              "Illustrative map · demo positions",
              "নমুনা ম্যাপ · কাল্পনিক অবস্থান",
            )}
          </div>
        </>
      ) : (
        <>
          <div ref={mapRef} className="maplibre-container" />
          {!point && (
            <div className="map-location-hint">
              <Icon name="location" size={18} />
              {t(
                "Choose a search location to see eligible nearby results.",
                "কাছাকাছি ফলাফল দেখতে খোঁজার জায়গা নির্বাচন করুন।",
              )}
            </div>
          )}
          {pendingPoint && (
            <button
              className="button primary map-search-area"
              onClick={() => {
                onPoint(pendingPoint);
                setPendingPoint(null);
              }}
            >
              {t("Search this area", "এই এলাকায় খুঁজুন")}
              <Icon name="search" size={15} />
            </button>
          )}
        </>
      )}
      <div className="map-top-label">
        <span className="status-dot online" />
        {t(
          preview ? "YOUR NEIGHBOURHOOD · PREVIEW" : "EXPLORE THE MAP",
          preview ? "আপনার এলাকা · প্রিভিউ" : "ম্যাপে খুঁজুন",
        )}
      </div>
      <div className="map-controls">
        <button
          className="map-control"
          aria-label="Choose a search location"
          onClick={() => {
            if (point) onPoint(point);
            else
              setError(
                t(
                  "Select a point on the map or choose your location above.",
                  "ম্যাপে জায়গা বেছে নিন অথবা উপরের মেনু থেকে অবস্থান দিন।",
                ),
              );
          }}
        >
          <Icon name="target" size={19} />
        </button>
      </div>
      {error && (
        <div className="map-error" role="status">
          {error}
        </div>
      )}
    </div>
  );
}
