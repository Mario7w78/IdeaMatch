# IdeaMatch — Endpoints requeridos por el frontend

Contrato que necesita el frontend, organizado en los 3 sprints de 1 semana. **No se asume ningún servicio de correo.**

## Convenciones

- Autenticación: `Authorization: Bearer <token>` en todas las rutas salvo las marcadas como 🌐 públicas.
- Error: `{ "code": "INVALID_CREDENTIALS", "message": "Credenciales inválidas" }`. El frontend decide qué mostrar según `code`.
- Paginación: `?page=1&limit=10` → `{ items, total, page, limit }`.
- `401` sin sesión · `403` sin permiso (no es dueño, no es miembro, no es admin) · `404` no existe · `409` conflicto de reglas de negocio.
- Objeto `user`: `{ id, firstName, lastName, email, isAdmin, createdAt }`. Nunca incluye la contraseña.

---

## Sprint 1 (9–15 nov) — Acceso

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| POST 🌐 | `/auth/register` | body: `firstName`, `lastName`, `email`, `password` (≥ 8, una mayúscula y un número) | `201 { token, user }` (la cuenta queda activa) · `409 EMAIL_TAKEN_OR_INVALID` · `400 WEAK_PASSWORD` |
| POST 🌐 | `/auth/login` | body: `email`, `password` | `200 { token, user }` · `401 INVALID_CREDENTIALS` (mismo mensaje si el correo no existe o la contraseña es incorrecta) |
| POST | `/auth/logout` | — | `204` (invalida el token) |
| GET | `/auth/me` | — | `200 { user }` · `401` |

## Sprint 2 (16–22 nov) — Perfil, publicación y exploración

### Perfil

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| GET | `/me/profile` | — | `200 { profile }` (perfil completo propio) |
| PATCH | `/me/profile` | body (todos opcionales): `firstName`, `lastName`, `headline`, `location`, `bio`, `links: { portfolio, linkedin, github }`, `hoursPerWeek` (1–80) | `200 { profile }` · `400 INVALID_URL` (debe iniciar con http:// o https://) · `400 INVALID_HOURS` |
| PUT | `/me/profile/photo` | multipart: `file` (JPG/PNG ≤ 2 MB) | `200 { photoUrl }` · `400 INVALID_FILE` |
| PUT | `/me/skills` | body: `skillIds[]` (1–15) | `200 { skills }` · `400 SKILLS_OUT_OF_RANGE` |
| PUT | `/me/interests` | body: `categoryIds[]` | `200 { interests }` |
| GET | `/skills` | query: `q` | `200 [{ id, name }]` |
| GET 🌐 | `/categories` | — | `200 [{ id, name, projectCount }]` |

`profile`: `{ id, firstName, lastName, photoUrl, headline, location, bio, links, hoursPerWeek, skills[], interests[] }`

### Proyectos

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| POST | `/projects` | body: `name` (≤ 60), `summary` (≤ 140), `description`, `categoryId`, `modality` (`remoto` \| `presencial` \| `hibrido`) | `201 { project }` en estado `borrador` · `400 VALIDATION` |
| PATCH | `/projects/:id` | mismos campos, opcionales | `200 { project }` · `403 NOT_OWNER` |
| GET | `/me/projects` | query: `status` | `200 [{ id, name, category, status, rolesCovered, rolesPending, pendingApplications }]` |
| POST | `/projects/:id/roles` | body: `name`, `vacancies` (≥ 1), `dedication` (`5-10` \| `10-20` \| `20+`), `skillIds[]`, `description` | `201 { role }` · `400 INVALID_VACANCIES` · `403` |
| PATCH | `/projects/:id/roles/:roleId` | mismos campos, opcionales | `200 { role }` · `403` |
| DELETE | `/projects/:id/roles/:roleId` | — | `204` · `403` |
| POST | `/projects/:id/publish` | — | `200 { project }` en estado `abierto` · `409 NO_ROLES` |
| PATCH | `/projects/:id/status` | body: `status` (`abierto` \| `en_curso` \| `pausado` \| `cerrado`) | `200 { project }` · `409 INVALID_TRANSITION` · `403` |

- El objeto `project` incluye `{ id, name, summary, description, category, modality, status, roles[] }`. Estados: `borrador`, `abierto`, `en_curso`, `pausado`, `cerrado`.

### Exploración (Inicio y Explorar)

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| GET | `/projects` | query: `page`, `limit` (10); solo proyectos en estado `abierto` | `200 { items: [projectCard], total }` |
| GET | `/projects/:id` | — | `200 { projectDetail }` · `404 PROJECT_NOT_FOUND` |

- `projectCard`: `{ id, name, summary, category, coverColor, skills[], memberInitials[], extraMembers }`
- `projectDetail`: `{ ...projectCard, description, modality, status, creator { id, name, photoUrl }, roles: [{ id, name, dedication, skills[], vacancies, vacanciesAvailable }], members: [{ userId, name, role }], myApplication: { id, roleId, status } | null }`
- La sección "Proyectos listos para despegar" de Inicio usa `GET /projects?limit=3`.


## Sprint 3 (23–29 nov) — Postulaciones, equipo y mensajería

### Perfil público, búsqueda y filtros

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| GET | `/users/:id` | — | `200 { publicProfile }`: nombre, foto, headline, ubicación, bio, habilidades, enlaces, disponibilidad, experiencia, insignias. **Sin correo ni datos privados.** |
| GET | `/projects` (ampliación) | query adicional: `q` (título y descripción), `categoryIds`, `skillIds`, `availability` (`5-10` \| `10-20`), `status` | `200 { items, total }` · debe responder en < 1 s (RNF34) |
| GET 🌐 | `/categories` (ampliación) | — | debe incluir `projectCount` para el panel de filtros |

### Postulaciones

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| POST | `/projects/:id/roles/:roleId/applications` | body: `note` | `201 { application }` en estado `pendiente` · `409 PROJECT_NOT_OPEN` · `409 ROLE_FULL` · `409 ALREADY_APPLIED` (un colaborador solo puede postular una vez por proyecto) |
| GET | `/me/applications` | query: `status`, `page` | `200 { summary: { sent, inReview, accepted, finished }, items: [{ id, project { id, name, category, coverColor }, role, createdAt, status }] }` |
| GET | `/projects/:id/applications` | query: `roleId`, `q`, `sort` (`match` \| `recent`), `page` | `200 { roleCounts: [{ roleId, name, count }], total, vacancies, items: [applicantCard] }` · `403 NOT_OWNER` |
| POST | `/applications/:id/accept` | — | `200` estado `aceptada`, resta 1 vacante y suma al usuario al equipo · `409 NO_VACANCIES` · `409 NOT_PENDING` |
| POST | `/applications/:id/reject` | — | `200` estado `rechazada` · `409 NOT_PENDING` |

`applicantCard`: `{ id, status, isNew, matchPercent, note, applicant: { id, name, initials, headline, location, projectsCount, hoursPerWeek, skills[], links } }`

Estados de una postulación: `pendiente`, `aceptada`, `rechazada`, `cancelada`.

### Equipo y chat

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| GET | `/projects/:id/team` | — | `200 [{ userId, name, photoUrl, role, isLeader }]` (el creador aparece como "Líder del proyecto") |
| GET | `/conversations` | query: `q` | `200 [{ id, project { id, name, initials }, lastMessage { text, authorName, sentAt }, unreadCount }]` |
| GET | `/conversations/:id` | — | `200 { id, project, membersCount, projectStatus }` · `403 NOT_MEMBER` |
| GET | `/conversations/:id/messages` | query: `before` (cursor), `limit` | `200 [{ id, author { id, name, initials }, text, sentAt, readByOthers }]` · `403 NOT_MEMBER` |
| POST | `/conversations/:id/messages` | body: `text` | `201 { message }` · `403 NOT_MEMBER` |
| POST | `/conversations/:id/read` | — | `204` |
| GET | `/conversations/:id/messages` (polling) | query: `after` (id o fecha del último mensaje recibido) | `200 [message]` con los mensajes nuevos. El frontend consulta cada 5 s; el WebSocket queda como mejora futura |

Solo el creador y los colaboradores aceptados pueden acceder a la conversación de un proyecto (`403 NOT_MEMBER`).

---

## Backlog futuro (no se implementa en estas 3 semanas)

| Método | Ruta | Parámetros | Respuesta / errores |
|---|---|---|---|
| POST | `/projects/:id/cancel` | — | `200 { project }` en estado `cancelado` (las postulaciones pendientes se cierran) · `403` |
| GET | `/projects` | query: `sort` (`recent` \| `popular`) | HU19 |
| POST | `/applications/:id/cancel` | — | `200` estado `cancelada` · `409 ALREADY_PROCESSED` |
| POST | `/projects/:id/leave` | — | `204` (libera la vacante y quita el acceso al chat) · `409 OWNER_CANNOT_LEAVE` |
| DELETE | `/projects/:id/members/:userId` | body: `reason` | `204` (reabre la vacante y quita el acceso al chat) · `403 NOT_OWNER` |
| POST | `/conversations/:id/messages` | multipart: `file` (PDF/PNG ≤ 10 MB) | HU33 · adjuntos |
| GET | `/notifications` | query: `unreadOnly`, `page` | `200 { unreadCount, items: [{ id, type, payload, read, createdAt }] }` |
| POST | `/notifications/:id/read` | — | `204` |
| POST | `/notifications/read-all` | — | `204` |
| GET | `/me/counters` | — | `200 { unreadNotifications, unreadMessages }` (indicador de la campana y número junto a "Mensajes" en la barra lateral) |
| WS | `/ws?token=<token>` | eventos del servidor: `notification:new`, `message:new` (reemplaza el polling del chat) | — |
| POST | `/projects/:id/reports` | body: `reason` (`spam` \| `contenido_enganoso` \| `propiedad_intelectual` \| `otro`), `description` (obligatoria) | `201` · `409 ALREADY_REPORTED` |
| GET | `/admin/metrics` | — | `200 { users, activeProjects, acceptanceRate, openReports, updatedAt }`; cada indicador tiene la forma `{ value, changeThisMonth }`. Si el cálculo falla, se devuelve el último valor en caché con su `updatedAt` |
| GET | `/admin/reports` | query: `status` (`abierto` \| `resuelto`), `severity` (`alta` \| `media` \| `baja`), `page` | `200 { items: [{ id, project { id, name }, reason, severity, createdAt, reporter }], total }` |
| POST | `/admin/reports/:id/resolve` | body: `action` (`suspend_project` \| `dismiss`), `note` | `200` (suspender oculta el proyecto y notifica al creador) |
| GET | `/admin/categories` | — | `200 [{ id, name, active, projectCount }]` |
| POST | `/admin/categories` | body: `name` | `201` · `409 CATEGORY_EXISTS` |
| PATCH | `/admin/categories/:id` | body: `name`, `active` | `200` · `409 CATEGORY_EXISTS` |

### Fuera de alcance por no usar servicio de correo

| HU | Historia | Qué cambia |
|---|---|---|
| HU02 | Verificación de correo | Se elimina: la cuenta queda activa al registrarse. |
| HU04 | Recuperación de contraseña | No hay forma de demostrar que el usuario es dueño de la cuenta sin un canal externo. Queda pendiente; si se quiere, se puede reemplazar por "cambiar contraseña con sesión iniciada": `PUT /me/password` con `currentPassword` y `newPassword`. |
| HU36 | Notificaciones por correo | Se reemplazarían por notificaciones in-app (también en el backlog futuro). |

