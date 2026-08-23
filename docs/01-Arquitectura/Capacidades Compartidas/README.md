---
tags:
  - proyecto/fosforo
  - capacidades-compartidas
  - indice
type: readme-seccion
area: arquitectura
status: vigente
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[../README|Arquitectura]]"
  - "[[Catalogo-de-Capacidades-Compartidas|Catalogo de capacidades]]"
---

# Capacidades Compartidas

Esta carpeta centraliza la documentación de capacidades reutilizables del ecosistema.

## Documentos base

- [Catalogo-de-Capacidades-Compartidas.md](Catalogo-de-Capacidades-Compartidas.md)
- [Plantilla-SRS-Componente-Compartido.md](Plantilla-SRS-Componente-Compartido.md)
- [Guia-Variables-de-Entorno.md](Guia-Variables-de-Entorno.md)

## Capacidades definidas

1. [SRS-Identidad-y-Acceso.md](SRS-Identidad-y-Acceso.md)
2. [SRS-Datos-y-Taxonomias-Compartidas.md](SRS-Datos-y-Taxonomias-Compartidas.md)
3. [SRS-Notificaciónes-y-Plantillas.md](SRS-Notificaciónes-y-Plantillas.md)
4. [SRS-Búsqueda-y-Conocimiento-Compartido.md](SRS-Búsqueda-y-Conocimiento-Compartido.md)
5. [SRS-Pagos-y-Transacciones-Compartidas.md](SRS-Pagos-y-Transacciones-Compartidas.md)
6. [SRS-Observabilidad-y-Auditoria.md](SRS-Observabilidad-y-Auditoria.md)
7. [SRS-Design-System-y-Navegacion-Global.md](SRS-Design-System-y-Navegacion-Global.md)

## Paquetes compartidos vigentes en el repo

Los paquetes activos hoy viven en `src/packages/` y representan la base reusable realmente implementada del monorepo.

| Paquete                    | Rol actual                                                       | Estado documental                                                      |
| -------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `@repo/ui`                 | Componentes UI, estilos compartidos y exports Astro/CSS para web | Parcialmente cubierto por `SRS-Design-System-y-Navegacion-Global.md`   |
| `@repo/tailwind-config`    | Tokens y configuración visual compartida                         | Parcialmente cubierto por `SRS-Design-System-y-Navegacion-Global.md`   |
| `@repo/mobile-auth-client` | Primitivas mobile para sesion, login y pantallas compartidas     | Relaciónado con `SRS-Identidad-y-Acceso.md`, sin SRS de paquete propio |
| `@repo/api-utils`          | Utilidades compartidas para consumo de APIs y contratos simples  | Sin documentación especifica de paquete                                |
| `@repo/env`                | Lectura, validacion y convencion de variables de entorno         | Cubierto por `Guia-Variables-de-Entorno.md`                            |
| `@repo/auth`               | Sesion y cookies compartidas sobre Supabase Auth                 | Relacionado con `SRS-Identidad-y-Acceso.md`                            |
| `@repo/eslint-config`      | Configuración ESLint compartida del monorepo                     | Sin documentación especifica de paquete                                |
| `@repo/typescript-config`  | Configuraciónes TypeScript reutilizables del monorepo            | Sin documentación especifica de paquete                                |

## Lectura recomendada al tocar paquetes compartidos

- Revisar `docs/01-Arquitectura/Estructura Monorepo.md`.
- Revisar el SRS transversal que corresponda a la capacidad afectada.
- Verificar el estado real del paquete en `src/packages/<nombre>/package.json`.
- Si el paquete implementa una capacidad reutilizable no cubierta por un SRS, dejarlo explicitado como hueco documental.

## Navegación

- [Arquitectura](../README.md)
- [Información general](../../00-General/README.md)
