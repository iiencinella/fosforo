---
tags:
  - proyecto/fosforo
  - aplicaciónes
  - inventario
type: inventario
area: general
status: vigente
created: 2026-03-07
updated: 2026-05-27
related:
  - "[[README|Indice de documentación]]"
  - "[[03-Indice-General|Indice General]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
---

# Listado de Aplicaciones

Este documento funciona como inventario maestro del ecosistema.

- La documentación realmente generada vive en `docs/02-Aplicaciones/FASE_<N>-<nombre>/<PLATAFORMA>/`.
- Cada carpeta documental de app debe seguir el esquema numerado oficial `00-README.md` a `11-SLA y SLO.md`.
- No todas las apps listadas abajo tienen carpeta documental creada hoy.
- No todas las apps documentadas tienen implementación activa en `src/apps/`, `src/mobile/` o `src/desktop/`.

## Apps con documentación generada actualmente

<!-- apps-docs-list:start -->
- [Panel de Administración](../02-Aplicaciones/FASE_1-0107_administracion/WEB/00-README.md)
- [Biblia](../02-Aplicaciones/FASE_1-0102_biblia/WEB/00-README.md)
- [Calendario Liturgico](../02-Aplicaciones/FASE_1-0103_calendario/WEB/00-README.md)
- [Horarios de Misas](../02-Aplicaciones/FASE_1-0106_horarios/WEB/00-README.md)
- [Log](../02-Aplicaciones/FASE_1-0105_log/WEB/00-README.md)
- [Fósforo Portal](../02-Aplicaciones/FASE_1-0101_portal/WEB/00-README.md)
- [Gestion de Usuarios](../02-Aplicaciones/FASE_1-0104_usuarios/WEB/00-README.md)
- [Cancionero](../02-Aplicaciones/FASE_4-0401_cancionero/WEB/00-README.md)
<!-- apps-docs-list:end -->

## Modulos de plataforma criticos

Estos modulos no deben pensarse como productos aislados, sino como capacidades base del ecosistema:

- Sistema de Contenidos (CMS)
- Motor Liturgico
- Gestion de Usuarios
- Sistema de Notificaciónes
- Panel de Administración
- Sistema de Logueo

## Matriz de estado por aplicación

<!-- app-status-matrix:start -->
| App | Fase | Plataforma | Documentada | Implementada | Workspace |
| --- | --- | --- | --- | --- | --- |
| Auth | 1 | WEB | No | No | - |
| Sistema de Logueo | 1 | WEB | No | No | - |
| Biblia | 1 | WEB | Si | Si | src/apps/biblia |
| Calendario Liturgico | 1 | WEB | Si | Si | src/apps/calendario |
| Fósforo Portal | 1 | WEB | Si | Si | src/apps/portal |
| Panel de Administración | 1 | WEB | Si | Si | src/apps/administracion |
| Gestion de Usuarios | 1 | WEB | Si | Si | src/apps/usuario |
| Motor Liturgico | 2 | - | No | No | - |
| Horarios de Misas | 1 | WEB | Si | Si | src/apps/horarios |
| Espiritualidad diaria | 2 | WEB | No | No | - |
| Sistema de Notificaciónes | 2 | - | No | No | - |
| Sistema de Contenidos (CMS) | 2 | - | No | No | - |
| Log | 1 | WEB | Si | Si | src/apps/log |
| Misal | 2 | WEB | No | No | - |
| Oraciones | 2 | WEB | No | No | - |
| Santopedia | 2 | WEB | No | No | - |
| Vida de Misionero | 2 | WEB | No | No | - |
| Visita 7 Iglesias | 2 | WEB | No | No | - |
| Lectio Divina | - | - | No | No | - |
| Meditvoz | 5 | - | No | No | - |
| Agenda Comunitaria | 3 | - | No | No | - |
| Carisma | 3 | - | No | No | - |
| Historia de mi Iglesia | 3 | - | No | No | - |
| Confesiones | - | - | No | No | - |
| Peticionario | - | - | No | No | - |
| Servicio Sacerdotal al Difunto | - | - | No | No | - |
| Servicios Pastorales | 3 | - | No | No | - |
| Newsletter | 3 | - | No | No | - |
| Cancionero | 4 | WEB | Si | Si | src/apps/cancionero |
| Donaciónes | 4 | - | No | No | - |
| Buscador | 4 | - | No | No | - |
| Chatbot | 4 | - | No | No | - |
| Biblioteca Vaticano | 5 | - | No | No | - |
| Formación | 5 | - | No | No | - |
| Motus | 5 | - | No | No | - |
| Emprendedor | 5 | - | No | No | - |
| Bibliotecario IA | 5 | - | No | No | - |
| Calendario de Adviento | 5 | - | No | No | - |
| Calendario de Cuaresma | 5 | - | No | No | - |

- `Documentada`: existe carpeta en `docs/02-Aplicaciones/`.
- `Implementada`: existe workspace real en `src/apps/`, `src/mobile/` o `src/desktop/`.
- `Workspace`: ruta relativa del workspace cuando existe.
<!-- app-status-matrix:end -->

## Inventario funcional del ecosistema

Cada aplicación deberia contar, cuando se materialice su documentación, con `00-README.md`, `01-PRD.md`, `02-SRS.md`, `03-FRD.md`, `04-Flujos y Secuencias.md`, `05-Tests Unitarios.md`, `06-Esquema de Datos.md`, `07-ERM.md`, `08-Decisiones de Arquitectura.md`, `09-Especificación Tecnica.md`, `10-OWASP.md` y `11-SLA y SLO.md`.

Orden y dependencia esperados:

1. `00-README.md` centraliza contexto, owners y mapa documental.
2. `01-PRD.md` define la necesidad y genera `02-SRS.md`.
3. `02-SRS.md` traduce producto a requisitos y genera `03-FRD.md`.
4. `03-FRD.md` detalla comportamiento y genera `04-Flujos y Secuencias.md`.
5. `04-Flujos y Secuencias.md` genera `05-Tests Unitarios.md`.
6. `06-Esquema de Datos.md` y `07-ERM.md` alimentan `08-Decisiones de Arquitectura.md`.
7. `08-Decisiones de Arquitectura.md` genera `09-Especificación Tecnica.md` y sirve de base para `10-OWASP.md`.
8. `11-SLA y SLO.md` deriva de `01-PRD.md` y cierra compromisos operativos.

El prefijo numerico es obligatorio y define el orden oficial de lectura, construccion y mantenimiento de la documentación por app.

El ecosistema debe entenderse como plataforma con multiples clientes. Algunas piezas del inventario representan apps visibles para usuario final y otras representan modulos de plataforma necesarios para sostener contenido, liturgia, identidad, administración y comúnicaciónes.

## Contenido Religioso

- Biblia
- Calendario Liturgico
- Biblioteca Vaticano
- Santopedia
- Espiritualidad diaria
- Misal
- Meditvoz

## Vida Comunitaria

- Agenda Comunitaria
- Carisma
- Historia de mi Iglesia
- Confesiones
- Horarios de Misas
- Peticionario
- Servicios Pastorales

## Formación

- Formación
- Cancionero
- Motus

## Servicios

- Emprendedor
- Donaciónes
- Newsletter
- Sistema de Logueo
- Bibliotecario IA

## Herramientas

- Buscador
- Chatbot
- Fósforo Portal
- Vida de Misionero
- Visita 7 Iglesias
- Calendario de Adviento
- Calendario de Cuaresma
