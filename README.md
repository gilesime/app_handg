# LoyalRun

Aplicacion mobile para clubes deportivos con tracking de actividad, rewards y gamificacion.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Mobile | React Native + Expo SDK 52 + Expo Router 4 |
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
│   │   ├── select-club.tsx
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
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

1. `/(auth)/sign-in`
2. `/(auth)/sign-up`
3. `/select-club`
4. `/(tabs)/index`
5. `/(tabs)/track`
6. `/activity-summary`
7. `/(tabs)/map`
8. `/(tabs)/rewards`
9. `/(tabs)/profile`

El layout principal redirige automaticamente:

- sin sesion: `/(auth)/sign-in`
- con sesion pero sin club activo: `/select-club`
- con sesion y club activo: `/(tabs)`

## Pantallas disponibles

Ya existen y quedaron conectadas estas pantallas:

- `sign-in`: inicio de sesion con Supabase
- `sign-up`: registro basico
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
- `components/` sigue disponible para extraer UI reutilizable cuando empecemos a refinar la interfaz.
- Si quieres una siguiente fase, lo natural seria agregar onboarding, recovery password y pantallas CRUD para retos o historial de actividades.
- La arquitectura propuesta para wearables esta en `docs/wearables-architecture.md`.
- La base inicial de schema para wearables esta en `supabase/migrations/002_wearable_foundation.sql`.
