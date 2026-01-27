"use client";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

// ✅ Fix icon paths (Next + Leaflet)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  marker: { lat: number; lng: number } | null;
  onPick: (p: { lat: number; lng: number }) => void;
};

function ClickToPick({ onPick }: { onPick: Props["onPick"] }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPickerMap({ marker, onPick }: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    marker ?? { lat: -33.45694, lng: -70.64827 }
  );

  useEffect(() => {
    if (marker) setPosition(marker);
  }, [marker]);

  const center = useMemo(() => position, [position]);

  return (
    <div className="dv-leaflet-wrapper">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom
        style={{ height: 280, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickToPick
          onPick={(p) => {
            setPosition(p);
            onPick(p);
          }}
        />

        <Marker
          position={[position.lat, position.lng]}
          icon={defaultIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as any;
              const latlng = m.getLatLng();
              const p = { lat: latlng.lat, lng: latlng.lng };
              setPosition(p);
              onPick(p);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
