# IdeaMatch · Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest + Testing Library
npm run lint     # oxlint
npm run build
```

## Estructura

```
src/
  components/ui/     Design system: Button, TextField, Alert, Logo, PasswordStrength
  layouts/           AuthLayout (acceso) y AppLayout (barra lateral + barra superior)
  pages/             Landing, auth/ (login, registro, verificación, recuperación), app/
  services/auth/     Contrato AuthService + implementación simulada
  context/           AuthProvider / useAuth (sesión)
  routes/            Guardas de rutas privadas y públicas
  hooks/useForm.ts   Validación al salir del campo y al enviar
```

## Autenticación simulada (Sprint 1)

Mientras no exista backend, `services/auth/mockAuthService.ts` guarda usuarios,
tokens y sesión en `localStorage`. Los correos de activación y recuperación
se pueden abrir desde el botón **Correos de prueba** (solo en modo desarrollo).

Para integrar la API real basta con implementar la interfaz `AuthService`
(`services/auth/types.ts`) con llamadas HTTP y exportarla en `services/auth/index.ts`.

## Rutas

| Ruta | Pantalla | HU |
|---|---|---|
| `/` | Landing pública | — |
| `/registro` | Crea tu cuenta | HU01 |
| `/verificar/:token` | Verificación de correo | HU02 |
| `/login` | Inicia sesión | HU03 |
| `/recuperar`, `/restablecer/:token` | Recuperación de contraseña | HU04 |
| `/app` | Inicio (privada) · botón **Salir** cierra sesión | HU05 |
| `/app/*` | Secciones de próximos sprints | — |
