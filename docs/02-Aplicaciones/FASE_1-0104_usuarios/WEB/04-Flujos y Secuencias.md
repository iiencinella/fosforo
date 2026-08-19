---
tags:
  - proyecto/fosforo
  - usuarios
  - arquitectura
  - flujos
  - aplicación
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# Flujos y Secuencias - 0104_usuarios

## Objetivo

Describir cómo interactúa el usuario con las funcionalidades principales de la app de usuarios y cómo se integra con el resto del ecosistema.

## Flujo principal: autenticación y acceso a apps

1. El visitante llega a una aplicación del ecosistema (Portal, Biblia, Calendario).
2. El sistema detecta que no hay sesión activa y redirige al formulario de inicio de sesión o registro.
3. El usuario ingresa email y contraseña (o se registra si es primera vez).
4. El sistema valida credenciales contra Supabase Auth y emite un JWT.
5. El sistema consulta el rol y permisos del usuario desde la base de datos.
6. El JWT se almacena y el usuario es redirigido a la aplicación con sesión activa.
7. Al navegar a otra app del ecosistema, el JWT existente se reutiliza y se validan los permisos para la app destino.

## Flujos secundarios

- Flujo A (Recuperación de contraseña): el usuario solicita recuperación → recibe email con enlace → establece nueva contraseña → redirigido a login.
- Flujo B (Administración de roles): el administrador accede al panel → busca usuario → selecciona nuevo rol → confirma → el sistema actualiza y audita el cambio.

## Secuencias clave

### Secuencia 1 - Registro y primer inicio de sesión

1. Visitante: completa formulario de registro (email, contraseña, nombre).
2. Sistema: valida datos, llama a Supabase Auth `signUp`, crea registro en `auth.users`.
3. Sistema: inserta fila en `public.profiles` con `id`, `email`, `name` y rol por defecto "usuario".
4. Sistema: emite JWT con claims de `user_id`, `role`, `email`.
5. Sistema: redirige al visitante a la aplicación de destino con sesión activa.
6. Visitante: visualiza la aplicación autenticada.

### Secuencia 2 - Inicio de sesión y SSO entre apps

1. Usuario: ingresa email y contraseña en el formulario de login de la App A.
2. Sistema App A: envía credenciales al endpoint `/api/auth/login`.
3. UserService: valida contra Supabase Auth, recupera rol y permisos.
4. UserService: retorna JWT firmado con claims de usuario, rol y lista de apps autorizadas.
5. App A: almacena JWT y permite el acceso.
6. Usuario: navega a la App B del ecosistema.
7. App B: detecta JWT existente, lo envía a UserService para validación.
8. UserService: verifica firma, expiración y permisos para App B.
9. App B: concede acceso sin pedir credenciales nuevamente.

### Secuencia 3 - Asignación de rol por administrador

1. Admin: inicia sesión y accede al panel de administración de usuarios.
2. Admin: busca al usuario destino por nombre o email.
3. Sistema: muestra perfil del usuario con rol actual.
4. Admin: selecciona nuevo rol "coordinador" del selector y confirma.
5. Sistema: valida que el admin tenga permiso para asignar ese rol.
6. Sistema: actualiza `public.user_roles` con el nuevo rol y fecha.
7. Sistema: inserta registro en `public.audit_log` con admin_id, user_id, rol_anterior, rol_nuevo, timestamp.
8. Sistema: muestra confirmación de asignación exitosa.
9. Admin: visualiza el cambio reflejado en el perfil del usuario.

### Secuencia 4 - Acceso denegado por permisos insuficientes

1. Usuario: intenta acceder a una aplicación para la que no tiene permisos.
2. Sistema: valida JWT existente, extrae user_id y rol.
3. UserService: consulta permisos del rol para la app solicitada.
4. UserService: determina que el permiso está denegado.
5. Sistema: muestra pantalla de "acceso denegado" con opción de contactar al administrador.
6. Sistema: registra el intento de acceso denegado en audit_log.
