# Guía de instalación y ejecución — CliniControl

## 1. Requisitos

- Node.js 20 o superior (probado con Node 24).
- PostgreSQL 14 o superior en `localhost:5432` con el usuario `postgres`.
- `pg_dump` en el PATH (viene con PostgreSQL) para el módulo de Respaldos.

## 2. Instalación

```bash
cd clinicontrol
createdb -h localhost -U postgres clinicontrol
cd backend && cp .env.example .env && cd ..
npm install
```

Revise `backend/.env`: usuario y contraseña de PostgreSQL, `DB_DATABASE=clinicontrol`,
`DB_SYNCHRONIZE=true` (crea el esquema desde las entidades) y `RUN_SEED=true`
(carga los datos de demostración la primera vez). `ADMIN_PASSWORD` define la
contraseña inicial del administrador.

## 3. Ejecución

```bash
npm run dev          # backend en :3000 y frontend en :5173
```

- Aplicación: http://localhost:5173/
- Documentación de la API (Swagger): http://localhost:3000/api

Para ejecutar por separado: `npm run backend` y `npm run frontend`.

## 4. Credenciales de demostración

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | admin@clinica.com | Admin123! |
| Gerente | gerente@clinica.com | Demo2026! |
| Recepcionista | recepcion@clinica.com | Demo2026! |
| Secretaria | secretaria@clinica.com | Demo2026! |
| Médico | medico@clinica.com | Demo2026! |
| Enfermería | enfermeria@clinica.com | Demo2026! |

Cada rol entra directamente a su pantalla principal y ve únicamente su menú.

## 5. Menús por rol

| Rol | Menú |
|-----|------|
| Recepción / Secretaria | Dashboard · Pacientes · Citas · Turnos · Pagos · Recibos · Reportes de Recepción |
| Enfermería | Pacientes en Espera · Triaje · Signos Vitales · Reportes · Hospitalización |
| Médico | Agenda del Día · Pacientes · Historia Clínica · CIE-10 · Recetas · Hospitalización · Reportes Médicos |
| Hospitalización (médico y enfermería) | Camas · Internaciones · Evoluciones · Altas · Reportes |
| Gerente | Dashboard · Indicadores · Estadísticas · Reportes |
| Administrador | Usuarios · Roles · Permisos · Auditoría · Configuración · Respaldos |

## 6. Impresión

Recibos, recetas y reportes se imprimen desde el navegador (ventana nueva con el
diálogo de impresión). Si el navegador bloquea las ventanas emergentes, permítalas
para `localhost:5173`. Cada impresión queda registrada en Auditoría.

## 7. Respaldos

Administración → Respaldos genera un archivo `.dump` con `pg_dump` en la carpeta
`backend/backups/` (configurable con `BACKUP_DIR`). Para restaurar:

```bash
pg_restore -h localhost -U postgres -d clinicontrol --clean archivo.dump
```

## 8. Reiniciar los datos de demostración

```bash
dropdb -h localhost -U postgres clinicontrol && createdb -h localhost -U postgres clinicontrol
npm run backend    # al arrancar vuelve a crear el esquema y la semilla
```

## 9. Solución de problemas

- **"Cannot find native binding" al iniciar el frontend**: el `npm install` se hizo
  en otro sistema operativo. Borre `node_modules` (raíz, backend y frontend) y repita `npm install`.
- **El médico no ve su agenda**: su usuario debe estar vinculado a un médico
  (Administración → Configuración → Médicos).
- **El médico no puede atender un turno**: el turno necesita pago registrado en
  Recepción → Pagos, salvo urgencia ESI-1/ESI-2 registrada hoy por enfermería.
- **Respaldo falla**: instale las herramientas cliente de PostgreSQL o defina
  `PG_DUMP_PATH` en `backend/.env` con la ruta completa a `pg_dump`.
