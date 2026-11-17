# IdeaMatch — Reglas del Proyecto Frontend (AGENTS.md)

Este repositorio corresponde exclusivamente a la **aplicación frontend** de IdeaMatch (React 19 + TypeScript + Vite + Tailwind CSS v4). Todo el desarrollo de los sprints debe regirse por las siguientes directrices:

---

## 1. Stack Técnico y Herramientas

* **Framework & Bundler:** React 19, TypeScript (modo estricto), Vite.
* **Estilos:** Tailwind CSS v4 con design tokens centralizados en `src/index.css`.
* **Iconografía:** `lucide-react`.
* **Enrutamiento:** React Router v7 (usar navegación declarativa y layouts existentes).
* **Calidad & Testing:** Oxlint (`npm run lint`), Vitest + Testing Library (`npm test`), TypeScript Compiler (`npm run build`).

---

## 2. Consistencia Visual y Fidelidad con Figma

* **Diseño Figma:** Cuando se disponga de la pantalla en Figma, se debe replicar la estructura visual, jerarquía tipográfica, distribución de espacios, estados (hover, active, disabled) y flujos visuales.
* **Pantallas sin Figma:** Si una pantalla o estado alterno no está en Figma, debe diseñarse con total coherencia visual respecto a las pantallas ya implementadas (`LandingPage`, `LoginPage`, `RegisterPage`, `AppLayout`).
* **Design System Base:** Reutilizar obligatoriamente los componentes de `src/components/ui/` (`Button`, `TextField`, `Alert`, `Logo`, etc.) antes de crear elementos nuevos. Si se requiere un nuevo componente de interfaz de uso transversal, debe ubicarse en `src/components/ui/` siguiendo el patrón existente.
* **Colores y Tokens:** Utilizar exclusivamente la paleta de tokens definida en `@theme` (`brand-50` a `brand-900`, `ink`, `ink-soft`, `muted`, `subtle`, `line`, `surface`, `field`, etc.). Evitar colores arbitrarios hardcodeados.

---

## 3. Patrón de Servicios Desacoplados (Arquitectura Mock-First)

Como el repositorio es puramente frontend y el backend se desarrollará en otra fase:
* **Contratos Tipados:** Cada dominio funcional nuevo (perfil, proyectos, postulaciones, chat, etc.) debe definir su interfaz en `src/services/<dominio>/types.ts`.
* **Implementación Simulada:** Crear `src/services/<dominio>/mock<Dominio>Service.ts` implementando dicha interfaz con persistencia en `localStorage` o en memoria, permitiendo operar la plataforma al 100% en modo interactivo y en pruebas.
* **Punto de Entrada Unificado:** Exportar la instancia activa en `src/services/<dominio>/index.ts` para que las vistas nunca dependan de si el servicio es simulado o una API REST real.

---

## 4. Trazabilidad con el Sprint Backlog

* Cada implementación debe responder a las tareas e historias de usuario definidas en `SPRINT_BACKLOG.md`.
* Los mensajes de commit y las referencias en el código deben citar el identificador de tarea correspondiente (ejemplo: `[S2-T04]`, `[S3-T08]`).
* En cada pantalla desarrollada, reemplazar progresivamente las rutas correspondientes en `src/layouts/navigation.ts` (que actualmente apuntan a `ComingSoonPage`).

---

## 5. Definición de Hecho (Definition of Done - DoD)

Una tarea o historia de usuario solo se considera terminada si cumple con:
1. **Linter limpio:** `npm run lint` ejecuta Oxlint sin errores.
2. **Pruebas de aceptación superadas:** `npm test` pasa en verde con pruebas automatizadas que cubren explícitamente los dos criterios de aceptación (escenario feliz y escenario alterno) de la historia.
3. **Compilación estricta sin errores:** `npm run build` compila con TypeScript y genera el bundle de producción sin fallos.
4. **Accesibilidad y navegación responsiva:** Formularios con etiquetas legibles, estados de foco visibles y layout responsivo.
