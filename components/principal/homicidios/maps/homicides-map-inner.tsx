"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Homicide } from "@/lib/focos/types";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FocusController({
  focusId,
  focusPoint,
  points,
  markerRefs,
  tempMarkerRef,
}: {
  focusId: string | null;
  focusPoint: { lat: number; lng: number } | null;
  points: Array<Homicide & { latitude: number; longitude: number }>;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
  tempMarkerRef: React.MutableRefObject<L.Marker | null>;
}) {
  const map = useMap();

  useEffect(() => {
    // ✅ 1) Prioridad: focusPoint (viene desde "Ubicar en mapa" en edición)
    if (focusPoint) {
      const latlng: [number, number] = [focusPoint.lat, focusPoint.lng];

      map.flyTo(latlng, 16, { animate: true, duration: 0.8 });

      // abre popup del marcador temporal
      if (tempMarkerRef.current) {
        setTimeout(() => {
          tempMarkerRef.current?.openPopup();
        }, 250);
      }
      return;
    }

    // ✅ 2) Caso normal: focusId (ubicar un caso existente)
    if (!focusId) return;

    const target = points.find((p) => p.id === focusId);
    if (!target) return;

    const latlng: [number, number] = [target.latitude, target.longitude];

    map.flyTo(latlng, 16, { animate: true, duration: 0.8 });

    const marker = markerRefs.current.get(focusId);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 250);
    }
  }, [focusId, focusPoint, points, map, markerRefs, tempMarkerRef]);

  return null;
}

export function HomicidesMapInner({
  homicides,
  focusId,
  focusPoint,
}: {
  homicides: Homicide[];
  focusId: string | null;
  focusPoint?: { lat: number; lng: number } | null; // ✅ NUEVO
}) {
  const points = useMemo(
    () =>
      homicides
        .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number")
        .map((h) => ({ ...h, latitude: h.latitude as number, longitude: h.longitude as number })),
    [homicides]
  );

  const center =
    focusPoint
      ? { lat: focusPoint.lat, lng: focusPoint.lng }
      : points.length > 0
      ? { lat: points[0].latitude, lng: points[0].longitude }
      : { lat: -33.45694, lng: -70.64827 };

  // refs para poder abrir popup programáticamente
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // ✅ ref para popup temporal (focusPoint)
  const tempMarkerRef = useRef<L.Marker | null>(null);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: 420, width: "100%" }}
    >
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FocusController
        focusId={focusId}
        focusPoint={focusPoint ?? null}
        points={points}
        markerRefs={markerRefs}
        tempMarkerRef={tempMarkerRef}
      />

      {points.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={defaultIcon}
          ref={(ref) => {
            if (!ref) return;
            markerRefs.current.set(h.id, ref);
          }}
        >
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

      {/* ✅ Marcador temporal cuando vienes desde "Ubicar en mapa" en edición */}
      {focusPoint ? (
        <Marker
          key={`focus-${focusPoint.lat}-${focusPoint.lng}`}
          position={[focusPoint.lat, focusPoint.lng]}
          icon={defaultIcon}
          ref={(ref) => {
            tempMarkerRef.current = ref ?? null;
          }}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">Ubicación seleccionada</div>
              <div className="text-xs">
                {focusPoint.lat.toFixed(6)}, {focusPoint.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
