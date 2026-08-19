---
tags:
  - proyecto/fosforo
  - administracion
  - erm
  - aplicacion
type: app-erm
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[06-Esquema de Datos|Esquema de Datos Administracion]]"
---

# ERM - 0107_administracion

## 1. Ficha

- ID base: `ERM-0107-ADMINISTRACION-*`
- Owner operativo: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 2. Registro de riesgos y errores

| ID                          | Riesgo/Error                                                 | Tipo   | Severidad | Mitigacion                                                                              | Owner    |
| --------------------------- | ------------------------------------------------------------ | ------ | --------- | --------------------------------------------------------------------------------------- | -------- |
| ERM-0107-ADMINISTRACION-001 | Iglesia duplicada creada por falta de validacion en frontend | Error  | P2        | Validacion doble (cliente + servidor) con indice unico compuesto name+city              | Tecnico  |
| ERM-0107-ADMINISTRACION-002 | Coordenadas geograficas incorrectas ingresadas manualmente   | Riesgo | P3        | Validacion de rango en formulario + geocodificacion asistida como alternativa           | Producto |
| ERM-0107-ADMINISTRACION-003 | Horarios superpuestos para una misma iglesia y dia           | Error  | P2        | Validacion de cruce de horarios al guardar, con alerta visual y bloqueo                 | Tecnico  |
| ERM-0107-ADMINISTRACION-004 | Usuario no autorizado accede a accion de administracion      | Riesgo | P1        | Control de acceso por rol en cada endpoint y ocultacion de acciones no permitidas en UI | Tecnico  |
| ERM-0107-ADMINISTRACION-005 | Perdida de datos por error en operacion de base de datos     | Riesgo | P1        | Transacciones atomicas en operaciones CRUD, backup diario de Supabase                   | Tecnico  |
| ERM-0107-ADMINISTRACION-006 | Baja adopcion del panel por usabilidad deficiente            | Riesgo | P3        | Pruebas con operadores reales, iteracion por feedback, curva de aprendizaje minima      | Producto |

## 3. Runbooks

- P1: `docs/runbooks/admin-panel/p1-perdida-datos.md`
- P2: `docs/runbooks/admin-panel/p2-duplicados-horarios.md`
- P3: `docs/runbooks/admin-panel/p3-coordenadas-incorrectas.md`

## 4. Continuidad operativa

- RTO objetivo: 4 horas en horario diurno
- RPO objetivo: 24 horas
- Estrategia de rollback: restauracion de backup diario de Supabase + migracion inversa si aplica
