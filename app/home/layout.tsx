import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/principal/sidebar/app-sidebar"
import { SiteHeader } from "@/components/principal/sidebar/site-header"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 53)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="notranslate p-6">
          {children}   
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
