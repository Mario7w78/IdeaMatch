# IdeaMatch — Sprint Backlog

Sprints de 2 semanas. Estimación en Story Points (Fibonacci) por historia y en horas por tarea.
Cada historia incluye una tarea de QA para validar sus dos criterios de aceptación.

## Sprint 1 — Acceso y base técnica

**Objetivo:** Dejar operativa la arquitectura del proyecto y permitir que un usuario se registre, verifique su correo, inicie y cierre sesión de forma segura.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **TEC** | **Tareas técnicas del sprint** | | |
| S1-T01 | Estructura del repositorio IdeaMatch (frontend/backend), README y convención de ramas | DevOps | 3 |
| S1-T02 | Pipeline CI (lint + tests) en GitHub Actions | DevOps | 3 |
| S1-T03 | Configurar base de datos relacional y herramienta de migraciones (RNF33) | BD | 3 |
| S1-T04 | Design system base: colores, tipografía, botones, inputs, tarjetas (según pantallas) | Diseño | 6 |
| S1-T05 | Layout de autenticación (panel morado + formulario) y layout de la app (barra lateral + barra superior) | Frontend | 6 |
| S1-T06 | Landing pública (hero, 'Todo empieza con una conexión', 'Ideas que ya despegaron', CTA, footer) | Frontend | 6 |
| **HU01** | **Registro de Usuario por Rol** (5 SP · Alta (Must)) | | |
| S1-T07 | Modelo Usuario (id único, nombre, apellido, correo único, hash, estado) y migración | BD | 3 |
| S1-T08 | Endpoint POST /auth/register con validaciones (correo único/formato, contraseña ≥ 8) | Backend | 4 |
| S1-T09 | Hash de contraseña con bcrypt/argon2 (RNF32) | Backend | 1 |
| S1-T10 | Pantalla 'Crea tu cuenta' (nombre, apellido, correo, contraseña, confirmación, términos) | Frontend | 6 |
| S1-T11 | Medidor de fortaleza de contraseña y mensajes de error en línea | Frontend | 2 |
| S1-T12 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU02** | **Verificación de Correo Electrónico** (3 SP · Alta (Must)) | | |
| S1-T13 | Generación de token de activación (24 h) y servicio de envío de correo | Backend | 4 |
| S1-T14 | Endpoint GET /auth/verify/:token y POST /auth/resend-verification | Backend | 3 |
| S1-T15 | Vistas 'Cuenta verificada' y 'Enlace inválido o expirado' con botón Reenviar | Frontend | 3 |
| S1-T16 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU03** | **Inicio de Sesión Seguro** (5 SP · Alta (Must)) | | |
| S1-T17 | Endpoint POST /auth/login con emisión de JWT / sesión | Backend | 4 |
| S1-T18 | Middleware de autenticación y autorización por rol en el proyecto (RF6) | Backend | 4 |
| S1-T19 | Pantalla 'Inicia sesión' (correo, contraseña con mostrar/ocultar) | Frontend | 4 |
| S1-T20 | Guardas de rutas privadas y redirección al Inicio tras login | Frontend | 2 |
| S1-T21 | Mensaje genérico 'Credenciales inválidas' y bloqueo para cuentas no verificadas | Backend | 1 |
| S1-T22 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU04** | **Recuperación de Contraseña** (3 SP · Alta (Must)) | | |
| S1-T23 | Endpoint POST /auth/forgot-password (token 1 h, respuesta genérica) | Backend | 3 |
| S1-T24 | Endpoint POST /auth/reset-password con invalidación del token | Backend | 2 |
| S1-T25 | Vistas '¿Olvidaste tu contraseña?' y 'Nueva contraseña' | Frontend | 4 |
| S1-T26 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU05** | **Cierre de Sesión Seguro** (2 SP · Alta (Must)) | | |
| S1-T27 | Endpoint POST /auth/logout con invalidación del token/sesión | Backend | 2 |
| S1-T28 | Acción 'Salir' en el menú del usuario de la barra lateral y limpieza del estado | Frontend | 2 |
| S1-T29 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 18 SP · 91 h

## Sprint 2 — Perfil del colaborador

**Objetivo:** Que cada usuario pueda construir su perfil profesional (datos, foto, habilidades, enlaces y disponibilidad) y mostrarlo públicamente.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU06** | **Edición de Información Personal y Foto** (5 SP · Alta (Must)) | | |
| S2-T01 | Modelo Perfil (bio, ocupación, ciudad, foto) vinculado 1:1 a Usuario | BD | 2 |
| S2-T02 | Endpoints GET/PUT /me/profile | Backend | 3 |
| S2-T03 | Carga de foto JPG/PNG < 2 MB a almacenamiento de archivos | Backend | 3 |
| S2-T04 | Pantalla 'Mi perfil' (banner, avatar, Sobre mí) y formulario 'Editar perfil' | Frontend | 6 |
| S2-T05 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU07** | **Configuración de Habilidades e Intereses** (5 SP · Alta (Must)) | | |
| S2-T06 | Catálogo de habilidades y categorías + tablas usuario_habilidad / usuario_interes (seed inicial) | BD | 3 |
| S2-T07 | Endpoints GET /skills y PUT /me/skills (validar 1–15) | Backend | 3 |
| S2-T08 | Selector de habilidades con chips y buscador | Frontend | 4 |
| S2-T09 | Sección 'Habilidades' en el perfil | Frontend | 1 |
| S2-T10 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU08** | **Enlace de Portafolio y Redes Profesionales** (2 SP · Alta (Must)) | | |
| S2-T11 | Campos de enlaces (Portafolio, LinkedIn, GitHub) con validación http/https | Backend | 2 |
| S2-T12 | Formulario de enlaces y bloque 'Enlaces' en el perfil | Frontend | 3 |
| S2-T13 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU09** | **Configuración de Disponibilidad Horaria** (2 SP · Alta (Must)) | | |
| S2-T14 | Campo de disponibilidad semanal con validación 1–80 h | Backend | 1 |
| S2-T15 | Control de disponibilidad y tarjeta 'Disponibilidad' en el perfil | Frontend | 2 |
| S2-T16 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU10** | **Vista Pública del Perfil de Usuario** (3 SP · Alta (Must)) | | |
| S2-T17 | Endpoint GET /users/:id/public con DTO que oculta correo, teléfono y contraseña | Backend | 3 |
| S2-T18 | Vista pública del perfil reutilizando componentes de 'Mi perfil' (sin Editar) | Frontend | 3 |
| S2-T19 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 17 SP · 49 h

## Sprint 3 — Publicación y gestión de proyectos

**Objetivo:** Que un creador publique su idea en el asistente de 3 pasos, defina roles y vacantes, y gestione el ciclo de vida del proyecto.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU11** | **Creación y Publicación de Ideas** (5 SP · Alta (Must)) | | |
| S3-T01 | Modelo Proyecto (nombre, resumen, descripción, categoría, modalidad, estado, creador) | BD | 3 |
| S3-T02 | Endpoints POST /projects (borrador) y POST /projects/:id/publish | Backend | 4 |
| S3-T03 | Asistente 'Nuevo proyecto' – Paso 1 'La idea' con contadores 0/60 y 0/140 | Frontend | 6 |
| S3-T04 | Guardado de borrador ('Borrador guardado') y validación de campos obligatorios | Frontend | 3 |
| S3-T05 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU12** | **Definición de Roles Requeridos y Vacantes** (5 SP · Alta (Must)) | | |
| S3-T06 | Modelos Rol (nombre, vacantes, dedicación, descripción) y rol_habilidad | BD | 2 |
| S3-T07 | Endpoints CRUD /projects/:id/roles (vacantes ≥ 1) | Backend | 4 |
| S3-T08 | Paso 2 'Roles y vacantes': tarjetas de rol, contador de vacantes, chips de habilidades, resumen 'N roles · N vacantes' | Frontend | 6 |
| S3-T09 | Paso 3 'Vista previa' y botón Publicar | Frontend | 3 |
| S3-T10 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU13** | **Edición de Detalles del Proyecto** (3 SP · Alta (Must)) | | |
| S3-T11 | Endpoint PUT /projects/:id con verificación de propietario (403) | Backend | 3 |
| S3-T12 | Sección 'Mis proyectos' con listado y acceso a edición (reutiliza el asistente) | Frontend | 5 |
| S3-T13 | Indicador de roles cubiertos / pendientes | Frontend | 2 |
| S3-T14 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU14** | **Cambio de Estado del Proyecto (Abierto / En Curso / Cerrado)** (3 SP · Alta (Must)) | | |
| S3-T15 | Máquina de estados Abierto → En curso → Pausado/Cerrado con transiciones válidas | Backend | 3 |
| S3-T16 | Bloquear nuevas postulaciones si el estado ≠ Abierto | Backend | 1 |
| S3-T17 | Selector de estado con confirmación y etiqueta de estado | Frontend | 2 |
| S3-T18 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU15** | **Cancelación / Archivado de Proyectos** (3 SP · Media (Should)) | | |
| S3-T19 | Endpoint POST /projects/:id/cancel (estado Cancelado, excluir de búsquedas) | Backend | 2 |
| S3-T20 | Marcar postulaciones pendientes para notificación (se envía en Sprint 7) | Backend | 1 |
| S3-T21 | Modal de confirmación 'Cancelar proyecto' | Frontend | 2 |
| S3-T22 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 19 SP · 62 h

## Sprint 4 — Exploración de proyectos

**Objetivo:** Que los colaboradores descubran proyectos desde Inicio y Explorar: catálogo, búsqueda, filtros (<1 s), ordenamiento y detalle.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU16** | **Catálogo General de Proyectos Abiertos** (5 SP · Alta (Must)) | | |
| S4-T01 | Endpoint GET /projects paginado (10 por página, solo Abiertos) | Backend | 3 |
| S4-T02 | Componente tarjeta de proyecto (portada degradada, categoría, habilidades, avatares, 'Ver proyecto') | Frontend | 4 |
| S4-T03 | Pantalla 'Explora proyectos' en cuadrícula con paginación y contador de proyectos abiertos | Frontend | 4 |
| S4-T04 | Pantalla 'Inicio' (hero 'Tu próxima gran idea merece despegar' + 'Proyectos listos para despegar') | Frontend | 4 |
| S4-T05 | Estado vacío 'No se encontraron proyectos activos' | Frontend | 1 |
| S4-T06 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU17** | **Búsqueda de Proyectos por Palabras Clave** (3 SP · Alta (Must)) | | |
| S4-T07 | Índices de búsqueda de texto en título y descripción | BD | 2 |
| S4-T08 | Parámetro ?q= en GET /projects | Backend | 2 |
| S4-T09 | Buscador por palabra clave y buscador global de la barra superior | Frontend | 3 |
| S4-T10 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU18** | **Filtro por Categorías y Habilidades Requeridas** (5 SP · Alta (Must)) | | |
| S4-T11 | Filtros por categoría, habilidades, disponibilidad y estado con conteos por categoría | Backend | 4 |
| S4-T12 | Panel 'Filtros' (checkboxes con conteo, chips 5–10 h / 10–20 h) y dropdowns 'Todas las categorías' / 'Habilidades' | Frontend | 5 |
| S4-T13 | Estado sin resultados con botón 'Limpiar filtros' | Frontend | 1 |
| S4-T14 | Prueba de rendimiento: búsqueda + filtros < 1 s (RNF34) | QA | 3 |
| S4-T15 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU19** | **Ordenamiento de Resultados de Búsqueda** (2 SP · Media (Should)) | | |
| S4-T16 | Parámetro ?sort=recent|popular | Backend | 2 |
| S4-T17 | Dropdown 'Más recientes' y manejo de error manteniendo la vista anterior | Frontend | 2 |
| S4-T18 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU20** | **Vista Detallada del Proyecto** (5 SP · Alta (Must)) | | |
| S4-T19 | Endpoint GET /projects/:id (creador, miembros, roles con vacantes disponibles) | Backend | 3 |
| S4-T20 | Pantalla de detalle del proyecto con roles y botón 'Postular' por rol | Frontend | 6 |
| S4-T21 | Página 404 'El proyecto no existe o fue eliminado' | Frontend | 1 |
| S4-T22 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **TEC** | **Tareas técnicas del sprint** | | |
| S4-T23 | Pruebas de regresión de los Sprints 1–3 | QA | 3 |

**Total:** 20 SP · 63 h

## Sprint 5 — Postulaciones

**Objetivo:** Cerrar el ciclo de postulación: el colaborador postula y hace seguimiento; el creador revisa, acepta o rechaza candidatos.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU21** | **Enviar Postulación a un Rol Específico** (5 SP · Alta (Must)) | | |
| S5-T01 | Modelo Postulación (colaborador, rol, nota, fecha, estado) | BD | 2 |
| S5-T02 | Endpoint POST /roles/:id/applications (proyecto Abierto, vacantes > 0) | Backend | 3 |
| S5-T03 | Modal 'Postular' con nota de presentación usando datos del perfil | Frontend | 4 |
| S5-T04 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU22** | **Restricción de Múltiples Postulaciones** (2 SP · Alta (Must)) | | |
| S5-T05 | Restricción única (colaborador, proyecto) | BD | 1 |
| S5-T06 | Validación de postulación duplicada en servidor | Backend | 1 |
| S5-T07 | Deshabilitar 'Postular' si ya existe postulación | Frontend | 1 |
| S5-T08 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU23** | **Cancelación de Postulación Enviada** (2 SP · Media (Should)) | | |
| S5-T09 | Endpoint POST /applications/:id/cancel (solo Pendiente) | Backend | 2 |
| S5-T10 | Acción 'Cancelar postulación' con confirmación en 'Ver detalle' | Frontend | 2 |
| S5-T11 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU24** | **Visualización de Postulaciones Recibidas (Creador)** (5 SP · Alta (Must)) | | |
| S5-T12 | Endpoint GET /projects/:id/applications agrupado por rol (solo creador, 403) | Backend | 3 |
| S5-T13 | Cálculo de % de compatibilidad (habilidades del rol vs. del postulante) | Backend | 3 |
| S5-T14 | Pantalla 'Postulantes': selector de proyecto, buscador, chips por rol, orden 'Mayor compatibilidad' | Frontend | 5 |
| S5-T15 | Tarjeta de postulante (match %, proyectos, h/semana, habilidades, nota, Portafolio/LinkedIn, Ver perfil) y paginación | Frontend | 4 |
| S5-T16 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU25** | **Aceptación de Candidato para el Equipo** (3 SP · Alta (Must)) | | |
| S5-T17 | Endpoint POST /applications/:id/accept transaccional (−1 vacante, alta en equipo) | Backend | 4 |
| S5-T18 | Botón ✓ con confirmación y alerta 'No quedan vacantes' | Frontend | 2 |
| S5-T19 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU26** | **Rechazo de Candidato con Notificación** (2 SP · Alta (Must)) | | |
| S5-T20 | Endpoint POST /applications/:id/reject (solo Pendiente) | Backend | 2 |
| S5-T21 | Botón ✕ con confirmación | Frontend | 1 |
| S5-T22 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU27** | **Panel 'Mis Postulaciones' (Colaborador)** (3 SP · Alta (Must)) | | |
| S5-T23 | Endpoint GET /me/applications con totales por estado | Backend | 2 |
| S5-T24 | Pantalla 'Mis postulaciones': tarjetas Enviadas / En revisión / Aceptada / Finalizadas y tabla con estado | Frontend | 5 |
| S5-T25 | Estado vacío 'No has enviado ninguna postulación' + 'Explorar proyectos' | Frontend | 1 |
| S5-T26 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 22 SP · 62 h

## Sprint 6 — Equipo y mensajería

**Objetivo:** Que los integrantes aceptados formen el equipo del proyecto y se coordinen en un chat privado con adjuntos.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU28** | **Visualización del Equipo del Proyecto** (3 SP · Alta (Must)) | | |
| S6-T01 | Modelo MiembroEquipo (proyecto, usuario, rol, estado) | BD | 1 |
| S6-T02 | Endpoint GET /projects/:id/team (creador como 'Líder del proyecto') | Backend | 2 |
| S6-T03 | Pestaña 'Equipo' con avatar, nombre y rol de cada integrante | Frontend | 3 |
| S6-T04 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU29** | **Salida Voluntaria del Equipo** (2 SP · Media (Should)) | | |
| S6-T05 | Endpoint POST /projects/:id/leave (libera vacante, revoca chat; creador no puede salir) | Backend | 2 |
| S6-T06 | Acción 'Abandonar equipo' con confirmación | Frontend | 1 |
| S6-T07 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU30** | **Remoción de Integrante por el Creador** (3 SP · Media (Should)) | | |
| S6-T08 | Endpoint DELETE /projects/:id/members/:uid con motivo (solo creador) | Backend | 2 |
| S6-T09 | Modal 'Remover integrante' con motivo | Frontend | 2 |
| S6-T10 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU31** | **Chat Grupal del Proyecto (Solo Aceptados)** (8 SP · Alta (Must)) | | |
| S6-T11 | Modelos Conversación (1 por proyecto) y Mensaje | BD | 2 |
| S6-T12 | Servidor WebSocket para mensajes en tiempo real | Backend | 6 |
| S6-T13 | Endpoints GET /conversations y GET /conversations/:id/messages (paginado) | Backend | 3 |
| S6-T14 | Pantalla 'Mensajes': lista de conversaciones con buscador y último mensaje | Frontend | 4 |
| S6-T15 | Vista de conversación (burbujas, hora, 'Visto', cabecera con integrantes y 'Ver proyecto') | Frontend | 6 |
| S6-T16 | Estados vacíos 'Sin conversaciones' / 'Todavía no tienes mensajes' | Frontend | 1 |
| S6-T17 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU32** | **Control de Acceso y Seguridad al Chat** (3 SP · Alta (Must)) | | |
| S6-T18 | Autorización por membresía en REST y en el handshake del WebSocket (403) | Backend | 3 |
| S6-T19 | Redirección con aviso 'Ya no formas parte de este equipo' | Frontend | 1 |
| S6-T20 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU33** | **Envíos de Archivos y Adjuntos en Chat** (3 SP · Media (Should)) | | |
| S6-T21 | Carga de adjuntos PDF/PNG < 10 MB y enlace de descarga | Backend | 3 |
| S6-T22 | Botón '+' para adjuntar y tarjeta de archivo en el chat | Frontend | 3 |
| S6-T23 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 22 SP · 57 h

## Sprint 7 — Notificaciones y reportes

**Objetivo:** Mantener informados a los usuarios (in-app y correo) y permitir reportar contenido inapropiado.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU34** | **Notificaciones In-App de Estado de Postulación** (3 SP · Media (Should)) | | |
| S7-T01 | Modelo Notificación (usuario, tipo, payload, leída) | BD | 1 |
| S7-T02 | Servicio de notificaciones disparado por eventos de postulación | Backend | 3 |
| S7-T03 | Campana con indicador rojo y sincronización de no leídas al reconectar | Frontend | 3 |
| S7-T04 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU35** | **Notificaciones In-App por Nueva Postulación (Creador)** (3 SP · Media (Should)) | | |
| S7-T05 | Notificación al creador por nueva postulación y agrupación ('Tienes 5 postulaciones pendientes') | Backend | 3 |
| S7-T06 | Render de notificaciones agrupadas | Frontend | 1 |
| S7-T07 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU36** | **Notificaciones por Correo Electrónico** (5 SP · Media (Should)) | | |
| S7-T08 | Plantillas HTML de correo (aceptación, rechazo, nueva postulación, mensajes) | Backend | 3 |
| S7-T09 | Cola de envío en segundo plano con 3 reintentos y log de auditoría | Backend | 4 |
| S7-T10 | Notificar a postulantes pendientes al cancelar un proyecto (deuda de HU15) | Backend | 1 |
| S7-T11 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU37** | **Centro de Control de Notificaciones** (3 SP · Media (Should)) | | |
| S7-T12 | Endpoints GET /notifications y POST /notifications/read-all | Backend | 2 |
| S7-T13 | Panel de notificaciones (historial, marcar todas como leídas, estado vacío) | Frontend | 3 |
| S7-T14 | Contador de no leídos en 'Mensajes' de la barra lateral | Frontend | 1 |
| S7-T15 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU38** | **Reporte de Proyectos e Ideas Inapropiadas** (3 SP · Media (Should)) | | |
| S7-T16 | Modelo Reporte (proyecto, usuario, causa, motivo, severidad, estado) | BD | 1 |
| S7-T17 | Endpoint POST /projects/:id/reports (motivo obligatorio, 1 por usuario) | Backend | 2 |
| S7-T18 | Modal 'Reportar' con causa y motivo | Frontend | 2 |
| S7-T19 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |

**Total:** 17 SP · 40 h

## Sprint 8 — Administración y cierre

**Objetivo:** Entregar el panel de administración (moderación, categorías y métricas) y preparar la versión para producción.

| ID | Tarea | Tipo | h |
|---|---|---|---|
| **HU39** | **Panel de Moderación para Administradores** (5 SP · Media (Should)) | | |
| S8-T01 | Rol Administrador y protección de rutas /admin (403) | Backend | 2 |
| S8-T02 | Endpoints GET /admin/reports y acciones (suspender proyecto, descartar) | Backend | 4 |
| S8-T03 | Bloque 'Reportes recientes' (severidad, causa, antigüedad, 'Revisar') y vista 'Ver todos' | Frontend | 5 |
| S8-T04 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU40** | **Gestión de Categorías del Sistema** (3 SP · Media (Should)) | | |
| S8-T05 | CRUD /admin/categories (nombre único, inactivar) | Backend | 3 |
| S8-T06 | Gestión de categorías en el panel de administración | Frontend | 3 |
| S8-T07 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **HU41** | **Dashboard de Métricas e Indicadores de Uso** (5 SP · Baja (Could)) | | |
| S8-T08 | Endpoint GET /admin/metrics (usuarios, proyectos activos, tasa de aceptación, reportes, variación mensual) | Backend | 4 |
| S8-T09 | Caché de métricas y mensaje 'Datos actualizados hace X minutos' | Backend | 2 |
| S8-T10 | Pantalla 'Panel de administración' con tarjetas de indicadores | Frontend | 4 |
| S8-T11 | Pruebas de los criterios de aceptación (escenario feliz y alterno) | QA | 2 |
| **TEC** | **Tareas técnicas del sprint** | | |
| S8-T12 | Pruebas end-to-end de los flujos principales (registro → publicar → postular → aceptar → chat) | QA | 6 |
| S8-T13 | Despliegue en producción y variables de entorno | DevOps | 4 |
| S8-T14 | Manual de usuario y documentación de la API | Doc | 4 |

**Total:** 13 SP · 47 h

## Observaciones

- 1. HU01 pide elegir rol (Creador/Colaborador) al registrarse, pero RF1 y la pantalla 'Crea tu cuenta' usan una única cuenta para ambos. Se planificó según RF1 (sin selector de rol); el rol se determina por proyecto (RF6).
- 2. RF9, RF25, RF26 y RF27 (contribuciones validadas, integración con GitHub/Figma/Trello e insignias) no tienen historia de usuario, aunque 'Mi perfil' muestra 'Experiencia verificada' e 'Insignias'. Quedan fuera de estos 8 sprints hasta redactar sus historias.
- 3. HU14 incluye el estado 'Pausado', que RF12 no menciona; se mantuvo en la planificación.
- 4. HU41 (Dashboard de métricas) no tiene requisito asociado en el catálogo; se trazó a la pantalla 'Administración'.
