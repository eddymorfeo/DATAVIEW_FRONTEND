"use client";

import dynamic from "next/dynamic";
import type { Homicide } from "@/lib/focos/types";

const HomicidesMapInner = dynamic(
  () => import("./homicides-map-inner").then((m) => m.HomicidesMapInner),
  { ssr: false }
);

export function HomicidesMap({
  homicides,
  focusId,
  focusPoint,
}: {
  homicides: Homicide[];
  focusId: string | null;
  focusPoint?: { lat: number; lng: number } | null;
}) {
  return (
    <div className="dv-leaflet-wrapper overflow-hidden rounded-xl border">
      <HomicidesMapInner homicides={homicides} focusId={focusId} focusPoint={focusPoint ?? null}/>
    </div>
  );
}
