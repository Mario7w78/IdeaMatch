# Avance del integrante 5 — Sprint 2

Fuente de alcance: `context/Reparto_equipo_IdeaMatch.docx` y `context/Catalogo_de_requisitos_y_Product_Backlog_final.xlsx`. El reparto asigna HU25–HU30 y HU41–HU42 al integrante 5. Este documento describe el estado del frontend; no certifica que una HU esté terminada sin prueba con datos reales y QA del equipo.

## Implementado en esta rama

| HU | Frontend | Backend consumido | Validación pendiente |
| --- | --- | --- | --- |
| HU25 | «Mis proyectos» abre postulaciones recibidas y filtra por rol | `GET /api/me/projects`, `GET /api/projects/:id/applications` | Probar creador y 403 ajeno con proyectos reales |
| HU26 | Aceptar candidato, recargar listado y mostrar conflicto sin vacantes | `POST /api/applications/:id/accept` | Confirmar incorporación y vacante con dos cuentas |
| HU27 | Rechazar candidato, recargar y mostrar conflicto de estado | `POST /api/applications/:id/reject` | Confirmar estado y notificación con dos cuentas |
| HU28 | Grilla de miembros con líder y roles | `GET /api/projects/:id/team` | Confirmar líder solo y equipo con aceptados |
| HU29 | Salida voluntaria con confirmación solo para colaborador | `POST /api/projects/:id/leave` | Confirmar vacante libre y acceso al chat revocado por backend |
| HU30 | Remoción por creador con motivo obligatorio y confirmación | `DELETE /api/projects/:id/members/:userId` con `{ reason }` | Confirmar vacante libre y acceso revocado por backend |

Entrada en modo API: `/app/mis-proyectos`. Desde cada proyecto se navega a `/app/proyecto/:id/postulaciones` y `/app/proyecto/:id/equipo`. La página antigua de detalle y el catálogo aún usan mocks; no se han reescrito porque son de otro alcance. El servicio HTTP transversal y la autenticación están explicados en `docs/BACKEND_INTEGRATION.md`.

## Pendiente de mi asignación

- HU41: sección de contribuciones validadas en perfil. Acordar contrato y endpoint con backend antes de conectar.
- HU42: enlaces GitHub, Figma y Trello en proyecto, con validación de dominio. Acordar ruta de lectura y actualización con backend.
- Ejecutar pruebas manuales con cuentas de creador y colaborador, proyecto real y postulación pendiente; pedir la validación QA independiente indicada por el reparto.

## Límites de responsabilidad

No se ha cambiado la UI ni el servicio de chat, notificaciones, categorías, reportes o moderación. La revocación del chat, la transacción de vacantes y la emisión de notificaciones son responsabilidad del backend; estas pantallas muestran el resultado de sus respuestas. Los enlaces a perfiles públicos aún dependen del módulo de perfil mock.

## Prueba sugerida para el equipo

1. Configurar `VITE_API_URL` según `docs/BACKEND_INTEGRATION.md` e iniciar sesión como creador.
2. Abrir «Mis proyectos», entrar a postulaciones y equipo. Crear un proyecto real y postular desde otra cuenta si no existen datos.
3. Aceptar una postulación y comprobar que aparece en el equipo. Desde la cuenta colaboradora, salir; verificar que desaparece de la lista.
4. Repetir con otra postulación, aceptar y cancelar primero el modal de remoción: el miembro debe permanecer. Luego indicar motivo, confirmar y comprobar que desaparece.
5. Ejecutar `npm run lint`, `npm test` y `npm run build` antes de integrar la rama.
