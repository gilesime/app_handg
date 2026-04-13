# Análisis de Costos — Servicios de IA y Rutas
**LoyalRun · app_handg** | Abril 2026

---

## Modelo de facturación

Anthropic, Google y OpenAI facturan por **tokens** — unidades de texto que el modelo procesa.  
> 1 token ≈ 0.75 palabras en español.

Pagas por separado lo que **envías** (input) y lo que el modelo **responde** (output).  
OpenRouteService no es un LLM; es un servicio de ruteo geoespacial con modelo **freemium por número de requests**.

---

## Precios actuales (Abril 2026)

### Anthropic — Claude API

| Modelo | Input $/MTok | Output $/MTok | Cache Write 5min | Cache Write 1h | Cache Read |
|--------|-------------|--------------|-----------------|---------------|-----------|
| Claude Haiku 4.5 | $1.00 | $5.00 | $1.25 | $2.00 | $0.10 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $3.75 | $6.00 | $0.30 |
| Claude Opus 4.6 | $5.00 | $25.00 | $6.25 | $10.00 | $0.50 |

- **Tier gratuito:** No existe. Requiere tarjeta de crédito desde el primer uso.
- **Batch API:** 50 % de descuento en input y output para llamadas asíncronas.
- **Prompt Caching:** Hasta 90 % de ahorro en tokens de input reutilizados.
- **Facturación:** Pay-as-you-go, sin mínimo mensual.

---

### Google — Gemini API

| Modelo | Input $/MTok | Output $/MTok | Notas |
|--------|-------------|--------------|-------|
| Gemini 2.5 Flash-Lite | $0.10 | $0.40 | Modelo más económico |
| Gemini 2.5 Flash | $0.30 | $2.50 | Equilibrio costo/calidad |
| Gemini 2.5 Pro | $1.25 – $2.50* | $10.00 | *Según tamaño de contexto |

- **Tier gratuito:** Disponible en Google AI Studio con rate limits bajos (uso experimental).
- **Batch API:** 50 % de descuento en llamadas no urgentes.
- **Context Caching:** Reduce el costo en prompts grandes repetidos.
- **Gemini 2.0 Flash** se descontinúa el 1 de junio de 2026.
- **Facturación:** Pay-as-you-go una vez activado el billing en Google Cloud.

---

### OpenAI — GPT API

| Modelo | Input $/MTok | Output $/MTok | Cached Input $/MTok |
|--------|-------------|--------------|-------------------|
| GPT-4o mini | $0.15 | $0.60 | $0.075 |
| GPT-4o | $2.50 | $10.00 | $1.25 |

- **Tier gratuito:** $5 USD en créditos para nuevas cuentas (expiran en 3 meses).
- **Batch API:** 50 % de descuento en llamadas en lote.
- **Prompt Caching:** 50 % de descuento en inputs cacheados.
- **Facturación:** Pay-as-you-go, sin mínimo mensual.

---

### OpenRouteService — Rutas circulares

| Plan | Requests/día | Requests/minuto | Precio |
|------|-------------|----------------|--------|
| Free (Directions) | 2,000 | 40 | $0/mes |
| Free (Isochrones) | 500 | 20 | $0/mes |
| Free (Matrix) | 500 | 40 | $0/mes |
| Self-hosted | Ilimitado | Ilimitado | Costo de servidor (~$20–40/mes) |

- Es **código abierto** (GitHub: GIScience/openrouteservice).
- El tier gratuito cubre hasta **60,000 requests/mes** para rutas.
- Incluye datos de **elevación altimétrica**, soporte para rutas circulares nativo y perfiles de superficie.
- Para escala >60,000 req/mes se recomienda **self-hostearlo** en un VPS.

---

## Supuestos del estimado

### Consumo de tokens por usuario activo por mes

| Operación | Frecuencia/mes | Input (tokens) | Output (tokens) | Total (tokens) |
|-----------|---------------|----------------|-----------------|----------------|
| Generar plan de entrenamiento semanal | 4 llamadas | 2,000 | 1,500 | 14,000 |
| Análisis post-actividad con IA | 12 llamadas | 800 | 600 | 16,800 |
| Generar plan nutricional semanal | 4 llamadas | 2,500 | 3,000 | 22,000 |
| Sugerencia de ruta diaria (descripción IA) | 20 llamadas | 300 | 200 | 10,000 |
| **Total por usuario/mes** | **40 llamadas** | **~33,600** | **~29,200** | **~62,800** |

**Rutas (OpenRouteService):** ~20 generaciones/mes por usuario. No consume tokens de LLM.

---

## Estimado mensual por escenario

### Escenario A — MVP: 500 usuarios activos

> Input total: **16.8 MTok** · Output total: **14.6 MTok**

| Modelo | Costo input | Costo output | **Total/mes** |
|--------|------------|-------------|--------------|
| Gemini 2.5 Flash-Lite | $1.68 | $5.84 | **~$8** |
| GPT-4o mini | $2.52 | $8.76 | **~$11** |
| Gemini 2.5 Flash | $5.04 | $36.50 | **~$42** |
| Claude Haiku 4.5 | $16.80 | $73.00 | **~$90** |
| GPT-4o | $42.00 | $146.00 | **~$188** |
| Claude Sonnet 4.6 | $50.40 | $219.00 | **~$270** |

**ORS rutas:** 10,000 req/mes → **$0** (dentro del tier gratis de 60,000/mes)

---

### Escenario B — Crecimiento: 2,000 usuarios activos

> Input total: **67.2 MTok** · Output total: **58.4 MTok**

| Modelo | Costo input | Costo output | **Total/mes** |
|--------|------------|-------------|--------------|
| Gemini 2.5 Flash-Lite | $6.72 | $23.36 | **~$30** |
| GPT-4o mini | $10.08 | $35.04 | **~$45** |
| Gemini 2.5 Flash | $20.16 | $146.00 | **~$166** |
| Claude Haiku 4.5 | $67.20 | $292.00 | **~$359** |
| GPT-4o | $168.00 | $584.00 | **~$752** |
| Claude Sonnet 4.6 | $201.60 | $876.00 | **~$1,078** |

**ORS rutas:** 40,000 req/mes → **$0** (aún dentro del tier gratis)

---

### Escenario C — Escala: 10,000 usuarios activos

> Input total: **336 MTok** · Output total: **292 MTok**

| Modelo | Costo input | Costo output | **Total/mes** |
|--------|------------|-------------|--------------|
| Gemini 2.5 Flash-Lite | $33.60 | $116.80 | **~$150** |
| GPT-4o mini | $50.40 | $175.20 | **~$226** |
| Gemini 2.5 Flash | $100.80 | $730.00 | **~$831** |
| Claude Haiku 4.5 | $336.00 | $1,460.00 | **~$1,796** |
| GPT-4o | $840.00 | $2,920.00 | **~$3,760** |
| Claude Sonnet 4.6 | $1,008.00 | $4,380.00 | **~$5,388** |

**ORS rutas:** 200,000 req/mes → **excede el tier gratis** → self-hostearlo: **~$20–40/mes** adicionales.

---

## Estrategias para reducir el costo hasta un 60 %

### 1. Batch API — 50 % de descuento
Los planes de entrenamiento y nutrición no requieren respuesta en tiempo real.  
Se pueden generar en un job nocturno (cron de Supabase) y estar listos para cuando el usuario abra la app.  
Los tres proveedores ofrecen esta opción.

```
Aplica a:  Plan de entrenamiento semanal  ✓
           Plan nutricional semanal       ✓
           Sugerencia de ruta diaria      ✓
No aplica: Análisis post-actividad        ✗  (el usuario espera la respuesta)
```

### 2. Prompt Caching
El system prompt (instrucciones del entrenador, restricciones dietéticas del usuario, reglas de negocio) es **idéntico** en todas las llamadas del mismo usuario.  
Cacheado, el costo del input cae hasta un **10 % en Claude** y un **50 % en OpenAI**.

```
Tokens típicos del system prompt reutilizable:  ~1,200 tokens
Sin caché (40 llamadas/mes):  40 × 1,200 = 48,000 tokens facturados como input
Con caché:                    48,000 × 0.10 =  4,800 tokens  (Claude)
Ahorro mensual por usuario:   ~43,200 tokens de input
```

### 3. Modelo mixto por tarea
Usar modelos económicos para tareas simples y modelos premium solo donde la calidad es crítica.

| Tarea | Modelo recomendado | Razón |
|-------|--------------------|-------|
| Sugerencia post-actividad | Gemini Flash-Lite / GPT-4o mini | Texto corto, baja complejidad |
| Descripción de rutas | Gemini Flash-Lite / GPT-4o mini | Output breve, sin razonamiento complejo |
| Seguimiento nutricional diario | Gemini Flash-Lite | Cálculo de macros, no requiere creatividad |
| **Plan semanal de entrenamiento** | **Claude Haiku / Sonnet** | Alta precisión en JSON estructurado, lógica de progresión |
| **Plan nutricional personalizado** | **Claude Haiku / Sonnet** | Múltiples restricciones simultáneas, semanas coherentes |

---

## Resumen de recomendación por fase

| Fase del producto | Configuración recomendada | Costo estimado/mes |
|------------------|--------------------------|-------------------|
| **MVP** (≤ 500 usuarios) | Gemini 2.5 Flash-Lite para todo | **< $10** |
| **MVP con calidad** (≤ 500 usuarios) | GPT-4o mini + Claude Haiku para planes | **~$30–50** |
| **Crecimiento** (≤ 2,000 usuarios) | Modelo mixto + Batch API | **~$80–130** |
| **Escala** (10,000 usuarios) | Modelo mixto + Batch API + Prompt Cache + ORS self-hosted | **~$300–500** |

> **Punto de partida sugerido:** Comenzar con **Gemini 2.5 Flash-Lite** (tier gratuito disponible para pruebas) y migrar a **Claude Haiku 4.5** cuando se requiera mayor precisión en los planes estructurados. Las rutas con OpenRouteService son gratuitas hasta bien entrada la fase de escala.

---

*Precios verificados en abril de 2026. Sujetos a cambios por parte de cada proveedor.*  
*MTok = 1 millón de tokens.*
