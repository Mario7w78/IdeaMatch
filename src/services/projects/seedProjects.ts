import type { Project, ProjectMember, ProjectRole } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString()

type Details = Pick<
  Project,
  'description' | 'goals' | 'tags' | 'creatorId' | 'creatorName' | 'creatorBio' | 'createdAt' | 'members'
>

interface Seed {
  id: string
  title: string
  category: string
  summary: string
  description: string
  goals: [string, string, string]
  tags: string[]
  creator: [id: string, name: string, bio: string]
  days: number
  roles: [name: string, skills: string[], vacancies: number][]
  members: [name: string, role: string][]
}

function make(s: Seed): Project {
  const roles: ProjectRole[] = s.roles.map(([roleName, skills, vacancies], i) => ({
    id: `role-${s.id}-${i + 1}`,
    projectId: s.id,
    roleName,
    skills,
    vacancies,
  }))
  const members: ProjectMember[] = s.members.map(([name, roleName], i) => ({
    userId: `usr-${s.id}-${i + 1}`,
    name,
    roleName,
  }))
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    summary: s.summary,
    status: 'OPEN',
    roles,
    description: s.description,
    goals: [...s.goals],
    tags: [s.category, ...s.tags],
    creatorId: s.creator[0],
    creatorName: s.creator[1],
    creatorBio: s.creator[2],
    createdAt: daysAgo(s.days),
    members,
  }
}

/**
 * Datos de presentación de los proyectos que ya sembró el servicio de postulaciones
 * (mismos ids, roles y vacantes). Se combinan con lo guardado: el estado y las
 * vacantes siguen siendo los del almacenamiento compartido.
 */
export function detailsFor(id: string): Details | null {
  switch (id) {
    case 'proj-neurobloom':
      return {
        description:
          'NeuroBloom hace que cuidar la salud mental se sienta simple, cotidiano y alcanzable. Diseñamos una experiencia que ayuda a crear hábitos mediante seguimiento visual, comunidad y recomendaciones personalizadas.',
        goals: [
          'Una experiencia amable y sin fricción',
          'Recomendaciones realmente personales',
          'Una comunidad segura y cercana',
        ],
        tags: ['Salud digital', 'Impacto social', 'Remoto'],
        creatorId: 'usr-laura',
        creatorName: 'Laura Ríos',
        creatorBio: 'Construyendo productos digitales con propósito y equipos felices.',
        createdAt: daysAgo(3),
        members: [
          { userId: 'usr-ac', name: 'Andrés Castro', roleName: 'Backend Developer' },
          { userId: 'usr-ns', name: 'Nora Salas', roleName: 'Psicóloga' },
          { userId: 'usr-mg', name: 'Mateo Gil', roleName: 'Data Analyst' },
        ],
      }
    case 'proj-verdecerca':
      return {
        description:
          'Verde Cerca conecta a vecinos para crear y cuidar huertos urbanos comunitarios. Queremos que cualquier barrio pueda sembrar, compartir cosechas y aprender junto a quienes viven cerca.',
        goals: [
          'Un mapa de huertos fácil de usar',
          'Calendarios de siembra compartidos',
          'Una red de vecinos que se apoya',
        ],
        tags: ['Impacto social', 'Comunitario', 'Presencial'],
        creatorId: 'user1',
        creatorName: 'User 1',
        creatorBio: 'Diseño servicios para comunidades más verdes y conectadas.',
        createdAt: daysAgo(6),
        members: [
          { userId: 'usr-vc-1', name: 'Mateo Ibarra', roleName: 'Agrónomo asesor' },
          { userId: 'usr-vc-2', name: 'Paula Reyes', roleName: 'Community Manager' },
        ],
      }
    case 'proj-orbitfinance':
      return {
        description:
          'Orbit Finance enseña finanzas personales con retos cortos y recompensas. Buscamos que los universitarios aprendan a ahorrar e invertir jugando.',
        goals: [
          'Retos semanales de ahorro',
          'Simuladores de inversión sin riesgo',
          'Un ranking amistoso entre compañeros',
        ],
        tags: ['Fintech', 'Gamificación', 'Remoto'],
        creatorId: 'user2',
        creatorName: 'User 2',
        creatorBio: 'Apasionado por la educación financiera accesible.',
        createdAt: daysAgo(9),
        members: [
          { userId: 'usr-of-1', name: 'Elena Prado', roleName: 'Product Designer' },
          { userId: 'usr-of-2', name: 'Diego Luna', roleName: 'Backend Developer' },
        ],
      }
    case 'proj-aurora-closed':
      return {
        description:
          'Aurora Studio crea instalaciones interactivas generativas que reaccionan al movimiento del público mediante sensores.',
        goals: ['Una instalación itinerante', 'Sensores de bajo costo', 'Un kit para otros artistas'],
        tags: ['Arte y tecnología', 'Presencial'],
        creatorId: 'usr-sofia',
        creatorName: 'Sofía Mena',
        creatorBio: 'Artista y programadora creativa.',
        createdAt: daysAgo(40),
        members: [{ userId: 'usr-au-1', name: 'Tomás Vera', roleName: 'Sound Designer' }],
      }
    default:
      return null
  }
}

/** Proyectos abiertos adicionales para que el catálogo tenga más de una página. */
export const CATALOG_SEEDS: Project[] = [
  make({
    id: 'proj-agroconecta',
    title: 'AgroConecta',
    category: 'Agrotech',
    summary: 'Marketplace directo entre pequeños productores y restaurantes.',
    description:
      'AgroConecta acerca a los productores del campo con cocinas que buscan ingredientes frescos, sin intermediarios. Gestiona pedidos, entregas y pagos en un solo lugar.',
    goals: ['Pedidos en menos de tres toques', 'Rutas de entrega compartidas', 'Pagos claros para ambas partes'],
    tags: ['Marketplace', 'Remoto'],
    creator: ['usr-camila', 'Camila Ortiz', 'Ingeniera agrónoma enamorada de la tecnología.'],
    days: 1,
    roles: [
      ['Full-stack Developer', ['Node.js', 'React', 'PostgreSQL'], 2],
      ['UX Designer', ['Figma', 'UX Research'], 1],
    ],
    members: [['Iván Soto', 'Operaciones']],
  }),
  make({
    id: 'proj-tutorbit',
    title: 'TutorBit',
    category: 'Educación',
    summary: 'Tutorías entre pares con seguimiento de progreso.',
    description:
      'TutorBit conecta a estudiantes que dominan un tema con compañeros que necesitan ayuda. Cada sesión deja notas y metas para seguir avanzando.',
    goals: ['Emparejar tutor y estudiante en minutos', 'Sesiones por video integradas', 'Metas y progreso visibles'],
    tags: ['Comunidad', 'Remoto'],
    creator: ['usr-marta', 'Marta Díaz', 'Docente e investigadora en aprendizaje colaborativo.'],
    days: 2,
    roles: [
      ['Frontend Developer', ['React', 'TypeScript'], 2],
      ['Pedagoga asesora', ['Educación', 'Contenido'], 1],
    ],
    members: [['Luis Paz', 'Backend Developer'], ['Ana Gómez', 'UX Researcher']],
  }),
  make({
    id: 'proj-ruta-verde',
    title: 'Ruta Verde',
    category: 'Sostenibilidad',
    summary: 'Rutas urbanas sostenibles para bicicletas y transporte público.',
    description:
      'Ruta Verde calcula el trayecto con menos emisiones combinando bicicleta, caminata y transporte público, y muestra cuánto CO₂ se ahorra en cada viaje.',
    goals: ['Rutas comparables en tiempo y emisiones', 'Mapa con ciclovías al día', 'Retos mensuales por barrio'],
    tags: ['Movilidad', 'Remoto'],
    creator: ['usr-carlos', 'Carlos Pérez', 'Urbanista y ciclista diario.'],
    days: 4,
    roles: [
      ['Mobile Developer', ['React Native', 'Mapas'], 1],
      ['Data Analyst', ['Python', 'SQL'], 1],
    ],
    members: [['Valeria Cruz', 'GIS Specialist']],
  }),
  make({
    id: 'proj-pulso',
    title: 'Pulso',
    category: 'Salud digital',
    summary: 'Monitoreo de signos vitales para adultos mayores.',
    description:
      'Pulso ayuda a las familias a seguir la salud de sus mayores con lecturas simples y alertas oportunas, sin invadir su rutina.',
    goals: ['Lecturas sin fricción', 'Alertas que no asustan', 'Reportes claros para el médico'],
    tags: ['Cuidado', 'Remoto'],
    creator: ['usr-rafael', 'Rafael Núñez', 'Ingeniero biomédico.'],
    days: 5,
    roles: [
      ['Backend Developer', ['Node.js', 'PostgreSQL', 'APIs'], 1],
      ['Product Designer', ['Figma', 'Accesibilidad'], 1],
    ],
    members: [['Camila Rojas', 'Geriatra asesora'], ['Sergio Mora', 'Mobile Developer']],
  }),
  make({
    id: 'proj-logiflow',
    title: 'LogiFlow',
    category: 'Logística',
    summary: 'Optimización de rutas de última milla para pymes.',
    description:
      'LogiFlow ayuda a negocios pequeños a repartir más con menos kilómetros: planifica rutas, asigna pedidos y avisa a los clientes.',
    goals: ['Rutas óptimas en segundos', 'Seguimiento de entregas en vivo', 'Avisos automáticos al cliente'],
    tags: ['Logística', 'Remoto'],
    creator: ['usr-andrea', 'Andrea Vega', 'Especialista en cadenas de suministro.'],
    days: 7,
    roles: [
      ['Data Scientist', ['Python', 'Optimización'], 1],
      ['Frontend Developer', ['React', 'Mapas'], 1],
    ],
    members: [['Hugo Barrios', 'Operaciones']],
  }),
  make({
    id: 'proj-cultivarte',
    title: 'CultivArte',
    category: 'Arte y tecnología',
    summary: 'Talleres creativos con realidad aumentada para barrios.',
    description:
      'CultivArte lleva murales con realidad aumentada a espacios comunitarios. Cada taller termina con una obra que cobra vida desde el celular.',
    goals: ['Un kit de taller repetible', 'Murales con historias locales', 'Una galería abierta del barrio'],
    tags: ['Cultura', 'Presencial'],
    creator: ['usr-sofia', 'Sofía Mena', 'Artista y programadora creativa.'],
    days: 8,
    roles: [
      ['Creative Coder', ['Three.js', 'WebGL'], 1],
      ['Ilustrador/a', ['Ilustración', 'Motion'], 2],
    ],
    members: [['Tomás Vera', 'Sound Designer']],
  }),
  make({
    id: 'proj-cuentas-claras',
    title: 'Cuentas Claras',
    category: 'Fintech',
    summary: 'Presupuestos compartidos para estudiantes que viven juntos.',
    description:
      'Cuentas Claras reparte gastos entre compañeros de vivienda y recuerda quién debe qué, para que la convivencia no se pague con malos ratos.',
    goals: ['Dividir un gasto en segundos', 'Recordatorios amables', 'Saldos siempre actualizados'],
    tags: ['Finanzas personales', 'Remoto'],
    creator: ['usr-luis', 'Luis Rivas', 'Economista y desarrollador de fines de semana.'],
    days: 10,
    roles: [
      ['Mobile Developer', ['Flutter', 'Firebase'], 1],
      ['UX Researcher', ['UX Research', 'Entrevistas'], 1],
    ],
    members: [['Irene Campos', 'Product Designer']],
  }),
  make({
    id: 'proj-huellalab',
    title: 'HuellaLab',
    category: 'Sostenibilidad',
    summary: 'Calculadora de huella de carbono para pequeñas empresas.',
    description:
      'HuellaLab mide la huella de carbono de un negocio pequeño con preguntas simples y propone cambios concretos para reducirla.',
    goals: ['Un diagnóstico en diez minutos', 'Recomendaciones priorizadas', 'Informes para clientes'],
    tags: ['Clima', 'Remoto'],
    creator: ['usr-ana', 'Ana Gómez', 'Consultora en sostenibilidad empresarial.'],
    days: 12,
    roles: [
      ['Frontend Developer', ['React', 'Tailwind CSS'], 2],
      ['Data Analyst', ['Python', 'Estadística'], 1],
    ],
    members: [['Pablo Soria', 'Analista ambiental']],
  }),
  make({
    id: 'proj-mentorhub',
    title: 'MentorHub',
    category: 'Educación',
    summary: 'Conecta estudiantes de último año con mentores profesionales.',
    description:
      'MentorHub empareja a estudiantes que están por graduarse con profesionales que ya recorrieron su camino, con sesiones guiadas y metas claras.',
    goals: ['Emparejamiento por intereses', 'Sesiones con agenda guiada', 'Seguimiento de metas'],
    tags: ['Mentoría', 'Remoto'],
    creator: ['usr-jorge', 'Jorge Salas', 'Mentor y fundador de dos comunidades.'],
    days: 14,
    roles: [
      ['Full-stack Developer', ['Next.js', 'PostgreSQL'], 1],
      ['Community Manager', ['Comunidad', 'Contenido'], 1],
    ],
    members: [['Rosa Vidal', 'Product Manager']],
  }),
  make({
    id: 'proj-barrio-seguro',
    title: 'Barrio Seguro',
    category: 'Impacto social',
    summary: 'Alertas vecinales y mapa de zonas seguras.',
    description:
      'Barrio Seguro reúne a los vecinos para avisarse de incidentes cercanos y marcar rutas seguras, con respeto por la privacidad de todos.',
    goals: ['Alertas verificadas por vecinos', 'Mapa de zonas seguras', 'Privacidad por defecto'],
    tags: ['Comunitario', 'Presencial'],
    creator: ['usr-nora', 'Nora Salas', 'Trabajadora social y organizadora comunitaria.'],
    days: 16,
    roles: [
      ['Backend Developer', ['Python', 'FastAPI'], 1],
      ['Product Designer', ['Figma', 'Design Systems'], 1],
    ],
    members: [['Esteban Mora', 'Líder vecinal']],
  }),
]
