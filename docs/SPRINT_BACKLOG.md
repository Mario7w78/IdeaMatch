# IdeaMatch — Sprint Backlog (reestructurado)

3 sprints de 1 semana (9 al 29 de noviembre de 2026). Sin servicio de correo.
Estimación en Story Points por historia y en horas por tarea.

## Sprint 1 — Acceso y base técnica

**Objetivo:** Base técnica del proyecto y acceso: registro, inicio y cierre de sesión. Frontend terminado; las tareas de backend pasan al Sprint 2.

| ID | Tarea | Tipo | h | Estado |
|---|---|---|---|---|
| **TEC** | **Tareas técnicas** | | | |
| S1-T01 | Estructura del repositorio IdeaMatch (frontend/backend), README y convención de ramas | DevOps | 3 | Terminado |
| S1-T02 | Pipeline CI (lint + tests) en GitHub Actions | DevOps | 3 | Terminado |
| S1-T03 | Design system base: colores, tipografía, botones, inputs, tarjetas (según pantallas) | Diseño | 6 | Terminado |
| S1-T04 | Layout de autenticación (panel morado + formulario) y layout de la app (barra lateral + barra superior) | Frontend | 6 | Terminado |
| S1-T05 | Landing pública (hero, 'Todo empieza con una conexión', 'Ideas que ya despegaron', CTA, footer) | Frontend | 6 | Terminado |
| **HU01** | **Registro de Usuario por Rol** (5 SP) | | | |
| S1-T06 | Pantalla 'Crea tu cuenta' (nombre, apellido, correo, contraseña, confirmación, términos) | Frontend | 6 | Terminado |
| S1-T07 | Medidor de fortaleza de contraseña y mensajes de error en línea | Frontend | 2 | Terminado |
| **HU03** | **Inicio de Sesión Seguro** (5 SP) | | | |
| S1-T08 | Pantalla 'Inicia sesión' (correo, contraseña con mostrar/ocultar) | Frontend | 4 | Terminado |
| S1-T09 | Guardas de rutas privadas y redirección al Inicio tras login | Frontend | 2 | Terminado |
| **HU05** | **Cierre de Sesión Seguro** (2 SP) | | | |
| S1-T10 | Acción 'Salir' en el menú del usuario de la barra lateral y limpieza del estado | Frontend | 2 | Terminado |

**Total:** 12 SP · 40 h

## Sprint 2 — Perfil, publicación y exploración

**Objetivo:** Que un usuario arme su perfil, publique un proyecto con roles y que otros lo encuentren en Inicio/Explorar y vean su detalle. Incluye el backend de acceso pendiente del Sprint 1.

| ID | Tarea | Tipo | h | Estado |
|---|---|---|---|---|
| **TEC** | **Arrastre del Sprint 1 (backend)** | | | |
| S2-T01 | Configurar base de datos relacional y herramienta de migraciones (RNF33) | BD | 3 | Pendiente |
| **HU01** | **Registro de Usuario por Rol (backend, arrastre S1)** | | | |
| S2-T02 | Modelo Usuario (id único, nombre, apellido, correo único, hash, fecha de alta) y migración | BD | 3 | Pendiente |
| S2-T03 | Endpoint POST /auth/register con validaciones (correo único/formato, contraseña ≥ 8) | Backend | 4 | Pendiente |
| S2-T04 | Hash de contraseña con bcrypt/argon2 (RNF32) | Backend | 1 | Pendiente |
| S2-T05 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU03** | **Inicio de Sesión Seguro (backend, arrastre S1)** | | | |
| S2-T06 | Endpoint POST /auth/login con emisión de JWT / sesión | Backend | 4 | Pendiente |
| S2-T07 | Middleware de autenticación y autorización por rol en el proyecto (RF6) | Backend | 4 | Pendiente |
| S2-T08 | Mensaje genérico 'Credenciales inválidas' sin revelar qué dato falló | Backend | 1 | Pendiente |
| S2-T09 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU05** | **Cierre de Sesión Seguro (backend, arrastre S1)** | | | |
| S2-T10 | Endpoint POST /auth/logout con invalidación del token/sesión | Backend | 2 | Pendiente |
| S2-T11 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU06** | **Edición de Información Personal y Foto** (5 SP) | | | |
| S2-T12 | Modelo Perfil (bio, ocupación, ciudad, foto) vinculado 1:1 a Usuario | BD | 2 | Pendiente |
| S2-T13 | Endpoints GET/PUT /me/profile | Backend | 3 | Pendiente |
| S2-T14 | Carga de foto JPG/PNG < 2 MB a almacenamiento de archivos | Backend | 3 | Pendiente |
| S2-T15 | Pantalla 'Mi perfil' (banner, avatar, Sobre mí) y formulario 'Editar perfil' | Frontend | 6 | Pendiente |
| S2-T16 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU07** | **Configuración de Habilidades e Intereses** (5 SP) | | | |
| S2-T17 | Catálogo de habilidades y categorías + tablas usuario_habilidad / usuario_interes (seed inicial) | BD | 3 | Pendiente |
| S2-T18 | Endpoints GET /skills y PUT /me/skills (validar 1–15) | Backend | 3 | Pendiente |
| S2-T19 | Selector de habilidades con chips y buscador | Frontend | 4 | Pendiente |
| S2-T20 | Sección 'Habilidades' en el perfil | Frontend | 1 | Pendiente |
| S2-T21 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU08** | **Enlace de Portafolio y Redes Profesionales** (2 SP) | | | |
| S2-T22 | Campos de enlaces (Portafolio, LinkedIn, GitHub) con validación http/https | Backend | 2 | Pendiente |
| S2-T23 | Formulario de enlaces y bloque 'Enlaces' en el perfil | Frontend | 3 | Pendiente |
| S2-T24 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU09** | **Configuración de Disponibilidad Horaria** (2 SP) | | | |
| S2-T25 | Campo de disponibilidad semanal con validación 1–80 h | Backend | 1 | Pendiente |
| S2-T26 | Control de disponibilidad y tarjeta 'Disponibilidad' en el perfil | Frontend | 2 | Pendiente |
| S2-T27 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU11** | **Creación y Publicación de Ideas** (5 SP) | | | |
| S2-T28 | Modelo Proyecto (nombre, resumen, descripción, categoría, modalidad, estado, creador) | BD | 3 | Pendiente |
| S2-T29 | Endpoints POST /projects (borrador) y POST /projects/:id/publish | Backend | 4 | Pendiente |
| S2-T30 | Asistente 'Nuevo proyecto' – Paso 1 'La idea' con contadores 0/60 y 0/140 | Frontend | 6 | Pendiente |
| S2-T31 | Guardado de borrador ('Borrador guardado') y validación de campos obligatorios | Frontend | 3 | Pendiente |
| S2-T32 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU12** | **Definición de Roles Requeridos y Vacantes** (5 SP) | | | |
| S2-T33 | Modelos Rol (nombre, vacantes, dedicación, descripción) y rol_habilidad | BD | 2 | Pendiente |
| S2-T34 | Endpoints CRUD /projects/:id/roles (vacantes ≥ 1) | Backend | 4 | Pendiente |
| S2-T35 | Paso 2 'Roles y vacantes': tarjetas de rol, contador de vacantes, chips de habilidades, resumen 'N roles · N vacantes' | Frontend | 6 | Pendiente |
| S2-T36 | Paso 3 'Vista previa' y botón Publicar | Frontend | 3 | Pendiente |
| S2-T37 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU14** | **Cambio de Estado del Proyecto (Abierto / En Curso / Cerrado)** (3 SP) | | | |
| S2-T38 | Máquina de estados Abierto → En curso → Pausado/Cerrado con transiciones válidas | Backend | 3 | Pendiente |
| S2-T39 | Bloquear nuevas postulaciones si el estado ≠ Abierto | Backend | 1 | Pendiente |
| S2-T40 | Selector de estado con confirmación y etiqueta de estado | Frontend | 2 | Pendiente |
| S2-T41 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU16** | **Catálogo General de Proyectos Abiertos** (5 SP) | | | |
| S2-T42 | Endpoint GET /projects paginado (10 por página, solo Abiertos) | Backend | 3 | Pendiente |
| S2-T43 | Componente tarjeta de proyecto (portada degradada, categoría, habilidades, avatares, 'Ver proyecto') | Frontend | 4 | Pendiente |
| S2-T44 | Pantalla 'Explora proyectos' en cuadrícula con paginación y contador de proyectos abiertos | Frontend | 4 | Pendiente |
| S2-T45 | Pantalla 'Inicio' (hero 'Tu próxima gran idea merece despegar' + 'Proyectos listos para despegar') | Frontend | 4 | Pendiente |
| S2-T46 | Estado vacío 'No se encontraron proyectos activos' | Frontend | 1 | Pendiente |
| S2-T47 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU20** | **Vista Detallada del Proyecto** (5 SP) | | | |
| S2-T48 | Endpoint GET /projects/:id (creador, miembros, roles con vacantes disponibles) | Backend | 3 | Pendiente |
| S2-T49 | Pantalla de detalle del proyecto con roles y botón 'Postular' por rol | Frontend | 6 | Pendiente |
| S2-T50 | Página 404 'El proyecto no existe o fue eliminado' | Frontend | 1 | Pendiente |
| S2-T51 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |

**Total:** 37 SP · 142 h

## Sprint 3 — Postulaciones, equipo y mensajería

**Objetivo:** Cerrar el flujo principal: editar proyectos, buscar y filtrar, postular, aceptar o rechazar candidatos, formar el equipo y coordinarse en el chat del proyecto. Pruebas finales y despliegue.

| ID | Tarea | Tipo | h | Estado |
|---|---|---|---|---|
| **HU10** | **Vista Pública del Perfil de Usuario** (3 SP) | | | |
| S3-T01 | Endpoint GET /users/:id/public con DTO que oculta correo, teléfono y contraseña | Backend | 3 | Pendiente |
| S3-T02 | Vista pública del perfil reutilizando componentes de 'Mi perfil' (sin Editar) | Frontend | 3 | Pendiente |
| S3-T03 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU13** | **Edición de Detalles del Proyecto** (3 SP) | | | |
| S3-T04 | Endpoint PUT /projects/:id con verificación de propietario (403) | Backend | 3 | Pendiente |
| S3-T05 | Sección 'Mis proyectos' con listado y acceso a edición (reutiliza el asistente) | Frontend | 5 | Pendiente |
| S3-T06 | Indicador de roles cubiertos / pendientes | Frontend | 2 | Pendiente |
| S3-T07 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU17** | **Búsqueda de Proyectos por Palabras Clave** (3 SP) | | | |
| S3-T08 | Índices de búsqueda de texto en título y descripción | BD | 2 | Pendiente |
| S3-T09 | Parámetro ?q= en GET /projects | Backend | 2 | Pendiente |
| S3-T10 | Buscador por palabra clave y buscador global de la barra superior | Frontend | 3 | Pendiente |
| S3-T11 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU18** | **Filtro por Categorías y Habilidades Requeridas** (5 SP) | | | |
| S3-T12 | Filtros por categoría, habilidades, disponibilidad y estado con conteos por categoría | Backend | 4 | Pendiente |
| S3-T13 | Panel 'Filtros' (checkboxes con conteo, chips 5–10 h / 10–20 h) y dropdowns 'Todas las categorías' / 'Habilidades' | Frontend | 5 | Pendiente |
| S3-T14 | Estado sin resultados con botón 'Limpiar filtros' | Frontend | 1 | Pendiente |
| S3-T15 | Prueba de rendimiento: búsqueda + filtros < 1 s (RNF34) | QA | 3 | Pendiente |
| S3-T16 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU21** | **Enviar Postulación a un Rol Específico** (5 SP) | | | |
| S3-T17 | Modelo Postulación (colaborador, rol, nota, fecha, estado) | BD | 2 | Pendiente |
| S3-T18 | Endpoint POST /roles/:id/applications (proyecto Abierto, vacantes > 0) | Backend | 3 | Pendiente |
| S3-T19 | Modal 'Postular' con nota de presentación usando datos del perfil | Frontend | 4 | Pendiente |
| S3-T20 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU22** | **Restricción de Múltiples Postulaciones** (2 SP) | | | |
| S3-T21 | Restricción única (colaborador, proyecto) | BD | 1 | Pendiente |
| S3-T22 | Validación de postulación duplicada en servidor | Backend | 1 | Pendiente |
| S3-T23 | Deshabilitar 'Postular' si ya existe postulación | Frontend | 1 | Pendiente |
| S3-T24 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU24** | **Visualización de Postulaciones Recibidas (Creador)** (5 SP) | | | |
| S3-T25 | Endpoint GET /projects/:id/applications agrupado por rol (solo creador, 403) | Backend | 3 | Pendiente |
| S3-T26 | Cálculo de % de compatibilidad (habilidades del rol vs. del postulante) | Backend | 3 | Pendiente |
| S3-T27 | Pantalla 'Postulantes': selector de proyecto, buscador, chips por rol, orden 'Mayor compatibilidad' | Frontend | 5 | Pendiente |
| S3-T28 | Tarjeta de postulante (match %, proyectos, h/semana, habilidades, nota, Portafolio/LinkedIn, Ver perfil) y paginación | Frontend | 4 | Pendiente |
| S3-T29 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU25** | **Aceptación de Candidato para el Equipo** (3 SP) | | | |
| S3-T30 | Endpoint POST /applications/:id/accept transaccional (−1 vacante, alta en equipo) | Backend | 4 | Pendiente |
| S3-T31 | Botón ✓ con confirmación y alerta 'No quedan vacantes' | Frontend | 2 | Pendiente |
| S3-T32 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU26** | **Rechazo de Candidato con Notificación** (2 SP) | | | |
| S3-T33 | Endpoint POST /applications/:id/reject (solo Pendiente) | Backend | 2 | Pendiente |
| S3-T34 | Botón ✕ con confirmación | Frontend | 1 | Pendiente |
| S3-T35 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU27** | **Panel 'Mis Postulaciones' (Colaborador)** (3 SP) | | | |
| S3-T36 | Endpoint GET /me/applications con totales por estado | Backend | 2 | Pendiente |
| S3-T37 | Pantalla 'Mis postulaciones': tarjetas Enviadas / En revisión / Aceptada / Finalizadas y tabla con estado | Frontend | 5 | Pendiente |
| S3-T38 | Estado vacío 'No has enviado ninguna postulación' + 'Explorar proyectos' | Frontend | 1 | Pendiente |
| S3-T39 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU28** | **Visualización del Equipo del Proyecto** (3 SP) | | | |
| S3-T40 | Modelo MiembroEquipo (proyecto, usuario, rol, estado) | BD | 1 | Pendiente |
| S3-T41 | Endpoint GET /projects/:id/team (creador como 'Líder del proyecto') | Backend | 2 | Pendiente |
| S3-T42 | Pestaña 'Equipo' con avatar, nombre y rol de cada integrante | Frontend | 3 | Pendiente |
| S3-T43 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU31** | **Chat Grupal del Proyecto (Solo Aceptados)** (8 SP) | | | |
| S3-T44 | Modelos Conversación (1 por proyecto) y Mensaje | BD | 2 | Pendiente |
| S3-T45 | Mensajes casi en tiempo real (polling cada 5 s; WebSocket queda como mejora) | Backend | 3 | Pendiente |
| S3-T46 | Endpoints GET /conversations y GET /conversations/:id/messages (paginado) | Backend | 3 | Pendiente |
| S3-T47 | Pantalla 'Mensajes': lista de conversaciones con buscador y último mensaje | Frontend | 4 | Pendiente |
| S3-T48 | Vista de conversación (burbujas, hora, 'Visto', cabecera con integrantes y 'Ver proyecto') | Frontend | 6 | Pendiente |
| S3-T49 | Estados vacíos 'Sin conversaciones' / 'Todavía no tienes mensajes' | Frontend | 1 | Pendiente |
| S3-T50 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **HU32** | **Control de Acceso y Seguridad al Chat** (3 SP) | | | |
| S3-T51 | Autorización por membresía en REST y en el handshake del WebSocket (403) | Backend | 3 | Pendiente |
| S3-T52 | Redirección con aviso 'Ya no formas parte de este equipo' | Frontend | 1 | Pendiente |
| S3-T53 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 | Pendiente |
| **TEC** | **Cierre del proyecto** | | | |
| S3-T54 | Pruebas end-to-end de los flujos principales (registro → publicar → postular → aceptar → chat) | QA | 6 | Pendiente |
| S3-T55 | Despliegue en producción y variables de entorno | DevOps | 4 | Pendiente |
| S3-T56 | Manual de usuario y documentación de la API | Doc | 4 | Pendiente |

**Total:** 48 SP · 149 h

## Backlog futuro (fuera de estos 3 sprints)

| HU | Historia | SP | Motivo |
|---|---|---|---|
| HU02 | Verificación de Correo Electrónico | 3 | Requiere servicio de correo (no disponible) |
| HU04 | Recuperación de Contraseña | 3 | Requiere servicio de correo (no disponible) |
| HU15 | Cancelación / Archivado de Proyectos | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU19 | Ordenamiento de Resultados de Búsqueda | 2 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU23 | Cancelación de Postulación Enviada | 2 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU29 | Salida Voluntaria del Equipo | 2 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU30 | Remoción de Integrante por el Creador | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU33 | Envíos de Archivos y Adjuntos en Chat | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU34 | Notificaciones In-App de Estado de Postulación | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU35 | Notificaciones In-App por Nueva Postulación (Creador) | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU36 | Notificaciones por Correo Electrónico | 5 | Requiere servicio de correo (no disponible) |
| HU37 | Centro de Control de Notificaciones | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU38 | Reporte de Proyectos e Ideas Inapropiadas | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU39 | Panel de Moderación para Administradores | 5 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU40 | Gestión de Categorías del Sistema | 3 | Prioridad media/baja: fuera del alcance de 3 semanas |
| HU41 | Dashboard de Métricas e Indicadores de Uso | 5 | Prioridad media/baja: fuera del alcance de 3 semanas |
## Cambios de la reestructuración

- De 8 sprints de 2 semanas a 3 sprints de 1 semana. El Sprint 1 ya terminó en el frontend; su backend (registro, login, logout y la base de datos) pasa al Sprint 2.
- Sin servicio de correo: HU02 (verificación), HU04 (recuperación de contraseña) y HU36 (notificaciones por correo) quedan fuera; la cuenta queda activa al registrarse.
- Se priorizaron las historias 'deberá' (Must) que forman el flujo principal: perfil → publicar → explorar → postular → aceptar → equipo → chat.
- Quedan en el backlog futuro las historias 'debería' (notificaciones, reportes, administración) y las de menor prioridad (cancelar o archivar proyectos, ordenamiento, cancelar postulación, salir del equipo, remover integrantes, adjuntos).
- El chat usa polling cada 5 s en lugar de WebSocket para que quepa en la semana.
