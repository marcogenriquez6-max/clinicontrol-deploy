# PROGRESO — CliniControl

Bitácora de lo implementado y cómo se verificó. Sesión del 5 de septiembre de 2026
sobre `ccpr (4).zip` (rama `feat/spec-login` + trabajo sin commit de Marco).

## Objetivo de la sesión
Alinear el software al documento de grado ("CLINICONTROL — FUNCIONAMIENTO REAL"):
un menú por rol, pago simple en efectivo con recibo (sin caja/arqueo/POS),
turnos A001…, agenda del médico solo con pacientes pagados, y reportes imprimibles
por rol. Todo verificado en navegador y por API con los seis roles.

## Backend (NestJS)
- **Pagos y recibos** (`modules/pago`): entidad `pago` (N° recibo `R-000001`, paciente,
  concepto, monto, efectivo, estado PAGADO/ANULADO, usuario). `GET/POST /pagos`,
  `GET /pagos/pendientes` (turnos del día sin pago), `GET /pagos/:id/recibo`,
  `PATCH /pagos/:id/anular`. Registrar el pago marca el turno como pagado.
  `CajaModule` y `ArqueoModule` salen de `app.module` (fuera del alcance de la tesis).
- **Turnos**: numeración diaria `A001, A002, …`; filtro por día corregido (antes solo
  tenía cota superior); `GET /turnos/hoy` = agenda del día (el médico solo ve los suyos,
  con marca `esUrgencia` ESI‑1/2). Regla de cobro previo intacta.
- **Reportes por rol** (`modules/reports/reportes-tesis.*`): `/reports/recepcion`,
  `/reports/triaje`, `/reports/medico` (acotado al médico logueado), `/reports/hospitalizacion`,
  `/reports/indicadores`, `/reports/estadisticas-periodo`, `/reports/pacientes`,
  `/reports/citas/resumen`, `/reports/productividad`, `/reports/auditoria` (general/usuario/accesos)
  y `POST /reports/impresion` (deja constancia "Imprimió reporte" en auditoría, acción `PRINT`).
- **Administración**: `GET /roles/permisos` (matriz rol × módulos/permisos),
  `GET/PUT /configuracion/clinica` (datos institucionales usados en recibos y reportes),
  `modules/respaldo` (`pg_dump` → `backend/backups/`, listar, descargar, eliminar).
- **Seguridad**: `RolesGuard`/`PermissionsGuard` ya no dejan pasar al `admin` a todo;
  `admin` sale de los controladores clínicos (consultas, recetas, triaje, hospitalización…).
  `OwnershipGuard`: el médico accede al expediente si tiene consulta, turno, cita u
  hospitalización con el paciente; enfermería lee expedientes para triaje.
- **Auditoría**: registros en turnos, pagos, triaje, hospitalización, evoluciones, citas,
  recetas y consultas; el listado devuelve nombre y rol del usuario.
- **Correcciones de bugs preexistentes**: `GET /usuarios` devolvía 500; el triaje
  perdía presión arterial y saturación; la consulta completa usaba el id de usuario
  como id de médico; la consulta completa no guardaba la receta del PLAN; la talla se
  validaba en metros; fecha "hoy" calculada en UTC (cambiaba de día a las 20:00).
- **Pacientes**: contacto de emergencia (nombre y teléfono).

## Frontend (React)
- **Menú por rol** (`data/navigation.ts`, `routes/AppRoutes.tsx`): Recepción, Enfermería,
  Consulta Médica, Hospitalización, Gerencia, Administración. Cada rol entra a su
  pantalla inicial (`HOME_POR_ROL`). Caja y Arqueo pasan a `_fuera-de-alcance/`.
- **Nuevas pantallas**: Pagos, Recibos, Reportes de Recepción; Pacientes en Espera,
  Signos Vitales, Reportes de Enfermería; Agenda del Día, CIE‑10, Reportes Médicos;
  Hospitalización por secciones (Camas, Internaciones, Evoluciones, Altas, Reportes);
  Gerencia (Dashboard, Indicadores, Estadísticas, Reportes); Permisos, Configuración
  (clínica, médicos, camas, tarifas), Respaldos; Auditoría con reportes.
- **Impresión** (`utils/impresion.ts`, `utils/recibo.ts`, `components/reportes/ReportePanel.tsx`):
  recibo en formato ticket con el contenido del documento; reportes A4 con encabezado
  institucional; toda impresión se registra en auditoría.
- **Turnos**: etiquetas Esperando / En atención / Finalizado; el pago desde Turnos usa
  el módulo de pagos y abre el recibo.
- **Pacientes**: mensaje "Paciente encontrado" con CI duplicada y botón para abrir el
  expediente existente (Historia Clínica acepta `?paciente=ID`). El expediente muestra
  datos, alergias, cirugías, **hospitalizaciones y citas** del paciente además de las consultas.
- **Consulta SOAP**: aviso claro cuando faltan campos obligatorios en otra pestaña;
  la receta se imprime con diagnóstico CIE‑10.
- Proxy de Vite: las rutas del SPA ya no devuelven JSON al recargar.

## Verificación
- `tsc --noEmit` backend y frontend: 0 errores. `eslint` frontend: 0 errores.
- `vitest`: 4 archivos, 22 pruebas OK (backend no tiene specs en el árbol de trabajo:
  Marco los eliminó en el zip; los e2e de `backend/test` no se ejecutaron).
- Flujo completo en navegador: recepción registra pago e imprime recibo → enfermería
  registra triaje desde Pacientes en Espera → el médico atiende desde la Agenda del Día,
  guarda SOAP + CIE‑10 + receta y el turno queda Finalizado → hospitalización registra
  evolución → gerencia ve indicadores/estadísticas → auditoría muestra cada paso.
- API por rol: el administrador recibe 403 en pacientes/consultas/turnos/pagos; el médico
  recibe 403 en usuarios/pagos.

## Pendiente / notas
- `medico@clinica.com` está vinculado al Dr. Carlos García; los demás médicos demo no
  tienen usuario (se vinculan desde Configuración → Médicos).
- El documento `.docx` no se modificó en esta sesión.
- Trabajo sin commit: revisar `git status` y commitear cuando se apruebe.
