import {
  Folder,
  GitMerge,
  Layers,
  LayoutGrid,
  Mail,
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
  /** Solo se muestra a administradores. */
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Inicio', icon: LayoutGrid },
  { to: '/app/explorar', label: 'Explorar', icon: Search },
  {
    to: '/app/mis-proyectos',
    label: 'Mis proyectos',
    icon: Folder,
    description: 'Edita tus proyectos, cambia su estado y revisa los roles cubiertos y pendientes.',
  },
  {
    to: '/app/postulaciones',
    label: 'Postulaciones',
    icon: Users,
  },
  {
    to: '/app/mensajes',
    label: 'Mensajes',
    icon: MessageSquare,
    description: 'Conversa con tu equipo en un chat privado por proyecto.',
  },
  {
    to: '/app/perfil',
    label: 'Mi perfil',
    icon: User,
  },
  {
    to: '/app/contribuciones',
    label: 'Contribuciones',
    icon: GitMerge,
  },
  {
    to: '/app/notificaciones/correo',
    label: 'Preferencias de correo',
    icon: Mail,
  },
  {
    to: '/admin/reports',
    label: 'Administración',
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    to: '/admin/categories',
    label: 'Categorías',
    icon: Layers,
    adminOnly: true,
  },
]

export const PUBLISH_ITEM: NavItem = {
  to: '/app/publicar',
  label: 'Publicar una idea',
  icon: LayoutGrid,
  sprint: 3,
  description: 'Asistente de 3 pasos: la idea, los roles y vacantes, y la vista previa.',
}
