PANTALLA: Consulta completa SOAP

BACKEND
  Endpoints revisados: 4 (POST /consultas/completa, PUT /consultas/:id, GET /consultas/:id, POST /consultas/:id/nota)
  Roles correctos: SI — GET :id con `@Roles('medico','enfermeria')`, POST/PUT/nota con `@Roles('medico')`, `OwnershipGuard` en GET/:id y POST/:id/nota.
  Validaciones implementadas: `CreateNotaEvolucionDto` (contenido no-empty, ≥3, ≤5000, tipo opcional enum). `createConsultaCompleta()` valida paciente/doctor existentes (404), ≥1 diagnóstico con `cie10Id`/`codigoCie10`. Inmutabilidad: ventana 24h, autor-only, 7 campos protegidos. `agregarNota()` valida consulta existe y contenido no vacío.
  Códigos HTTP correctos: SI — 201 created, 200 ok, 400 dato inválido, 401 sin sesión, 403 sin permiso, 404 no existe, 409 conflicto de inmutabilidad.
  Mensajes en español y accionables: SI — todos los errores en español y con acción.
  Auditoría: implementada — `diferencias()` de los 7 campos SOAP en `update()`, `logLoginFailed` en nota, auditoría pre/post en inmutabilidad.

PRUEBAS
  Casos escritos: 8 (consulta.service.spec.ts)
  Resultado: 8 de 8 pasan
  Suite consulta completa: 2 suites, 17 tests pasando.

FRONTEND
  Controles de la especificación: 5
  Ya cumplían: `<BandaPaciente>` sticky, CIE-10 search threshold <3, `addMedicamento()` bloquea sin diagnóstico con toast.
  Implementados: `handleEnmienda()` con `enmiendaMotivo` obligatorio y `turnoId`, `crearNotaEnmienda(consultaId, contenido)` en `api/consulta.service.ts`.
  No implementados: F1–F7 verificación mecánica no disponible (`npm run verificar` no existe). Cumplimiento visual/semántico (F5 tokens tema, F6 tamaño texto, F7 cuatro estados) no verificado mecánicamente.
  Mensajes genéricos restantes: 0 (error messages vienen de `errMsg.ts`).
  Botones bloqueados sin explicación: 0.

VERIFICACIÓN
  tsc backend OK · tsc frontend OK
  nest build OK · npm test consulta 17/17 · npm run verificar [no existe en repo — N/A]

NO VERIFICADO:
  - `npm run verificar` no existe; F1–F7 frontend no se comprueban mecánicamente.
  - Lint frontend tiene 1 error preexistente en `BandaPaciente.tsx` y 118 warnings sin relación con pantalla 8.
  - Integración e2e con DB/Redis no verificada; solo tests unitarios de servicio.
