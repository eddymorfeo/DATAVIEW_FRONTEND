"use client";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Homicide } from "@/lib/focos/types";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function HomicidesMapInner({ homicides }: { homicides: Homicide[] }) {
  const points = homicides
    .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number")
    .map((h) => ({ ...h, latitude: h.latitude as number, longitude: h.longitude as number }));

  const center =
    points.length > 0
      ? { lat: points[0].latitude, lng: points[0].longitude }
      : { lat: -33.45694, lng: -70.64827 };

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom style={{ height: 420, width: "100%" }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {points.map((h) => (
        <Marker key={h.id} position={[h.latitude, h.longitude]} icon={defaultIcon}>
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">RUC: {h.ruc}</div>
              <div>{h.full_name ?? "-"}</div>
              <div className="text-xs">{h.address ?? "-"}</div>
              <div className="text-xs">
                {h.comuna_name ?? ""} • {h.weapon_name ?? ""} • {h.case_status_name ?? ""}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
