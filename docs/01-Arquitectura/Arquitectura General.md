---
tags:
  - proyecto/fosforo
  - arquitectura
  - plataforma
  - capas
type: documentación-tecnica
area: arquitectura
status: vigente
created: 2026-05-06
updated: 2026-05-06
related:
  - "[[README|Arquitectura]]"
  - "[[Estructura Monorepo|Monorepo]]"
  - "[[../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# Arquitectura General

Fósforo debe pensarse como una plataforma con multiples clientes, no como un conjunto de apps aisladas.

## Vision por capas

```text
┌───────────────────────────────────────┐
│            FRONTEND LAYER             │
│  (Apps Web / Mobile / Desktop UI)     │
└───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│        APPLICATION SERVICES           │
│ (Logica de negocio / Orquestación)    │
└───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│            CORE SYSTEMS               │
│ (Motor liturgico, CMS, usuarios)      │
└───────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│        DATA & INFRASTRUCTURE          │
│ (Supabase, storage, auth, APIs)       │
└───────────────────────────────────────┘
```

## Interpretación del modelo

- `Frontend Layer`: interfaces web, mobile y desktop consumidas por usuarios finales o equipos internos.
- `Application Services`: capa intermedia de logica de negocio y orquestación que compone capacidades y evita acceso directo de las apps a la base.
- `Core Systems`: modulos nucleares compartidos de los que depende el ecosistema.
- `Data & Infrastructure`: persistencia, autenticación, storage, APIs, CI/CD y componentes operativos.

## Core Systems

Estos modulos son el corazon del sistema y deben tratarse como capacidades de plataforma.

### 1. Sistema de Contenidos (CMS)

Responsabilidad:

- Gestionar contenido estructurado reusable del ecosistema.

Entidades principales:

- lecturas biblicas;
- santos;
- oraciones;
- canciones;
- eventos liturgicos.

Consumidores esperados:

- Biblia;
- Misal;
- Santopedia;
- Cancionero;
- Espiritualidad diaria.

### 2. Motor Liturgico

Responsabilidad:

- Determinar el estado liturgico del día.

Inputs:

- fecha;
- calendario liturgico.

Outputs:

- lecturas del día;
- santo del día;
- color liturgico;
- tiempo liturgico;
- oraciones sugeridas.

Este modulo debe considerarse el cerebro dinamico del ecosistema.

### 3. Gestion de Usuarios

Responsabilidad:

- autenticación;
- roles y permisos;
- perfil espiritual;
- preferencias.

Extensiones futuras:

- progreso espiritual o formativo;
- comúnidad;
- continuidad cross-app.

### 4. Sistema de Notificaciónes

Responsabilidad:

- enviar eventos relevantes al usuario.

Canales:

- push;
- email;
- in-app.

Triggers:

- motor liturgico;
- agenda;
- eventos comúnitarios.

### 5. Panel de Administración

Responsabilidad:

- CRUD operativo del sistema.

Usuarios principales:

- coordinadores;
- administradores;
- equipos pastorales.

## Application Services

Esta capa conecta frontend, core systems e infraestructura.

Objetivo:

- encapsular logica de negocio;
- orquestar dependencias;
- evitar que las apps accedan directo a la base de datos;
- centralizar reglas de negocio reutilizables.

Ejemplos:

- `LiturgicalService`: combina CMS + Motor liturgico.
- `UserService`: maneja perfiles, permisos y preferencias.
- `ContentService`: expone contenido del CMS a los clientes.
- `NotificationService`: orquesta envios y preferencias.

## Frontend Layer

Las apps visibles para el usuario deben pensarse como clientes de la plataforma.

### Fase 1 - nucleo funcional

Apps principales:

- Fósforo Portal - entry point y dashboard espiritual.
- Biblia - consumidor principal del CMS.
- Calendario Liturgico - consumidor principal del Motor liturgico.
- Horarios de Misas - combina CMS y geolocalización.
- Espiritualidad diaria - combina Motor liturgico y CMS.

Apps de sistema o plataforma:

- Sistema de Logueo.
- Gestion de usuarios.
- Panel de Administración.
- Sistema de Notificaciónes.
- CMS.
- Motor liturgico.

Estas piezas deben tratarse como plataforma, no como producto final aislado.

### Fase 2

- Misal - alta dependencia del Motor liturgico.
- Santopedia - dependencia principal del CMS.
- Vida de Misionero - combinación de usuarios y contenido.
- Visita 7 Iglesias - experiencia guiada con tracking.

### Fase 3

- Agenda Comunitaria.
- Carisma.
- Historia de mi Iglesia.
- Servicios Pastorales.
- Newsletter - integrado al sistema de notificaciónes.

### Fase 4

- Cancionero - dependiente del CMS.
- Donaciónes - dependencia de infraestructura externa de pagos.
- Buscador - dependencia de indexación.
- Chatbot - combinación de IA y CMS.

### Fase 5

- Biblioteca Vaticano.
- Meditvoz.
- Formación.
- Motus.
- Emprendedor.
- Bibliotecario IA.
- Calendarios especiales de Adviento y Cuaresma.

## Flujo de datos de referencia

Ejemplo: usuario abre `Espiritualidad diaria`.

1. El frontend invoca `LiturgicalService`.
2. `LiturgicalService` consulta el Motor liturgico para determinar el estado del día.
3. `LiturgicalService` consulta el CMS para obtener contenido asociado.
4. El servicio devuelve lectura, oración y santo del día.
5. El frontend renderiza la experiencia final.

## Mapeo mental del sistema

### Plataforma

- CMS.
- Motor liturgico.
- Usuarios.
- Notificaciónes.
- Admin.

### Apps visibles para usuario

- Portal.
- Biblia.
- Calendario.
- Espiritualidad diaria.
- Horarios de Misas.

## Conclusiones tecnicas

Fósforo debe evolucionar desde muchas apps separadas hacia una plataforma con multiples clientes.

Ventajas criticas:

- escalabilidad: se agregan apps sin rehacer la base;
- consistencia liturgica: una sola fuente de verdad;
- reutilización: todas las apps comparten datos, capacidades y reglas de negocio.
