---
tags:
  - proyecto/fosforo
  - cancionero
  - erm
  - aplicación
type: doc-app-erm
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-05-28
related:
  - "[[00-README|Cancionero App]]"
---

# ERM - 0401_cancionero

## 1. Ficha

- ID base: `ERM-0401-CANCIONERO-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-28

## 2. Registro de riesgos y errores

| ID                      | Riesgo/Error                                       | Tipo   | Severidad | Mitigación                                                                                           | Owner                    |
| ----------------------- | -------------------------------------------------- | ------ | --------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-0401-CANCIONERO-001 | API de Calendario Litúrgico no disponible          | Riesgo | P2        | Fallback a selector manual de tiempo con datos locales en Supabase                                   | Iván Ezequiel Iencinella |
| ERM-0401-CANCIONERO-002 | Contenido inapropiado en contribuciones            | Riesgo | P1        | Flujo de moderación obligatorio; todo contenido requiere aprobación antes de publicación             | Iván Ezequiel Iencinella |
| ERM-0401-CANCIONERO-003 | Duplicación de canciones en el catálogo            | Riesgo | P3        | Validación de título duplicado al contribuir; el administrador puede rechazar con motivo "duplicado" | Iván Ezequiel Iencinella |
| ERM-0401-CANCIONERO-004 | Error en parseo de acordes en letra                | Error  | P3        | Validación de formato al contribuir; fallback a mostrar solo letra si el formato no es válido        | Iván Ezequiel Iencinella |
| ERM-0401-CANCIONERO-005 | Etiquetas litúrgicas incorrectas en contribuciones | Riesgo | P2        | El administrador puede corregir etiquetas antes de publicar; auditoría registra cambios              | Iván Ezequiel Iencinella |

## 3. Runbooks

- **P1: Contenido inapropiado.** El administrador recibe notificación de nueva contribución pendiente. Revisa el recurso, si es inapropiado lo rechaza con motivo. El contribuyente recibe notificación del rechazo. Si hay contenido ya publicado inapropiado, el administrador puede cambiar el estado a "rechazado" desde el panel.
- **P2: API de Calendario Litúrgico caída.** El sistema detecta timeout en la consulta a la API. Activa automáticamente el modo fallback con selector manual. El equipo técnico investiga la causa mientras la app sigue funcionando con datos locales.
- **P3: Duplicación de canciones.** El contribuyente recibe una advertencia al enviar si el título coincide con una canción existente. Si se publica un duplicado, el administrador lo rechaza con motivo "duplicado".

## 4. Continuidad operativa

- **RTO objetivo:** 4 horas para incidencias P1; 24 horas para P2; 72 horas para P3.
- **RPO objetivo:** 1 día (pérdida máxima de datos aceptable de 1 día en contribuciones y moderación).
- **Estrategia de rollback:** Revertir deploy en Vercel a versión anterior; restaurar datos desde backup diario de Supabase si fuera necesario.
