---
tags:
  - proyecto/fosforo
  - cancionero
  - arquitectura
  - decisiones
  - aplicación
type: doc-app-arquitectura
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[00-README|Cancionero App]]"
---

# Decisiones de Arquitectura - 0401_cancionero

## Contexto

- **Plataforma objetivo:** WEB
- **Alcance de esta decision:** Definir la arquitectura técnica, el modelo de datos y las integraciones para el MVP de Cancionero, priorizando simplicidad y reutilización del stack del ecosistema Fósforo.

## Funcionalidades generales obligatorias

- Búsqueda libre por nombre y fragmento de letra.
- Filtro por tiempo litúrgico y momento de misa.
- Visualización de letra con acordes.
- Flujo de contribución y panel de moderación.
- Integración con API de Calendario Litúrgico.

## Decisiones clave

| ID                      | Decision                                                                                                                                                                  | Motivo                                                                                                                                                                                                                                                                  | Impacto                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-0401-CANCIONERO-001 | Usar búsqueda por ILIKE en PostgreSQL para MVP en lugar de Elasticsearch                                                                                                  | Simplifica la infraestructura inicial; el volumen de datos en MVP (< 500 canciones) no justifica un motor de búsqueda dedicado                                                                                                                                          | Migrar a búsqueda全文 (Elasticsearch/Typesense) en fases posteriores cuando el catálogo crezca                                                                                                                                                                 |
| ADR-0401-CANCIONERO-002 | Modelar momentos litúrgicos como JSONB en tabla `tiempos_liturgicos`                                                                                                      | Los momentos varían por tiempo litúrgico y no justifican una tabla normalizada separada; JSONB permite flexibilidad y consultas con operadores de Postgres                                                                                                              | Las consultas de validación de etiquetas deben usar `jsonb_array_elements` para expandir los momentos                                                                                                                                                          |
| ADR-0401-CANCIONERO-003 | Separar etiquetas tiempo+momento en tabla `etiquetas_cancion` en lugar de columna JSONB en `canciones`                                                                    | Permite consultas eficientes de filtrado por tiempo+momento con índices compuestos; facilita la auditoría de cambios en moderación                                                                                                                                      | Aumenta la complejidad del modelo pero mejora rendimiento de búsqueda y trazabilidad                                                                                                                                                                           |
| ADR-0401-CANCIONERO-004 | Almacenar la letra limpia y los acordes como coordenadas (`letra` text + `acordes` jsonb `[{linea,posicion,nombre}]`)                                                     | Permite separar el modelo (texto + posiciones) y renderizar los acordes en línea superior (formato cancionero). La búsqueda sigue funcionando sobre `letra` con GIN.                                                                                                    | Requiere un editor de acordes (click-en-sílaba) y un alineador (`alignChordsWithLyrics`). Incrementa el contrato de la API y de la DB.                                                                                                                         |
| ADR-0401-CANCIONERO-006 | Migrar los registros existentes del formato legado `[Acorde]` al nuevo modelo en una sola migración                                                                       | Evita mantener dos parsers en producción y deja una sola fuente de verdad desde el día 1                                                                                                                                                                                | La migración es one-shot y se documenta con un script PL/pgSQL reusable (`internal.cancionero_migrate_chord_text`)                                                                                                                                             |
| ADR-0401-CANCIONERO-005 | Usar sesión de Supabase Auth para identidad de usuarios y RLS para proteger datos sensibles                                                                               | Consistente con el resto del ecosistema; RLS permite control de acceso a nivel de fila sin lógica adicional en API                                                                                                                                                      | Requiere crear políticas RLS específicas para la app y seed de usuarios administradores                                                                                                                                                                        |
| ADR-0401-CANCIONERO-007 | Consumir la identidad del ecosistema desde el paquete compartido `@repo/auth` (session, cookies cross-app, role-mapping) en lugar de mantener mocks o auth paralela       | Cancionero es una app "consumer" del core de identidad de la app 0104 Usuario; centralizar cookies, sesión y mapeo de roles en un paquete compartido evita duplicación y mantiene coherencia con el resto del ecosistema                                                | Cancionero queda atado al contrato de `@repo/auth`; cualquier cambio en el paquete debe coordinarse con Usuario y demás consumidores                                                                                                                           |
| ADR-0401-CANCIONERO-008 | Asignar el rol `musico` (id=5) en el endpoint de registro de Cancionero (no en SQL) usando `supabase.auth.admin.createUser` + upsert a `profiles` + insert a `user_roles` | Mantiene el control de qué apps asignan qué roles en el código de la app (no en migraciones SQL), respeta el trigger `internal.handle_new_user` que ya crea el profile con `usuario` (id=4), y permite reusar el endpoint para asignar otros roles por app en el futuro | El flujo no es atómico en SQL: el trigger crea primero el profile con `usuario` y el endpoint sobrescribe a `musico`; en `user_roles` quedan dos filas. Se acepta porque la fuente de verdad del rol actual es `profiles.role_id` (ver RB-0401-CANCIONERO-014) |

## Alternativas consideradas

- **Alternativa A - Elasticsearch para búsqueda:** Se descartó para MVP por complejidad operativa. Se adopta ILIKE con índices GIN en PostgreSQL. Post-MVP se migrará a Typesense como motor de búsqueda compartido del ecosistema.
- **Alternativa B - Momentos litúrgicos como tabla normalizada:** Se descartó porque la estructura de momentos por tiempo es estable y predecible. JSONB es más simple de mantener y consultar.
- **Alternativa C - Mantener `[Acorde]` texto plano:** Se descartó porque la lectura del cancionero con acordes en la misma línea es ruidosa; el modelo con coordenadas permite renderizar el formato cancionero clásico (acordes arriba) y simplifica el form de contribución (no se escribe markup).
- **Alternativa D - Editor WYSIWYG para letras con acordes:** Se descartó por sobreingeniería. El click-en-sílaba sobre la vista previa con caracteres clickables es suficiente y accesible.
- **Alternativa E - Mantener Cancionero con un mock auth propio (header `x-cancionero-role`):** Se descartó porque la Fase 4 ya cuenta con un core de identidad en `@repo/auth` listo para consumir; mantener un mock en Cancionero impide flujos reales de contribución/moderación, persistencia de autor/moderador y trae problemas de seguridad y de consistencia entre apps. Se adopta `@repo/auth` con cookies cross-app.
- **Alternativa F - Asignar el rol `musico` desde una función SQL `SECURITY DEFINER` con parámetro `role_slug`:** Se descartó por simplicidad: el patrón actual de la app 0104 Usuario centraliza la asignación de roles en el código (no en SQL). Usar `supabase.auth.admin.createUser` + upsert a `profiles` + insert a `user_roles` desde el endpoint es atómico desde la perspectiva de la API y respeta el trigger `handle_new_user`. La función SQL se puede agregar en el futuro si surgen casos cross-app que lo justifiquen.

## Riesgos y mitigaciónes

- **Riesgo 1:** Búsqueda ILIKE lenta cuando el catálogo crezca (> 1000 canciones).
  - **Mitigación 1:** Implementar índices GIN en `letra` y `titulo`; migrar a Typesense cuando las consultas superen los 500ms p95.
- **Riesgo 2:** Coordenadas de acordes inválidas (línea inexistente, posición fuera de rango).
  - **Mitigación 2:** Validación Zod en endpoint (`contributionSchema` + superRefine que valida linea/posicion contra `letra.split('\n')`) y constraint SQL `canciones_acordes_shape_check`.
- **Riesgo 3:** Dependencia de API de Calendario Litúrgico no disponible.
  - **Mitigación 3:** Implementar fallback con datos locales en Supabase y selector manual de tiempo litúrgico.
- **Riesgo 4:** El paquete `@repo/auth` cambia de contrato y rompe a Cancionero (o viceversa).
  - **Mitigación 4:** `@repo/auth` expone tests unitarios (14 tests: cookies + role-mapping) que corren en CI; el consumer Cancionero expone tests de los helpers `resolveAppRole` / `canContribute` / `canModerate` (TC-0401-CANCIONERO-015..020). Cualquier cambio incompatible debe actualizar los tipos exportados del paquete y los tests del consumer.
- **Riesgo 5:** El endpoint de registro asigna el rol `musico` después de que el trigger crea el profile con `usuario`; durante una ventana brevísima el profile tiene `role_id = 4`.
  - **Mitigación 5:** El upsert y el insert a `user_roles` se ejecutan en el mismo handler HTTP (sin `await` intermedios con operaciones de usuario). El frontend no consulta el rol hasta que recibe la respuesta del endpoint, momento en el cual `profile.role_id = 5` ya está persistido. La concurrencia queda limitada al request individual.
- **Riesgo 6:** Las cookies cross-app asumen mismo dominio en producción. Si en producción cada app vive en un subdominio distinto, las cookies no se compartiran.
  - **Mitigación 6:** En MVP se asume un único dominio (`fosforo.org`); cuando se separen subdominios, migrar a `Domain=.fosforo.org` y `SameSite=None; Secure` en `setSessionCookies` (`src/packages/auth/src/cookies.ts`).
