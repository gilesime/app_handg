# Analisis competitivo y wireframes de referencia

Rama de trabajo: `feat/ux-competitive-wireframes`

Necesidad de negocio: validar si la interfaz actual de `app_handg` compite en simplicidad y claridad contra apps lideres de running, y convertir ese analisis en ajustes concretos de producto para mejorar activacion, continuidad y retencion.

Este documento compara `app_handg` con seis referencias de running y entrenamiento:

- Strava
- adidas Running
- Runna
- Nike Run Club
- Garmin Connect
- Polar Flow

Objetivo: validar si las pantallas actuales del proyecto conservan un nivel parecido de simplicidad y funcionalidad, y detectar donde conviene acercarse mas a los patrones del mercado.

## 1. Patrones detectados por app

### Strava

- Home/feed orientado a actividad reciente, comunidad y descubrimiento.
- CTA de tracking visible, pero no siempre domina toda la pantalla.
- Mucha importancia visual a mapa, ruta, segmentos y actividad compartible.
- Sensacion: producto simple para iniciar, mas profundo cuando exploras.

### adidas Running

- Combina objetivo personal, progreso, retos y tracking.
- Home con balance entre motivacion y accion.
- Buena mezcla entre progreso semanal y desafio personal.
- Sensacion: mas guiado y lifestyle que tecnico.

### Runna

- Home muy enfocada en plan semanal y siguiente entrenamiento.
- Prioriza estructura, coaching y claridad de agenda.
- El usuario casi siempre sabe "que toca hoy".
- Sensacion: menos feed, mas programa.

### Nike Run Club

- Muy clara en motivacion, guideds runs y progreso.
- CTA fuerte para correr, con menos saturacion de datos que Garmin.
- Usa bien bloques emocionales: logros, retos, coaching.
- Sensacion: simple, aspiracional, muy usable.

### Garmin Connect

- Dashboard configurable con muchas metricas.
- Fuerte en salud, rendimiento, carga, dispositivos y analitica.
- Menos simple visualmente, mas potente para usuarios avanzados.
- Sensacion: plataforma de datos.

### Polar Flow

- Similar a Garmin en enfoque analitico, pero con peso fuerte en entrenamiento, recovery y frecuencia cardiaca.
- Mas orientada a lectura de progreso y calidad del entrenamiento que a comunidad.
- Sensacion: coaching y control.

## 2. Lectura rapida vs `app_handg`

### Donde `app_handg` ya se parece al mercado

- La pantalla de tracking es simple y competitiva en lo esencial: mapa, distancia, tiempo, ritmo, pausa y finalizar.
- El home ya mezcla varios patrones validos del mercado: progreso, retos, ranking y actividad reciente.
- El resumen post actividad tiene buena jerarquia visual: celebracion, stats y siguiente accion.
- La navegacion por tabs es corta y facil de entender.

### Donde hoy se ve mas "wireframe funcional" que producto comparable

- El home no tiene una prioridad narrativa tan clara como `Runna` o `Nike Run Club`.
- La pantalla de historial esta bastante mas basica que las referencias principales.
- Falta una capa de objetivo personal o "proxima mejor accion" en home.
- El valor de wearables existe, pero no todavia con la riqueza visual de `Garmin` o `Polar`.
- `Rewards` y `Map` son diferenciales, pero todavia no estan integrados al loop principal de entrenamiento de forma tan natural.

### Veredicto

`app_handg` si se parece a estas apps en simplicidad base, sobre todo en `track`, `home` y `activity-summary`. Donde aun no se parece tanto es en la sofisticacion del foco por pantalla: las apps top suelen hacer que cada vista responda una pregunta principal:

- `Runna`: que me toca hoy
- `NRC`: sal a correr y manten el impulso
- `Strava`: registra y comparte tu actividad
- `Garmin/Polar`: entiende tu rendimiento

En `app_handg` hoy varias pantallas resuelven bien funciones, pero algunas todavia compiten entre si por atencion.

## 3. Comparacion por pantalla

| Pantalla `app_handg` | Estado actual | Referencia mas cercana | Lectura |
|---|---|---|---|
| `home` | XP + acciones rapidas + retos + ranking + recientes | Strava + adidas Running | Buena mezcla, pero necesita una prioridad principal mas fuerte |
| `track` | Mapa + stats + wearable + CTA principal | NRC + Strava | Bien resuelta y simple |
| `activity-summary` | Celebracion + stats + wearable | NRC + Garmin | Buena base; faltan insights y continuidad |
| `history` | Lista funcional de sesiones | Garmin/Polar, pero muy reducida | Hoy esta por debajo del benchmark |
| `rewards` | Catalogo y canje | Diferencial propio | Aporta valor, pero no conversa suficiente con entrenamiento |
| `map` | Negocios cercanos con ofertas | Diferencial propio | Util, aunque hoy se siente separado del core running |
| `profile` | XP, badges, datos, club, consentimiento | Garmin lite | Correcta, mas utilitaria que aspiracional |

## 4. Wireframes hibridos sugeridos

Los siguientes wireframes mezclan patrones de las apps analizadas con el diferencial de `app_handg`.

### Wireframe A: Home hibrido

Inspiracion:
- Runna: bloque principal "lo que sigue"
- NRC: CTA emocional y claro
- Strava/adidas Running: progreso y comunidad
- app_handg: rewards y club

```text
+--------------------------------------------------+
| Hola, Gilberto                    Nivel 7  8,420 |
| Club: Loyal Runners                              |
+--------------------------------------------------+
| HOY                                               |
| [ Proxima accion ]                                |
|  Carrera suave 5 km                 32 min       |
|  Objetivo semanal: 12 / 20 km                    |
|  [ Empezar ahora ]   [ Ver plan ]                |
+--------------------------------------------------+
| TU PROGRESO                                       |
|  Racha: 4 dias   XP esta semana: +520            |
|  [###########-----] 60% meta semanal             |
+--------------------------------------------------+
| CLUB                                              |
|  Ranking semanal                                 |
|  #1 Ana      18 km                               |
|  #2 Tu       12 km                               |
|  #3 Luis     11 km                               |
|  [ Ver ranking completo ]                        |
+--------------------------------------------------+
| RECOMPENSAS CERCA                                 |
|  Cafe 20% off al completar 15 km semanales       |
|  [ Ver mapa ]                                     |
+--------------------------------------------------+
| Tabs: Inicio | Track | Mapa | Rewards | Perfil   |
+--------------------------------------------------+
```

Decision de producto:
- Mantener simplicidad, pero darle una prioridad clara al primer bloque.
- El CTA principal deberia ser uno solo.

### Wireframe B: Tracking hibrido

Inspiracion:
- NRC: claridad y foco
- Strava: mapa protagonista
- Garmin/Polar: lectura de sensores
- app_handg: wearable + recompensas

```text
+--------------------------------------------------+
|                        MAPA                       |
|                  ruta en tiempo real              |
|                                                  |
|             [ chip: FC conectada 152 bpm ]       |
+--------------------------------------------------+
| Distancia        Tiempo          Ritmo            |
| 4.82 km          00:29:14        6:03 /km        |
| Calorias         Elevacion       Zona FC         |
| 286 kcal         42 m            Z3              |
+--------------------------------------------------+
| Progreso reward del club                          |
|  Te faltan 1.2 km para desbloquear cafe 2x1      |
+--------------------------------------------------+
| [ Finalizar ]                 [ Pausar ]          |
+--------------------------------------------------+
```

Decision de producto:
- Tu pantalla actual ya va muy bien.
- La mejora mas fuerte seria agregar una sola capa extra de contexto: zona cardiaca, laps o progreso hacia meta.

### Wireframe C: Resumen post actividad

Inspiracion:
- NRC: celebracion
- Garmin/Polar: analitica util
- Strava: posibilidad de guardar y revisar
- app_handg: XP + rewards

```text
+--------------------------------------------------+
|                     +120 XP                      |
|              Actividad completada                 |
+--------------------------------------------------+
| 5.03 km     31:10     6:11 /km     164 bpm avg   |
+--------------------------------------------------+
| INSIGHTS                                          |
| - Mejor ritmo en km 3                             |
| - 72% del tiempo en zona aerobica                 |
| - Nuevo record semanal de distancia               |
+--------------------------------------------------+
| IMPACTO EN CLUB                                   |
| +5 posiciones en ranking                           |
| Reward desbloqueado: Smoothie 15% off             |
+--------------------------------------------------+
| [ Ver historial ]   [ Nueva actividad ]           |
+--------------------------------------------------+
```

Decision de producto:
- Conviene que esta pantalla no termine solo en stats.
- Debe conectar con continuidad: progreso, club y recompensa.

### Wireframe D: Historial + analitica ligera

Inspiracion:
- Strava: lista entendible
- Garmin/Polar: filtros y comparacion
- app_handg: XP y club

```text
+--------------------------------------------------+
| Historial                                         |
| [ 7 dias ] [ 30 dias ] [ Club ] [ Todo ]         |
+--------------------------------------------------+
| Resumen                                           |
| 24.6 km   3h 48m   +640 XP   4 actividades       |
+--------------------------------------------------+
| Sab 12 abr   8.2 km   48:11   5:52/km   +180 XP  |
| Jue 10 abr   5.0 km   31:10   6:11/km   +120 XP  |
| Mar 08 abr   6.4 km   39:30   6:10/km   +160 XP  |
| Lun 07 abr   5.0 km   32:05   6:25/km   +180 XP  |
+--------------------------------------------------+
| [ Ver detalle de actividad ]                      |
+--------------------------------------------------+
```

Decision de producto:
- Aqui tienes la brecha mas clara contra mercado.
- Sin volverla compleja, un resumen superior y filtros ya la pondrian mucho mas cerca del benchmark.

### Wireframe E: Mapa de negocios integrado al running loop

Inspiracion:
- Strava: mapa contextual
- adidas Running/NRC: recompensa emocional
- app_handg: diferencial comercial

```text
+--------------------------------------------------+
| Mapa de beneficios                                |
| 6 negocios cerca                                  |
+--------------------------------------------------+
|                  MAPA                             |
|       pines por categoria / distancia             |
+--------------------------------------------------+
| Oferta destacada                                  |
| Cafe Central                                      |
| 20% de descuento                                  |
| Desbloqueo: completar 15 km esta semana           |
| Tu progreso: 12 / 15 km                           |
| [ Ir al negocio ]   [ Ver condiciones ]           |
+--------------------------------------------------+
```

Decision de producto:
- La clave no es solo mostrar negocios.
- La clave es mostrar por que esa oferta importa ahora, ligada al esfuerzo del usuario.

## 5. Recomendaciones concretas para `app_handg`

### Alta prioridad

1. Reordenar `home` para que el primer bloque sea una sola accion principal.
2. Mejorar `history` con filtros y un resumen superior.
3. Conectar `activity-summary` con rewards, ranking y progreso semanal.

### Media prioridad

1. Agregar una meta semanal visible en home.
2. En `track`, mostrar una sola metrica avanzada adicional: zona cardiaca o progreso hacia reward/meta.
3. Hacer que `map` y `rewards` se conecten mejor con kilometros, rachas o retos.

### Baja prioridad

1. Enriquecer `profile` con tendencias personales.
2. Dar mas configurabilidad tipo Garmin solo si el usuario avanzado realmente lo pide.

## 6. Conclusión

La app actual va bien encaminada en simplicidad. No se ve sobrecargada y ya tiene un loop valioso que varias referencias no tienen: `actividad -> XP -> club -> recompensa`.

La principal oportunidad no es agregar muchas funciones, sino darles mejor jerarquia:

- una accion principal en home
- mejor continuidad despues de terminar una actividad
- historial menos basico
- rewards mas integrados al esfuerzo deportivo

Si haces esos ajustes, `app_handg` puede sentirse tan simple como `NRC` o `Runna`, pero con un diferencial propio que esas apps no tienen.

## 7. Fuentes consultadas

- Strava App Store: https://apps.apple.com/is/app/strava-run-bike-hike/id426826309
- adidas Running App Store: https://apps.apple.com/us/app/adidas-running-run-tracker/id336599882
- Runna App Store: https://apps.apple.com/us/app/runna-running-plans-coach/id1594204443
- Nike Run Club App Store: https://apps.apple.com/us/app/nike-run-club-running-coach/id387771637
- Garmin Connect App Store: https://apps.apple.com/es/app/garmin-connect/id583446403?l=en
- Polar Flow App Store: https://apps.apple.com/us/app/polar-flow/id717172678
- Runna Support: https://support.runna.com/en/articles/11168168-how-to-use-runna-for-free

Nota: algunas conclusiones de UX son una inferencia a partir de la combinacion entre descripciones oficiales, estructura funcional publicada y patrones visuales estables de estas apps en App Store. Si quieres, en el siguiente paso puedo ampliar este documento con una matriz mas estricta por pantalla y feature.
