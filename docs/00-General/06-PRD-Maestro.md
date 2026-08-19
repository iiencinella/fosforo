---
tags:
  - proyecto/fosforo
  - prd
  - producto
  - ecosistema
type: prd-maestro
area: ecosistema
status: draft
created: 2025-12-26
updated: 2026-04-04
related:
  - "[[../README|Indice de documentación]]"
  - "[[../01-Arquitectura/Stack Tecnologico|Stack Tecnologico]]"
  - "[[10-Matriz-de-Trazabilidad|Matriz de Trazabilidad]]"
  - "[[04-Listado-de-Aplicaciones|Listado de Aplicaciones]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
  - "[[../03-Legal/README|Legal y Licencias]]"
---

# PRD Maestro - Ecosistema Fósforo

> [!info] Documento rector de producto
> Este PRD maestro define el marco estratégico, operativo y técnico del ecosistema Fósforo. Los PRDs individuales de cada aplicación detallan alcance específico, MVP y evolución por producto.

## 1. Resumen Ejecutivo

Fósforo es un ecosistema digital católico compuesto por aplicaciónes web, movil, escritorio y APIs, diseñado para unificar evangelización, formación, vida comunitaria, servicios pastorales y gestión operativa bajo una identidad de producto común.

El objetivo no es publicar aplicaciónes aisladas, sino construir una plataforma coherente con cuenta única, datos compartidos, experiencias conectadas y una operación sostenible. Este documento existe para alinear producto, diseño, desarrollo, QA, DevOps y operación pastoral bajo un mismo marco de priorización, calidad y release.

## 2. Problema y Oportunidad

Hoy la vida comunitaria y pastoral suele apoyarse en herramientas dispersas, procesos manuales y contenidos desconectados. Eso genera:

- Fragmentación de la experiencia del usuario entre contenido, eventos, formación y servicios.
- Baja trazabilidad de interacciones pastorales y procesos administrativos.
- Coste operativo alto para parroquias, movimientos y coordinadores.
- Dificultad para escalar comunicación, formación y seguimiento.
- Ausencia de una capa de datos compartida que permita inteligencia operativa y mejores experiencias.

La oportunidad de Fósforo es crear un ecosistema unificado que permita descubrir contenido, participar en comúnidad, realizar tramites y acceder a servicios religiosos desde una experiencia consistente, simple y medible.

## 3. Vision de Producto

Fósforo debe convertirse en la puerta de entrada digital para la vida catolica cotidiana: un entorno donde un usuario pueda orar, formarse, descubrir su comúnidad, participar en eventos, realizar gestiones y recibir acompanamiento sin cambiar de identidad ni perder continuidad de contexto.

### 3.1 Principios de Producto

- Un ecosistema antes que un conjunto de apps sueltas.
- MVP estricto por aplicación, integración progresiva a nivel ecosistema.
- UX simple para usuarios no técnicos y contextos parroquiales reales.
- Contenido confiable, moderado y trazable.
- Seguridad, privacidad y observabilidad desde fase temprana.
- Diseño reusable con componentes, taxonomías y patrones compartidos.
- **Soporte multi-idioma**: el ecosistema está diseñado para ofrecer interfaz y contenido en varios idiomas (español prioritario en MVP; expansión progresiva a inglés, portugués y otros).
- **Licencia no comercial**: el código está disponible para colaboración comunitaria con reconocimiento de autoría, pero no se permite uso comercial sin autorización escrita del titular.

## 4. Objetivos y No Objetivos

### 4.1 Objetivos

1. Unificar acceso a contenido, comúnidad, formación y servicios en un ecosistema integrado.
2. Habilitar crecimiento sostenible por fases con entregas incrementales y medibles.
3. Garantizar calidad operativa mediante seguridad, observabilidad, privacidad y procesos de release claros.
4. Asegurar adopción real en parroquias y movimientos con valor tangible desde los primeros MVPs.
5. Sentar una base reutilizable para identidad, notificaciónes, búsqueda, pagos, auditoría y contenido compartido.

### 4.2 No Objetivos

- Lanzar todas las aplicaciónes en paralelo.
- Resolver personalización avanzada basada en IA en las primeras fases.
- Implementar modo offline completo para todas las aplicaciónes desde MVP.
- Integrar sistemas externos complejos de diócesis, ERP o CRMs en la primera etapa.
- Optimizar monetización avanzada antes de validar adopción y flujos principales.
- Autorizar uso comercial del código o contenido sin licencia separada.

## 5. Segmentos de Usuario y Jobs To Be Done

### 5.1 Segmentos Principales

- Fieles católicos.
- Sacerdotes y religiosos.
- Coordinadores laicos y líderes de ministerios.
- Buscadores e interesados en la fe.
- Evangelizadores digitales.
- Operadores pastorales y administrativos.
- Contribuidores comúnitarios (desarrolladores, diseñadores, traductores, creadores de contenido).

### 5.2 Jobs To Be Done Transversales

- Como fiel, quiero encontrar contenido, horarios y recursos espirituales confiables en pocos pasos.
- Como coordinador, quiero comúnicar, organizar eventos y dar seguimiento sin depender de múltiples herramientas dispersas.
- Como sacerdote o agente pastoral, quiero responder necesidades concretas de la comúnidad con trazabilidad y menor fricción operativa.
- Como buscador, quiero descubrir contenido y respuestas claras sin conocer previamente la estructura de la Iglesia.
- Como operador del ecosistema, quiero medir uso, incidentes y calidad para priorizar mejor el roadmap.
- Como contribuidor, quiero colaborar con el proyecto con reconocimiento de mi autoria y sin fines comerciales.

## 6. Alcance del Ecosistema

### 6.1 Alcance Incluido

- Aplicaciones organizadas en 5 dominios funcionales.
- Plataformas objetivo: Web, móvil, escritorio y APIs públicas/privadas.
- **Soporte para varios idiomas**: interfaz y contenido traducibles; español como idioma por defecto en MVP, con arquitectura y procesos que permitan añadir idiomas de forma progresiva.
- Infraestructura base compartida: identidad, logging, notificaciónes, búsqueda, calendario litúrgico y taxonomías comúnes.
- PRDs individuales por aplicación con MVP, dependencias y KPI principal.
- **Licencia dual**: código bajo PolyForm Noncommercial 1.0.0, contenido bajo CC BY-NC 4.0.

### 6.2 Dominios Funcionales

| Dominio             | Aplicaciones                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Contenido religioso | Biblia, Calendario Litúrgico, Santopedia, Oraciones, Misal, Lectio Divina, Meditvoz, Cancionero                                   |
| Vida comunitaria    | Agenda Comunitaria, Carisma, Historia de mi Iglesia, Confesiones, Horarios de Misas, Peticionario, Servicio Sacerdotal al Difunto |
| Formación           | Formación, Motus                                                                                                                  |
| Servicios           | Emprendedor, Donaciónes, Newsletter, Sistema de Logueo, Servicio Sacerdotal al Difunto                                            |
| Herramientas        | Buscador, Chatbot, Fósforo Portal, Vida de Misionero, Visita a 7 Iglesias, Calendario de Adviento, Calendario de Cuaresma         |

### 6.3 Inventario Oficial de Aplicaciones

1. Biblia
2. Calendario Litúrgico
3. Santopedia
4. Oraciones
5. Misal
6. Lectio Divina
7. Meditvoz
8. Cancionero
9. Agenda Comunitaria
10. Carisma
11. Historia de mi Iglesia
12. Confesiones
13. Horarios de Misas
14. Peticionario
15. Formación
16. Motus
17. Emprendedor
18. Donaciónes
19. Newsletter
20. Sistema de Logueo
21. Servicio Sacerdotal al Difunto
22. Buscador
23. Chatbot
24. Fósforo Portal
25. Vida de Misionero
26. Visita a 7 Iglesias
27. Calendario de Adviento
28. Calendario de Cuaresma

> [!warning] Nota de consistencia
> El inventario oficial de aplicaciónes puede variar con el correr del tiempo. Las apps se agregan o retiran según prioridad pastoral y viabilidad técnica.

### 6.4 Fuera de Alcance del MVP Ecosistema

- Personalización algorítmica avanzada cross-app.
- Marketplaces multi-vendedor complejos con logística avanzada desde el primer release.
- Integraciónes institucionales profundas sin contratos y ownership definidos.
- Internaciónalización completa multi-país en fase inicial.
- Uso comercial del código o contenido sin autorización escrita.

## 7. Flujos Criticos del Ecosistema

Los siguientes journeys deben tratarse como prioritarios porque validan valor ecosistémico, no solo funcionalidad aislada:

1. Descubrimiento y activación: usuario llega a Fósforo Portal, crea cuenta, completa onboarding y usa al menos 2 aplicaciónes en 30 dias.
2. Consulta espiritual diaria: usuario entra por Calendario Liturgico o Biblia y continua hacia Oraciones, Misal o Lectio Divina.
3. Participación comunitaria: usuario descubre un evento, se suscribe, recibe notificaciónes y concreta asistencia.
4. Servicio pastoral sensible: usuario solicita ayuda o coordinación en Confesiones, Peticionario o Servicio Sacerdotal al Difunto y recibe respuesta trazable.
5. Monetización confiable: usuario dona o paga una intencion/compra con experiencia segura, confirmación inmediata y comprobante.
6. Resolucion guiada: usuario busca contenido en Buscador o Chatbot y llega a una respuesta util sin navegar multiples apps manualmente.

## 8. Requisitos Funcionales Transversales

### 8.1 Identidad y Acceso

- SSO y perfil unificado para todo el ecosistema.
- Gestion de roles base: admin, sacerdote, coordinador, usuario.
- Capacidad de evolucionar a permisos mas finos por aplicación sin romper la identidad compartida.
- Auditoria de accesos a operaciónes sensibles.

### 8.2 Datos Compartidos

- Taxonomia común de iglesias, diocesis, ubicaciónes, eventos, contenido y personas relevantes.
- Identificadores consistentes para entidades compartidas entre aplicaciónes.
- Contratos de datos versionados para integraciónes entre apps y APIs.

### 8.3 Comunicación y Notificaciónes

- Sistema de notificaciónes multi-canal: email, SMS y push.
- Preferencias de comunicación por usuario.
- Plantillas reutilizables y trazabilidad de entregas.

### 8.4 Búsqueda, Descubrimiento e IA

- Buscador global sobre contenido y entidades indexables.
- Estrategia de integración progresiva entre buscador y chatbot.
- Senales de relevancia, filtros y resultados por tipo de entidad.

### 8.5 Operación y Soporte

- Sistema central de logs, metricas y auditoria.
- Gestion de incidentes con severidad, responsables y runbooks.
- Telemetria minima obligatoria para todas las apps del ecosistema.

### 8.6 UI/UX Compartida

- Todas las apps deben respetar la Guia UI/UX Base (`docs/00-General/09-Guia-UI-UX-Base.md`).
- Design system común con tokens de color, tipografia, espaciado y componentes.
- Modo oscuro y modo claro obligatorios con paleta definida.
- Accesibilidad WCAG 2.1 AA en interfaces principales.
- Iconos SVG consistentes (Lucide Icons), sin emojis como iconos de interfaz.
- Navegación reconocible del ecosistema al cambiar entre aplicaciónes.

## 9. Requisitos No Funcionales

### 9.1 Disponibilidad y Rendimiento

- Disponibilidad objetivo: 99.5% en MVP y 99.9% post-MVP para aplicaciónes criticas.
- Latencia p95 API menor a 300 ms en endpoints de lectura frecuentes.
- Carga inicial menor a 3 segundos en flujos principales sobre red movil razonable.
- Degradación controlada ante dependencias no criticas caidas.

### 9.2 Seguridad y Privacidad

- RLS y control de acceso por rol cuando aplique.
- Cifrado en transito y proteccion de secretos.
- Validación de entradas, rate limiting y hardening basico de APIs.
- Minimización de datos, consentimiento explicito y trazabilidad de accesos sensibles.
- Threat modeling por fase para apps criticas o con pagos/datos sensibles.

### 9.3 Accesibilidad y Calidad

- WCAG 2.1 AA en interfaces principales.
- Compatibilidad aceptable con lectores de pantalla y navegación por teclado en flujos criticos.
- Logs estructurados, metricas por SLO y alertas accionables.
- Smoke E2E obligatorio en los flujos mas sensibles por fase.

### 9.4 Continuidad Operativa

- Runbook por aplicación antes de salida a produccion.
- RTO inicial objetivo: menos de 4 horas para apps criticas.
- RPO inicial objetivo: menos de 1 hora para datos criticos con respaldo y restauración probados.

## 10. Arquitectura de Producto

- Monorepo: Turborepo + pnpm.
- Frontend web: Astro + React + Tailwind + TypeScript.
- Movil: React Native + Expo.
- Escritorio: Electron.
- Backend y data: Astro API + Supabase (PostgreSQL, Auth, Storage, Realtime).
- CI/CD: GitHub Actions.

### 10.1 Vision por capas

Fósforo debe operar como plataforma con multiples clientes y no como conjunto de apps aisladas.

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

### 10.2 Core Systems del ecosistema

Los modulos nucleares que deben priorizarse como plataforma son:

- CMS o Sistema de Contenidos para lecturas biblicas, santos, oraciones, canciones y eventos liturgicos.
- Motor liturgico para determinar lecturas, santo, color, tiempo liturgico y oraciones sugeridas del día.
- Gestion de usuarios para autenticación, roles, perfil espiritual y preferencias.
- Sistema de notificaciónes para push, email e in-app disparado por eventos liturgicos o comúnitarios.
- Panel de administración para CRUD operativo del ecosistema.

### 10.3 Application Services

La capa intermedia debe encapsular la logica de negocio y evitar acceso directo de las apps a la base de datos.

Ejemplos esperados:

- `LiturgicalService`
- `UserService`
- `ContentService`
- `NotificationService`

### 10.4 Decisiones Arquitectonicas de Producto

- Priorizar componentes compartidos, contratos claros y paquetes reutilizables.
- Evitar dependencias circulares entre aplicaciónes.
- Disenar integraciónes por APIs y eventos antes que por acoplamiento directo de base de datos.
- Tratar búsqueda, identidad, logging y notificaciónes como capacidades de plataforma, no como features aislados.

## 11. Dependencias Estrategicas

### 11.1 Plataforma obligatoria

- CMS.
- Motor liturgico.
- Gestion de usuarios.
- Sistema de notificaciónes.
- Panel de administración.

### 11.2 Foundation

- Sistema de Logueo.
- Fósforo Portal.
- Calendario Liturgico.
- Biblia.

### 11.3 Servicios Transversales

- Newsletter como capa de notificaciónes multi-canal.
- Donaciónes y Emprendedor como base de pagos y cobros reutilizables.
- Buscador como capa de descubrimiento compartida.
- Chatbot como consumidor de indexación y conocimiento estructurado.

### 11.4 Dependencias Relevantes entre Apps y Plataforma

- Calendario Liturgico alimenta Biblia, Santopedia, Oraciones, Misal, Cancionero y Lectio Divina.
- Biblia alimenta Lectio Divina y Formación.
- CMS alimenta Biblia, Misal, Santopedia, Cancionero y Espiritualidad diaria.
- Motor liturgico alimenta Calendario Liturgico, Misal y Espiritualidad diaria.
- Horarios de Misas alimenta Confesiones y flujos pastorales relaciónados.
- Vida de Misionero funciona como capa editorial transversal para amplificar contenido, testimonios y CTAs hacia Portal, Formación, Motus, Donaciónes y lanzamientos del ecosistema.
- Buscador y Chatbot dependen de indexación y calidad editorial del contenido base.

## 12. Plan de Entrega por Fases

El plan de ejecucion debe respetar dependencias tecnicas, carga operativa y validación de mercado. Cada fase debe cerrar con aplicaciónes usables, observables y con metricas activas.

| Fase                         | Objetivo                                                                                                      | Aplicaciones                                                                                                                                                                                             | Criterio de salida                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Fase 1 - Nucleo funcional    | Construir la plataforma base y las apps iniciales que validan identidad, liturgia, contenido y observabilidad | Fósforo Portal, Biblia, Calendario Liturgico, Horarios de Misas, Espiritualidad diaria, Sistema de Logueo, Gestion de Usuarios, Panel de Administración, Sistema de Notificaciónes, CMS, Motor liturgico | Plataforma base operativa, observabilidad minima y clientes iniciales funcionando sobre capacidades compartidas |
| Fase 2 - Core de contenido   | Consolidar contenido religioso, experiencias guiadas y producto editorial conectado a la plataforma           | Misal, Santopedia, Vida de Misionero, Visita 7 Iglesias                                                                                                                                                  | Contenido central reusable, dependencias de plataforma estabilizadas y experiencias conectadas acumuladas       |
| Fase 3 - Comunidad           | Digitalizar comúnidad, memoria institucional y servicios pastorales                                           | Agenda Comunitaria, Carisma, Historia de mi Iglesia, Servicios Pastorales, Newsletter                                                                                                                    | Flujos comúnitarios y comúnicaciónes operando sobre notificaciónes y usuarios compartidos                       |
| Fase 4 - Servicios avanzados | Agregar musica, pagos, descubrimiento e IA apoyados en la plataforma                                          | Cancionero, Donaciónes, Buscador, Chatbot                                                                                                                                                                | Descubrimiento unificado, pagos funcionales y capacidades de IA acotadas sobre contenido estructurado           |
| Fase 5 - Expansion e IA      | Escalar formación, audio, expansion editorial y productos de IA                                               | Biblioteca Vaticano, Meditvoz, Formación, Motus, Emprendedor, Bibliotecario IA, Calendarios especiales                                                                                                   | Plataforma extendida con nuevos clientes y capacidades de expansion sostenibles                                 |

### 12.1 Estado Actual

- Estado documental: ecosistema planificado y PRDs individuales disponibles.
- Estado operativo esperado: inicio por Fase 1 con foco en MVPs y componentes compartidos.
- Regla de ejecucion: no abrir una nueva fase sin criterios de salida cumplidos o una excepcion aprobada explicitamente.

## 13. KPIs de Ecosistema

### 13.1 KPIs Principales

- Activación: porcentaje de usuarios que completan onboarding y usan 2 o mas apps en 30 dias.
- Retencion mensual por segmento.
- MAU por app y MAU consolidado del ecosistema.
- Conversion en flujos clave: donaciónes, inscripcion a eventos, cursos, peticiones.
- Tiempo medio de resolucion de incidentes (MTTR).
- Cobertura de tests y defect leakage por release.
- Exito de búsqueda y tasa de resolucion asistida en Chatbot.

### 13.2 Metas Iniciales de Referencia

| Metrica                                          | Meta inicial                       |
| ------------------------------------------------ | ---------------------------------- |
| Activación 30 dias                               | >= 25%                             |
| Uso multiapp en usuarios activos                 | >= 35%                             |
| Retencion mensual en segmentos core              | >= 30%                             |
| Conversion en donaciónes iniciadas a completadas | >= 60%                             |
| MTTR incidentes P1                               | < 60 min                           |
| Cobertura minima en apps criticas                | >= 70% unit/integration combinadas |
| Search success rate                              | >= 70%                             |

Estas metas son iniciales y deben recalibrarse con datos reales tras cada fase.

## 14. Riesgos y Mitigaciónes

- Riesgo de sobrealcance: imponer MVP estricto por app, feature flags y control de WIP por fase.
- Riesgo de integración prematura: contratos API versionados y pruebas de contrato antes de integrar apps dependientes.
- Riesgo de calidad de contenido: gobernanza editorial, ownership por dominio y workflows de moderación.
- Riesgo de seguridad y compliance: revisiones de seguridad por fase y threat modeling en apps criticas o con pagos.
- Riesgo de operación debil: runbooks, tableros y alertas desde Fase 1.
- Riesgo de baja adopcion: medir activación real, validar journeys prioritarios y reducir friccion de onboarding.
- Riesgo de inconsistencia documental: mantener este PRD como fuente maestra y alinear roadmap, backlog y PRDs derivados.
- Riesgo de uso comercial no autorizado: licencia PolyForm Noncommercial + CC BY-NC con monitoreo y proceso de autorización comercial separada.

## 15. Gobernanza de Producto

- Cadencia quincenal de planning y review.
- Backlog unico priorizado por impacto pastoral, valor al usuario, dependencia tecnica y factibilidad.
- RFC liviano para decisiones de arquitectura compartida.
- Responsable claro por cada aplicación y por cada capacidad transversal.
- Revision mensual de KPIs ecosistema, riesgos, deuda y readiness de la siguiente fase.

### 15.1 Criterios de Entrada a Desarrollo

- PRD aprobado.
- Dependencias identificadas.
- KPI principal definido.
- Riesgos relevantes documentados.
- Diseno tecnico y ownership claros.
- Compatibilidad con licencia del repositorio verificada.

### 15.2 Criterios de Salida a Produccion

- QA aprobado.
- Observabilidad activa.
- Runbook disponible.
- Seguridad basica validada.
- Soporte operativo asignado.
- UI/UX conforme a la Guia UI/UX Base.

## 16. Definicion de Hecho Global

- Requisitos funcionales MVP implementados y validados.
- Pruebas unitarias, integración y smoke E2E en el flujo critico correspondiente.
- Documentación tecnica y funcional actualizada.
- Telemetria, dashboards y alertas configuradas.
- Seguridad basica validada: authn, authz, validaciónes, rate limiting y auditoria donde aplique.
- Rollback o plan de contingencia definido para releases relevantes.
- UI/UX conforme a la Guia UI/UX Base (modo oscuro/claro, accesibilidad, tokens, iconos).
- Licencia y atribucion verificadas en todo material agregado.

## 17. Entregables de este Paquete

- PRD maestro: `docs/00-General/06-PRD-Maestro.md`
- SRS maestro: `docs/00-General/07-SRS-Maestro.md`
- FRD maestro: `docs/00-General/08-FRD-Maestro.md`
- Guia UI/UX Base: `docs/00-General/09-Guia-UI-UX-Base.md`
- Matriz de trazabilidad: `docs/00-General/10-Matriz-de-Trazabilidad.md`
- Indice de aplicaciónes: `docs/02-Aplicaciones/00-README.md`
- Documentación por aplicación: `docs/02-Aplicaciones/[App]/`
- Legal y licencias: `docs/03-Legal/`

## 18. Mantenimiento del Documento

Este PRD maestro debe actualizarse cuando ocurra alguno de estos eventos:

- Cambio de alcance del ecosistema.
- Repriorización de fases o dependencias.
- Cambio relevante en stack, SLOs o capacidades transversales.
- Incorporación o retiro de aplicaciónes del inventario oficial.
- Ajuste de KPIs marco tras evidencia de uso real.
- Cambios en esquema de licencias o politica de contribuciones.
- Actualizaciónes significativas de la Guia UI/UX Base.
