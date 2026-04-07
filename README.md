# LoyalRun

Aplicacion mobile para clubes deportivos con tracking de actividad, rewards y gamificacion.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Mobile | React Native + Expo SDK 54 + Expo Router 6 |
| Estado | Zustand 5 + React Query 5 + MMKV |
| GPS | expo-location + expo-task-manager |
| Backend | Supabase Auth + PostgreSQL + Edge Functions |
| Mapas | react-native-maps |

## Estructura actual

```text
app_handg/
├── app.json
├── package.json
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── activity-summary.tsx
│   │   ├── consent-preferences.tsx
│   │   ├── onboarding.tsx
│   │   ├── select-club.tsx
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── map.tsx
│   │       ├── profile.tsx
│   │       ├── rewards.tsx
│   │       └── track.tsx
│   ├── components/
│   ├── hooks/
│   │   └── useActivityTracker.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── xp-engine.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── gps-service.ts
│   ├── stores/
│   │   └── activity-store.ts
│   └── types/
│       └── index.ts
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── functions/
        ├── activity-complete/
        └── validate-redemption/
```

## Flujo principal

1. `/onboarding`
2. `/(auth)/sign-in`
3. `/(auth)/sign-up`
4. `/consent-preferences`
5. `/select-club`
6. `/(tabs)/index`
7. `/(tabs)/track`
8. `/activity-summary`
9. `/(tabs)/map`
10. `/(tabs)/rewards`
11. `/(tabs)/profile`

El layout principal redirige automaticamente:

- sin sesion: `/(auth)/sign-in`
- con sesion pero sin consentimiento legal/comercial capturado: `/consent-preferences`
- con sesion pero sin club activo: `/select-club`
- con sesion y club activo: `/(tabs)`

## Pantallas disponibles

Ya existen y quedaron conectadas estas pantallas:

- `sign-in`: inicio de sesion con Supabase
- `sign-up`: registro con aceptacion obligatoria de politica de privacidad y uso de datos
- `consent-preferences`: captura y gestion de consentimiento para notificaciones operativas, push comercial, email comercial e in-app notifications
- `select-club`: elegir club existente o unirse por `slug`
- `home`: resumen general del usuario
- `track`: tracking de actividad
- `activity-summary`: resumen al finalizar una actividad
- `map`: ofertas cercanas
- `rewards`: lista y canje de recompensas
- `profile`: perfil, badges y cambio de club

Las nuevas pantallas de auth y seleccion de club son wireframes funcionales, pensadas para flujo y validacion, no para diseno final.

## Setup rapido

### 1. Variables de entorno

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar la app

```bash
npx expo start
```

### 4. Validacion de tipos

```bash
npm run type-check
```

## Notas

- Si el usuario autenticado no tiene fila en `profiles`, el layout crea un perfil fallback en memoria para no bloquear el flujo.
- El modulo de consentimiento guarda un registro funcional de preferencias en `user.preferences`:
  - `privacy_policy_accepted`
  - `data_use_accepted`
  - `notifications_enabled`
  - `marketing_push_enabled`
  - `marketing_email_enabled`
  - `in_app_notifications_enabled`
  - `communications_choice_recorded`
  - `consent_version`
  - `consent_updated_at`
- La pantalla de consentimiento aparece antes de la seleccion de club si faltan consentimientos requeridos.
- El check obligatorio de privacidad/uso de datos vive tambien en `sign-up`, pero las preferencias comerciales se terminan de definir en `/consent-preferences`.
- Los textos y el flujo de consentimiento son una base funcional de producto; conviene validarlos con legal antes de produccion para GDPR/LFPDPP.
- `components/` sigue disponible para extraer UI reutilizable cuando empecemos a refinar la interfaz.
- Si quieres una siguiente fase, lo natural seria agregar onboarding, recovery password y pantallas CRUD para retos o historial de actividades.
- La arquitectura propuesta para wearables esta en `docs/wearables-architecture.md`.
- La base inicial de schema para wearables esta en `supabase/migrations/002_wearable_foundation.sql`.
