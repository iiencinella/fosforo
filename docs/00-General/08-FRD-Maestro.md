---
tags:
  - proyecto/fosforo
  - frd
  - ecosistema
  - transversal
type: frd-maestro
area: ecosistema
status: draft
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[README|Información General]]"
  - "[[06-PRD-Maestro|PRD Maestro]]"
  - "[[07-SRS-Maestro|SRS Maestro]]"
  - "[[../02-Aplicaciones/00-README|Indice de aplicaciónes]]"
  - "[[../03-Legal/README|Legal y Licencias]]"
  - "[[09-Guia-UI-UX-Base|Guia UI-UX Base]]"
---

# FRD Maestro - Ecosistema Fósforo

> [!info] Consolidación funcional transversal
> Este documento consolida los requisitos funcionales compartidos del ecosistema para alinear PRD maestro, FRD por aplicación y SRS maestro.

## 1. Objetivo

Definir las capacidades funcionales transversales que deben comportarse de forma consistente a nivel ecosistema para identidad, datos, descubrimiento, comunicación, observabilidad, operación compartida y experiencia visual unificada.

## 2. Actores transversales

- Usuario final del ecosistema que navega varias aplicaciónes con identidad y preferencias comúnes.
- Coordinador, sacerdote o administrador que ejecuta acciones de gestion con permisos diferenciados.
- Operador de plataforma que monitorea disponibilidad, seguridad, soporte e incidentes.
- Aplicaciones y servicios compartidos que intercambian datos, eventos y senales operativas.
- Contribuidores comúnitarios que colaboran con codigo, contenido o diseno bajo las licencias del repositorio.

## 3. Requisitos Funcionales Transversales MVP

- FR-ECO-01. El ecosistema debe ofrecer identidad compartida y cuenta unica para las aplicaciónes que requieran autenticación persistente.
- FR-ECO-02. El ecosistema debe soportar roles base reutilizables y evolucionables por aplicación.
- FR-ECO-03. El ecosistema debe mantener preferencias, consentimientos y perfil unificado por usuario.
- FR-ECO-04. El ecosistema debe reutilizar taxonomias comúnes para entidades, ubicaciónes, tiempos liturgicos y tipos de contenido.
- FR-ECO-05. El ecosistema debe conservar identificadores consistentes para entidades compartidas entre aplicaciónes.
- FR-ECO-06. El ecosistema debe disponer de contratos versionados para datos y eventos cross-app.
- FR-ECO-07. El ecosistema debe ofrecer notificaciónes multi-canal con trazabilidad de entrega y preferencias por usuario.
- FR-ECO-08. El ecosistema debe ofrecer portal y navegación de entrada para descubrimiento cross-app.
- FR-ECO-09. El ecosistema debe ofrecer búsqueda unificada sobre contenido y entidades indexables.
- FR-ECO-10. El ecosistema debe permitir derivación guiada entre buscador, chatbot y aplicaciónes de destino.
- FR-ECO-11. El ecosistema debe integrar logs, metricas y auditoria minima de todas las aplicaciónes publicadas.
- FR-ECO-12. El ecosistema debe contar con soporte operativo minimo mediante alertas, runbooks y responsables definidos.
- FR-ECO-13. El ecosistema debe ofrecer experiencia visual consistente: modo oscuro y claro, tokens de diseno compartidos, iconos SVG coherentes y navegación reconocible entre aplicaciónes.
- FR-ECO-14. El ecosistema debe cumplir accesibilidad WCAG 2.1 AA en interfaces principales (contraste, foco visible, navegación por teclado, labels en formularios).
- FR-ECO-15. El ecosistema debe respetar las licencias del repositorio: codigo bajo PolyForm Noncommercial 1.0.0, contenido bajo CC BY-NC 4.0.

## 4. Reglas de Negocio Transversales

- RB-ECO-01. Ninguna aplicación critica debe operar como silo en identidad, observabilidad o taxonomias compartidas.
- RB-ECO-02. Toda integración entre aplicaciónes debe usar contratos explicitos y ownership definido.
- RB-ECO-03. Las operaciónes sensibles deben ser auditables de extremo a extremo.
- RB-ECO-04. Las preferencias y consentimientos del usuario deben respetarse en cualquier canal o aplicación conectada.
- RB-ECO-05. La degradación ante fallos de dependencias no criticas debe ser controlada y visible para operación.
- RB-ECO-06. Todo material agregado al repositorio debe ser compatible con las licencias vigentes (PolyForm Noncommercial para codigo, CC BY-NC para contenido).
- RB-ECO-07. No se permite uso comercial del material del repositorio sin autorización escrita del titular.
- RB-ECO-08. Las interfaces deben seguir la Guia UI/UX Base para mantener coherencia visual y de experiencia entre aplicaciónes.
- RB-ECO-09. Los estados semanticos (error, exito, advertencia, info) deben comúnicarse con icono + texto + color, nunca solo con color.

## 5. Integraciónes y Dependencias Compartidas

- CMS y Motor Liturgico como fuentes compartidas para contenido estructurado y resolucion liturgica.
- Servicios de aplicación como capa de orquestación entre frontend, core systems e infraestructura.
- Sistema de Logueo como capa de observabilidad y auditoria.
- Fósforo Portal como punto de entrada y descubrimiento del ecosistema.
- Buscador como capacidad de indexación y recuperación transversal.
- Newsletter como orquestador de comúnicaciónes multi-canal.
- Calendario Liturgico y Biblia como fuentes funcionales base para multiples aplicaciónes.
- Servicios de pagos y notificaciónes como capacidades reutilizables para aplicaciónes de servicio.

### 5.1 Ejemplo de composicion funcional

Caso `Espiritualidad diaria`:

1. El frontend solicita contenido al `LiturgicalService`.
2. `LiturgicalService` consulta el Motor Liturgico para resolver el estado del día.
3. `LiturgicalService` consulta el CMS para recuperar lectura, oración y santo asociado.
4. El servicio devuelve una respuesta compuesta al cliente.

Este patron funcional debe preferirse frente al acceso directo del frontend a tablas o fuentes heterogeneas.

## 6. UI/UX Transversal

### 6.1 Design system

- Tokens de color, tipografia y espaciado compartidos en `src/packages/tailwind-config`.
- Componentes reutilizables en `src/packages/ui`.
- Guia de referencia: `docs/00-General/09-Guia-UI-UX-Base.md`.

### 6.2 Temas

- Modo oscuro: fondo carbon `#0F1115`, texto claro `#F1F0EB`, enfasis ambar `#D4A843`.
- Modo claro: fondo blanco `#FFFFFF`, texto oscuro `#0F172A`, enfasis azul liturgico `#1D5FA6`.
- Respetar preferencia del sistema o del usuario.

### 6.3 Iconografia

- Set unico: Lucide Icons (SVG, outline, 24x24px base).
- Prohibido usar emojis como iconos de interfaz.

### 6.4 Estados de interfaz

| Estado   | Patron requerido                             |
| -------- | -------------------------------------------- |
| Cargando | Skeleton con `animate-pulse`                 |
| Vacio    | Icono SVG + mensaje + accion sugerida        |
| Error    | Icono error + descripcion + boton reintentar |
| Exito    | Icono check + confirmación breve             |

### 6.5 Accesibilidad minima

- Contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande).
- Foco visible en todos los elementos interactivos.
- Areas tactiles >= 44x44px.
- Labels asociados a controles de formulario.
- Respetar `prefers-reduced-motion`.

## 7. Evolucion Post-MVP

- Permisos finos por dominio o aplicación.
- Contratos de eventos mas ricos para automatizaciónes cross-app.
- Recomendaciónes y personalización por perfil y uso.
- Observabilidad avanzada con correlación distribuida y analitica operativa.
- Internaciónalización completa multi-idioma y multi-region.
- Componentes avanzados de design system (charts, tablas complejas, drag-and-drop).

## 8. Criterios de Aceptación de Alto Nivel

- CA-ECO-01. Las aplicaciónes publicadas reutilizan identidad, observabilidad y navegación compartida cuando aplica.
- CA-ECO-02. Existen contratos documentados para las integraciónes transversales criticas.
- CA-ECO-03. La operación puede auditar eventos sensibles y detectar degradaciónes relevantes del ecosistema.
- CA-ECO-04. Los FRD y SRS por aplicación trazan explicitamente su relación con el PRD y los requisitos transversales.
- CA-ECO-05. Todas las apps implementan modo oscuro y claro conforme a la Guia UI/UX Base.
- CA-ECO-06. Las interfaces cumplen WCAG AA en flujos criticos.
- CA-ECO-07. Todo material agregado es compatible con las licencias del repositorio.

## 9. Trazabilidad PRD -> FRD -> SRS

- PRD fuente: [[06-PRD-Maestro|PRD Maestro]].
- SRS derivado: [[07-SRS-Maestro|SRS Maestro]].
- FRD por aplicación: [[../02-Aplicaciones/00-README|Indice de aplicaciónes]].
- SRS por aplicación: [[../02-Aplicaciones/00-README|Indice de aplicaciónes]].
- Guia UI/UX: [[09-Guia-UI-UX-Base|Guia UI-UX Base]].
- Licencias: [[../03-Legal/README|Legal y Licencias]].

| Origen PRD                                          | Derivación FRD                                        | Resultado SRS                                         |
| --------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| Requisitos funcionales transversales del ecosistema | FR-ECO-01 a FR-ECO-15                                 | FR-ECO-001 a FR-ECO-023 del SRS maestro               |
| Dependencias estrategicas y flujos criticos         | Reglas de negocio e integraciónes compartidas         | Requisitos de integración y operación del SRS maestro |
| Objetivos de calidad y operación                    | Criterios de aceptación y restricciones transversales | NFR, ARC, LIC y criterios del SRS maestro             |
| UI/UX compartida y accesibilidad                    | FR-ECO-13 a FR-ECO-15, seccion UI/UX transversal      | NFR-ECO-014 a NFR-ECO-018 del SRS maestro             |
