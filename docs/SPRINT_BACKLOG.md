# IdeaMatch — Sprint Backlog

2 sprints (9 al 29 de noviembre de 2026), 43 historias de usuario y 145 story points, según `Catalogo_de_requisitos_y_Product_Backlog_final (1).xlsx`.

Los números de HU siguen la prioridad del Product Backlog. Los IDs de tarea tienen la forma `HU26-BE` (backend), `HU26-FE` (frontend), `TEC-xx` (técnica) y `QA-x` (pruebas).

El reparto por persona, con el detalle de cada tarea, está en [REPARTO_EQUIPO.md](REPARTO_EQUIPO.md) y en `docs/Reparto_equipo_IdeaMatch.docx` (que además incluye la verificación contra el catálogo de requisitos).

## Equipo y criterio de reparto

| Responsable | Rol | Se encarga de | Puntos |
|---|---|---|---|
| **Dev 3** | Desarrollador Backend | Todo el backend y el servicio de correo | 37.5 |
| **Dev 4** | Desarrollador Frontend y Deploy | Pantallas de correo, moderación y contribuciones externas; deploy | 12.5 |
| **Dev 5** | Desarrollador Frontend | Pantallas de postulaciones, equipo, contribuciones y herramientas | 13 |
| **Dev 6** | Desarrollador Frontend y Tests | Pantallas de categorías y reportes; tests | 13.5 |
| **Dev 7** | Desarrollador Frontend | Pantallas del chat y de las notificaciones | 12.5 |

- **Un backend y cuatro frontends.** Dev 3 hace todo el backend (36 puntos, más el servicio de correo). Los otros cuatro hacen solo pantallas y trabajan con el servicio simulado hasta que el endpoint real esté listo.
- **Puntos:** el xlsx estima cada historia en story points (SP) sin separar backend y frontend. Aquí cada tarea vale la mitad de los puntos de su historia. Las tareas de correo, deploy y tests son propuestas, estimadas en la misma unidad.
- **Contrato primero.** Antes de programar una historia, Dev 3 y quien hace la pantalla acuerdan los tipos de datos (`src/services/<dominio>/types.ts`) y los mensajes exactos de los criterios de aceptación.
- **Nadie valida su propio trabajo.** Dev 6 prueba las historias de los demás. Sus pantallas (HU38–HU39) las prueba Dev 4 (QA-F).
- **Trazabilidad.** Cada commit cita el ID de la tarea, por ejemplo `[HU26-BE]` o `[TEC-02]`. Cada integrante escribe las pruebas unitarias de lo que hace.
- **Definición de Hecho:** `npm run lint`, `npm test` (escenario feliz y alterno) y `npm run build` en verde antes de pasar a QA (ver `AGENTS.md`).

## Sprint 1 — Cuentas, perfil, proyectos, exploración y postulación

**Fechas:** 9 al 18 de noviembre de 2026 · **24 historias · 73 SP** · Estado en el xlsx: **Terminado**

**Objetivo:** un usuario puede crear su cuenta y su perfil, publicar y gestionar proyectos, encontrarlos mediante búsqueda y filtros, y postular a un rol.

> **Pendiente de confirmar.** El xlsx marca todo el Sprint 1 como terminado, pero este repositorio (solo frontend) contiene las pantallas de HU1 a HU10. No hay proyectos, catálogo, búsqueda, filtros ni postulaciones (HU11–HU24). Si ese trabajo no existe en otra rama, el frontend pendiente está en el [Anexo A](#anexo-a-frontend-pendiente-del-sprint-1).

| HU | Historia | SP | Tarea BE | Tarea FE | Frontend en este repo |
|---|---|---|---|---|---|
| HU1 | Registro de Usuario | 5 | Endpoint de registro, correo único, hash de contraseña y token de activación | Formulario con validaciones en tiempo real | Sí |
| HU2 | Verificación de Correo Electrónico | 2 | Validación del token de activación y activación de la cuenta | Pantalla de confirmación | Sí |
| HU3 | Inicio de Sesión Seguro | 3 | Validación de credenciales y token de sesión | Formulario de inicio de sesión con manejo de errores | Sí |
| HU4 | Recuperación de Contraseña | 3 | Token temporal con expiración y envío de correo | Pantallas de solicitud y de nueva contraseña | Sí |
| HU5 | Cierre de Sesión Seguro | 1 | Invalidación del token | Opción en el menú de perfil y redirección | Sí |
| HU6 | Edición de Información Personal y Foto | 3 | Subida y validación de imagen, actualización del perfil | Formulario con previsualización de foto | Sí |
| HU7 | Configuración de Habilidades e Intereses | 3 | Asociación de habilidades e intereses al perfil | Selector múltiple con límites | Parcial (faltan categorías de interés) |
| HU8 | Configuración de Disponibilidad Horaria | 2 | Registro de la disponibilidad en el perfil | Selector de horas semanales | Sí |
| HU9 | Enlace de Portafolio y Redes Profesionales | 2 | Validación de formato de URL | Campos de enlaces en el perfil | Sí |
| HU10 | Vista Pública del Perfil de Usuario | 3 | Endpoint que filtra datos privados | Maquetación del perfil público | Sí |
| HU11 | Creación y Publicación de Ideas | 5 | Registro del proyecto con estado inicial «Abierto» | Formulario extenso con campos obligatorios | No |
| HU12 | Definición de Roles Requeridos y Vacantes | 3 | Relación proyecto–roles y habilidades por rol | Formulario dinámico para agregar y quitar roles | No |
| HU13 | Edición de Detalles del Proyecto | 3 | Actualización con control de propietario (403) | Reutilización del formulario de creación | No |
| HU14 | Cambio de Estado del Proyecto | 3 | Máquina de estados con transiciones válidas | Selector de estado | No |
| HU15 | Cancelación / Archivado de Proyectos | 2 | Transición a «Cancelado» y archivado con validación de propietario | Acción con confirmación | No |
| HU16 | Catálogo General de Proyectos Abiertos | 5 | Consulta paginada de proyectos abiertos | Tarjetas, paginación y estados de carga | No |
| HU17 | Vista Detallada del Proyecto | 3 | Objeto con proyecto, creador y roles disponibles | Página de detalle | No |
| HU18 | Búsqueda de Proyectos por Palabras Clave | 3 | Búsqueda por coincidencia en título y descripción | Buscador y estado «sin resultados» | No |
| HU19 | Filtro por Categorías y Habilidades Requeridas | 5 | Consultas dinámicas con JOIN entre proyectos, categorías y habilidades | Filtros combinables y botón «Limpiar filtros» | No |
| HU20 | Ordenamiento de Resultados de Búsqueda | 2 | Parámetro de ordenamiento en la consulta | Selector de orden | No |
| HU21 | Enviar Postulación a un Rol Específico | 5 | Validación de estado y vacantes, registro de la postulación | Modal de postulación con nota de presentación | No |
| HU22 | Restricción de Múltiples Postulaciones | 2 | Restricción de unicidad | Deshabilitar el botón si ya postuló | No |
| HU23 | Cancelación de Postulación Enviada | 2 | Cambio a «Cancelada» si sigue pendiente | Acción en «Mis postulaciones» | No |
| HU24 | Panel 'Mis Postulaciones' (Colaborador) | 3 | Consulta de postulaciones del usuario | Tabla de estados con estado vacío | No |

## Sprint 2 — Equipo, notificaciones, chat, administración e integraciones

**Fechas:** 19 al 29 de noviembre de 2026 · **19 historias · 72 SP** · Estado en el xlsx: **En proceso**

**Objetivo:** el creador puede gestionar las postulaciones y su equipo, el equipo puede comunicarse y recibir notificaciones, el usuario puede vincular herramientas externas y el administrador puede gestionar categorías y moderar contenido.

| ID | Tarea | Tipo | Responsable | Pts | Estado |
|---|---|---|---|---|---|
| **HU25** | **Visualización de Postulaciones Recibidas (Creador)** (5 SP) | | | | |
| HU25-BE | Consulta de postulantes por rol con validación de propietario | BE | Dev 3 | 2.5 | Pendiente |
| HU25-FE | Vista agrupada por rol: tarjetas de candidatos con portafolios y notas | FE | Dev 5 | 2.5 | Pendiente |
| **HU26** | **Aceptación de Candidato para el Equipo** (5 SP) | | | | |
| HU26-BE | Transacción: pasa a Aceptada, resta 1 vacante y agrega al equipo | BE | Dev 3 | 2.5 | Pendiente |
| HU26-FE | Acción «Aceptar Candidato» | FE | Dev 5 | 2.5 | Pendiente |
| **HU27** | **Rechazo de Candidato con Notificación** (3 SP) | | | | |
| HU27-BE | Cambio de la postulación pendiente a Rechazada | BE | Dev 3 | 1.5 | Pendiente |
| HU27-FE | Acción «Rechazar Candidato» | FE | Dev 5 | 1.5 | Pendiente |
| **HU28** | **Visualización del Equipo del Proyecto** (2 SP) | | | | |
| HU28-BE | Consulta de integrantes del proyecto | BE | Dev 3 | 1 | Pendiente |
| HU28-FE | Pestaña «Equipo»: grilla de integrantes y roles | FE | Dev 5 | 1 | Pendiente |
| **HU29** | **Salida Voluntaria del Equipo** (2 SP) | | | | |
| HU29-BE | Retiro del integrante (estado Retirado) y liberación de la vacante | BE | Dev 3 | 1 | Pendiente |
| HU29-FE | Acción «Abandonar Equipo» con confirmación | FE | Dev 5 | 1 | Pendiente |
| **HU30** | **Remoción de Integrante por el Creador** (3 SP) | | | | |
| HU30-BE | Remoción con validación de propietario, liberación de vacante y notificación | BE | Dev 3 | 1.5 | Pendiente |
| HU30-FE | Acción «Remover Integrante» con motivo y confirmación, en la vista del equipo | FE | Dev 5 | 1.5 | Pendiente |
| **HU31** | **Notificaciones In-App por Nueva Postulación (Creador)** (3 SP) | | | | |
| HU31-BE | Evento al crear una postulación y registro de la notificación | BE | Dev 3 | 1.5 | Pendiente |
| HU31-FE | Alerta en la campana | FE | Dev 7 | 1.5 | Pendiente |
| **HU32** | **Notificaciones In-App de Estado de Postulación** (3 SP) | | | | |
| HU32-BE | Evento al cambiar el estado de la postulación | BE | Dev 3 | 1.5 | Pendiente |
| HU32-FE | Alerta en la campana con indicador rojo | FE | Dev 7 | 1.5 | Pendiente |
| **HU33** | **Notificaciones por Correo Electrónico** (3 SP) | | | | |
| HU33-BE | Envío de correos ante eventos clave del proyecto | BE | Dev 3 | 1.5 | Pendiente |
| HU33-FE | Preferencias de notificación por correo | FE | Dev 4 | 1.5 | Pendiente |
| **HU34** | **Centro de Control de Notificaciones** (3 SP) | | | | |
| HU34-BE | Listado de notificaciones y marcado como leídas | BE | Dev 3 | 1.5 | Pendiente |
| HU34-FE | Panel de notificaciones y contador | FE | Dev 7 | 1.5 | Pendiente |
| **HU35** | **Chat Grupal del Proyecto (Solo Aceptados)** (8 SP) | | | | |
| HU35-BE | Mensajería en tiempo real (Supabase Realtime) y persistencia | BE | Dev 3 | 4 | Pendiente |
| HU35-FE | Sala de chat con scroll y estado de conexión | FE | Dev 7 | 4 | Pendiente |
| **HU36** | **Control de Acceso y Seguridad al Chat** (3 SP) | | | | |
| HU36-BE | Validación de pertenencia al equipo en cada petición (403) | BE | Dev 3 | 1.5 | Pendiente |
| HU36-FE | Bloqueo de acceso para no integrantes | FE | Dev 7 | 1.5 | Pendiente |
| **HU37** | **Envíos de Archivos y Adjuntos en Chat** (5 SP) | | | | |
| HU37-BE | Carga de archivos a Storage con validación de tipo y tamaño | BE | Dev 3 | 2.5 | Pendiente |
| HU37-FE | Adjuntar y descargar archivos en el chat | FE | Dev 7 | 2.5 | Pendiente |
| **HU38** | **Gestión de Categorías del Sistema** (3 SP) | | | | |
| HU38-BE | Creación, edición e inactivación de categorías por el administrador | BE | Dev 3 | 1.5 | Pendiente |
| HU38-FE | Panel de categorías | FE | Dev 6 | 1.5 | Pendiente |
| **HU39** | **Reporte de Proyectos e Ideas Inapropiadas** (2 SP) | | | | |
| HU39-BE | Registro del reporte con motivo | BE | Dev 3 | 1 | Pendiente |
| HU39-FE | Botón y formulario de reporte | FE | Dev 6 | 1 | Pendiente |
| **HU40** | **Panel de Moderación para Administradores** (5 SP) | | | | |
| HU40-BE | Listado de reportes y acciones de ocultar o suspender contenido | BE | Dev 3 | 2.5 | Pendiente |
| HU40-FE | Panel de moderación (ruta /admin/reports) | FE | Dev 4 | 2.5 | Pendiente |
| **HU41** | **Actualización del Perfil con Contribuciones** (3 SP) | | | | |
| HU41-BE | Consulta de contribuciones validadas del colaborador | BE | Dev 3 | 1.5 | Pendiente |
| HU41-FE | Sección de contribuciones en el perfil | FE | Dev 5 | 1.5 | Pendiente |
| **HU42** | **Vinculación de Herramientas Externas al Proyecto** (3 SP) | | | | |
| HU42-BE | Validación de URLs de GitHub, Figma y Trello | BE | Dev 3 | 1.5 | Pendiente |
| HU42-FE | Sección de herramientas vinculadas en el proyecto, con el ícono de cada plataforma | FE | Dev 5 | 1.5 | Pendiente |
| **HU43** | **Asociación de Contribuciones Externas** (8 SP) | | | | |
| HU43-BE | Recepción de eventos externos (webhooks) y asociación por correo del colaborador | BE | Dev 3 | 4 | Pendiente |
| HU43-FE | Registro de contribuciones pendientes de validación | FE | Dev 4 | 4 | Pendiente |
| **TEC / QA** | **Correo, deploy y tests** (propuestas, no están en el xlsx) | | | | |
| TEC-01 | Servicio de correo: proveedor, plantillas HTML, reintentos y registro de auditoría (lo necesita HU33) | Backend | Dev 3 | 1.5 | Pendiente |
| TEC-02 | Despliegue en producción y variables de entorno del MVP | Deploy | Dev 4 | 2.5 | Pendiente |
| TEC-03 | Pipeline de despliegue (CI/CD) y entorno de pruebas (staging) | Deploy | Dev 4 | 1.5 | Pendiente |
| QA-F | Pruebas de aceptación de HU38–HU39 (son de Integrante 6, así que las valida otra persona) | Tests | Dev 4 | 0.5 | Pendiente |
| QA-A | Pruebas de aceptación de HU25–HU30 (escenario feliz y alterno) | Tests | Dev 6 | 2 | Pendiente |
| QA-B | Pruebas de aceptación de HU31–HU34 | Tests | Dev 6 | 1.5 | Pendiente |
| QA-C | Pruebas de aceptación de HU35–HU37 | Tests | Dev 6 | 1.5 | Pendiente |
| QA-D | Pruebas de aceptación de HU40 | Tests | Dev 6 | 0.5 | Pendiente |
| QA-E | Pruebas de aceptación de HU41–HU43 | Tests | Dev 6 | 1.5 | Pendiente |
| TEST-API | Pruebas del backend: permisos (403), transacción de aceptación, acceso al chat y webhooks | Tests | Dev 6 | 2 | Pendiente |
| QA-E2E | Prueba de punta a punta: registro → publicar → postular → aceptar → chat | Tests | Dev 6 | 2 | Pendiente |

**Total de puntos repartidos:** 89 (72 SP de historias + 17 de correo, deploy y tests).

## Orden de trabajo y recortes

1. **Días 1 y 2:** Dev 3 y Dev 5 con HU25–HU28 (postulaciones y equipo). Dev 4 arma el pipeline de despliegue y el entorno de pruebas (TEC-03). Dev 3 empieza el servicio de correo (TEC-01).
2. **Días 3 y 4:** HU29–HU30 (salida y remoción), HU31–HU34 (notificaciones) y HU35–HU36 (chat y acceso). Dev 6 prueba HU25–HU30 (QA-A).
3. **Días 5 y 6:** HU37 (archivos en el chat), HU38–HU40 (administración y moderación), HU41–HU42 y las pruebas QA-B a QA-D y QA-F.
4. **Día 7:** HU43 (integraciones), pruebas del backend (TEST-API), prueba de punta a punta (QA-E2E) y despliegue a producción (TEC-02).

**Si falta tiempo**, orden sugerido para recortar: HU43, HU41, HU42, HU37 y HU33 (las de menor prioridad en el backlog). Es una recomendación; el equipo decide.

## Anexo A. Frontend pendiente del Sprint 1

Solo aplica si se confirma que las pantallas de HU11–HU24 no existen. Propuesta entre los cuatro frontends (entre 5 y 6.5 puntos cada uno). Son pantallas; su backend hay que confirmarlo aparte. No está sumada en las cargas de arriba.

| HU | Historia | Tarea de frontend | Pts | Propuesto |
|---|---|---|---|---|
| HU11 | Creación y Publicación de Ideas | Formulario extenso con campos obligatorios | 2.5 | Dev 6 |
| HU12 | Definición de Roles Requeridos y Vacantes | Formulario dinámico para agregar y quitar roles | 1.5 | Dev 6 |
| HU13 | Edición de Detalles del Proyecto | Reutilización del formulario de creación | 1.5 | Dev 6 |
| HU15 | Cancelación / Archivado de Proyectos | Acción con confirmación | 1 | Dev 6 |
| HU14 | Cambio de Estado del Proyecto | Selector de estado | 1.5 | Dev 4 |
| HU16 | Catálogo General de Proyectos Abiertos | Tarjetas, paginación y estados de carga | 2.5 | Dev 4 |
| HU17 | Vista Detallada del Proyecto | Página de detalle | 1.5 | Dev 4 |
| HU21 | Enviar Postulación a un Rol Específico | Modal de postulación con nota de presentación | 2.5 | Dev 5 |
| HU22 | Restricción de Múltiples Postulaciones | Deshabilitar el botón si ya postuló | 1 | Dev 5 |
| HU23 | Cancelación de Postulación Enviada | Acción en «Mis postulaciones» | 1 | Dev 5 |
| HU24 | Panel 'Mis Postulaciones' (Colaborador) | Tabla de estados con estado vacío | 1.5 | Dev 5 |
| HU18 | Búsqueda de Proyectos por Palabras Clave | Buscador y estado «sin resultados» | 1.5 | Dev 7 |
| HU19 | Filtro por Categorías y Habilidades Requeridas | Filtros combinables y botón «Limpiar filtros» | 2.5 | Dev 7 |
| HU20 | Ordenamiento de Resultados de Búsqueda | Selector de orden | 1 | Dev 7 |

Además, a HU7 le falta elegir categorías de interés en el perfil (hoy solo se eligen habilidades).

## Equivalencia con la numeración anterior

El commit `84d22e0` (perfil del colaborador) usó un backlog anterior. Sus historias corresponden a:

| Anterior | Actual |
|---|---|
| HU06 Información personal y foto | HU06 |
| HU07 Habilidades | HU07 |
| HU08 Enlaces de portafolio | HU09 |
| HU09 Disponibilidad semanal | HU08 |
| HU10 Vista pública del perfil | HU10 |
