PANTALLA: Login

BACKEND
  Endpoints revisados: 3 (login, refresh, logout)
  Roles correctos: SI — login público (`@Public()`), refresh público, logout con `@Roles('admin')` + `AuthGuard('jwt')`.
  Validaciones implementadas: `LoginDto` con `@IsEmail()`, `@MinLength(6)`, `rememberMe?: boolean`. `validarCredenciales` en `AuthDomainService`.
  Códigos HTTP correctos: SI — 200 login exitoso, 401 credenciales inválidas (email inexistente / contraseña incorrecta / usuario bloqueado), 400 datos inválidos, 401 refresh faltante/expirado.
  Mensajes en español y accionables: SI — "Credenciales inválidas" (genérico, no distingue email de password), "El formato del email no es válido", "La contraseña debe tener al menos 6 caracteres", "Bienvenido" (toast).
  Auditoría: implementada — `logLoginFailed(email, ip, userAgent)` en casos de fallo; `logLogin(userId, email, ip, userAgent)` en éxito. Falla de sesión con IP registrada.

PRUEBAS
  Casos escritos: 5 (auth.service.spec.ts)
  Resultado: 5 de 5 pasan
  Suite auth completa: 2 suites, 8 tests pasando.

FRONTEND
  Controles de la especificación: 6
  Ya cumplían: formato email, contraseña ≥6 chars, toast "Bienvenido" → `/dashboard`, link "¿Olvidó su contraseña?" → `/forgot-password`, checkbox "Recordar sesión".
  Implementados: error "Credenciales inválidas. Verifique su email y contraseña." en 401, manejo genérico de fallos de red/5xx vía `errMsg.ts`.
  No implementados: ninguno.
  Mensajes genéricos restantes: 0.
  Botones bloqueados sin explicación: 0.

VERIFICACIÓN
  tsc backend OK · tsc frontend OK
  npm test auth 8/8 · npm run verificar [no existe en repo — N/A]

NO VERIFICADO:
  - `npm run verificar` no existe en el repositorio; F1–F7 no se pueden comprobar mecánicamente.
  - `npm run lint` frontend falla con 1 error preexistente en `BandaPaciente.tsx` (setState síncrono en effect, sin relación con login) y 118 warnings (en su mayoría `any`). Sin relación con pantalla 1.
