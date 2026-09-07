---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-arquitectura
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Flujos y Secuencias — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Flujo principal: hoy → sesión → diario

```mermaid
flowchart TD
    A[Usuario entra a /hoy] --> B{¿Lecturas del\\nMotor disponibles?}
    B -- Sí --> C[Muestra fecha litúrgica\\ny lecturas del día]
    B -- No --> C2[Banner CR-2 +\\nfallback lectura manual]
    C --> D[CTA: Comenzar Lectio Divina]
    C2 --> D
    D --> E{¿Autenticado?}
    E -- No --> F[Modo lectura:\\nguía sin guardado\\no login con returnTo]
    E -- Sí --> G[Crea/retoma sesión\\nunique user_id+fecha]
    G --> H[Paso 1: lectio\\nlectura + guía + textarea]
    H --> I[Paso 2: meditatio]
    I --> J[Paso 3: oratio]
    J --> K[Paso 4: contemplatio]
    K --> L[Paso 5: actio]
    H & I & J & K & L -.autoguardado 2s.-> DB[(entries\\nRLS por user_id)]
    L --> M[Sesión completada\\n+ dirigir a /diario]
    M --> N[Historial + streak\\nactualizado]
```

Puntos clave:

- **Idempotencia:** "Comenzar" el mismo día retoma la sesión (`unique(user_id, fecha)`, RB-LECTIO-003).
- **Autoguardado por paso:** debounce 2 s → PUT `/api/diario/{paso}`; nunca se pierde el texto al recargar (ADR-LECTIO-003).
- **Privacidad visible:** indicador "Solo tú puedes leer esto" cerca del campo y del diario.

## 2. Flujos secundarios

### 2.1 Historial de práctica

```mermaid
flowchart LR
    A[/diario] --> B[GET sessions del user\\n Orden por fecha desc]
    B --> C[Calendario/lista + streak\\n con tz_offset del usuario]
    C --> D{¿Sesión de ese día?}
    D -- Sí --> E[Ver entradas en\\nmodo lectura / editar]
    D -- No --> F[CTA: orar ese día\\n→ /hoy]
```

### 2.2 Recordatorio de práctica (opt-in)

```mermaid
flowchart LR
    A[Preferencias] -->|opt-in| B[PUT preferences\\nrecordatorio + hora local + tz]
    B --> C[Sistema de Notificaciones\\nagenda envío diario]
    C --> D[Notificación con\\nenlace profundo /hoy]
    D --> E[Usuario ora]
    E --> F[streak crece]
    A -->|opt-out| G[Baja de agenda\\n< 24 h efectivas]
```

### 2.3 Exportación del diario

```mermaid
flowchart LR
    A[GET /api/diario/export\\nauth=dueño] --> B[Servidor: solo filas\\nuser_id = auth.uid]
    B --> C[Generar Markdown/JSON\\nen memoria, sin persistir]
    C --> D[Respuesta descargable\\nlog sin contenido]
```

## 3. Secuencias de sistema

### 3.1 Sesión guiada: Motor lecturas + pasos + autoguardado del diario

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant V as Vista /hoy (Astro SSR)
    participant M as lib/motor.ts (Motor/CMS)
    participant S as lib/sesion.ts (API sesión)
    participant D as lib/diario.ts (API diario)
    participant DB as Supabase (lectio)
    participant R as Log (RUM)

    U->>V: GET /hoy
    V->>M: getLecturasDelDia(fecha de hoy)
    M-->>V: lecturas + título litúrgico (cache TTL corto)
    V->>S: startOrResume(fecha, tz_offset)
    S->>DB: upsert sessions (unique user_id+fecha)
    S-->>V: session_id + progreso
    V->>R: lectio.sesion.iniciada (sin contenido)
    U->>V: abre paso lectio
    U->>V: escribe apunte
    Note over V: debounce 2 s
    V->>D: PUT /api/diario/lectio {texto}
    D->>DB: upsert entries (session_id, paso=user)
    DB-->>D: OK updated_at
    U->>V: "Siguiente" (x3 pasando meditatio/oratio/contemplatio)
    V->>R: lectio.paso.completado (por paso)
    U->>V: completa actio
    V->>S: complete(session_id)
    S->>DB: update sessions.status = completada
    V->>R: lectio.sesion.completada
```

Errores de la secuencia: si Motor no responde → CR/LECTIO-E-003 (fallback manual, sesión igualmente creada); si falla el PUT de diario → LECTIO-E-005 (reintentos + cola local en cliente).

### 3.2 Streak con zona horaria del usuario

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario (UTC-3)
    participant A as Historial /diario
    participant D as lib/diario.ts
    participant DB as Supabase

    U->>A: ver historial
    A->>D: getStreak(user)
    D->>DB: SELECT sessions completadas (user_id, con tz_offset)
    DB-->>D: filas por fecha (server usa tz_offset por sesión)
    note over D: el "día local" = fecha juliana en la TZ del usuario
    D->>D: calcular streak: días locales consecutivos con sesión COMPLETADA
    D-->>A: streak + calendario
    note over D,U: viajero: sesiones guardadas con tz_offset del viaje<br/>no rompen el streak (RB-LECTIO-004)
```

### 3.3 Recordatorio vía Notificaciones con enlace profundo

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant P as API preferencias
    participant DB as Supabase (preferences)
    participant N as Sistema de Notificaciones

    U->>P: PUT preferences {recordatorio: 07:00 local, tz_offset}
    P->>DB: upsert preferences (RLS dueño)
    DB-->>P: OK
    P->>N: registra agenda del recordatorio (opt-in)
    loop cada día a la hora local
        N->>N: verificación diaria
        N->>U: notificación "Es tu hora de orar" → enlace profundo /hoy
    end
    U-->>P: PUT preferences {recordatorio: null}
    P->>N: baja de agenda (< 24 h efectivas)
```

## 4. Consideraciones transversales

- **Modo lectura (sin auth):** las mismas secuencias de lectura funcionan sin `user_id`; solo se suprimen escrituras de `entries` (UC-LECTIO-008).
- **RUM:** número 3.1 emite ` sesion.iniciada`, ` paso.completado` y ` sesion.completada` bajo consentimiento (UC-LECTIO-007); nunca con contenido.
- **Cache:** `lib/motor.ts` cachea lecturas de presentación con TTL corto (p. ej. 15 min); ante CMS caído sirve última cache (ERM-LECTIO-004).
