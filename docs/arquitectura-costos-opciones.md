# Arquitectura, Infraestructura y Costos de Equipo — LoyalRun
**app_handg** | Abril 2026 | 5 opciones desde bootstrapped hasta rango medio

---

## Componentes del sistema

Antes de las opciones, esta es la lista completa de elementos que requiere LoyalRun para operar. Cada opción selecciona una combinación diferente de herramientas para cada componente.

| # | Componente | Categoría | Para qué sirve en LoyalRun |
|---|-----------|-----------|---------------------------|
| 1 | Base de datos principal | Infraestructura | Usuarios, actividades, clubs, badges, challenges |
| 2 | Autenticación | Infraestructura | Login, sesiones, tokens JWT |
| 3 | Edge Functions / Backend serverless | Infraestructura | activity-complete, validate-redemption, planes IA |
| 4 | Almacenamiento de archivos | Infraestructura | Avatares, logos de clubs y negocios |
| 5 | Servidor de IA (LLM) | Infraestructura | Planes de entrenamiento, nutrición, análisis post-actividad |
| 6 | API de rutas y mapas | Infraestructura | Generación de rutas circulares, perfil altimétrico |
| 7 | Push notifications | Infraestructura | Recompensas desbloqueadas, recordatorios de entreno |
| 8 | Analítica de producto | Infraestructura | Funnel de activación, retención, eventos clave |
| 9 | Monitoreo de errores | Infraestructura | Crashes de la app, errores en Edge Functions |
| 10 | CDN / DNS / SSL | Infraestructura | Performance, seguridad, dominio |
| 11 | CI/CD | Infraestructura | Builds automáticos, despliegue de la app |
| 12 | Build y distribución de la app | Infraestructura | Compilar y subir a App Store / Play Store |
| 13 | Email transaccional | Infraestructura | Bienvenida, recuperación de contraseña, resúmenes |
| 14 | CRM | Negocio | Gestión de leads, negocios asociados, clubs |
| 15 | Soporte al usuario | Negocio | Tickets, preguntas, problemas de la app |
| 16 | Marketing / comunicación | Negocio | Redes sociales, campañas, contenido |
| 17 | Licencias de tiendas | Negocio | Apple Developer, Google Play |
| 18 | Dominio web | Negocio | Landing page, deep links |

---

## Costos de referencia LATAM (desarrolladores y roles)

Salarios mensuales en USD para contratación remota en México, Colombia, Argentina, Chile o Perú.

| Rol | Junior | Semi-Senior | Senior |
|-----|--------|------------|--------|
| Desarrollador Mobile (React Native) | $1,200 | $2,500 | $4,500 |
| Desarrollador Backend (Supabase/Node/Deno) | $1,000 | $2,200 | $4,000 |
| Desarrollador Full Stack | $1,200 | $2,500 | $4,500 |
| Diseñador UX/UI | $900 | $1,800 | $3,200 |
| DevOps / Infraestructura | $1,500 | $3,000 | $5,000 |
| Product Manager | $1,200 | $2,500 | $4,500 |
| QA / Tester | $700 | $1,400 | $2,500 |
| Marketing Digital | $700 | $1,500 | $2,800 |
| Community Manager | $500 | $1,000 | $1,800 |
| Especialista CRM / Growth | $800 | $1,800 | $3,000 |
| FinOps / Administración | $700 | $1,400 | $2,500 |
| Soporte al cliente | $500 | $900 | $1,500 |

> Freelancers por hora LATAM: Junior $8–15/h · Semi-Senior $15–30/h · Senior $30–55/h  
> Freelancers por hora España/Portugal: Semi-Senior $25–45/h · Senior $45–80/h

---

## Las 5 opciones

---

### OPCIÓN 1 — Bootstrapped Founder Técnico
**Perfil:** El founder hace todo. Cero equipo externo. Solo los costos mínimos para tener la app en producción.  
**Adecuada para:** Fase de validación, primeros 0–200 usuarios, MVP funcional.

#### Infraestructura mensual

| Componente | Herramienta elegida | Plan | Costo/mes |
|-----------|-------------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage | **Supabase** | Free (500 MB DB, 500k invocaciones) | $0 |
| IA / LLM | **Google AI Studio (Gemini API)** | Free tier | $0 |
| Rutas circulares | **OpenRouteService** | Free (2,000 req/día) | $0 |
| Push notifications | **Expo Push Notifications** | Free (incluido en EAS) | $0 |
| Analítica | **PostHog** | Free (1M eventos/mes) | $0 |
| Monitoreo de errores | **Sentry** | Free (5,000 errores/mes) | $0 |
| CDN / DNS / SSL | **Cloudflare** | Free | $0 |
| CI/CD | **GitHub Actions** | Free (2,000 min/mes) | $0 |
| Build y distribución | **Expo EAS Build** | Free tier (30 builds/mes) | $0 |
| Email transaccional | **Resend** | Free (3,000 emails/mes) | $0 |
| CRM | **HubSpot** | Free CRM | $0 |
| Soporte | **Email directo / WhatsApp** | — | $0 |
| Dominio web | **Namecheap / Porkbun** | — | $1.25 |
| **Apple Developer** | Apple | Anual ($99) | $8.25 |
| **Google Play** | Google | One-time ($25) | $2 (primer mes) |

| | |
|--|--|
| **Total infraestructura/mes** | **~$10** |
| **Total equipo/mes** | **$0** (founder técnico) |
| **TOTAL MENSUAL** | **~$10** |

**Limitaciones reales:**
- Supabase Free: DB se pausa después de 7 días de inactividad
- Gemini free tier: rate limits bajos, no escala
- Sin métricas avanzadas de negocio
- Todo el tiempo del founder va a desarrollo

---

### OPCIÓN 2 — Bootstrapped con Freelancers Puntuales
**Perfil:** Founder técnico + 1–2 freelancers LATAM part-time para UX y marketing.  
**Adecuada para:** 200–500 usuarios, primeras iteraciones de producto con feedback real.

#### Infraestructura mensual

| Componente | Herramienta elegida | Plan | Costo/mes |
|-----------|-------------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage | **Supabase** | Pro ($25/mes · 8 GB DB, 250 GB storage) | $25 |
| IA / LLM | **Gemma 4 4B en Hetzner VPS** | CX22 (2 vCPU, 4 GB RAM) + Ollama | $5 |
| Rutas circulares | **OpenRouteService** | Free | $0 |
| Push notifications | **Expo Push / OneSignal** | Free (hasta 10,000 subs) | $0 |
| Analítica | **PostHog** | Free | $0 |
| Monitoreo de errores | **Sentry** | Free | $0 |
| CDN / DNS / SSL | **Cloudflare** | Free | $0 |
| CI/CD | **GitHub Actions** | Free | $0 |
| Build y distribución | **Expo EAS Build** | Free | $0 |
| Email transaccional | **Resend** | Free | $0 |
| CRM | **HubSpot** | Free CRM | $0 |
| Soporte | **Crisp Chat** | Free (2 agentes) | $0 |
| Dominio + Landing | **Namecheap + Carrd** | — | $4 |
| Apple Developer + Google Play | — | Prorrateado | $10 |

| | |
|--|--|
| **Total infraestructura/mes** | **~$44** |

#### Equipo mensual

| Rol | Tipo | Horas/mes | Tarifa | Costo/mes |
|-----|------|-----------|--------|----------|
| Diseñador UX/UI | Freelance LATAM semi-senior | 20 h | $18/h | $360 |
| Community Manager / Marketing | Freelance LATAM junior | 30 h | $8/h | $240 |

| | |
|--|--|
| **Total equipo/mes** | **~$600** |
| **TOTAL MENSUAL** | **~$644** |

---

### OPCIÓN 3 — Micro Equipo MVP
**Perfil:** 3–4 personas part-time o 2 full-time. Primera estructura formal de startup.  
**Adecuada para:** 500–1,500 usuarios, primeros clubes y negocios reales integrados, iteración rápida de producto.

#### Infraestructura mensual

| Componente | Herramienta elegida | Plan | Costo/mes |
|-----------|-------------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage | **Supabase** | Pro | $25 |
| IA / LLM (planes entrenamiento + nutrición) | **Gemma 4 12B en Hetzner VPS** | CX32 (4 vCPU, 8 GB RAM) + Ollama | $13 |
| IA / LLM (tareas simples, análisis) | **Google Gemini 2.5 Flash-Lite API** | Pay-as-you-go (~500 usuarios) | $10 |
| Rutas circulares | **OpenRouteService** | Free | $0 |
| Push notifications | **OneSignal** | Free (hasta 10k subs) | $0 |
| Analítica | **PostHog** | Free | $0 |
| Monitoreo de errores | **Sentry** | Free | $0 |
| CDN / DNS / SSL | **Cloudflare** | Free | $0 |
| CI/CD | **GitHub Actions** | Free | $0 |
| Build y distribución | **Expo EAS Build** | Production ($29/mes) | $29 |
| Email transaccional | **Resend** | Pro ($20/mes · 50k emails) | $20 |
| CRM | **HubSpot** | Starter ($45/mes) | $45 |
| Soporte | **Crisp Chat** | Essentials ($25/mes) | $25 |
| Dominio + Landing page | **Webflow** | Starter ($14/mes) | $14 |
| Apple Developer + Google Play | — | Prorrateado | $10 |
| Gestión de proyecto | **Linear** | Free | $0 |
| Repositorio / docs | **GitHub + Notion** | Free | $0 |

| | |
|--|--|
| **Total infraestructura/mes** | **~$191** |

#### Equipo mensual

| Rol | Tipo | Dedicación | Costo/mes |
|-----|------|-----------|----------|
| Dev Full Stack (React Native + Supabase) | Full-time LATAM semi-senior | 100 % | $2,500 |
| Diseñador UX/UI | Part-time LATAM semi-senior | 50 % | $900 |
| Marketing Digital + Community | Part-time LATAM junior | 50 % | $700 |

| | |
|--|--|
| **Total equipo/mes** | **~$4,100** |
| **TOTAL MENSUAL** | **~$4,291** |

---

### OPCIÓN 4 — Equipo Startup Consolidado
**Perfil:** 5–7 personas. Estructura funcional con roles definidos. Producto maduro y en crecimiento activo.  
**Adecuada para:** 1,500–5,000 usuarios, expansión a nuevas ciudades, primeros ingresos por suscripción o comisión a negocios.

#### Infraestructura mensual

| Componente | Herramienta elegida | Plan | Costo/mes |
|-----------|-------------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage | **Supabase** | Pro (scale-up) | $25 |
| IA / LLM principal (planes complejos) | **Claude Haiku 4.5 API** | ~2,000 usuarios activos | $360 |
| IA / LLM tareas simples | **Gemma 4 self-hosted en Hetzner** | CX32 + Ollama | $13 |
| Rutas circulares + elevación | **OpenRouteService** | Free | $0 |
| Push notifications | **OneSignal** | Growth ($9/mes · hasta 100k subs) | $9 |
| Analítica de producto | **PostHog** | Pago (~2M eventos) | $45 |
| Monitoreo de errores + performance | **Sentry** | Team ($26/mes) | $26 |
| CDN / DNS / SSL | **Cloudflare** | Pro ($20/mes) | $20 |
| CI/CD + staging environments | **GitHub Actions** | Team ($4/usuario) | $20 |
| Build y distribución | **Expo EAS Build** | Production ($29/mes) | $29 |
| Email transaccional + marketing email | **Resend + Loops** | $20 + $49 | $69 |
| CRM | **HubSpot** | Starter Suite | $45 |
| Soporte al cliente | **Crisp Chat** | Pro ($95/mes · equipo) | $95 |
| Landing + blog SEO | **Webflow** | CMS ($23/mes) | $23 |
| Apple Developer + Google Play | — | Prorrateado | $10 |
| Gestión de proyecto | **Linear** | Standard ($8/usuario × 6) | $48 |
| Documentación interna | **Notion** | Plus ($8/usuario × 6) | $48 |
| Videoconferencias | **Google Workspace** | Business Starter ($7/usuario × 6) | $42 |

| | |
|--|--|
| **Total infraestructura/mes** | **~$927** |

#### Equipo mensual

| Rol | Tipo | Nivel | Dedicación | Costo/mes |
|-----|------|-------|-----------|----------|
| Dev Mobile Lead (React Native) | Full-time LATAM | Senior | 100 % | $4,500 |
| Dev Backend (Supabase + IA) | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Diseñador UX/UI | Full-time LATAM | Semi-senior | 100 % | $1,800 |
| Product Manager | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Marketing Digital + Growth | Full-time LATAM | Semi-senior | 100 % | $1,500 |
| Especialista CRM / Partnerships | Part-time LATAM | Junior-Mid | 50 % | $900 |

| | |
|--|--|
| **Total equipo/mes** | **~$13,700** |
| **TOTAL MENSUAL** | **~$14,627** |

---

### OPCIÓN 5 — Pre-Crecimiento / Pre-Serie A
**Perfil:** 8–12 personas. Equipo funcional completo. Producto escalando con ingresos recurrentes que empiezan a cubrir parte de los costos.  
**Adecuada para:** 5,000–15,000 usuarios, múltiples ciudades, modelo de negocio probado (suscripción clubs + comisión negocios).

#### Infraestructura mensual

| Componente | Herramienta elegida | Plan | Costo/mes |
|-----------|-------------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage | **Supabase** | Pro + Add-ons (compute upgrade) | $125 |
| IA / LLM principal (planes complejos) | **Claude Sonnet 4.6 API** | ~5,000 usuarios activos | $700 |
| IA / LLM tareas simples y batch | **Claude Haiku 4.5 (Batch API 50% off)** | Alto volumen | $250 |
| IA self-hosted (backup + dev) | **Gemma 4 en Hetzner CX52** | 8 vCPU, 16 GB RAM | $38 |
| Rutas circulares | **ORS self-hosted en Hetzner** | CX22 dedicado | $5 |
| Push notifications | **OneSignal** | Professional ($99/mes) | $99 |
| Analítica avanzada | **PostHog** | Scale (~10M eventos) | $150 |
| Monitoreo + APM | **Sentry** | Business ($80/mes) | $80 |
| CDN / DDoS / SSL | **Cloudflare** | Pro | $20 |
| CI/CD + testing | **GitHub Actions** | Team | $40 |
| Build y distribución | **Expo EAS Build** | Enterprise ($799/mes) | $799 |
| Email transaccional + marketing | **Resend + Loops** | $40 + $99 | $139 |
| CRM + Sales | **HubSpot** | Professional ($890/mes) | $890 |
| Soporte + Help Center | **Intercom** | Essential ($39/seat × 3) | $117 |
| Landing + SEO + Blog | **Webflow** | Business ($39/mes) | $39 |
| Apple Developer + Google Play | — | — | $10 |
| Gestión de proyecto | **Linear** | Business ($16/usuario × 10) | $160 |
| Documentación | **Notion** | Business ($15/usuario × 10) | $150 |
| Google Workspace | Business | $12/usuario × 10 | $120 |
| Backups + DR | **Supabase + S3 Backblaze** | — | $25 |
| VPN / Seguridad acceso | **Tailscale** | Starter ($6/usuario × 10) | $60 |

| | |
|--|--|
| **Total infraestructura/mes** | **~$3,866** |

#### Equipo mensual

| Rol | Tipo | Nivel | Dedicación | Costo/mes |
|-----|------|-------|-----------|----------|
| CTO / Dev Lead Mobile | Full-time LATAM | Senior | 100 % | $5,000 |
| Dev Backend + IA | Full-time LATAM | Senior | 100 % | $4,000 |
| Dev Mobile | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Dev Full Stack / QA | Full-time LATAM | Semi-senior | 100 % | $2,200 |
| Diseñador UX/UI | Full-time LATAM | Senior | 100 % | $3,200 |
| Product Manager | Full-time LATAM | Senior | 100 % | $4,500 |
| Head of Marketing | Full-time LATAM | Senior | 100 % | $3,500 |
| Especialista Marketing Digital | Full-time LATAM | Semi-senior | 100 % | $1,500 |
| Community Manager | Full-time LATAM | Junior | 100 % | $800 |
| Especialista CRM / Partnerships | Full-time LATAM | Semi-senior | 100 % | $1,800 |
| Customer Success / Soporte | Full-time LATAM | Junior | 100 % | $900 |
| FinOps / Administración | Part-time LATAM | Semi-senior | 50 % | $1,400 |

| | |
|--|--|
| **Total equipo/mes** | **~$31,300** |
| **TOTAL MENSUAL** | **~$35,166** |

---

## Comparativa consolidada

| | Opción 1 | Opción 2 | Opción 3 | Opción 4 | Opción 5 |
|--|----------|----------|----------|----------|----------|
| **Nombre** | Bootstrapped Solo | Bootstrapped + Freelancers | Micro Equipo MVP | Equipo Consolidado | Pre-Serie A |
| **Usuarios objetivo** | 0–200 | 200–500 | 500–1,500 | 1,500–5,000 | 5,000–15,000 |
| **Infraestructura/mes** | ~$10 | ~$44 | ~$191 | ~$927 | ~$3,866 |
| **Equipo/mes** | $0 | ~$600 | ~$4,100 | ~$13,700 | ~$31,300 |
| **TOTAL/mes** | **~$10** | **~$644** | **~$4,291** | **~$14,627** | **~$35,166** |
| **TOTAL/año** | **~$120** | **~$7,728** | **~$51,492** | **~$175,524** | **~$421,992** |
| **IA / LLM** | Gemini free tier | Gemma self-hosted | Gemma + Gemini pago | Claude Haiku + Gemma | Claude Sonnet + Haiku batch |
| **Base de datos** | Supabase Free | Supabase Pro | Supabase Pro | Supabase Pro | Supabase Pro + compute |
| **Build app** | EAS Free | EAS Free | EAS Production | EAS Production | EAS Enterprise |
| **CRM** | HubSpot Free | HubSpot Free | HubSpot Starter | HubSpot Starter | HubSpot Professional |
| **Soporte** | Email / WA | Email / WA | Crisp Essentials | Crisp Pro | Intercom |
| **Equipo técnico** | 1 founder | 1 founder + freelancers | 1 full-time dev | 2 devs full-time | 4 devs full-time |

---

## Notas sobre la transición entre opciones

### De Opción 1 a Opción 2
El único salto recomendado es activar **Supabase Pro** cuando llegues a los primeros 100 usuarios reales (elimina la pausa de la DB en inactividad). El resto puede mantenerse gratis hasta los 300–400 usuarios.

### De Opción 2 a Opción 3
El salto más importante es contratar el **primer desarrollador full-time**. Hacerlo con un semi-senior en LATAM por $2,500/mes es la decisión con mejor ROI del roadmap. El primer dev debe dominar React Native + Supabase.

### De Opción 3 a Opción 4
El habilitador de este salto es tener **ingresos recurrentes** (aunque sea $2,000–3,000/mes de clubs o negocios). Sin eso, la Opción 4 se vuelve insostenible para un startup sin financiación.

### De Opción 4 a Opción 5
Esta transición casi siempre requiere capital externo (ángel, pre-seed) o ingresos de $15,000+/mes. No intentes llegar aquí solo con ingresos orgánicos desde cero; necesitas un runway de al menos 12 meses.

---

## Recomendación de ruta para LoyalRun sin financiación

```
MES 1–3    → Opción 1:  valida el producto con usuarios reales, costo casi cero
MES 4–6    → Opción 2:  activa Supabase Pro, itera UX con un freelancer
MES 7–12   → Opción 3:  primer dev full-time cuando tengas 300+ usuarios activos
MES 13–18  → Opción 4:  cuando generes $5,000+/mes en ingresos recurrentes
MES 19+    → Opción 5:  con capital o ingresos que lo soporten
```

---

*Precios verificados abril 2026. Salarios LATAM basados en rangos de mercado para trabajo remoto en México, Colombia, Argentina, Chile y Perú. Todos los valores en USD.*
