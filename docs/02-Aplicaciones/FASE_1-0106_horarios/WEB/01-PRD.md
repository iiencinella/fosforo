---
tags:
  - proyecto/fosforo
  - horarios
  - prd
  - aplicación
type: app-prd
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0106_horarios

## 1. Ficha

- ID base: `PRD-0106-HORARIOS-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-26
- Estado: vigente

## 2. Problema y oportunidad

- Problema: encontrar horarios de Misa actualizados y confiables suele ser dificil, especialmente fuera de la parroquia habitual o en fechas especiales.
- Oportunidad: una plataforma unica de consulta de celebraciones con filtros por zona, horario y tipo reduce friccion y facilita participacion liturgica.

## 3. Objetivo de negocio

Consolidar 0106 Horarios como servicio web de referencia para consulta de celebraciones liturgicas, aumentando la probabilidad de que cada usuario encuentre una Misa util en pocos pasos y mejorando la calidad/actualizacion del catalogo de templos.

## 4. Segmentos y JTBD

- Segmento principal: fieles catolicos y personas interesadas en participar de la Misa que necesitan encontrar horarios de forma rapida.
- Segmento secundario: viajeros, familias y agentes pastorales que consultan horarios fuera de su zona habitual.
- JTBD principal: "Cuando necesito asistir a una celebracion, quiero encontrar rapidamente un templo y un horario valido cerca mio o en una fecha puntual".

## 5. Alcance MVP

| ID                    | Requisito de producto                                                                      | Prioridad | Justificación                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------- |
| PRD-0106-HORARIOS-001 | Permitir buscar celebraciones por templo, ciudad o cercania geografica.                    | Must      | Es la necesidad principal que la app resuelve para el usuario final.            |
| PRD-0106-HORARIOS-002 | Permitir filtrar por tipo de celebracion y franja horaria.                                 | Must      | Reduce tiempo de decision y mejora precision de resultados.                     |
| PRD-0106-HORARIOS-003 | Mostrar ficha de templo con ubicacion, referencia de contacto y proximas celebraciones.    | Must      | Convierte la busqueda en accion concreta para asistir a celebracion.            |
| PRD-0106-HORARIOS-004 | Señalar estado de actualizacion de horarios por templo (actualizado/no actualizado).       | Must      | Evita desinformacion y da contexto de confianza sobre los datos.                |
| PRD-0106-HORARIOS-005 | Incorporar accesos a contenido liturgico complementario (santoral y evangelio del dia).    | Should    | Aumenta valor pastoral y continuidad de uso sin bloquear el core transaccional. |
| PRD-0106-HORARIOS-006 | Registrar metricas de consultas y resultados para seguimiento operativo y mejora continua. | Must      | Permite medir exito real del producto y priorizar mejoras de cobertura.         |

## 6. No alcance MVP

- Gestion integral parroquial (intenciones, agenda sacramental, caja o pagos).
- Moderacion distribuida en tiempo real por comunidad sin backoffice definido.
- Recomendaciones personalizadas por perfil autenticado en MVP.

## 7. KPI y criterios de exito

- KPI principal: porcentaje de sesiones que encuentran al menos una celebracion valida en menos de 3 interacciones.
- KPI secundario 1: tasa de consultas exitosas sin errores tecnicos.
- KPI secundario 2: porcentaje de templos con horarios actualizados segun ventana operativa definida.

## 8. Riesgos de negocio

| Riesgo                                                                  | Impacto | Mitigación                                                                                     | Owner            |
| ----------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| Datos de horarios desactualizados en templos con alto trafico.          | Alto    | Estado visible por templo, circuito de revision periodica y priorizacion por volumen.          | Producto/Técnico |
| Baja cobertura geografica inicial.                                      | Medio   | Expandir por fases con priorizacion de diocesis/zonas y calendario de carga.                   | Producto         |
| Dependencia de carga manual para parte del catalogo en MVP.             | Medio   | Backoffice simple y metricas de stale data para detectar necesidad de automatizacion.          | Técnico          |
| Picos de trafico en fechas liturgicas relevantes.                       | Medio   | Caching, optimizacion de consultas y monitoreo proactivo en fechas de alta demanda.            | Técnico          |
| Desalineacion entre expectativa del usuario y datos realmente vigentes. | Alto    | Mensajeria transparente en UI sobre nivel de actualizacion y canales de reporte de correccion. | Producto         |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- Flujos derivados: [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md)
