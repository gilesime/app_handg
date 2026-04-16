# Arquitectura y Costos Detallados por Opción — LoyalRun
**app_handg** | Abril 2026

---

## TABLA A — Catálogo de componentes por tipo

Todos los componentes que requiere LoyalRun para operar, clasificados por categoría funcional.

| # | Componente | Tipo | Descripción funcional en LoyalRun |
|---|-----------|------|----------------------------------|
| 1 | Base de datos relacional | Infraestructura · Core | Usuarios, actividades, clubs, badges, challenges, recompensas, wearables |
| 2 | Autenticación y sesiones | Infraestructura · Core | Login, signup, JWT, recuperación de contraseña, OAuth |
| 3 | Backend serverless (Edge Functions) | Infraestructura · Core | activity-complete, validate-redemption, generación de planes IA, webhooks |
| 4 | Almacenamiento de archivos | Infraestructura · Core | Avatares de usuarios, logos de clubs y negocios, assets de la app |
| 5 | Extensión geoespacial (PostGIS) | Infraestructura · Core | Búsquedas por proximidad, rutas, ST_DWithin para negocios cercanos |
| 6 | Servidor LLM / IA generativa | Infraestructura · IA | Generación de planes de entrenamiento, nutrición, análisis post-actividad |
| 7 | API de rutas y mapas | Infraestructura · IA | Rutas circulares desde domicilio, perfil altimétrico, perfiles de inclinación |
| 8 | Push notifications | Infraestructura · Comunicación | Recompensas desbloqueadas, recordatorios de entreno, sugerencia de ruta diaria |
| 9 | Email transaccional | Infraestructura · Comunicación | Bienvenida, recuperación de contraseña, resúmenes semanales de actividad |
| 10 | Email marketing / newsletters | Marketing · Comunicación | Campañas, onboarding sequences, reactivación de usuarios inactivos |
| 11 | Analítica de producto | Infraestructura · Observabilidad | Funnel de activación, retención, eventos clave (primera actividad, primer canje) |
| 12 | Monitoreo de errores y crashes | Infraestructura · Observabilidad | Errores en Edge Functions, crashes de la app en iOS/Android |
| 13 | CDN / DNS / SSL | Infraestructura · Red | Performance de assets, seguridad HTTPS, dominio propio |
| 14 | CI/CD | Infraestructura · DevOps | Pipelines de build automático, tests, despliegue de Edge Functions |
| 15 | Build y distribución de la app | Infraestructura · DevOps | Compilación para iOS y Android, subida a App Store y Play Store |
| 16 | CRM | CRM · Ventas | Gestión de leads (clubs y negocios), pipeline de ventas, seguimiento de cuentas |
| 17 | Soporte al usuario | CRM · Soporte | Tickets, chat en la app, preguntas frecuentes, resolución de problemas |
| 18 | Gestión de proyecto | Herramienta · Equipo | Tickets de desarrollo, roadmap, sprints, priorización |
| 19 | Documentación interna | Herramienta · Equipo | Wiki, guías de onboarding, decisiones de producto, ADRs |
| 20 | Comunicación del equipo | Herramienta · Equipo | Videollamadas, mensajería interna, coordinación diaria |
| 21 | Repositorio de código | Herramienta · Equipo | Control de versiones, pull requests, code review |
| 22 | Landing page y blog | Marketing · Web | Captación orgánica, SEO, información del producto para clubs y negocios |
| 23 | Dominio web | Infraestructura · Red | Identidad digital, deep links de la app |
| 24 | Apple Developer Program | Licencia | Publicación y mantenimiento en App Store |
| 25 | Google Play Developer | Licencia | Publicación y mantenimiento en Play Store |
| 26 | Marketing en redes sociales | Marketing · Adquisición | Contenido, comunidad, campañas orgánicas y pagas |
| 27 | Herramienta de diseño UI/UX | Herramienta · Diseño | Wireframes, prototipos, sistema de diseño, assets visuales |
| 28 | Backups y recuperación | Infraestructura · Seguridad | Copias de seguridad de la DB, disaster recovery |
| 29 | FinOps / Administración | Operaciones | Contabilidad, facturación a negocios, control de costos de infra |
| 30 | VPN / Acceso seguro al equipo | Infraestructura · Seguridad | Acceso seguro a servidores y entornos de staging |

---

## TABLA B1 — Opción 1: Bootstrapped Founder Técnico

**Perfil:** Un founder técnico que construye y opera todo. Cero equipo externo.  
**Usuarios objetivo:** 0–200 | **Runway:** Indefinido (costo casi nulo)

| Componente | Tipo | Herramienta | Plan | Costo/mes |
|-----------|------|------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage + PostGIS | Infraestructura · Core | **Supabase** | Free (500 MB DB, 50 MB storage, 500k invocaciones/mes) | $0 |
| Servidor LLM / IA generativa | Infraestructura · IA | **Google AI Studio (Gemini 2.5 Flash-Lite)** | Free tier (límites variables por cuenta) | $0 |
| API de rutas y mapas | Infraestructura · IA | **OpenRouteService** | Free (2,000 req/día · 60,000/mes) | $0 |
| Push notifications | Infraestructura · Comunicación | **Expo Push Notifications** | Free (incluido en Expo SDK) | $0 |
| Email transaccional | Infraestructura · Comunicación | **Resend** | Free (3,000 emails/mes · 100/día) | $0 |
| Email marketing | Marketing · Comunicación | **Loops** | Free (hasta 1,000 contactos) | $0 |
| CRM | CRM · Ventas | **HubSpot CRM** | Free forever (contactos ilimitados, sin límite de tiempo) | $0 |
| Soporte al usuario | CRM · Soporte | **Email directo / WhatsApp Business** | Free | $0 |
| Analítica de producto | Infraestructura · Observabilidad | **PostHog** | Free (1,000,000 eventos/mes) | $0 |
| Monitoreo de errores | Infraestructura · Observabilidad | **Sentry** | Free (5,000 errores/mes, 1 usuario) | $0 |
| CDN / DNS / SSL | Infraestructura · Red | **Cloudflare** | Free | $0 |
| CI/CD | Infraestructura · DevOps | **GitHub Actions** | Free (2,000 min/mes en repos públicos, ilimitado en privados con plan Free) | $0 |
| Build y distribución de la app | Infraestructura · DevOps | **Expo EAS Build** | Free (30 builds/mes iOS + Android) | $0 |
| Gestión de proyecto | Herramienta · Equipo | **Linear** | Free (hasta 250 issues) | $0 |
| Documentación interna | Herramienta · Equipo | **Notion** | Free (hasta 1,000 bloques) | $0 |
| Repositorio de código | Herramienta · Equipo | **GitHub** | Free (repos privados ilimitados) | $0 |
| Landing page | Marketing · Web | **Carrd** | Pro Lite ($9/año · ~$0.75/mes) | $1 |
| Dominio web | Infraestructura · Red | **Porkbun / Namecheap** | ~$15/año | $1.25 |
| Herramienta de diseño UI/UX | Herramienta · Diseño | **Figma** | Free (hasta 3 proyectos) | $0 |
| Apple Developer Program | Licencia | Apple | $99/año | $8.25 |
| Google Play Developer | Licencia | Google | $25 one-time | $2.10 (primer mes) / $0 después |
| Marketing en redes | Marketing · Adquisición | Orgánico (tiempo del founder) | — | $0 |
| Comunicación del equipo | Herramienta · Equipo | **Discord / WhatsApp** | Free | $0 |
| Backups | Infraestructura · Seguridad | Incluido en Supabase Free | — | $0 |
| FinOps / Administración | Operaciones | Founder | — | $0 |

### Resumen Opción 1

| Categoría | Costo/mes |
|-----------|----------|
| Infraestructura Core | $0 |
| IA y Rutas | $0 |
| Comunicación (push + email) | $0 |
| CRM y Soporte | $0 |
| Observabilidad | $0 |
| DevOps y Build | $0 |
| Herramientas de equipo | $0 |
| Marketing y Web | $1 |
| Dominio | $1.25 |
| Licencias de tiendas | $10.35 (mes 1) / $8.25 después |
| **Equipo** | **$0** |
| **TOTAL MES 1** | **~$12.60** |
| **TOTAL MES 2 EN ADELANTE** | **~$10.50** |

> ⚠️ **Limitación crítica:** Supabase Free pausa la DB tras 7 días de inactividad. En cuanto tengas usuarios reales activos, activa Supabase Pro ($25/mes) para eliminar ese riesgo.

---

## TABLA B2 — Opción 2: Bootstrapped + Freelancers Puntuales

**Perfil:** Founder técnico + 1–2 freelancers LATAM part-time para UX y marketing.  
**Usuarios objetivo:** 200–500 | **Runway recomendado:** 6–9 meses de ahorros personales

| Componente | Tipo | Herramienta | Plan | Costo/mes |
|-----------|------|------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage + PostGIS | Infraestructura · Core | **Supabase** | Pro ($25/mes · 8 GB DB, 100 GB storage, sin pausa) | $25 |
| Servidor LLM / IA generativa | Infraestructura · IA | **Gemma 4 4B en Hetzner VPS** | CX22 (2 vCPU, 4 GB RAM · $3.79/mes) + Ollama (free) | $4 |
| API de rutas y mapas | Infraestructura · IA | **OpenRouteService** | Free | $0 |
| Push notifications | Infraestructura · Comunicación | **OneSignal** | Free (hasta 10,000 suscriptores) | $0 |
| Email transaccional | Infraestructura · Comunicación | **Resend** | Free (3,000 emails/mes) | $0 |
| Email marketing | Marketing · Comunicación | **Loops** | Free (hasta 1,000 contactos) | $0 |
| CRM | CRM · Ventas | **HubSpot CRM** | Free forever | $0 |
| Soporte al usuario | CRM · Soporte | **Crisp Chat** | Free (1 agente, 1 chatbox) | $0 |
| Analítica de producto | Infraestructura · Observabilidad | **PostHog** | Free | $0 |
| Monitoreo de errores | Infraestructura · Observabilidad | **Sentry** | Free | $0 |
| CDN / DNS / SSL | Infraestructura · Red | **Cloudflare** | Free | $0 |
| CI/CD | Infraestructura · DevOps | **GitHub Actions** | Free | $0 |
| Build y distribución de la app | Infraestructura · DevOps | **Expo EAS Build** | Free (30 builds/mes) | $0 |
| Gestión de proyecto | Herramienta · Equipo | **Linear** | Free | $0 |
| Documentación interna | Herramienta · Equipo | **Notion** | Free | $0 |
| Repositorio de código | Herramienta · Equipo | **GitHub** | Free | $0 |
| Comunicación del equipo | Herramienta · Equipo | **Slack** | Free (90 días de historial) | $0 |
| Herramienta de diseño UI/UX | Herramienta · Diseño | **Figma** | Free | $0 |
| Landing page | Marketing · Web | **Carrd** | Pro Standard ($19/año · ~$1.60/mes) | $2 |
| Dominio web | Infraestructura · Red | **Porkbun** | ~$15/año | $1.25 |
| Apple Developer Program | Licencia | Apple | $99/año | $8.25 |
| Google Play Developer | Licencia | Google | $25 one-time | $0 |
| Marketing en redes | Marketing · Adquisición | Orgánico + freelancer | — | incluido en equipo |
| Backups | Infraestructura · Seguridad | Supabase Pro (backups diarios incluidos) | — | $0 |
| FinOps / Administración | Operaciones | Founder | — | $0 |

### Equipo Opción 2

| Rol | Tipo | Dedicación | Tarifa | Costo/mes |
|-----|------|-----------|--------|----------|
| Diseñador UX/UI | Freelance LATAM semi-senior | 20 h/mes | $18/h | $360 |
| Community Manager + Marketing | Freelance LATAM junior | 30 h/mes | $8/h | $240 |

### Resumen Opción 2

| Categoría | Costo/mes |
|-----------|----------|
| Infraestructura Core (Supabase Pro) | $25 |
| IA y Rutas (Hetzner VPS + Ollama + ORS) | $4 |
| Comunicación (push + email) | $0 |
| CRM y Soporte | $0 |
| Observabilidad | $0 |
| DevOps y Build | $0 |
| Herramientas de equipo | $0 |
| Marketing y Web | $2 |
| Dominio | $1.25 |
| Licencias de tiendas | $8.25 |
| **Equipo (freelancers)** | **$600** |
| **TOTAL MENSUAL** | **~$640** |

---

## TABLA B3 — Opción 3: Micro Equipo MVP

**Perfil:** 2–3 personas. Primer desarrollador full-time + founder + freelancer parcial.  
**Usuarios objetivo:** 500–1,500 | **Requiere:** Primeros ingresos o $25,000–30,000 de ahorros de runway

| Componente | Tipo | Herramienta | Plan | Costo/mes |
|-----------|------|------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage + PostGIS | Infraestructura · Core | **Supabase** | Pro | $25 |
| Servidor LLM IA (planes complejos) | Infraestructura · IA | **Gemma 4 12B en Hetzner VPS** | CX32 (4 vCPU, 8 GB RAM) + Ollama | $13 |
| LLM tareas simples (análisis, resúmenes) | Infraestructura · IA | **Gemini 2.5 Flash-Lite API** | Pay-as-you-go (~500 usuarios activos) | $8 |
| API de rutas y mapas | Infraestructura · IA | **OpenRouteService** | Free | $0 |
| Push notifications | Infraestructura · Comunicación | **OneSignal** | Free (hasta 10,000 subs) | $0 |
| Email transaccional | Infraestructura · Comunicación | **Resend** | Pro ($20/mes · 50,000 emails/mes) | $20 |
| Email marketing | Marketing · Comunicación | **Loops** | Starter ($49/mes · hasta 5,000 contactos, automatizaciones) | $49 |
| CRM | CRM · Ventas | **HubSpot CRM** | Starter ($20/mes · 2 usuarios, email tracking, pipeline) | $20 |
| Soporte al usuario | CRM · Soporte | **Crisp Chat** | Essentials ($25/mes · 4 agentes, chatbot básico) | $25 |
| Analítica de producto | Infraestructura · Observabilidad | **PostHog** | Free | $0 |
| Monitoreo de errores | Infraestructura · Observabilidad | **Sentry** | Free | $0 |
| CDN / DNS / SSL | Infraestructura · Red | **Cloudflare** | Free | $0 |
| CI/CD | Infraestructura · DevOps | **GitHub Actions** | Free | $0 |
| Build y distribución de la app | Infraestructura · DevOps | **Expo EAS Build** | Production ($29/mes · builds ilimitados) | $29 |
| Gestión de proyecto | Herramienta · Equipo | **Linear** | Free | $0 |
| Documentación interna | Herramienta · Equipo | **Notion** | Free | $0 |
| Repositorio de código | Herramienta · Equipo | **GitHub** | Team ($4/usuario × 3) | $12 |
| Comunicación del equipo | Herramienta · Equipo | **Slack** | Free | $0 |
| Herramienta de diseño UI/UX | Herramienta · Diseño | **Figma** | Starter ($15/mes · 1 editor) | $15 |
| Landing page + blog | Marketing · Web | **Webflow** | Starter ($14/mes) | $14 |
| Dominio web | Infraestructura · Red | **Porkbun** | ~$15/año | $1.25 |
| Apple Developer Program | Licencia | Apple | $99/año | $8.25 |
| Google Play Developer | Licencia | Google | $25 one-time | $0 |
| Marketing en redes | Marketing · Adquisición | Orgánico + freelancer parcial | — | incluido en equipo |
| Backups | Infraestructura · Seguridad | Supabase Pro (diarios incluidos) | — | $0 |
| FinOps / Administración | Operaciones | Founder | — | $0 |
| Videoconferencias | Herramienta · Equipo | **Google Meet / Zoom Free** | Free | $0 |

### Equipo Opción 3

| Rol | Tipo | Nivel | Dedicación | Costo/mes |
|-----|------|-------|-----------|----------|
| Desarrollador Full Stack (RN + Supabase) | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Diseñador UX/UI | Freelance LATAM | Semi-senior | 50 % (20 h/mes) | $360 |
| Marketing Digital + Community | Freelance LATAM | Junior | 50 % (25 h/mes) | $200 |

### Resumen Opción 3

| Categoría | Costo/mes |
|-----------|----------|
| Infraestructura Core | $25 |
| IA y Rutas | $21 |
| Comunicación (push + email transaccional) | $20 |
| Email marketing | $49 |
| CRM | $20 |
| Soporte | $25 |
| Observabilidad | $0 |
| DevOps y Build | $29 |
| Herramientas de equipo | $27 |
| Marketing y Web | $14 |
| Dominio + Licencias | $9.50 |
| **Equipo** | **$3,060** |
| **TOTAL MENSUAL** | **~$3,319** |

> 💡 Nota: el costo de equipo es menor que en la tabla anterior porque el diseñador y el marketer son part-time/freelance. El gran salto en costo es el dev full-time.

---

## TABLA B4 — Opción 4: Equipo Startup Consolidado

**Perfil:** 5–7 personas con roles definidos. Estructura funcional completa.  
**Usuarios objetivo:** 1,500–5,000 | **Requiere:** Ingresos recurrentes $3,000–5,000/mes o capital ángel

| Componente | Tipo | Herramienta | Plan | Costo/mes |
|-----------|------|------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage + PostGIS | Infraestructura · Core | **Supabase** | Pro (con compute add-on básico) | $50 |
| LLM principal (planes entrenamiento y nutrición) | Infraestructura · IA | **Claude Haiku 4.5 API** | Pay-as-you-go (~2,000 usuarios activos) | $360 |
| LLM self-hosted (tareas simples, batch) | Infraestructura · IA | **Gemma 4 12B en Hetzner** | CX32 + Ollama | $13 |
| API de rutas y mapas | Infraestructura · IA | **OpenRouteService** | Free | $0 |
| Push notifications | Infraestructura · Comunicación | **OneSignal** | Growth ($9/mes · hasta 100,000 subs) | $9 |
| Email transaccional | Infraestructura · Comunicación | **Resend** | Pro ($20/mes) | $20 |
| Email marketing | Marketing · Comunicación | **Loops** | Pro ($99/mes · hasta 25,000 contactos, A/B, automatizaciones avanzadas) | $99 |
| CRM | CRM · Ventas | **HubSpot** | Starter Suite ($45/mes · 2 usuarios, email, pipeline, reporting) | $45 |
| Soporte al usuario | CRM · Soporte | **Crisp Chat** | Pro ($95/mes · equipo completo, chatbot avanzado, historial ilimitado) | $95 |
| Analítica de producto | Infraestructura · Observabilidad | **PostHog** | Pago (~2M eventos/mes · $45/mes) | $45 |
| Monitoreo de errores + performance | Infraestructura · Observabilidad | **Sentry** | Team ($26/mes · 5 usuarios) | $26 |
| CDN / DNS / SSL | Infraestructura · Red | **Cloudflare** | Pro ($20/mes · WAF, analytics avanzado) | $20 |
| CI/CD | Infraestructura · DevOps | **GitHub Actions** | Team ($4/usuario × 5) | $20 |
| Build y distribución de la app | Infraestructura · DevOps | **Expo EAS Build** | Production ($29/mes) | $29 |
| Gestión de proyecto | Herramienta · Equipo | **Linear** | Standard ($8/usuario × 6) | $48 |
| Documentación interna | Herramienta · Equipo | **Notion** | Plus ($8/usuario × 6) | $48 |
| Repositorio de código | Herramienta · Equipo | **GitHub** | Team ($4/usuario × 5) | $20 |
| Comunicación del equipo | Herramienta · Equipo | **Slack** | Pro ($7.25/usuario × 6) | $44 |
| Herramienta de diseño UI/UX | Herramienta · Diseño | **Figma** | Professional ($45/mes · 3 editores) | $45 |
| Landing page + blog SEO | Marketing · Web | **Webflow** | CMS ($23/mes) | $23 |
| Dominio web | Infraestructura · Red | **Porkbun** | ~$15/año | $1.25 |
| Apple Developer Program | Licencia | Apple | $99/año | $8.25 |
| Google Play Developer | Licencia | Google | $25 one-time | $0 |
| Backups y DR | Infraestructura · Seguridad | Supabase Pro + punto de restauración manual | — | $0 |
| FinOps / Administración | Operaciones | Parte del rol de PM/Ops | — | $0 |
| Videoconferencias | Herramienta · Equipo | **Google Workspace** | Business Starter ($7/usuario × 6) | $42 |

### Equipo Opción 4

| Rol | Tipo | Nivel | Dedicación | Costo/mes |
|-----|------|-------|-----------|----------|
| Dev Mobile Lead (React Native) | Full-time LATAM | Senior | 100 % | $4,500 |
| Dev Backend + IA (Supabase + Edge) | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Diseñador UX/UI | Full-time LATAM | Semi-senior | 100 % | $1,800 |
| Product Manager | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Marketing Digital + Growth | Full-time LATAM | Semi-senior | 100 % | $1,500 |
| Especialista CRM / Partnerships | Part-time LATAM | Junior-Mid | 50 % | $900 |

### Resumen Opción 4

| Categoría | Costo/mes |
|-----------|----------|
| Infraestructura Core | $50 |
| IA y Rutas | $373 |
| Comunicación (push + email transaccional) | $29 |
| Email marketing | $99 |
| CRM | $45 |
| Soporte | $95 |
| Observabilidad | $71 |
| DevOps y Build | $49 |
| Herramientas de equipo | $267 |
| Marketing y Web | $23 |
| Dominio + Licencias | $9.50 |
| **Equipo** | **$13,700** |
| **TOTAL MENSUAL** | **~$14,810** |

---

## TABLA B5 — Opción 5: Pre-Crecimiento / Pre-Serie A

**Perfil:** 10–12 personas con equipo funcional completo y roles especializados.  
**Usuarios objetivo:** 5,000–15,000 | **Requiere:** Capital ángel o ingresos $15,000+/mes

| Componente | Tipo | Herramienta | Plan | Costo/mes |
|-----------|------|------------|------|----------|
| Base de datos + Auth + Edge Functions + Storage + PostGIS | Infraestructura · Core | **Supabase** | Pro + Compute Add-on Medium (4 vCPU, 16 GB) | $125 |
| LLM principal (planes complejos, alta calidad) | Infraestructura · IA | **Claude Sonnet 4.6 API** | Pay-as-you-go (~5,000 usuarios activos) | $700 |
| LLM batch y tareas simples | Infraestructura · IA | **Claude Haiku 4.5 API (Batch 50% off)** | Alto volumen descontado | $250 |
| LLM self-hosted (dev + backup) | Infraestructura · IA | **Gemma 4 12B en Hetzner CX52** | 8 vCPU, 16 GB RAM + Ollama | $38 |
| API de rutas (self-hosted) | Infraestructura · IA | **OpenRouteService self-hosted en Hetzner** | CX22 dedicado (>200k req/mes) | $5 |
| Push notifications | Infraestructura · Comunicación | **OneSignal** | Professional ($99/mes · segmentación avanzada, A/B) | $99 |
| Email transaccional | Infraestructura · Comunicación | **Resend** | Business ($89/mes · 200,000 emails/mes) | $89 |
| Email marketing | Marketing · Comunicación | **Loops** | Business ($199/mes · hasta 75,000 contactos, API completa) | $199 |
| CRM | CRM · Ventas | **HubSpot** | Professional ($890/mes · automatización completa, reporting, secuencias) | $890 |
| Soporte al usuario | CRM · Soporte | **Intercom** | Essential ($39/seat × 3 agentes) | $117 |
| Analítica de producto | Infraestructura · Observabilidad | **PostHog** | Scale (~10M eventos/mes) | $150 |
| Monitoreo de errores + APM + logs | Infraestructura · Observabilidad | **Sentry** | Business ($80/mes · 10 usuarios, replays, performance) | $80 |
| CDN / DNS / SSL / WAF / DDoS | Infraestructura · Red | **Cloudflare** | Pro ($20/mes) | $20 |
| CI/CD + environments | Infraestructura · DevOps | **GitHub Actions** | Team ($4/usuario × 10) | $40 |
| Build y distribución de la app | Infraestructura · DevOps | **Expo EAS Build** | Enterprise ($799/mes · builds prioritarios, SLA) | $799 |
| Gestión de proyecto | Herramienta · Equipo | **Linear** | Business ($16/usuario × 10) | $160 |
| Documentación interna | Herramienta · Equipo | **Notion** | Business ($15/usuario × 10) | $150 |
| Repositorio de código | Herramienta · Equipo | **GitHub** | Team ($4/usuario × 10) | $40 |
| Comunicación del equipo | Herramienta · Equipo | **Slack** | Pro ($7.25/usuario × 10) | $73 |
| Herramienta de diseño UI/UX | Herramienta · Diseño | **Figma** | Organization ($45/editor × 2 + viewer × 5) | $115 |
| Landing page + blog SEO | Marketing · Web | **Webflow** | Business ($39/mes · CMS escalable) | $39 |
| Dominio web | Infraestructura · Red | **Porkbun** | ~$15/año | $1.25 |
| Apple Developer Program | Licencia | Apple | $99/año | $8.25 |
| Google Play Developer | Licencia | Google | $25 one-time | $0 |
| Backups y DR | Infraestructura · Seguridad | **Supabase + Backblaze B2** | Point-in-time recovery + backups en S3 | $25 |
| VPN / Acceso seguro al equipo | Infraestructura · Seguridad | **Tailscale** | Starter ($6/usuario × 10) | $60 |
| Videoconferencias + Workspace | Herramienta · Equipo | **Google Workspace** | Business Standard ($12/usuario × 10) | $120 |
| FinOps / Administración | Operaciones | Rol dedicado part-time | — | incluido en equipo |

### Equipo Opción 5

| Rol | Tipo | Nivel | Dedicación | Costo/mes |
|-----|------|-------|-----------|----------|
| CTO / Dev Lead Mobile | Full-time LATAM | Senior | 100 % | $5,000 |
| Dev Backend + IA | Full-time LATAM | Senior | 100 % | $4,000 |
| Dev Mobile (React Native) | Full-time LATAM | Semi-senior | 100 % | $2,500 |
| Dev Full Stack / QA | Full-time LATAM | Semi-senior | 100 % | $2,200 |
| Diseñador UX/UI Senior | Full-time LATAM | Senior | 100 % | $3,200 |
| Product Manager | Full-time LATAM | Senior | 100 % | $4,500 |
| Head of Marketing | Full-time LATAM | Senior | 100 % | $3,500 |
| Especialista Marketing Digital | Full-time LATAM | Semi-senior | 100 % | $1,500 |
| Community Manager | Full-time LATAM | Junior | 100 % | $800 |
| Especialista CRM / Partnerships | Full-time LATAM | Semi-senior | 100 % | $1,800 |
| Customer Success / Soporte | Full-time LATAM | Junior | 100 % | $900 |
| FinOps / Administración | Part-time LATAM | Semi-senior | 50 % | $1,400 |

### Resumen Opción 5

| Categoría | Costo/mes |
|-----------|----------|
| Infraestructura Core | $125 |
| IA y Rutas | $993 |
| Comunicación (push + email transaccional) | $188 |
| Email marketing | $199 |
| CRM | $890 |
| Soporte | $117 |
| Observabilidad | $230 |
| DevOps y Build | $839 |
| Herramientas de equipo | $698 |
| Marketing y Web | $39 |
| Seguridad | $85 |
| Dominio + Licencias | $9.50 |
| **Equipo** | **$31,300** |
| **TOTAL MENSUAL** | **~$35,713** |

---

## TABLA C — CRM y Marketing recomendados para Opciones 1 y 2

Análisis comparativo de las mejores herramientas de CRM, push notifications y email marketing para un startup sin financiación en etapa temprana.

### C1 — CRM

| Herramienta | Opción | Plan gratuito | Qué incluye en gratis | Cuándo pagar | Primer plan pago | Costo |
|------------|--------|--------------|----------------------|-------------|-----------------|-------|
| **HubSpot CRM** | 1 y 2 ✅ | Sí, forever | Contactos ilimitados, pipeline visual, tracking de emails, formularios, live chat básico, app móvil | Cuando necesites automatizaciones de ventas o reportes avanzados | Starter Suite | $20/mes |
| **Notion CRM** (plantilla) | 1 ✅ | Sí | Adaptable, todo en un workspace que ya usas para docs | Cuando crezcas a equipo | Plus | $8/mes |
| **Pipedrive** | 2 opcional | No | — | Desde el inicio si priorizas pipeline de ventas a negocios | Essential | $14/usuario/mes |
| **Zoho CRM** | 2 opcional | Sí (3 usuarios) | Pipeline, contactos, tareas, integración con email | Cuando necesites automatización | Standard | $14/usuario/mes |

**Recomendación:** HubSpot Free para ambas opciones. Es el único CRM enterprise-grade completamente gratuito y sin límite de tiempo. Cubre el 100% de lo que necesitas en Opciones 1 y 2 para gestionar clubs y negocios asociados.

---

### C2 — Push Notifications

| Herramienta | Opción | Plan gratuito | Límite gratuito | Segmentación | Cuándo pagar | Primer plan pago | Costo |
|------------|--------|--------------|----------------|-------------|-------------|-----------------|-------|
| **Expo Push Notifications** | 1 ✅ | Sí, siempre | Ilimitado (nativo del SDK) | Básica (por token) | Nunca (suficiente para Opción 1) | — | $0 |
| **OneSignal** | 1 y 2 ✅ | Sí | 10,000 suscriptores | Segmentación por tags, A/B testing, automatización básica | Al superar 10k subs o necesitar analytics avanzado | Growth | $9/mes |
| **Firebase Cloud Messaging (FCM)** | 1 y 2 opcional | Sí, siempre | Ilimitado | Básica (topics y grupos) | Nunca (siempre gratis) | — | $0 |
| **Knock** | 2 opcional | Sí | 30,000 notificaciones/mes | Avanzada, multi-canal (push + email + in-app) | Al superar 30k notificaciones | Starter | $100/mes |

**Recomendación para Opción 1:** Expo Push Notifications nativo. Cero configuración extra, funciona con el SDK ya instalado, completamente gratis.  
**Recomendación para Opción 2:** OneSignal Free. Agrega segmentación por tags (ej: enviar push solo a usuarios de un club específico), A/B testing de mensajes y analytics de entrega. El free tier llega a 10,000 suscriptores, suficiente para toda la Opción 2.

---

### C3 — Email Marketing y Automatización

| Herramienta | Opción | Plan gratuito | Límite gratuito | Automatizaciones | Cuándo pagar | Primer plan pago | Costo |
|------------|--------|--------------|----------------|-----------------|-------------|-----------------|-------|
| **Loops** | 1 y 2 ✅ | Sí | 1,000 contactos, envíos ilimitados | Sí (flujos de onboarding, triggers por evento) | Al superar 1,000 contactos | Starter | $49/mes (5,000 contactos) |
| **Resend** | 1 y 2 ✅ (transaccional) | Sí | 3,000 emails/mes, 100/día | No (solo API transaccional) | Al superar 3,000/mes o necesitar dominio propio | Pro | $20/mes |
| **Brevo (ex-Sendinblue)** | 1 y 2 opcional | Sí | 300 emails/día (9,000/mes) | Sí (workflows básicos) | Al superar 9,000/mes | Starter | $9/mes |
| **Mailchimp** | 1 opcional | Sí | 500 contactos, 1,000 emails/mes | Básica (1 journey) | Desde el día 1 si superas 500 contactos | Essentials | $13/mes |
| **Kit (ex-ConvertKit)** | 2 opcional | Sí | 10,000 suscriptores | Sí (automatizaciones visuales, segmentación) | Al necesitar landing pages o commerce | Creator | $25/mes |

**Recomendación para Opción 1:**
- **Resend** para emails transaccionales (contraseñas, bienvenida, resúmenes de actividad). Gratis, tiene SDK oficial para TypeScript/Deno compatible con Supabase Edge Functions.
- **Loops** para email marketing. Es el único con free tier generoso (1,000 contactos ilimitados en envíos) Y automatizaciones de onboarding nativas. Perfecto para secuencias de activación de nuevos runners.

**Recomendación para Opción 2:**
- Mantener el stack de Opción 1 (Resend + Loops) hasta superar los 1,000 contactos.
- Al superarlos, escalar a **Loops Starter ($49/mes)** antes que migrar a otra plataforma. La combinación Resend (transaccional) + Loops (marketing) cubre el 100% de los casos de uso de comunicación de LoyalRun en etapa temprana.

---

### C4 — Stack de comunicación recomendado completo por opción

| Canal | Opción 1 | Costo O1 | Opción 2 | Costo O2 |
|-------|----------|---------|----------|---------|
| CRM | HubSpot Free | $0 | HubSpot Free | $0 |
| Push notifications | Expo Push nativo | $0 | OneSignal Free | $0 |
| Email transaccional | Resend Free | $0 | Resend Free | $0 |
| Email marketing | Loops Free | $0 | Loops Free | $0 |
| Soporte en app | Email directo | $0 | Crisp Chat Free | $0 |
| **TOTAL COMUNICACIÓN** | | **$0** | | **$0** |

> Ambas opciones pueden operar con un stack de comunicación completo a costo cero. El primer gasto en comunicación ocurre cuando superas los 1,000 contactos en Loops (~$49/mes) o los 10,000 suscriptores push en OneSignal (~$9/mes), lo que en un startup en etapa temprana probablemente ocurra alrededor de los 800–1,200 usuarios activos.

---

*Precios verificados abril 2026. Todos los valores en USD.*
