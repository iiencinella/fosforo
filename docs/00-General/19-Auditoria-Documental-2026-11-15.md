---
tags:
  - proyecto/fosforo
  - auditoria
  - documentación
  - calidad
type: auditoria-documental
area: general
status: vigente
created: 2026-11-15
updated: 2026-11-15
related:
  - "[[README|Indice documental]]"
  - "[[03-Indice-General|Indice General]]"
  - "[[02-Guia-Navegacion|Guia de navegación]]"
  - "[[12-Novedades-2026-11-15-cierre-operativo-cms|Novedades cierre operativo CMS]]"
---

# Auditoria Documental 2026-11-15

> Ejecutada con GLM 5.3 (Z.ai). Owner: Iván Ezequiel Iencinella. Alcance: `docs/` completo en
> `main` (294 archivos `.md`), cruzado contra `src/` y `db/`.

## Metodologia

Chequeos automatizados (scripts de un solo uso, reproducibles):

1. **Completitud**: existencia de los 12 documentos canonicos por app (`00-README` a `11-SLA y SLO`)
   en las 18 apps documentadas + plantilla.
2. **Frontmatter**: extraccion de `status`/`created`/`updated` de los 294 archivos; distribucion y
   valores atipicos.
3. **Desalineacion documentacion-codigo**: seccion "Estado de implementación" y `status` de cada
   README de app, contra los workspaces reales en `src/apps/` (10).
4. **Enlaces**: 552 wiki-links (`[[...]]`) y 633 enlaces relativos (`.md`), resueltos por nombre
   base y por ruta.

## Resumen ejecutivo

| Dimension | Resultado |
| --- | --- |
| Completitud del canon | 18/18 apps con 11/12 (unico hueco: convencion de nombre del doc 09, ver A1) |
| Documentos en `draft` | 156 de 294 (53%) |
| Enlaces rotos | 14 wiki-links (9 archivos) + 27 relativos (15 archivos) |
| Desalineaciones con codigo | 4 (ver C1-C4) |
| Vocabulario de `status` inconsistente | 3 archivos fuera del vocabulario vigente/draft |

La documentacion esta **completa en cobertura** (toda app tiene su tramo canonico y las matrizes
generadas son consistentes), pero presenta **tres patrones de deuda sistemicos**: la convencion
dual con/sin tilde, el vocabulario de status sin normalizar, y READMEs de app cuya seccion de
estado no refleja la implementacion real.

## A) Completitud y convenciones

### A1 (Alta) - Canon dual del doc 09: "Especificación" vs "Especificacion"

El orden canonico (AGENTS.md y `docs/README.md`) exige `09-Especificación Tecnica.md` (con tilde),
pero **el archivo con tilde no existe en ninguna de las 18 apps**: todas usan
`09-Especificacion Tecnica.md` (sin tilde). Es la causa de los 9 enlaces relativos rotos y del
"falso 11/12" en completitud. Ademas 9 READMEs de app enlazan la version con tilde (portal,
usuarios, log, logueo, motor-liturgico, santopedia, notificaciones, plantilla; mas `10-Matriz-de-Trazabilidad` con PRD/SRS/FRD "Maestro" con espacio).

**Recomendacion**: normalizar el canon a **sin tilde** (coincide con la practica, evita renombrar
18 archivos): actualizar `AGENTS.md`, `docs/README.md` y el scaffold `docs-new-app.mjs`, y
corregir los 9 enlaces con tilde.

### A2 (Baja) - Typos de nombre "Novedas"

- `FASE_1-0102_biblia/WEB`: `12-Novedas-2026-08-06/07/12/14.md` (4 archivos).
- `FASE_1-0103_calendario/WEB`: `12-Novedas-2026-08-14.md` y `12-Novedas-2026-08-14-widget.md`.

Renombrar a `12-Novedades-...` y revisar referencias internas.

### A3 (Informativa) - Extensiones fuera del canon

Extensiones legitimas por app: `13-Runbook-Operativo.md` (portal, calendario) y
`12-Plan-Desarrollo-MVP.md` (log). Conviene formalizarlas en AGENTS.md como extensiones
habilitadas del canon (slots 12/13 por app), para que las auditorias futuras no las cuenten como
desvio.

## B) Estado y frescura del frontmatter

- Distribucion de `status` (294 archivos): `vigente` 132, `draft` 156, fuera de vocabulario:
  `active` (1), `propuesto` (1), `completado` (1); sin frontmatter: 3.
- Los 3 sin frontmatter: `02-Aplicaciones/00-README.md` (generado por script) y
  `docs/plans/2026-08-19-portal-supabase-design.md`,
  `docs/plans/2026-08-26-gestion-roles-ecosistema-design.md`.
- 8 archivos sin `updated` (novedades internas de biblia/calendario con typo "Novedas" y
  `Novedades-2026-08-25-control-de-versiones.md`).
- Vocabulario inconsistente: `active` en `plans/2026-09-05-plan-desarrollo-fase-0.md`,
  `propuesto` en `Plan-Unificacion-Estilos-Globales.md`, `completado` en
  `Plantilla-SRS-Componente-Compartido.md`. Recomendacion: normalizar a `vigente`/`draft`
  (+ `archivado` si se necesita) y documentarlo en la guia de lectura.
- Frescura: 143 archivos actualizados en la ola 2026-09 (documentacion Fase 2); sin actualizaciones
  10/11 en `main` (el cierre del CMS del 2026-11-15 vive en las ramas `docs/cierre-operativo-cms`
  y `docs/cms-readme-estado-implementacion`, pendientes de merge).

## C) Desalineacion documentación ↔ codigo (apps implementadas en `src/apps/`: portal, biblia,
calendario, usuario, log, horarios, administracion, logueo, cms, cancionero)

| ID | Hallazgo | Archivo |
| --- | --- | --- |
| C1 | CMS figura "Sin implementación" — **ya corregido** en el PR `docs/cms-readme-estado-implementacion` (pendiente de merge) | `FASE_2-Sistema-de-Contenidos-CMS/WEB/00-README.md` en `main` |
| C2 | Sin seccion "Estado de implementación" pese a estar implementada y con `status: vigente` | `FASE_1-0107_administracion/WEB/00-README.md` |
| C3 | `status: draft` con app implementada (inconsistente con horarios/cancionero/portal): usuarios, log, logueo | frontmatter de los 3 README |
| C4 | Texto desactualizado: Santopedia declara "En curso: documentación completa de la fase WEB" pese a que los 12 documentos existen desde 2026-09 | `FASE_2-Santopedia/WEB/00-README.md` |

Nota positiva: apps sin implementacion (Lectio Divina, Misal, Motor Liturgico, Oraciones,
Santopedia, Notificaciones, Vida de Misionero, Visita 7 Iglesias) declaran correctamente su estado
draft/sin implementacion, y la matriz generada de `02-Aplicaciones/00-README.md` es consistente
(`docs:sync-app-status` no genera diferencias).

## D) Enlaces rotos

### D1 - Wiki-links (14 en 9 archivos)

- `06-PRD Maestro` (con espacio; el real es `06-PRD-Maestro`): `07-SRS-Maestro`,
  `09-Guia-UI-UX-Base`, `SRS-Identidad-y-Acceso`.
- `01-Indice General` / `01-Índice General` (el real es `03-Indice-General`):
  `09-Guia-UI-UX-Base`.
- `docs/00-General/05-Tests` (no existe): Oraciones `05-Tests Unitarios.md`.
- `docs/02-Aplicaciones/FASE_1-Sistema-Logueo` (falta `-de-`): Oraciones `10-OWASP.md`.
- `docs/01-Arquitectura/Capacidades Compartidas` (apunta a directorio): Visita 7 Iglesias
  `06-Esquema de Datos.md`.
- `../LICENSE` / `../NOTICE` (existen en la raiz, fuera del vault de docs):
  `05-Licencias-y-Contribucion`, `03-Legal/README`, `03-Legal/LICENCIA-EXPLICADA`. Baja prioridad.

### D2 - Enlaces relativos (27 en 15 archivos)

- 9x `09-Especificación Tecnica.md` con tilde (consecuencia directa de A1).
- 3x "Maestro" con espacio en `10-Matriz-de-Trazabilidad.md`.
- 2x SRS con tilde/ñ en `docs/README.md` y `01-Arquitectura/Capacidades Compartidas/README.md`
  (los reales son `SRS-Busqueda-y-Conocimiento-Compartido.md` y
  `SRS-Notificaciones-y-Plantillas.md`).
- 1x `Plan-Unificación-Estilos-Globales.md` con tilde en `01-Arquitectura/README.md`.
- 2x `db/README.md` con profundidad incorrecta en Santopedia `06`/`07` (usan `../../../db/...`
  desde `docs/02-Aplicaciones/<app>/WEB/`; requieren `../../../../db/README.md`).

## Plan de remediacion propuesto (por prioridad)

1. **Alta - A1/D2**: fijar canon sin tilde (AGENTS.md, `docs/README.md`, scaffold) y corregir los
   9 enlaces con tilde. Un script + un PR.
2. **Alta - D1**: corregir los 14 wiki-links rotos (excluidos LICENSE/NOTICE).
3. **Media - C2/C3/C4**: completar seccion de estado en administracion; pasar `draft`→`vigente`
   en usuarios, log, logueo (y merge del PR del CMS); actualizar texto de Santopedia.
4. **Media - B**: normalizar vocabulario `active`/`propuesto`/`completado`; añadir frontmatter a
   los 3 archivos que carecen de el y `updated` a los 8 que faltan.
5. **Baja - A2**: renombrar los 6 "Novedas".
6. **Baja - A3**: formalizar extensiones del canon (slots 12/13 por app) en AGENTS.md.

## Archivos verificados sin hallazgos

`docs/00-General/04-Listado-de-Aplicaciones.md` y la matriz de
`docs/02-Aplicaciones/00-README.md` (regenerados, consistentes con `src/apps/`), plantilla de app
(completa), capacidades compartidas (9 SRS + catalogo + guia de variables de entorno presentes),
legal (LICENSE/NOTICE en raiz, referencias correctas desde `docs/03-Legal/README.md`).
