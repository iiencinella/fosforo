---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - flujos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# Flujos y Secuencias - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir cómo interactúa el usuario con el Misal y cómo la app se integra con Motor Litúrgico, CMS, Auth, RUM y Notificaciones.

## Flujo principal - Ver lecturas del día

1. Usuario abre `https://misal.fosforo.app/`.
2. SSR determina la fecha de hoy (UTC-3).
3. SSR consulta `GET {MOTOR}/api/liturgia/{fecha}` (cache 24h) → celebración, ciclo, color, referencias de lecturas.
4. SSR consulta `GET {CMS}/api/content/lectura?fecha={fecha}` (cache 1h) → textos completos.
5. SDK RUM reporta pageview + Web Vitals (si hay consentimiento).
6. Página renderiza: cabecera con celebración y color litúrgico, oración inicial, 1ª lectura, salmo, 2ª lectura (si aplica), evangelio, oración final.
7. Usuario puede navegar a otra fecha, consultar el ordinario o activar modo lectura.

## Flujos secundarios

- Flujo A - Favoritos: Usuario autenticado guarda lectura → Supabase con RLS → lista en `/favoritos`.
- Flujo B - Reporte de problema: Usuario reporta → evento en Log → revisor editorial corrige en CMS → cache se invalida vía webhook.
- Flujo C - Recordatorio diario: Usuario opt-in → preferencia en Notificaciones → envío diario con enlace profundo a las lecturas del día.
- Flujo D - Consentimiento RUM: Banner → acepta/rechaza → SDK activa/desactiva → DNT respetado.

## Secuencias clave

### Secuencia 1 - Carga de la página del día (SSR)

1. Vercel: recibe request a `/`.
2. Astro SSR: calcula fecha actual.
3. Astro SSR: `GET {MOTOR}/api/liturgia/2026-09-06` → `{celebracion: "23º domingo ordinario", color: "verde", tipo: "feria", lecturas: [...]}`.
4. Astro SSR: `GET {CMS}/api/content/lectura?fecha=2026-09-06` → textos completos.
5. Astro SSR: renderiza HTML con datos + View Transition metadata.
6. Cliente: hidrata islands (nav por fecha, modo lectura).
7. SDK RUM: reporta pageview + Web Vitals.

### Secuencia 2 - Navegación a otra fecha

1. Usuario: pulsa "Mañana".
2. Cliente: View Transition a `/dia/2026-09-07` (ClientRouter de Astro).
3. SSR: repite flujo de Secuencia 1 con la nueva fecha.
4. Sistema: cache del día futuro se genera en primera visita.

### Secuencia 3 - Guardar favorito

1. Usuario: pulsa "Guardar" en el evangelio.
2. Cliente: verifica sesión (Supabase Auth).
3. Si sin sesión: redirige a login con `redirect_to=/dia/2026-09-06`.
4. Si con sesión: `POST /api/favoritos` con RLS (user_id de la sesión).
5. Sistema: persiste favorito → toast de confirmación.
6. `/favoritos`: lista favoritos con acceso directo a cada lectura.

### Secuencia 4 - Degradación de servicios

1. CMS caído → SSR intenta CMS → timeout.
2. SSR: recupera último cache de `misal-content-{fecha}` (memoria/edge).
3. Página renderiza contenido cacheado + banner "Contenido puede estar desactualizado".
4. Log: registra `app=misal, level=warn, message='cms-unavailable'`.
