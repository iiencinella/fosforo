# @repo/notification-core

## 0.1.0

### Minor Changes

- 0e458f8: Nuevo paquete compartido con la logica pura del Sistema de Notificaciones (la carpeta existia vacia y no era un workspace valido). Canales (email, push, in_app) y categorias (transactional/product/liturgical/community) con concepto de categoria obligatoria; plantillas versionadas inmutables con render estricto y error tipado por variables faltantes; preferencias por canal+categoria con defaults conservadores (solo transactional optada) y opt-out ignorado para obligatorias; cola de envio con idempotencia por event_id, maximo 3 intentos, backoff exponencial de 30s con cap de 15 min y confirmaciones delivered/opened solo desde sent. Sin DB ni red: la persistencia y los proveedores consumen estos helpers.
