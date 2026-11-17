import {
  Folder,
  LayoutGrid,
  MessageSquare,
  Search,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Sprint en el que se implementa la sección (para las vistas "Próximamente"). */
  sprint?: number
  description?: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Inicio', icon: LayoutGrid },
  {
    to: '/app/explorar',
    label: 'Explorar',
    icon: Search,
    sprint: 4,
    description: 'Catálogo de proyectos con búsqueda, filtros por categoría y habilidades, y ordenamiento.',
  },
  {
    to: '/app/mis-proyectos',
    label: 'Mis proyectos',
    icon: Folder,
    sprint: 3,
    description: 'Edita tus proyectos, cambia su estado y revisa los roles cubiertos y pendientes.',
  },
  {
    to: '/app/postulaciones',
    label: 'Postulaciones',
    icon: Users,
    sprint: 5,
    description: 'Sigue el estado de tus postulaciones y revisa a los postulantes de tus proyectos.',
  },
  {
    to: '/app/mensajes',
    label: 'Mensajes',
    icon: MessageSquare,
    sprint: 6,
    description: 'Conversa con tu equipo en un chat privado por proyecto.',
  },
  {
    to: '/app/perfil',
    label: 'Mi perfil',
    icon: User,
    sprint: 2,
    description: 'Foto, biografía, habilidades, enlaces a tu portafolio y disponibilidad semanal.',
  },
  {
    to: '/app/admin',
    label: 'Administración',
    icon: ShieldCheck,
    sprint: 8,
    description: 'Moderación de reportes, gestión de categorías e indicadores de la comunidad.',
  },
]

export const PUBLISH_ITEM: NavItem = {
  to: '/app/publicar',
  label: 'Publicar una idea',
  icon: LayoutGrid,
  sprint: 3,
  description: 'Asistente de 3 pasos: la idea, los roles y vacantes, y la vista previa.',
}
