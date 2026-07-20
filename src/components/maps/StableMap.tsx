import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface StableMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  lines?: string[];
}

interface StableMapProps {
  markers: StableMapMarker[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

export default function StableMap({
  markers,
  height = "480px",
  center = [32.25, 35],
  zoom = 8,
  interactive = true,
}: StableMapProps) {
  return (
    <div
      className="relative w-full min-w-0 overflow-hidden rounded-3xl"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="absolute inset-0 h-full w-full"
        scrollWheelZoom={false}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={false}
        keyboard={false}
        inertia={false}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
      >
        <MapResizeFix />

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={markerIcon}
          >
            <Popup>
              <strong>{marker.title}</strong>

              {marker.lines?.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const refreshMap = () => {
      window.requestAnimationFrame(() => {
        map.invalidateSize({
          animate: false,
          pan: false,
        });
      });
    };

    refreshMap();

    const firstTimer = window.setTimeout(refreshMap, 100);
    const secondTimer = window.setTimeout(refreshMap, 350);

    const resizeObserver = new ResizeObserver(refreshMap);

    resizeObserver.observe(container);

    window.addEventListener("resize", refreshMap);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(secondTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", refreshMap);
    };
  }, [map]);

  return null;
}