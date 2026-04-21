# Bitácora de Instalación — Supabase · LoyalRun
**Proyecto:** app_handg  
**Fecha de inicio:** 2026-04-17  
**Responsable:** Pendiente de completar  
**Entorno:** macOS 25.3.0 · Node 25.8.1 · npm 11.11.0 · Homebrew 5.1.5

---

## Contexto del proyecto

- Framework móvil: React Native 0.81 + Expo SDK 54 + Expo Router 6
- Backend: Supabase (PostgreSQL 16 + PostGIS + Auth + Edge Functions)
- Repositorio: `/Users/gilbertomartinez/Documents/GitHub/app_handg`
- La carpeta `supabase/` ya existe con migraciones del POC:
  - `001_initial_schema.sql` — schema base del POC
  - `002_wearable_foundation.sql` — tablas BLE del POC
- **Estas migraciones serán reemplazadas** por el DDL definitivo del modelo de datos LoyalRun (28 tablas).

---

## FASE 0 — Pre-requisitos

### 0.1 Verificación del entorno

```bash
# Verificar Homebrew
brew --version
# Resultado: Homebrew 5.1.5 ✓

# Verificar Node
node --version
# Resultado: v25.8.1 ✓

# Verificar npm
npm --version
# Resultado: 11.11.0 ✓
```

### 0.2 Instalación de Supabase CLI

```bash
# Instalar via Homebrew (recomendado en macOS)
brew install supabase/tap/supabase

# Verificar instalación
supabase --version
```

> **Resultado:** Supabase CLI 2.90.0 instalado ✓  
> **Fecha:** 2026-04-17

---

## FASE 1 — Cuenta y proyecto en Supabase Cloud

### 1.1 Crear cuenta

1. Ir a [https://supabase.com](https://supabase.com)
2. Registrarse con GitHub (recomendado — simplifica auth)
3. Confirmar email

> **Estado:** Pendiente

### 1.2 Crear organización y proyecto

Desde el dashboard de Supabase:

1. **New Organization** → nombre: `LoyalRun` (o el nombre comercial)
2. **New Project**:
   - Name: `loyalrun-dev`
   - Database Password: generar y guardar en gestor de contraseñas
   - Region: **us-east-1** (Virginia) o **sa-east-1** (São Paulo) — elegir el más cercano a los usuarios en LATAM
   - Plan: **Free** para desarrollo

> **Datos de creación del proyecto:**

| Variable | Valor |
|----------|-------|
| Organización | `loyal run` |
| Project Name | `loyalrun-dev` |
| Project URL | `https://dikmcxizkyzfnprtzulq.supabase.co` |
| Project ID | `dikmcxizkyzfnprtzulq` |
| Region | South America (São Paulo) |
| Plan | Free |
| Cuenta GitHub | gilesime |
| anon key | Pendiente — obtener de Project Settings → API |
| service_role key | Pendiente — obtener de Project Settings → API (⚠️ nunca exponer en el cliente) |
| DB Password | Ver gestor de contraseñas (registrada el 2026-04-17) |

> ⚠️ **Este archivo NO debe commitearse a git.** Agregar a `.gitignore` si contiene credenciales.  
> **Fecha:** 2026-04-17  
> **Estado:** ✓ Completado

---

## FASE 2 — Configuración local del CLI

### 2.1 Login en Supabase CLI

```bash
cd /Users/gilbertomartinez/Documents/GitHub/app_handg

supabase login
# Abre el navegador para autenticarse con la cuenta de Supabase
```

> **Resultado:** "You are now logged in. Happy coding!" ✓  
> **Fecha:** 2026-04-17

### 2.2 Vincular proyecto local con proyecto remoto

```bash
supabase link --project-ref XXXXXXXXXXXX
# Reemplazar XXXXXXXXXXXX con el Project ID obtenido en 1.2
# Pedirá la DB password
```

> **Estado:** Pendiente

### 2.3 Verificar vinculación

```bash
supabase status
# Requiere Docker para entorno local — no aplica en este flujo
```

> **Resultado:** Error esperado — "Cannot connect to Docker daemon".  
> No se usa entorno local. Todas las operaciones van directo al proyecto cloud.  
> La vinculación es correcta: el archivo `.supabase/config.toml` contiene el project-ref.  
> **Fecha:** 2026-04-17  
> **Estado:** ✓ Omitido intencionalmente (sin Docker)

---

## FASE 3 — Habilitación de extensiones en Supabase Cloud

Antes de ejecutar migraciones, habilitar las extensiones requeridas desde el **Dashboard → Database → Extensions**:

| Extensión | Propósito | Estado |
|-----------|----------|--------|
| `pgcrypto` | `gen_random_uuid()` | Pendiente |
| `postgis` | Datos geoespaciales (rutas, proximidad) | Pendiente |
| `pg_trgm` | Búsqueda de texto en usernames | Pendiente |
| `pg_cron` | Jobs nocturnos (planes IA, resúmenes) | Pendiente |

> Las extensiones también se declaran en las migraciones con `CREATE EXTENSION IF NOT EXISTS`.

---

## FASE 4 — Migraciones de base de datos

### 4.1 Limpiar migraciones del POC

Las migraciones actuales corresponden al POC y no al modelo definitivo. Se renombran como archivo de referencia antes de reemplazar:

```bash
cd /Users/gilbertomartinez/Documents/GitHub/app_handg/supabase/migrations

# Archivar migraciones del POC
mkdir -p _poc_archive
mv 001_initial_schema.sql _poc_archive/
mv 002_wearable_foundation.sql _poc_archive/
```

> **Estado:** Pendiente

### 4.2 Crear migración definitiva

```bash
# Crear nueva migración con el DDL completo
supabase migration new initial_loyalrun_schema
# Genera: supabase/migrations/YYYYMMDDHHMMSS_initial_loyalrun_schema.sql
```

Copiar el contenido de `/Users/gilbertomartinez/Documents/GitHub/LoyalRun_DDL.sql` al archivo generado.

> **Estado:** Pendiente

### 4.3 Ejecutar migraciones en local (opcional, requiere Docker)

```bash
# Solo si se quiere probar localmente antes de subir a cloud
supabase start          # Levanta Supabase local con Docker
supabase db reset       # Aplica todas las migraciones desde cero
supabase db diff        # Muestra diferencias con el schema en cloud
```

> **Estado:** Opcional — se puede saltar e ir directo a cloud

### 4.4 Aplicar migraciones en Supabase Cloud

```bash
supabase db push
# Aplica las migraciones pendientes al proyecto remoto vinculado en 2.2
```

> **Estado:** Pendiente

### 4.5 Verificar schema en cloud

Desde **Dashboard → Table Editor** verificar que las 28 tablas aparecen correctamente:

- [ ] users
- [ ] user_profiles
- [ ] levels
- [ ] subscriptions
- [ ] xp_transactions
- [ ] wallet_transactions
- [ ] referrals
- [ ] wearables
- [ ] routes
- [ ] activities (particionada)
- [ ] activity_splits
- [ ] activity_gps_points
- [ ] training_plans
- [ ] training_plan_sessions
- [ ] nutrition_plans
- [ ] nutrition_plan_meals
- [ ] food_preferences
- [ ] sleep_records
- [ ] weekly_recaps
- [ ] badges
- [ ] user_badges
- [ ] clubs
- [ ] club_members
- [ ] running_groups
- [ ] group_members
- [ ] challenges
- [ ] challenge_participants
- [ ] territories
- [ ] businesses
- [ ] rewards
- [ ] reward_redemptions
- [ ] notifications
- [ ] races
- [ ] race_alerts

> **Estado:** Pendiente

---

## FASE 5 — Variables de entorno en la app

> **Nota:** El proyecto productivo es `app_handg_flutter` (Flutter), no `app_handg` (RN/POC).  
> Todos los pasos de esta fase aplican a `/Users/gilbertomartinez/Documents/GitHub/app_handg_flutter`.

### 5.1 Agregar dependencias en pubspec.yaml

```yaml
dependencies:
  supabase_flutter: ^2.8.4
  flutter_dotenv: ^5.2.1

flutter:
  assets:
    - .env
```

> **Estado:** ✓ Completado — 2026-04-21

### 5.2 Crear archivo .env

```bash
# En app_handg_flutter/ — NO commitear
touch .env
```

Contenido del `.env`:

```env
SUPABASE_URL=https://dikmcxizkyzfnprtzulq.supabase.co
SUPABASE_ANON_KEY=<publishable key — ver gestor de contraseñas>
```

> ⚠️ Supabase renombró `anon key` → **Publishable key** (mismo concepto, nuevo nombre).  
> ⚠️ La `secret key` (antes `service_role`) **jamás** va en el cliente.  
> **Estado:** ✓ Completado — 2026-04-21

### 5.3 Agregar .env al .gitignore

```
.env
.env.local
.env.production
```

> **Estado:** ✓ Completado — 2026-04-21

### 5.4 Inicializar Supabase en main.dart

```dart
// lib/main.dart
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: '.env');

  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );

  runApp(const LoyalRunFlutterApp());
}
```

> **Estado:** ✓ Completado — 2026-04-21

### 5.5 Cliente global en lib/services/supabase_client.dart

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

SupabaseClient get supabase => Supabase.instance.client;
```

Usar en cualquier parte de la app:
```dart
import 'package:loyalrun_flutter/services/supabase_client.dart';

final data = await supabase.from('user_profiles').select().eq('user_id', userId);
```

> **Estado:** ✓ Completado — 2026-04-21

### 5.6 Instalar dependencias

```bash
cd /Users/gilbertomartinez/Documents/GitHub/app_handg_flutter
flutter pub get
```

> **Estado:** Pendiente — ejecutar en terminal local

---

## FASE 6 — Autenticación

### 6.1 Configurar proveedores de Auth en el dashboard

**Dashboard → Authentication → Providers:**

| Proveedor | Configuración requerida | Estado |
|-----------|------------------------|--------|
| Email | Habilitar, desactivar "Confirm email" en dev | Pendiente |
| Google | Client ID + Secret de Google Cloud Console | Pendiente |
| Apple | Solo necesario para subir a App Store | Pendiente |

### 6.2 Configurar URL de redirección

**Dashboard → Authentication → URL Configuration:**

```
Site URL:         exp://localhost:8081   (desarrollo)
Redirect URLs:    exp://localhost:8081/--/auth/callback
                  loyalrun://auth/callback   (producción — deep link)
```

> **Estado:** Pendiente

### 6.3 Configurar plantillas de email

**Dashboard → Authentication → Email Templates:**

- [ ] Confirm signup — personalizar con branding LoyalRun
- [ ] Reset password — personalizar con link de recuperación
- [ ] Magic link — personalizar si se usa

> **Estado:** Pendiente

---

## FASE 7 — Storage

### 7.1 Crear buckets

**Dashboard → Storage → New Bucket:**

| Bucket | Tipo | Propósito |
|--------|------|----------|
| `avatars` | Público | Fotos de perfil de usuarios |
| `club-logos` | Público | Logos de clubs |
| `business-assets` | Público | Logos e imágenes de negocios |
| `badge-icons` | Público | Iconos de badges del sistema |

```bash
# O via CLI después de vincular
supabase storage create avatars --public
supabase storage create club-logos --public
supabase storage create business-assets --public
supabase storage create badge-icons --public
```

### 7.2 Políticas de Storage

Para el bucket `avatars`, los usuarios solo pueden modificar su propia carpeta:

```sql
-- Solo el dueño puede subir/actualizar su avatar
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Lectura pública
CREATE POLICY "Avatars are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

> **Estado:** Pendiente

---

## FASE 8 — Edge Functions

### 8.1 Verificar funciones existentes del POC

```bash
ls /Users/gilbertomartinez/Documents/GitHub/app_handg/supabase/functions/
# activity-complete/
# validate-redemption/
```

Estas funciones serán revisadas y actualizadas al modelo definitivo en iteraciones posteriores.

### 8.2 Deployar funciones

```bash
# Deploy de todas las funciones
supabase functions deploy activity-complete
supabase functions deploy validate-redemption
```

### 8.3 Configurar secrets de las funciones

```bash
# API keys de IA (nunca en el cliente)
supabase secrets set GEMINI_API_KEY=AIza...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ORS_API_KEY=...          # OpenRouteService
supabase secrets set ONESIGNAL_APP_ID=...     # Push notifications
supabase secrets set ONESIGNAL_API_KEY=...
```

> **Estado:** Pendiente

---

## FASE 9 — Validación final

### Checklist de validación

- [ ] `supabase status` muestra proyecto vinculado
- [ ] 28 tablas visibles en Table Editor
- [ ] Extensiones PostGIS y pgcrypto activas
- [ ] RLS habilitado en todas las tablas de usuario
- [ ] Login con email funciona desde la app
- [ ] Buckets de Storage creados y accesibles
- [ ] Edge Functions deployadas y responden a invocaciones de prueba
- [ ] Variables de entorno configuradas y .env en .gitignore
- [ ] `supabase db diff` no muestra diferencias pendientes

---

## Registro de ejecución

| Fecha | Fase | Acción | Resultado | Notas |
|-------|------|--------|-----------|-------|
| 2026-04-17 | 0.1 | Verificación entorno | ✓ | Node 25.8.1, npm 11.11.0, Homebrew 5.1.5 |
| 2026-04-17 | 0.2 | Instalación Supabase CLI | ✓ | v2.90.0 via `brew install supabase/tap/supabase` |
| 2026-04-17 | 1.1 | Crear cuenta Supabase | ✓ | OAuth con GitHub — usuario: gilesime |
| 2026-04-17 | 1.2 | Crear proyecto en cloud | ✓ | loyalrun-dev · ID: dikmcxizkyzfnprtzulq · São Paulo |
| 2026-04-17 | 2.1 | Login Supabase CLI | ✓ | `supabase login` · OAuth GitHub · "You are now logged in. Happy coding!" |
| 2026-04-17 | 2.2 | Vincular proyecto local | ✓ | `supabase link --project-ref dikmcxizkyzfnprtzulq` · "Finished supabase link." · Sin solicitud de contraseña (token OAuth activo) |
| 2026-04-17 | 2.3 | Verificar vinculación | ✓ | `supabase status` falla por Docker (no requerido) · Vinculación correcta vía config.toml |
| 2026-04-17 | 3 | Habilitar extensiones | ✓ | pgcrypto, postgis, pg_trgm, pg_cron — activadas desde Dashboard → Database → Extensions |
| 2026-04-17 | 4.1 | Archivar migraciones POC | ✓ | 001 y 002 movidas a `supabase/migrations/_poc_archive/` |
| 2026-04-17 | 4.2 | Crear migración definitiva | ✓ | `20260417174323_initial_loyalrun_schema.sql` — DDL reescrito con `auth.users` (Supabase nativo) |
| 2026-04-17 | 4.2 | Ajuste crítico migración | ✓ | Eliminada tabla `users` propia · Todas las FK apuntan a `auth.users(id)` · Añadido trigger `handle_new_user` para auto-crear perfil |
| 2026-04-17 | 4.3 | Fix geometry schema | ✗→✓ | `GEOMETRY` → `extensions.geometry` — PostGIS vive en schema `extensions` en Supabase Cloud |
| 2026-04-17 | 4.4 | Fix particionamiento activities | ✗→✓ | PK `(id, started_at)` · 6 tablas con FK compuesta: activity_splits, activity_gps_points, training_plan_sessions, weekly_recaps, user_badges, territories |
| 2026-04-17 | 4.5 | Aplicar migración en cloud | ✓ | `supabase db push` exitoso · 33 tablas + índices + RLS + triggers aplicados en dikmcxizkyzfnprtzulq |
| 2026-04-21 | 5.1 | Agregar dependencias Flutter | ✓ | `supabase_flutter ^2.8.4` + `flutter_dotenv ^5.2.1` en pubspec.yaml |
| 2026-04-21 | 5.2 | Crear .env | ✓ | SUPABASE_URL + SUPABASE_ANON_KEY (Publishable key) · archivo excluido de git |
| 2026-04-21 | 5.3 | Actualizar .gitignore | ✓ | `.env`, `.env.local`, `.env.production` agregados |
| 2026-04-21 | 5.4 | Inicializar Supabase en main.dart | ✓ | `Supabase.initialize()` con dotenv · `WidgetsFlutterBinding.ensureInitialized()` |
| 2026-04-21 | 5.5 | Cliente global | ✓ | `lib/services/supabase_client.dart` — getter `supabase` accesible en toda la app |
| 2026-04-21 | 5.6 | flutter pub get | ✓ | 68 dependencias resueltas |
| 2026-04-21 | 6.1 | Habilitar Email Auth | ✓ | Dashboard → Auth → Providers · "Confirm email" desactivado para dev |
| 2026-04-21 | 6.2 | URL de redirección | ✓ | Site URL + Redirect URL: `loyalrun://auth/callback` |
| 2026-04-21 | 6.3 | Deep link Android | ✓ | Intent filter `loyalrun://` en AndroidManifest.xml |
| 2026-04-21 | 6.3 | Deep link iOS | ✓ | CFBundleURLSchemes `loyalrun` en Info.plist |
| 2026-04-21 | 6.4 | AuthService | ✓ | `lib/services/auth_service.dart` — signIn, signUp, signOut, resetPassword |
| 2026-04-21 | 6.4 | AppState auth wired | ✓ | signInWithEmail, signUpWithEmail, signOutAsync conectados a Supabase · `flutter analyze` sin errores |
| 2026-04-21 | 6.5 | Fix entitlements macOS | ✓ | `com.apple.security.network.client` agregado a DebugProfile.entitlements y Release.entitlements |
| 2026-04-21 | 6.6 | Fix trigger search_path | ✓ | `handle_new_user` falló por search_path en SECURITY DEFINER · migración `20260421175859` aplicada con `SET search_path = public` |
| 2026-04-21 | 6.7 | Prueba registro completo | ✓ | Usuario creado en auth.users + perfil auto-creado en user_profiles vía trigger |
| 2026-04-21 | 7.1 | Crear buckets Storage | ✓ | avatars, club-logos, business-assets, badge-icons — creados como Public desde Dashboard → Storage |
| 2026-04-21 | 7.2 | Políticas RLS Storage | ✓ | avatars: SELECT público + INSERT/UPDATE/DELETE solo dueño · club-logos/business-assets/badge-icons: SELECT público |
| 2026-04-21 | 8 | Edge Functions | ⏳ | Directorio functions/ no existe — se crearán al momento de necesitarlas en desarrollo |
| 2026-04-21 | 9 | Validación final | ✓ | 33 tablas visibles en Table Editor · auth.users + user_profiles funcionando · Storage buckets activos · RLS aplicado |
| | | | | |

---

## Referencias

- Supabase CLI docs: https://supabase.com/docs/reference/cli
- PostGIS en Supabase: https://supabase.com/docs/guides/database/extensions/postgis
- Edge Functions: https://supabase.com/docs/guides/functions
- Auth en Expo: https://supabase.com/docs/guides/auth/auth-react-native
- RLS guide: https://supabase.com/docs/guides/auth/row-level-security
