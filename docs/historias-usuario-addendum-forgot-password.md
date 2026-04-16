# Addendum de Historias de Usuario

Documento base relacionado: `/Users/gilbertomartinez/Documents/GitHub/LoyalRun_Historias_de_Usuario.docx`

Motivo del addendum: en la revisión del documento no se encontró una historia de usuario explícita para recuperación de contraseña, a pesar de que el producto ya considera autenticación basada en correo y contraseña.

## MÓDULO 1: Autenticación y Onboarding

### HU-42 — Recuperar contraseña

Como usuario registrado,  
quiero poder solicitar un enlace de recuperación de contraseña,  
para volver a acceder a mi cuenta si olvidé mis credenciales.

Criterios de aceptación:

- CA-42.1 — Dado que estoy en la pantalla de inicio de sesión, cuando presiono "Olvidé mi contraseña", entonces el sistema navega a una pantalla dedicada de recuperación.
- CA-42.2 — Dado que ingreso un correo válido en la pantalla de recuperación, cuando presiono "Enviar enlace", entonces el sistema dispara el flujo de recuperación y muestra un mensaje de confirmación no bloqueante.
- CA-42.3 — Dado que el correo no tiene formato válido, cuando intento enviar la solicitud, entonces el sistema me impide continuar y muestra un error de validación.
- CA-42.4 — Dado que el enlace de recuperación fue solicitado, cuando regreso a la pantalla de login, entonces puedo volver a intentar iniciar sesión o repetir la solicitud si fuera necesario.
- CA-42.5 — Dado que la app está en modo demo, cuando solicito la recuperación, entonces el sistema no llama a Supabase y muestra una confirmación simulada indicando que el enlace fue enviado a mi correo.
