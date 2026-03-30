# Wearables Integration Architecture

## Objetivo

Permitir que `app_handg` reciba y normalice:

- pulso cardiaco en tiempo real
- distancia
- ruta GPS
- resumen de entrenamiento
- metadata del dispositivo origen

sin depender de una sola marca o ecosistema.

## Enfoque recomendado

### Capa 1: Realtime local

Para sesiones en vivo desde el telefono:

- `BLE Heart Rate Monitor` para pulsometros de pecho o sensores compatibles
- `expo-location` para GPS, ruta y distancia del telefono

### Capa 2: Ecosistema del sistema operativo

Para sincronizar actividades completas desde relojes:

- `iOS`: `HealthKit`
- `Android`: `Health Connect`

### Capa 3: Conectores por fabricante

Para integraciones premium y usuarios avanzados:

- `Garmin`: backend-to-backend
- `Polar`: BLE SDK / API
- `Apple Watch`: companion app o lectura desde `HealthKit`
- `Wear OS`: `Health Services` para tiempo real y `Health Connect` para sync

## Arquitectura por modulos

### Mobile app

Agregar estos modulos:

- `src/types/wearables.ts`
- `src/services/wearables/device-registry.ts`
- `src/services/wearables/ble-heart-rate.ts`
- `src/services/wearables/healthkit-sync.ts`
- `src/services/wearables/health-connect-sync.ts`
- `src/services/wearables/session-composer.ts`
- `src/stores/wearable-store.ts`
- `src/hooks/useWearableSession.ts`

### Backend / Supabase

Agregar:

- tablas de conexiones y dispositivos
- tabla de sesiones wearable
- tabla de muestras de heart rate
- tabla de rutas / puntos
- tabla de sincronizacion externa
- edge functions para ingestar y reconciliar datos

## Modelo de datos recomendado

### Tabla `wearable_connections`

- `id uuid pk`
- `user_id uuid`
- `provider text`
- `status text`
- `external_user_id text`
- `access_token_encrypted text`
- `refresh_token_encrypted text`
- `scopes jsonb`
- `last_synced_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

### Tabla `wearable_devices`

- `id uuid pk`
- `user_id uuid`
- `connection_id uuid null`
- `provider text`
- `device_name text`
- `device_type text`
- `manufacturer text`
- `model text`
- `external_device_id text`
- `is_active boolean`
- `last_seen_at timestamptz`
- `created_at timestamptz`

### Tabla `wearable_sessions`

- `id uuid pk`
- `user_id uuid`
- `club_id uuid null`
- `activity_id uuid null`
- `device_id uuid null`
- `provider text`
- `source_session_id text`
- `sport_type text`
- `status text`
- `started_at timestamptz`
- `ended_at timestamptz`
- `distance_km numeric`
- `duration_s integer`
- `avg_heart_rate integer null`
- `max_heart_rate integer null`
- `calories numeric null`
- `elevation_gain_m numeric null`
- `route_source text`
- `payload jsonb`
- `created_at timestamptz`

### Tabla `heart_rate_samples`

- `id uuid pk`
- `session_id uuid`
- `activity_id uuid null`
- `measured_at timestamptz`
- `bpm integer`
- `confidence numeric null`
- `source text`
- `created_at timestamptz`

### Tabla `session_route_points`

- `id uuid pk`
- `session_id uuid`
- `activity_id uuid null`
- `sequence_no integer`
- `latitude numeric`
- `longitude numeric`
- `altitude numeric null`
- `accuracy numeric null`
- `speed_mps numeric null`
- `recorded_at timestamptz`

### Tabla `wearable_sync_events`

- `id uuid pk`
- `connection_id uuid`
- `provider text`
- `event_type text`
- `status text`
- `request_payload jsonb`
- `response_payload jsonb`
- `error_message text`
- `occurred_at timestamptz`

## Flujo de ingestión

### Opcion A: BLE + telefono

1. usuario conecta pulsometro BLE
2. app inicia sesion local
3. GPS del telefono registra puntos
4. BLE entrega muestras de pulso
5. al finalizar se guarda sesion, muestras, puntos y actividad

### Opcion B: Apple Health / Health Connect

1. usuario autoriza permisos
2. app consulta workouts recientes
3. app normaliza cada workout
4. backend crea `wearable_session`
5. si corresponde, se vincula con `activities`

### Opcion C: Garmin

1. usuario conecta cuenta Garmin
2. backend recibe webhook o hace pull
3. normaliza actividad
4. guarda sync event, session y activity

## Orden de implementacion

### Fase 1

- BLE heart rate local
- GPS telefono
- session composer
- nuevas tablas base
- pantalla de seleccion de dispositivo

### Fase 2

- importar `HealthKit`
- importar `Health Connect`
- job de sincronizacion manual
- vista de historial con fuente del dato

### Fase 3

- Garmin connector backend
- Polar SDK / bridge
- auditoria y retries

### Fase 4

- companion app `watchOS`
- companion app `Wear OS`
- realtime desde reloj

## Recomendacion para este proyecto

Implementar primero:

1. `BLE heart rate + phone GPS`
2. `HealthKit / Health Connect sync`
3. `Garmin`
