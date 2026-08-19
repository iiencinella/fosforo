---
tags:
  - proyecto/fosforo
  - srs
  - requisitos
  - ecosistema
type: srs-maestro
area: ecosistema
status: draft
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[README|Información General]]"
  - "[[06-PRD-Maestro|PRD Maestro]]"
  - "[[../01-Arquitectura/Stack Tecnologico|Stack Tecnologico]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
  - "[[../01-Arquitectura/Capacidades Compartidas/README|Capacidades compartidas]]"
  - "[[../03-Legal/README|Legal y Licencias]]"
---

# SRS Maestro - Ecosistema Fósforo

## 1. Proposito

Este documento especifica los requisitos de software del ecosistema Fósforo como plataforma digital unificada para contenido, vida comunitaria, formación, servicios y capacidades de plataforma. Su objetivo es convertir la estrategia de producto en requisitos verificables para diseno, desarrollo, QA, seguridad, operación y despliegue.

## 2. Alcance del sistema

El sistema cubre aplicaciónes visibles para usuario final y modulos de plataforma distribuidos en cinco dominios funcionales mas una capa de capacidades base.

| Dominio             | Aplicaciones                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Contenido religioso | Biblia, Calendario Liturgico, Santopedia, Oraciones, Misal, Lectio Divina, Meditvoz, Cancionero                                   |
| Vida comunitaria    | Agenda Comunitaria, Carisma, Historia de mi Iglesia, Confesiones, Horarios de Misas, Peticionario, Servicio Sacerdotal al Difunto |
| Formación           | Formación, Motus                                                                                                                  |
| Servicios           | Emprendedor, Donaciónes, Newsletter, Sistema de Logueo, Servicio Sacerdotal al Difunto                                            |
| Herramientas        | Buscador, Chatbot, Fósforo Portal, Vida de Misionero                                                                              |

Capacidades de plataforma obligatorias:

- Sistema de Contenidos (CMS)
- Motor Liturgico
- Gestion de Usuarios
- Sistema de Notificaciónes
- Panel de Administración

Quedan fuera del MVP ecosistemico la personalización avanzada basada en IA, integraciónes institucionales profundas sin ownership definido, internaciónalización multi-pais completa y capacidades offline completas para todas las aplicaciónes.

## 3. Stakeholders y usuarios

- Fieles católicos y buscadores.
- Sacerdotes, religiosos y agentes pastorales.
- Coordinadores laicos y lideres de grupos.
- Operadores de contenido, soporte, producto y tecnologia.
- Administradores del ecosistema y owners de aplicaciónes.
- Contribuidores comúnitarios (desarrolladores, diseñadores, traductores, creadores de contenido).

## 4. Contexto operativo

Fósforo debe operar como un ecosistema con identidad compartida, datos interoperables, experiencia consistente y capacidades de plataforma reutilizables. Ninguna aplicación critica debe diseñarse como silo. Toda app nueva debe integrarse con autenticación, observabilidad, taxonomias y politicas comúnes.

## 5. Suposiciones y restricciones

- Arquitectura objetivo: monorepo con Turborepo y pnpm.
- Canales objetivo: web, movil, escritorio y APIs segun aplique.
- Backend base: Astro API + Supabase.
- La seguridad, la privacidad y la trazabilidad aplican desde el MVP.
- El ecosistema debe soportar varios idiomas: espanol como idioma por defecto en MVP; la arquitectura (i18n/l10n) debe permitir la incorporación progresiva de otros idiomas (p. ej. ingles, portugues).
- Toda aplicación debe exponer telemetria minima y criterios de soporte antes de salir a produccion.
- **Licencia**: codigo bajo PolyForm Noncommercial 1.0.0, contenido bajo CC BY-NC 4.0. No se permite uso comercial sin autorización escrita.
- **UI/UX**: todas las interfaces deben cumplir la Guia UI/UX Base (`docs/00-General/09-Guia-UI-UX-Base.md`).

## 6. Requisitos funcionales transversales

### 6.1 Identidad y acceso

- FR-ECO-001: El ecosistema debe ofrecer autenticación centralizada con cuenta unica para todas las aplicaciónes que requieran identidad persistente.
- FR-ECO-002: El sistema debe soportar roles base de usuario, coordinador, sacerdote y administrador, con posibilidad de ampliar permisos por aplicación.
- FR-ECO-003: Las operaciónes sensibles deben registrar eventos de auditoria con actor, fecha, accion, entidad y resultado.
- FR-ECO-004: El perfil de usuario debe conservar preferencias, consentimientos y relaciónes con aplicaciónes activas.

### 6.2 Datos y contratos compartidos

- FR-ECO-005A: El ecosistema debe disponer de un Sistema de Contenidos (CMS) compartido para lecturas biblicas, santos, oraciones, canciones y eventos liturgicos reutilizables.
- FR-ECO-005B: El ecosistema debe disponer de un Motor Liturgico capaz de resolver el estado liturgico del día y exponer lecturas, santo, color, tiempo liturgico y oraciones sugeridas.
- FR-ECO-005: El ecosistema debe mantener identificadores consistentes para usuarios, parroquias, iglesias, eventos, contenidos, causas y documentos reutilizados entre aplicaciónes.
- FR-ECO-006: Los contratos de datos entre aplicaciónes y servicios compartidos deben ser versionados.
- FR-ECO-007: Toda entidad compartida debe tener reglas explicitas de ownership, sincronización y resolucion de conflictos.
- FR-ECO-008: Las aplicaciónes deben reutilizar taxonomias comúnes de tiempo liturgico, geografia, tipos de contenido y audiencias cuando aplique.

### 6.3 Descubrimiento, navegación y comunicación

- FR-ECO-009: El portal debe actuar como punto de entrada al ecosistema y permitir descubrir aplicaciónes, contenido reciente y accesos relevantes.
- FR-ECO-010: Las aplicaciónes deben poder enviar eventos al sistema de notificaciónes para email, SMS o push segun reglas de preferencia y consentimiento.
- FR-ECO-011: El ecosistema debe ofrecer búsqueda unificada sobre contenido y entidades indexables.
- FR-ECO-012: El chatbot debe poder resolver consultas simples o derivar al usuario a la aplicación adecuada cuando no pueda completar la tarea.
- FR-ECO-012A: Espiritualidad diaria debe componerse como cliente de plataforma usando contenido del CMS y resolucion del Motor Liturgico.

### 6.4 Operación y soporte

- FR-ECO-013: Todas las aplicaciónes deben integrarse con el Sistema de Logueo para logs, eventos y metricas operativas.
- FR-ECO-014: Las aplicaciónes criticas deben definir runbook operativo, responsable y criterios de severidad antes de produccion.
- FR-ECO-015: Toda app debe exponer salud minima, version desplegada y dependencia de servicios compartidos.
- FR-ECO-016: Los incidentes de seguridad y disponibilidad deben tener flujo de escalamiento y trazabilidad.

### 6.5 UI/UX compartida

- FR-ECO-017: Todas las aplicaciónes deben implementar modo oscuro y modo claro segun la Guia UI/UX Base.
- FR-ECO-018: Los componentes interactivos deben tener area tactil minima de 44x44px y foco visible.
- FR-ECO-019: Las interfaces deben usar tokens de diseno compartidos (color, tipografia, espaciado) definidos en la Guia UI/UX Base.
- FR-ECO-020: Los iconos de interfaz deben provenir del set Lucide Icons (SVG). No se permiten emojis como iconos de UI.
- FR-ECO-021: Las animaciónes deben respetar `prefers-reduced-motion: reduce` y usar duraciónes de 150-300ms.
- FR-ECO-022: Los estados de interfaz (loading, vacio, error, exito) deben estar contemplados con patrones consistentes.
- FR-ECO-023: La navegación debe permitir reconocer el ecosistema Fósforo al cambiar entre aplicaciónes.

## 7. Requisitos de integración

- IR-ECO-000: Las apps cliente no deben acceder de forma directa a la base para resolver capacidades de plataforma; deben consumir servicios de aplicación y contratos compartidos.
- IR-ECO-001: Calendario Liturgico debe publicar datos reutilizables para Biblia, Santopedia, Oraciones, Misal, Cancionero y Lectio Divina.
- IR-ECO-002: Biblia debe exponer referencias y lecturas consumibles por Lectio Divina, Formación y Chatbot.
- IR-ECO-002A: Misal, Oraciones, Santopedia, Cancionero y Espiritualidad diaria deben reutilizar contenido estructurado del CMS cuando aplique.
- IR-ECO-002B: Calendario Liturgico, Misal y Espiritualidad diaria deben reutilizar resolucion del Motor Liturgico.
- IR-ECO-003: Newsletter debe recibir eventos de Agenda Comunitaria, Carisma, Peticionario, Emprendedor, Donaciónes y Portal.
- IR-ECO-004: Donaciónes y Emprendedor deben proveer capacidades de pago reutilizables para otros flujos monetizados.
- IR-ECO-005: Buscador debe indexar contenidos y entidades de todas las apps que publiquen datos indexables.
- IR-ECO-006: Chatbot debe consumir conocimiento curado y resultados de Buscador bajo politicas de seguridad y calidad editorial.

## 8. Requisitos no funcionales

### 8.1 Disponibilidad y resiliencia

- NFR-ECO-001: Las aplicaciónes criticas deben apuntar a una disponibilidad minima de 99.5% en MVP y 99.9% post-MVP.
- NFR-ECO-002: Los flujos criticos deben degradarse de forma controlada cuando fallen dependencias no esenciales.
- NFR-ECO-003: Los servicios criticos deben tener respaldo, restauración probada y objetivo inicial de RTO menor a 4 horas y RPO menor a 1 hora.

### 8.2 Rendimiento

- NFR-ECO-004: Los endpoints de lectura frecuentes deben mantener p95 menor a 300 ms en condiciones normales.
- NFR-ECO-005: Las interfaces principales deben cargar en menos de 3 segundos en redes moviles razonables para los journeys prioritarios.
- NFR-ECO-006: La indexación y sincronización cross-app no debe bloquear la operación principal de las aplicaciónes fuente.

### 8.3 Seguridad y privacidad

- NFR-ECO-007: Todo trafico de datos debe utilizar cifrado en transito.
- NFR-ECO-008: Las APIs deben aplicar validación de entradas, proteccion contra abuso y rate limiting cuando corresponda.
- NFR-ECO-009: Las apps con datos sensibles, pagos o asistencia pastoral deben aplicar controles reforzados de acceso y minimización de datos.
- NFR-ECO-010: Todo acceso a datos sensibles debe ser auditable.

### 8.4 Accesibilidad y calidad

- NFR-ECO-011: Las interfaces principales deben aspirar a WCAG 2.1 AA en flujos criticos.
- NFR-ECO-012: Toda aplicación debe incluir smoke tests para sus flujos mas sensibles antes de release.
- NFR-ECO-013: La observabilidad debe usar logs estructurados, metricas accionables y alertas con owner asignado.

### 8.5 UI/UX y accesibilidad

- NFR-ECO-014: El contraste de texto debe cumplir WCAG AA (4.5:1 texto normal, 3:1 texto grande) en ambos modos (claro y oscuro).
- NFR-ECO-015: Todos los elementos interactivos deben tener indicador de foco visible (`focus:ring`).
- NFR-ECO-016: Los formularios deben tener labels asociados explicitamente a los controles (`for/id`).
- NFR-ECO-017: Las imagenes con significado deben tener atributo `alt` descriptivo.
- NFR-ECO-018: Los estados semanticos (error, exito, advertencia) deben comúnicarse con icono + texto + color, no solo con color.

## 9. Restricciones de arquitectura

- ARC-ECO-001: Las integraciónes entre apps deben priorizar APIs y eventos por encima del acceso directo a la base de datos de otra aplicación.
- ARC-ECO-002: Las capacidades de plataforma reutilizables deben residir en paquetes o servicios compartidos con ownership claro.
- ARC-ECO-003: Se deben evitar dependencias circulares entre aplicaciónes y paquetes.
- ARC-ECO-004: Las decisiones de modelos de datos compartidos deben coordinarse con los SRS de componentes compartidos.
- ARC-ECO-005: La arquitectura debe respetar una vision por capas: frontend, application services, core systems y data & infrastructure.

## 10. Restricciones de licencia y contribucion

- LIC-ECO-001: Todo codigo agregado al repositorio debe ser compatible con PolyForm Noncommercial 1.0.0.
- LIC-ECO-002: Todo contenido textual y multimedia agregado debe ser compatible con CC BY-NC 4.0.
- LIC-ECO-003: No se permite incluir codigo de terceros con licencias incompatibles (GPL, AGPL, licencias comerciales restrictivas).
- LIC-ECO-004: Los contribuidores deben mantener avisos de copyright y atribucion requeridos por las licencias del repositorio.
- LIC-ECO-005: Las dependencias externas deben revisarse por compatibilidad de licencia antes de ser anadidas al proyecto.

## 11. Flujos criticos a validar

1. Activación: usuario llega al portal, crea cuenta y usa al menos dos aplicaciónes en 30 dias.
2. Consulta espiritual diaria: acceso desde calendario o biblia hacia oraciones, misal o lectio divina.
3. Participación comunitaria: descubrimiento de evento, suscripcion, notificación y asistencia.
4. Servicio pastoral sensible: solicitud, asignación y seguimiento en Confesiones, Peticionario o Servicio Sacerdotal al Difunto.
5. Monetización confiable: pago o donación con confirmación y comprobante.
6. Resolucion guiada: búsqueda o chatbot conduce al contenido o accion correcta.

## 12. Criterios de aceptación del ecosistema

- CA-ECO-001: Existe SSO operativo y al menos una estrategia documentada de roles base.
- CA-ECO-002: Toda app en produccion reporta logs y metricas al Sistema de Logueo.
- CA-ECO-003: Toda app con notificaciónes usa preferencias y plantillas reutilizables.
- CA-ECO-004: Buscador indexa contenidos elegibles de las apps publicadas.
- CA-ECO-005: Los runbooks de las apps criticas estan definidos antes del go-live.
- CA-ECO-006: Cada aplicación cuenta con su SRS individual y vinculación al PRD correspondiente.
- CA-ECO-007: Todas las apps cumplen la Guia UI/UX Base (modo oscuro/claro, accesibilidad, tokens, iconos).
- CA-ECO-008: Todo material agregado es compatible con las licencias del repositorio (ver `LICENSE`, `NOTICE` y `ATTRIBUTIONS.md`).

## 13. Trazabilidad documental

- Vision y alcance: [[06-PRD Maestro|PRD Maestro]].
- Fases y orden de entrega: [[06-PRD Maestro|PRD Maestro]] (seccion 12).
- Stack y restricciones tecnicas: [[../01-Arquitectura/Stack Tecnologico|Stack Tecnologico]].
- Backlog resumido por producto: [[04-Listado-de-Aplicaciones|Listado de Aplicaciones]].
- Requisitos por aplicación: [[../02-Aplicaciones/00-README|Indice de aplicaciónes]].
- Requisitos reutilizables de plataforma: [[../01-Arquitectura/Capacidades Compartidas/README|Capacidades compartidas]].
- Matriz operativa de trazabilidad entre producto, requisitos, arquitectura y QA: [[10-Matriz-de-Trazabilidad|Matriz de trazabilidad]].
- Guia UI/UX: [[09-Guia-UI-UX-Base|Guia UI-UX Base]].
- Licencias: [[../03-Legal/README|Legal y Licencias]].
