
import {
  IconDatabase,
  IconReport,
  IconFileWord,
  IconTrendingUp,
  IconMapPin,
  IconTimeline,
  IconTopologyRing
} from "@tabler/icons-react"

export const sidebarMenu = [
    {
      name: "Focos Delictuales",
      description: "Monitorea el avance, estadísticas y gestión de focos delictuales activos y terminados.",
      url: "/home/focos",
      icon: IconTrendingUp,
    },
    {
      name: "Monitoreo Homicidios",
      description: "Visualiza casos, georreferenciación, estados y estadísticas de homicidios.",
      url: "/home/homicidios",
      icon: IconMapPin,
    },
    // {
    //   name: "Lineas Investigativas",
    //   description: "Monitorea el avance, estadísticas y gestión de focos delictuales activos y terminados.",
    //   url: "/home/focos",
    //   icon: IconTrendingUp,
    // },
    {
      name: "Procedimientos",
      description: "Monitorea el avance, estadísticas y gestión de los procedimientos de los fiscales.",
      url: "/home/procedimientos",
      icon: IconTimeline,
    },
    {
      name: "RAF",
      description: "Seguimiento y gestión de los Reportes a Fiscalía.",
      url: "/home/raf",
      icon: IconTopologyRing,
    },
  ]