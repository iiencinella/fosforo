# `@repo/mobile-auth-client`

Primitivas compartidas para autenticación y sesion en aplicaciónes mobile del ecosistema.

## Incluye

- Helpers de runtime como `getMobileRuntimeConfig` y `resolveActiveUserId`.
- Flujo de login mobile con `loginMobile`.
- Exports de UI y estilos como `session-login-card`, `api-info-card`, `mobile-screen` y `mobile-styles`.

## Variables esperadas

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_DEMO_USER_ID` (opcional)

## Uso

Este paquete debe reutilizarse en apps Expo o React Native antes de duplicar logica de sesion, login o pantallas compartidas.
