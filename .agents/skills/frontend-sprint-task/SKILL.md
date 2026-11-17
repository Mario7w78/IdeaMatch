---
name: frontend-sprint-task
description: >-
  Use this skill whenever developing or testing a user story or task from the IdeaMatch sprint backlog. Provides step-by-step guidance on Figma alignment, mock services, component development, and acceptance testing.
---

# Procedimiento de Implementación de Tareas Frontend — IdeaMatch

Esta guía define el flujo de trabajo estandarizado para implementar cualquier historia de usuario o tarea visual en el repositorio frontend de IdeaMatch.

---

## Paso 1: Análisis de Requisitos y Referencia Visual (Figma)

1. **Consultar la Historia de Usuario:**
   * Localizar el ID de la HU en `SPRINT_BACKLOG.md` (ejemplo: `HU06: Edición de Información Personal y Foto`).
   * Identificar los dos criterios de aceptación (escenario feliz y alterno) y las tareas asociadas.
2. **Revisar Figma:**
   * Solicitar o verificar la pantalla correspondiente en Figma para inspeccionar: distribución en cuadrícula/flexbox, jerarquía de títulos, tipografías, tarjetas, bordes, estados vacíos y modales.
   * Si la pantalla no existe en Figma, derivar el diseño a partir de `AppLayout.tsx`, `src/components/ui/` y los tokens de color `--color-brand-*` en `src/index.css`.

---

## Paso 2: Capa de Datos Simulada (Mock Service)

1. Si la funcionalidad pertenece a un nuevo módulo (ej. `profile`, `projects`, `applications`, `chat`):
   * Crear la carpeta `src/services/<modulo>/`.
   * Definir los tipos de datos y la interfaz en `types.ts`.
   * Implementar `mock<Modulo>Service.ts` guardando el estado en `localStorage` con datos semilla realistas (seed data).
   * Exportar el servicio activo en `index.ts`.
2. Si el módulo ya existe, extender la interfaz y el mock con los nuevos métodos requeridos.

---

## Paso 3: Componentes y Pantalla

1. **Componentes Atómicos:**
   * Si se necesitan nuevos elementos genéricos (chips de habilidades, selectores, contadores de caracteres, badges de estado), ubicarlos en `src/components/ui/`.
2. **Vista Principal:**
   * Crear la página en `src/pages/<modulo>/<Pantalla>Page.tsx`.
   * Utilizar `useForm` de `src/hooks/useForm.ts` si contiene formularios con validación al salir del campo (onBlur).
   * Mostrar mensajes de error claros y estados de carga o guardado exitoso con `Alert`.
3. **Navegación:**
   * Enlazar la ruta en `src/App.tsx` bajo la guarda adecuada (`RequireAuth` si es privada).
   * Si la sección ya existía como "Próximamente", actualizar `src/layouts/navigation.ts` para que active la nueva página.

---

## Paso 4: Pruebas Automatizadas de QA

1. Crear o actualizar la suite de pruebas en `src/test/` o `src/services/<modulo>/<modulo>.test.ts`.
2. Validar expresamente los criterios de aceptación de la HU:
   * **Caso Feliz:** El usuario completa la acción con datos válidos y el estado se actualiza correctamente.
   * **Caso Alterno / Error:** Validaciones fallidas, límites de caracteres, datos incompletos o errores de red simulados.

---

## Paso 5: Verificación de Calidad (DoD)

Antes de dar la tarea por finalizada, ejecutar y verificar que no existan errores:

```bash
npm run lint    # Oxlint no debe emitir warnings ni errores
npm test        # Vitest debe pasar todas las pruebas en verde
npm run build   # TypeScript y Vite deben compilar exitosamente
```
