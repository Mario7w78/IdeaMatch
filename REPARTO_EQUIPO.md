# IdeaMatch — Reparto del equipo (Sprint 2, 1 backend y 4 frontends)

Qué hace cada integrante. Las tareas salen de [SPRINT_BACKLOG.md](SPRINT_BACKLOG.md) (Sprint 2: HU25–HU43, 72 SP). Cada commit cita el ID de su tarea, por ejemplo `[HU26-BE]`.

**Siglas:** BE = backend, FE = frontend, QA = pruebas, Pts = puntos de esfuerzo.

## Resumen

| Responsable | Rol | Se encarga de | Puntos |
|---|---|---|---|
| **Dev 3** | Desarrollador Backend | Todo el backend y el servicio de correo | 37.5 |
| **Dev 4** | Desarrollador Frontend y Deploy | Pantallas de correo, moderación y contribuciones externas; deploy | 12.5 |
| **Dev 5** | Desarrollador Frontend | Pantallas de postulaciones, equipo, contribuciones y herramientas | 13 |
| **Dev 6** | Desarrollador Frontend y Tests | Pantallas de categorías y reportes; tests | 13.5 |
| **Dev 7** | Desarrollador Frontend | Pantallas del chat y de las notificaciones | 12.5 |

**Supuesto:** el xlsx marca el Sprint 1 como terminado, así que este reparto cubre solo el Sprint 2. El frontend de HU11–HU24 que el repositorio no tiene está en el Anexo A de `SPRINT_BACKLOG.md`.

## Reglas para todos

- **Un backend y cuatro frontends.** Dev 3 hace todo el backend (36 puntos, más el servicio de correo). Los otros cuatro hacen solo pantallas y trabajan con el servicio simulado hasta que el endpoint real esté listo.
- **Puntos:** el xlsx estima cada historia en story points (SP) sin separar backend y frontend. Aquí cada tarea vale la mitad de los puntos de su historia. Las tareas de correo, deploy y tests son propuestas, estimadas en la misma unidad.
- **Contrato primero.** Antes de programar una historia, Dev 3 y quien hace la pantalla acuerdan los tipos de datos (`src/services/<dominio>/types.ts`) y los mensajes exactos de los criterios de aceptación.
- **Nadie valida su propio trabajo.** Dev 6 prueba las historias de los demás. Sus pantallas (HU38–HU39) las prueba Dev 4 (QA-F).
- **Trazabilidad.** Cada commit cita el ID de la tarea, por ejemplo `[HU26-BE]` o `[TEC-02]`. Cada integrante escribe las pruebas unitarias de lo que hace.
- **Definición de Hecho:** `npm run lint`, `npm test` (escenario feliz y alterno) y `npm run build` en verde antes de pasar a QA (ver `AGENTS.md`).

---

## Dev 3 — Desarrollador Backend

**Tu trabajo:** Es el único backend: hace todo el servidor de las 19 historias (36 puntos) y el servicio de correo que necesita HU33.

**Trabajas con:** Con los cuatro frontends: Dev 5 (postulaciones, equipo, contribuciones y herramientas), Dev 7 (chat y avisos), Dev 4 (correo, moderación y webhooks) e Dev 6 (categorías y reportes).

### HU25 · Visualización de Postulaciones Recibidas (Creador) (5 SP)

*Debe cumplir:* Si no es el creador: 403 «No tiene permisos para ver estas postulaciones».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU25-BE | Consulta de postulantes por rol con validación de propietario | BE | 2.5 |

### HU26 · Aceptación de Candidato para el Equipo (5 SP)

*Debe cumplir:* Sin vacantes: «No quedan vacantes disponibles para este rol. Aumente el cupo si desea aceptarlo».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU26-BE | Transacción: pasa a Aceptada, resta 1 vacante y agrega al equipo | BE | 2.5 |

### HU27 · Rechazo de Candidato con Notificación (3 SP)

*Debe cumplir:* Si ya no está pendiente: «La postulación ya no está en estado pendiente». Se notifica al usuario.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU27-BE | Cambio de la postulación pendiente a Rechazada | BE | 1.5 |

### HU28 · Visualización del Equipo del Proyecto (2 SP)

*Debe cumplir:* Sin aceptados: solo el creador, como «Líder del Proyecto».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU28-BE | Consulta de integrantes del proyecto | BE | 1 |

### HU29 · Salida Voluntaria del Equipo (2 SP)

*Debe cumplir:* El creador no puede abandonar. Quien sale pierde el acceso al chat.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU29-BE | Retiro del integrante (estado Retirado) y liberación de la vacante | BE | 1 |

### HU30 · Remoción de Integrante por el Creador (3 SP)

*Debe cumplir:* Si se cancela la ventana, el miembro no cambia. Se revoca el acceso al chat.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU30-BE | Remoción con validación de propietario, liberación de vacante y notificación | BE | 1.5 |

### HU31 · Notificaciones In-App por Nueva Postulación (Creador) (3 SP)

*Debe cumplir:* «Tienes una nueva postulación para el rol [Nombre]». Si llegan 5, se agrupan: «Tienes 5 postulaciones pendientes».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU31-BE | Evento al crear una postulación y registro de la notificación | BE | 1.5 |

### HU32 · Notificaciones In-App de Estado de Postulación (3 SP)

*Debe cumplir:* Al reconectarse se sincronizan y muestran las alertas no leídas.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU32-BE | Evento al cambiar el estado de la postulación | BE | 1.5 |

### HU33 · Notificaciones por Correo Electrónico (3 SP)

*Debe cumplir:* Correo HTML ante eventos críticos. Si falla el envío: 3 reintentos y registro de auditoría.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU33-BE | Envío de correos ante eventos clave del proyecto | BE | 1.5 |

### HU34 · Centro de Control de Notificaciones (3 SP)

*Debe cumplir:* «Marcar todas como leídas» deja el contador en cero. Vacío: «No tienes notificaciones registradas».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU34-BE | Listado de notificaciones y marcado como leídas | BE | 1.5 |

### HU35 · Chat Grupal del Proyecto (Solo Aceptados) (8 SP)

*Debe cumplir:* Solo el creador y los aceptados. Ajenos o con postulación pendiente: 403.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU35-BE | Mensajería en tiempo real (Supabase Realtime) y persistencia | BE | 4 |

### HU36 · Control de Acceso y Seguridad al Chat (3 SP)

*Debe cumplir:* Removido del equipo: se redirige al inicio con «Ya no formas parte de este equipo».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU36-BE | Validación de pertenencia al equipo en cada petición (403) | BE | 1.5 |

### HU37 · Envíos de Archivos y Adjuntos en Chat (5 SP)

*Debe cumplir:* PDF/PNG de hasta 10 MB. Otros: «Formato no permitido o el archivo supera el límite de 10MB».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU37-BE | Carga de archivos a Storage con validación de tipo y tamaño | BE | 2.5 |

### HU38 · Gestión de Categorías del Sistema (3 SP)

*Debe cumplir:* Nombre repetido: «La categoría ingresada ya existe en el sistema».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU38-BE | Creación, edición e inactivación de categorías por el administrador | BE | 1.5 |

### HU39 · Reporte de Proyectos e Ideas Inapropiadas (2 SP)

*Debe cumplir:* Motivo vacío o reporte repetido: «Proporcione un motivo» / «Ya registraste un reporte para esta publicación».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU39-BE | Registro del reporte con motivo | BE | 1 |

### HU40 · Panel de Moderación para Administradores (5 SP)

*Debe cumplir:* Un usuario común recibe 403 y se redirige al inicio.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU40-BE | Listado de reportes y acciones de ocultar o suspender contenido | BE | 2.5 |

### HU41 · Actualización del Perfil con Contribuciones (3 SP)

*Debe cumplir:* Solo se muestran las contribuciones validadas por el creador.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU41-BE | Consulta de contribuciones validadas del colaborador | BE | 1.5 |

### HU42 · Vinculación de Herramientas Externas al Proyecto (3 SP)

*Debe cumplir:* Otras URLs: «Solo se admiten enlaces de GitHub, Figma o Trello».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU42-BE | Validación de URLs de GitHub, Figma y Trello | BE | 1.5 |

### HU43 · Asociación de Contribuciones Externas (8 SP)

*Debe cumplir:* Si no coincide ninguna cuenta: se registra como «No asociada».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU43-BE | Recepción de eventos externos (webhooks) y asociación por correo del colaborador | BE | 4 |

### Tareas técnicas (propuestas)

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| TEC-01 | Servicio de correo: proveedor, plantillas HTML, reintentos y registro de auditoría (lo necesita HU33) | Backend | 1.5 |

**Total de Dev 3: 37.5 pts**

---

## Dev 4 — Desarrollador Frontend y Deploy

**Tu trabajo:** Pantallas de notificaciones por correo (HU33), panel de moderación (HU40) y contribuciones externas (HU43). Además, el pipeline de despliegue, el despliegue a producción y las pruebas de HU38–HU39.

**Trabajas con:** Con el Dev 3 (backend de sus historias y servicio de correo).

### HU33 · Notificaciones por Correo Electrónico (3 SP)

*Debe cumplir:* Correo HTML ante eventos críticos. Si falla el envío: 3 reintentos y registro de auditoría.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU33-FE | Preferencias de notificación por correo | FE | 1.5 |

### HU40 · Panel de Moderación para Administradores (5 SP)

*Debe cumplir:* Un usuario común recibe 403 y se redirige al inicio.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU40-FE | Panel de moderación (ruta /admin/reports) | FE | 2.5 |

### HU43 · Asociación de Contribuciones Externas (8 SP)

*Debe cumplir:* Si no coincide ninguna cuenta: se registra como «No asociada».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU43-FE | Registro de contribuciones pendientes de validación | FE | 4 |

### Deploy y pruebas (propuestas)

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| TEC-02 | Despliegue en producción y variables de entorno del MVP | Deploy | 2.5 |
| TEC-03 | Pipeline de despliegue (CI/CD) y entorno de pruebas (staging) | Deploy | 1.5 |
| QA-F | Pruebas de aceptación de HU38–HU39 (son de Integrante 6, así que las valida otra persona) | Tests | 0.5 |

**Total de Dev 4: 12.5 pts**

---

## Dev 5 — Desarrollador Frontend

**Tu trabajo:** Todo el flujo de postulaciones y equipo (HU25–HU30), y las secciones de perfil y proyecto de contribuciones y herramientas externas (HU41–HU42).

**Trabajas con:** Con el Dev 3 (backend de sus historias).

### HU25 · Visualización de Postulaciones Recibidas (Creador) (5 SP)

*Debe cumplir:* Si no es el creador: 403 «No tiene permisos para ver estas postulaciones».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU25-FE | Vista agrupada por rol: tarjetas de candidatos con portafolios y notas | FE | 2.5 |

### HU26 · Aceptación de Candidato para el Equipo (5 SP)

*Debe cumplir:* Sin vacantes: «No quedan vacantes disponibles para este rol. Aumente el cupo si desea aceptarlo».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU26-FE | Acción «Aceptar Candidato» | FE | 2.5 |

### HU27 · Rechazo de Candidato con Notificación (3 SP)

*Debe cumplir:* Si ya no está pendiente: «La postulación ya no está en estado pendiente». Se notifica al usuario.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU27-FE | Acción «Rechazar Candidato» | FE | 1.5 |

### HU28 · Visualización del Equipo del Proyecto (2 SP)

*Debe cumplir:* Sin aceptados: solo el creador, como «Líder del Proyecto».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU28-FE | Pestaña «Equipo»: grilla de integrantes y roles | FE | 1 |

### HU29 · Salida Voluntaria del Equipo (2 SP)

*Debe cumplir:* El creador no puede abandonar. Quien sale pierde el acceso al chat.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU29-FE | Acción «Abandonar Equipo» con confirmación | FE | 1 |

### HU30 · Remoción de Integrante por el Creador (3 SP)

*Debe cumplir:* Si se cancela la ventana, el miembro no cambia. Se revoca el acceso al chat.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU30-FE | Acción «Remover Integrante» con motivo y confirmación, en la vista del equipo | FE | 1.5 |

### HU41 · Actualización del Perfil con Contribuciones (3 SP)

*Debe cumplir:* Solo se muestran las contribuciones validadas por el creador.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU41-FE | Sección de contribuciones en el perfil | FE | 1.5 |

### HU42 · Vinculación de Herramientas Externas al Proyecto (3 SP)

*Debe cumplir:* Otras URLs: «Solo se admiten enlaces de GitHub, Figma o Trello».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU42-FE | Sección de herramientas vinculadas en el proyecto, con el ícono de cada plataforma | FE | 1.5 |

**Total de Dev 5: 13 pts**

---

## Dev 6 — Desarrollador Frontend y Tests

**Tu trabajo:** Pantallas de gestión de categorías (HU38) y de reporte de proyectos (HU39). Además, las pruebas de aceptación, las pruebas del backend y la prueba de punta a punta.

**Trabajas con:** Con el Dev 3 (backend de sus historias y pruebas del backend) y con todos como validador de sus historias.

### HU38 · Gestión de Categorías del Sistema (3 SP)

*Debe cumplir:* Nombre repetido: «La categoría ingresada ya existe en el sistema».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU38-FE | Panel de categorías | FE | 1.5 |

### HU39 · Reporte de Proyectos e Ideas Inapropiadas (2 SP)

*Debe cumplir:* Motivo vacío o reporte repetido: «Proporcione un motivo» / «Ya registraste un reporte para esta publicación».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU39-FE | Botón y formulario de reporte | FE | 1 |

### Pruebas (tests) (propuestas)

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| QA-A | Pruebas de aceptación de HU25–HU30 (escenario feliz y alterno) | Tests | 2 |
| QA-B | Pruebas de aceptación de HU31–HU34 | Tests | 1.5 |
| QA-C | Pruebas de aceptación de HU35–HU37 | Tests | 1.5 |
| QA-D | Pruebas de aceptación de HU40 | Tests | 0.5 |
| QA-E | Pruebas de aceptación de HU41–HU43 | Tests | 1.5 |
| TEST-API | Pruebas del backend: permisos (403), transacción de aceptación, acceso al chat y webhooks | Tests | 2 |
| QA-E2E | Prueba de punta a punta: registro → publicar → postular → aceptar → chat | Tests | 2 |

**Total de Dev 6: 13.5 pts**

---

## Dev 7 — Desarrollador Frontend (nuevo)

**Tu trabajo:** Todo lo que funciona en tiempo real: pantallas del chat (HU35–HU37) y avisos de nueva postulación, de cambio de estado y centro de notificaciones (HU31, HU32 y HU34).

**Trabajas con:** Con el Dev 3 (backend de sus historias).

### HU31 · Notificaciones In-App por Nueva Postulación (Creador) (3 SP)

*Debe cumplir:* «Tienes una nueva postulación para el rol [Nombre]». Si llegan 5, se agrupan: «Tienes 5 postulaciones pendientes».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU31-FE | Alerta en la campana | FE | 1.5 |

### HU32 · Notificaciones In-App de Estado de Postulación (3 SP)

*Debe cumplir:* Al reconectarse se sincronizan y muestran las alertas no leídas.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU32-FE | Alerta en la campana con indicador rojo | FE | 1.5 |

### HU34 · Centro de Control de Notificaciones (3 SP)

*Debe cumplir:* «Marcar todas como leídas» deja el contador en cero. Vacío: «No tienes notificaciones registradas».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU34-FE | Panel de notificaciones y contador | FE | 1.5 |

### HU35 · Chat Grupal del Proyecto (Solo Aceptados) (8 SP)

*Debe cumplir:* Solo el creador y los aceptados. Ajenos o con postulación pendiente: 403.

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU35-FE | Sala de chat con scroll y estado de conexión | FE | 4 |

### HU36 · Control de Acceso y Seguridad al Chat (3 SP)

*Debe cumplir:* Removido del equipo: se redirige al inicio con «Ya no formas parte de este equipo».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU36-FE | Bloqueo de acceso para no integrantes | FE | 1.5 |

### HU37 · Envíos de Archivos y Adjuntos en Chat (5 SP)

*Debe cumplir:* PDF/PNG de hasta 10 MB. Otros: «Formato no permitido o el archivo supera el límite de 10MB».

| ID | Tarea | Tipo | Pts |
|---|---|---|---|
| HU37-FE | Adjuntar y descargar archivos en el chat | FE | 2.5 |

**Total de Dev 7: 12.5 pts**

---

## Orden de trabajo y recortes

1. **Días 1 y 2:** Dev 3 y Dev 5 con HU25–HU28 (postulaciones y equipo). Dev 4 arma el pipeline de despliegue y el entorno de pruebas (TEC-03). Dev 3 empieza el servicio de correo (TEC-01).
2. **Días 3 y 4:** HU29–HU30 (salida y remoción), HU31–HU34 (notificaciones) y HU35–HU36 (chat y acceso). Dev 6 prueba HU25–HU30 (QA-A).
3. **Días 5 y 6:** HU37 (archivos en el chat), HU38–HU40 (administración y moderación), HU41–HU42 y las pruebas QA-B a QA-D y QA-F.
4. **Día 7:** HU43 (integraciones), pruebas del backend (TEST-API), prueba de punta a punta (QA-E2E) y despliegue a producción (TEC-02).

**Si falta tiempo**, orden sugerido para recortar: HU43, HU41, HU42, HU37 y HU33 (las de menor prioridad en el backlog). Es una recomendación; el equipo decide.
