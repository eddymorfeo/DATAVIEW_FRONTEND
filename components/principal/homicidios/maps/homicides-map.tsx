"use client";

import dynamic from "next/dynamic";
import type { Homicide } from "@/lib/focos/types";

const HomicidesMapInner = dynamic(() => import("./homicides-map-inner").then(m => m.HomicidesMapInner), {
  ssr: false,
});

export function HomicidesMap({ homicides }: { homicides: Homicide[] }) {
  return (
    <div className="dv-leaflet-wrapper rounded-xl border overflow-hidden">
      <HomicidesMapInner homicides={homicides} />
    </div>
  );
}
