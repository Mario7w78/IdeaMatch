# Integración del frontend con el backend

## Activación local

Copiar `.env.example` a `.env.local`, ejecutar `npm install` y `npm run dev`.
Vite expone `VITE_API_BASE_URL` al navegador; debe contener el origen HTTPS, sin `/api` al final. El cliente añade `/api` a cada ruta. Reinicia Vite tras cambiar la variable. Sin ella, la autenticación existente usa el mock.

```dotenv
VITE_API_BASE_URL=https://ideamatch-backend-7rgz.onrender.com
```

La URL pública y el contrato vigente están en [Swagger](https://ideamatch-backend-7rgz.onrender.com/docs/). El backend en Render puede tardar en despertar tras inactividad.

## Contrato compartido

`src/services/http/apiClient.ts` centraliza el origen, `Authorization: Bearer <token>`, JSON y los errores `{ code, message }` como `ApiError(status, code, message)`. Una respuesta 204 no tiene cuerpo. `NETWORK_ERROR` indica que no llegó una respuesta HTTP. Ninguna página debe formar por su cuenta la URL del backend ni guardar un segundo token.

`src/services/auth/index.ts` selecciona `httpAuthService` al configurar la variable. Login, registro, `/auth/me` y logout usan el backend. La sesión se almacena bajo `ideamatch.api.session`, separada de la sesión mock `im.session`; al recibir 401 en `/auth/me` se elimina. Una interrupción de red conserva la sesión local para reintentar. El token está en `localStorage` para adaptarse al contrato Bearer actual; evita datos sensibles en el navegador y no registres tokens en consola.

El backend activa la cuenta al registrar. Las pantallas de verificación, reenvío y recuperación del mock no están disponibles en modo API y requieren endpoints antes de habilitarlas. El backend devuelve IDs como strings, aunque correspondan a BIGINT.

## Estado de migración

| Dominio | Estado |
| --- | --- |
| Auth | HTTP cuando se configura `VITE_API_BASE_URL` |
| HU25, postulaciones recibidas | HTTP en `/app/proyecto/:id/postulaciones` |
| HU26–HU30, decisiones y equipo | Pendiente de migrar las vistas y servicios |
| HU41–HU42, contribuciones y herramientas | Requieren acordar y publicar rutas del backend |
| Proyectos, perfil y postulaciones enviadas | Siguen consumiendo mocks; los IDs semilla no existen en la base real |

Por esa última limitación, el modo API es una integración parcial: para probar HU25 se necesita un proyecto creado en el backend por la cuenta autenticada y una postulación real hecha por otra cuenta. No uses los IDs `proj-*` del mock. El backend valida la propiedad y responde 403 `NOT_OWNER` para otro usuario.

## Próximo corte de trabajo

Conectar proyectos y perfil al mismo cliente para navegar con IDs reales, y luego incorporar `accept` y `reject` al contrato de `applications`. Después crear el servicio `team` para HU28–HU30. Al cerrar cada HU, probar escenario feliz y alterno con `npm run lint`, `npm test` y `npm run build`.
