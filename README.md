# LoyalRun — Loyalty + Gaming Platform for Sport Clubs

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo SDK 52 + Expo Router 4 |
| State | Zustand 5 + React Query 5 + MMKV |
| GPS | expo-location (background) + expo-task-manager |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions + Realtime) |
| Geoespacial | PostGIS (rutas, geofencing, negocios cercanos) |
| Cache | Supabase Redis (leaderboards, sesiones) |
| Notificaciones | Expo Push Notifications |
| Maps | react-native-maps (Google Maps) |
| Animaciones | react-native-reanimated 3 |

## Estructura del proyecto

```
loyalrun/
├── src/
│   ├── app/                    # Expo Router — pantallas
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # Home / Feed
│   │   │   ├── track.tsx       # Tracking en vivo ✓
│   │   │   ├── map.tsx         # Mapa + negocios cercanos
│   │   │   ├── rewards.tsx     # Ofertas + canje QR ✓
│   │   │   └── profile.tsx     # Perfil + badges
│   │   └── activity-summary.tsx
│   ├── components/
│   │   ├── ui/                 # Design system base
│   │   ├── activity/           # RouteMap, StatCard, LiveTimer
│   │   ├── gaming/             # XPBar, BadgeCard, Leaderboard
│   │   └── rewards/            # OfferCard, QRRedeem
│   ├── hooks/
│   │   ├── useActivityTracker.ts  ✓
│   │   └── useXPLevel.ts
│   ├── stores/
│   │   └── activity-store.ts   ✓ (auth, club, activity)
│   ├── services/
│   │   ├── api.ts              ✓
│   │   └── gps-service.ts      ✓
│   ├── lib/
│   │   ├── supabase.ts         ✓
│   │   └── xp-engine.ts        ✓
│   └── types/
│       └── index.ts            ✓
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  ✓
│   └── functions/
│       └── activity-complete/      ✓
└── package.json                ✓
```

## Setup rápido

### 1. Crear proyecto Supabase
```bash
npx supabase init
npx supabase db push         # aplica migrations
npx supabase functions deploy activity-complete
```

### 2. Variables de entorno
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Instalar y correr
```bash
npm install
npx expo start
```

## Modelo de multi-tenancy por club

El app es agnóstico al tipo de deporte. Cada club define:
- `sport_type`: tipo de actividad (running, cycling, etc.)
- `theme_config`: colores y logo propios
- `slug`: URL amigable para invitaciones

Los negocios pueden asociarse a uno o varios clubes mediante `club_id` en `business_offers`.
Un `club_id = NULL` en una oferta la hace disponible para todos los clubes.

## Integración de negocios (Business API)

Los negocios se integran de dos formas:

### 1. Webhook push (proactivo)
Cuando un miembro termina una actividad cerca del negocio, el Edge Function `activity-complete`
hace un POST al `webhook_url` del negocio con:
```json
{
  "event": "member_nearby",
  "offer_id": "uuid",
  "club_id": "uuid",
  "distance_km": 5.2,
  "member_count_nearby": 1
}
```

### 2. API Pull (negocio consulta)
Los negocios pueden usar su `api_key` para consultar estadísticas y canjes:
```
GET /functions/v1/business-stats
Authorization: Bearer {api_key}
```

## Motor de XP

| Acción | XP Base |
|--------|---------|
| Por km recorrido | 10 XP |
| Completar 5K | +30 XP |
| Completar 10K | +80 XP |
| Completar 21.1K | +200 XP |
| Ritmo < 6:00/km | +25 XP |
| Ritmo < 5:00/km | +50 XP |
| Racha 3+ días | ×1.25 |
| Racha 7+ días | ×1.50 |

## Niveles

| Nivel | Título | XP requerido |
|-------|--------|-------------|
| 1 | Novato | 0 |
| 2 | Activo | 500 |
| 3 | Corredor | 1,500 |
| 4 | Atleta | 3,500 |
| 5 | Campeón | 7,000 |
| 6 | Élite | 13,000 |
| 7 | Leyenda | 22,000 |
| 8 | Maestro | 35,000 |
