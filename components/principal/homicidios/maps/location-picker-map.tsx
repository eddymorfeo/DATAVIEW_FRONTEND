"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix icon path para Next (muchas veces el marker no aparece sin esto)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LatLng = { lat: number; lng: number };

type Props = {
  marker: LatLng | null;
  onPick: (p: LatLng) => void;
};

const DEFAULT_CENTER: LatLng = { lat: -33.45694, lng: -70.64827 }; // Santiago centro
const DEFAULT_ZOOM = 13;
const FOCUS_ZOOM = 16;

function FlyToMarker({ marker }: { marker: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (!marker) {
      // Si limpias el form (marker null), vuelve al centro por defecto
      map.flyTo([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM, {
        animate: true,
        duration: 0.8,
      });
      return;
    }

    // ✅ cuando llega marker (Buscar/Ubicar), centra y hace zoom
    map.flyTo([marker.lat, marker.lng], FOCUS_ZOOM, {
      animate: true,
      duration: 0.8,
    });
  }, [marker, map]);

  return null;
}

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPickerMap({ marker, onPick }: Props) {
  // Estado interno para soportar arrastre del marcador
  const [internalMarker, setInternalMarker] = useState<LatLng | null>(marker);

  useEffect(() => {
    setInternalMarker(marker);
  }, [marker]);

  const position = internalMarker ?? DEFAULT_CENTER;

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const m = e.target;
        const p = m.getLatLng();
        const next = { lat: p.lat, lng: p.lng };
        setInternalMarker(next);
        onPick(next);
      },
    }),
    [onPick]
  );

  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={internalMarker ? FOCUS_ZOOM : DEFAULT_ZOOM}
      scrollWheelZoom
      style={{ height: 320, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ✅ mueve el mapa automáticamente cuando cambia marker */}
      <FlyToMarker marker={marker} />

      {/* ✅ permite click para fijar punto */}
      <ClickToPick
        onPick={(p) => {
          setInternalMarker(p);
          onPick(p);
        }}
      />

      {/* marcador (draggable) */}
      {internalMarker && (
        <Marker
          position={[internalMarker.lat, internalMarker.lng]}
          draggable
          eventHandlers={eventHandlers as any}
        />
      )}
    </MapContainer>
  );
}
