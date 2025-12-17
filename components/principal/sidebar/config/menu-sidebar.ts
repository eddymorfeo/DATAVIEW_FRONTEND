
import {
  IconDatabase,
  IconReport,
  IconFileWord,
  IconTrendingUp,
  IconMapPin
} from "@tabler/icons-react"

export const sidebarMenu = [
    {
      name: "Focos Delictuales",
      description: "Monitorea el avance, estadísticas y gestión de focos delictuales activos y terminados.",
      url: "/home/focos",
      icon: IconTrendingUp,
    },
    {
      name: "Lineas Investigativas",
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
    {
      name: "RAF",
      description: "Esta es una descripcion de prueba.",
      url: "/home/raf",
      icon: IconFileWord,
    },
  ]