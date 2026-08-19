---
tags:
  - proyecto/fosforo
  - srs
  - datos
  - taxonomias
type: srs-componente
area: plataforma
status: draft
created: 2026-03-07
updated: 2026-03-07
related:
  - "[[README|Indice componentes compartidos]]"
---

# SRS - Datos y Taxonomias Compartidas

## 1. Proposito

Definir entidades, identificadores, catálogos y reglas de interoperabilidad reutilizados por varias aplicaciónes.

## 2. Alcance

Incluye usuarios, parroquias, iglesias, ubicaciónes, eventos, tiempos liturgicos, tipos de contenido, causas y referencias cruzadas. Excluye modelos privados estrictamente locales de una app.

## 3. Requisitos funcionales

- FR-DAT-001: Toda entidad compartida debe tener identificador global o estrategia de mapeo documentada.
- FR-DAT-002: Las taxonomias comúnes deben publicarse con version y fecha de actualización.
- FR-DAT-003: Deben existir reglas de ownership, mutabilidad y sincronización por entidad.
- FR-DAT-004: Las aplicaciónes consumidoras deben poder consultar catalogos comúnes sin duplicar logica de negocio critica.

## 4. Requisitos no funcionales

- NFR-DAT-001: Los contratos deben ser versionables y compatibles hacia atras cuando sea razonable.
- NFR-DAT-002: La integridad referencial entre entidades compartidas debe ser verificable.
- NFR-DAT-003: Los cambios de taxonomias deben quedar auditados.

## 5. Criterios de aceptación

- CA-DAT-001: Dos aplicaciónes consumen una misma taxonomia sin divergencia semantica.
- CA-DAT-002: Un cambio de version de contrato identifica impacto en consumidores.
- CA-DAT-003: Los datos maestros cuentan con owner funcional definido.
