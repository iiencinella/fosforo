---
tags:
  - proyecto/fosforo
  - cancionero
  - prd
  - aplicación
type: doc-app-prd
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-05-28
related:
  - "[[00-README|Cancionero App]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0401_cancionero

## 1. Ficha

- ID base: `PRD-0401-CANCIONERO-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-28
- Estado: vigente

## 2. Problema y oportunidad

- **Problema:** Los coros y ministerios de música no cuentan con una herramienta centralizada para buscar, compartir y validar repertorio litúrgico. Las canciones se distribuyen en PDFs sueltos, grupos de WhatsApp o sitios no especializados, sin control de calidad litúrgica ni coherencia con el tiempo o momento de la misa.
- **Oportunidad:** Crear un cancionero colaborativo con supervisión litúrgica que sirva como fuente común de consulta para comunidades, evitando la dispersión de recursos y garantizando que cada canción sea apropiada para su contexto litúrgico.

## 3. Objetivo de negocio

Proveer una biblioteca de cantos litúrgicos con búsqueda inteligente por tiempo y momento de la celebración, flujo de contribución comunitaria y validación centralizada, que mejore la preparación de las celebraciones y unifique el repertorio entre comunidades.

## 4. Segmentos y JTBD

- **Segmento principal:** Coros y ministerios de música parroquiales.
- **Segmento secundario:** Coordinadores litúrgicos y músicos individuales.
- **JTBD principal:** "Cuando preparo una celebración, quiero encontrar canciones apropiadas para el tiempo litúrgico y el momento de la misa para que el repertorio sea coherente con la liturgia."

## 5. Alcance MVP

| ID                      | Requisito de producto                                    | Prioridad | Justificación                                                 |
| ----------------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| PRD-0401-CANCIONERO-001 | Búsqueda libre por nombre y fragmento de letra           | Must      | Base de cualquier cancionero; sin esto la app no es funcional |
| PRD-0401-CANCIONERO-002 | Filtro por tiempo litúrgico (Adviento, Cuaresma, etc.)   | Must      | Diferenciador clave frente a buscadores genéricos             |
| PRD-0401-CANCIONERO-003 | Selector de Momentos (Tiempo + Momento de Misa)          | Must      | Permite filtrar con precisión litúrgica                       |
| PRD-0401-CANCIONERO-004 | Visualización de letra con acordes                       | Must      | Formato de salida principal para músicos                      |
| PRD-0401-CANCIONERO-005 | Flujo de contribución: músico sube canción con etiquetas | Should    | El crecimiento del catálogo depende de la comunidad           |
| PRD-0401-CANCIONERO-006 | Panel de moderación: aprobar/rechazar/corregir etiquetas | Should    | Sin validación litúrgica pierde valor pastoral                |
| PRD-0401-CANCIONERO-007 | Soporte multiformato: letra+acordes, PDF, YouTube        | Should    | Enriquece el recurso más allá del texto                       |

## 6. No alcance MVP

- Transposición interactiva de tonos.
- Recomendaciones automáticas basadas en la liturgia del día.
- Listas colaborativas y carpetas de ensayo compartidas.
- Modo offline PWA completo.
- Perfiles de usuario con historial y favoritos.

## 7. KPI y criterios de exito

- **KPI principal:** Porcentaje de búsquedas resueltas con éxito en el catálogo interno (target > 80%).
- **KPI secundario 1:** Latencia p95 de búsqueda por tiempo+momento en rangos aceptables (< 500ms).
- **KPI secundario 2:** Tiempo promedio entre contribución y publicación (< 48hs hábiles).

## 8. Riesgos de negocio

| Riesgo                                                   | Impacto | Mitigación                                                                                         | Owner                    |
| -------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| Baja adopción por falta de contenido inicial             | Alto    | Carga inicial de catálogo con canciones de dominio público + alianzas con diócesis                 | Iván Ezequiel Iencinella |
| Calidad litúrgica inconsistente en contribuciones        | Medio   | Flujo de moderación obligatorio antes de publicación; guías de estilo visibles para contribuyentes | Iván Ezequiel Iencinella |
| Dependencia de API de Calendario Litúrgico no disponible | Medio   | Fallback a selección manual de tiempo litúrgico cuando la API no responda                          | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
