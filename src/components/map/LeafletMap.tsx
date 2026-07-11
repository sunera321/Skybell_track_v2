"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import Link from "next/link";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.8 0 0 5.8 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.8 20.2 0 13 0z" fill="#2f5ee0"/>
    <circle cx="13" cy="13" r="5.5" fill="white"/>
  </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
  popupAnchor: [0, -30],
});

export interface MapSite {
  id: string;
  lat: number;
  lng: number;
  customerName: string;
  address: string;
}

function ClickToSelect({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LeafletMap({
  sites,
  height = "480px",
  interactiveLink = true,
  onSelect,
  center: centerProp,
}: {
  sites: MapSite[];
  height?: string;
  interactiveLink?: boolean;
  /** Enables click-to-drop-a-pin mode; called with the clicked coordinates. */
  onSelect?: (lat: number, lng: number) => void;
  center?: [number, number];
}) {
  const center: [number, number] =
    centerProp ?? (sites.length ? [sites[0].lat, sites[0].lng] : [6.9271, 79.8612]); // Colombo fallback

  return (
    <div style={{ height }} className={onSelect ? "cursor-crosshair" : undefined}>
      <MapContainer center={center} zoom={sites.length > 1 ? 10 : 14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onSelect && <ClickToSelect onSelect={onSelect} />}
        {sites.map((site) => (
          <Marker key={site.id} position={[site.lat, site.lng]} icon={pinIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{site.customerName}</p>
                <p className="text-xs text-muted">{site.address}</p>
                {interactiveLink && (
                  <Link href={`/sites/${site.id}`} className="mt-1 inline-block text-xs text-brand-600">
                    View site →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
