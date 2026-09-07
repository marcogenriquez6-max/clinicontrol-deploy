-- =============================================
-- CliniControl — Índices faltantes para OwnershipGuard
-- y consultas frecuentes de FK usadas en la app
-- =============================================

-- Índices para columnas FK usadas por OwnershipGuard (ownership.guard.ts)
-- medico → usuario, sucursal
CREATE INDEX IF NOT EXISTS idx_medico_usuario_id ON medico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_medico_sucursal_id ON medico(sucursal_id);

-- consulta → medico, paciente
CREATE INDEX IF NOT EXISTS idx_consulta_medico_id ON consulta(medico_id);
CREATE INDEX IF NOT EXISTS idx_consulta_paciente_id ON consulta(paciente_id);

-- cita → medico, paciente
CREATE INDEX IF NOT EXISTS idx_cita_medico_id ON cita(medico_id);
CREATE INDEX IF NOT EXISTS idx_cita_paciente_id ON cita(paciente_id);

-- receta → consulta (FK exists, index needed for JOINs)
CREATE INDEX IF NOT EXISTS idx_receta_consulta_id ON receta(consulta_id);

-- paciente_vacuna → paciente, vacuna
CREATE INDEX IF NOT EXISTS idx_paciente_vacuna_paciente_id ON paciente_vacuna(paciente_id);
CREATE INDEX IF NOT EXISTS idx_paciente_vacuna_vacuna_id ON paciente_vacuna(vacuna_id);

-- triaje → paciente, medico
CREATE INDEX IF NOT EXISTS idx_triaje_paciente_id ON triaje(paciente_id);
CREATE INDEX IF NOT EXISTS idx_triaje_medico_id ON triaje(medico_id);

-- signos_vitales → paciente
CREATE INDEX IF NOT EXISTS idx_signos_vitales_paciente_id ON signos_vitales(paciente_id);

-- hospitalizacion → paciente
CREATE INDEX IF NOT EXISTS idx_hospitalizacion_paciente_id ON hospitalizacion(paciente_id);

-- notas_evolucion → paciente
CREATE INDEX IF NOT EXISTS idx_notas_evolucion_paciente_id ON notas_evolucion(paciente_id);

-- nota_evolucion → paciente
CREATE INDEX IF NOT EXISTS idx_nota_evolucion_paciente_id ON nota_evolucion(paciente_id);

-- historia_clinica → paciente
CREATE INDEX IF NOT EXISTS idx_historia_clinica_paciente_id ON historia_clinica(paciente_id);

-- alergia_paciente → paciente
CREATE INDEX IF NOT EXISTS idx_alergia_paciente_paciente_id ON alergia_paciente(paciente_id);

-- historico_tratamiento → paciente
CREATE INDEX IF NOT EXISTS idx_historico_tratamiento_paciente_id ON historico_tratamiento(paciente_id);

-- cirugia_previa → paciente
CREATE INDEX IF NOT EXISTS idx_cirugia_previa_paciente_id ON cirugia_previa(paciente_id);

-- orden_laboratorio → medico, paciente
CREATE INDEX IF NOT EXISTS idx_orden_laboratorio_medico_id ON orden_laboratorio(medico_id);
CREATE INDEX IF NOT EXISTS idx_orden_laboratorio_paciente_id ON orden_laboratorio(paciente_id);

-- examen_laboratorio → orden_laboratorio
CREATE INDEX IF NOT EXISTS idx_examen_laboratorio_orden_id ON examen_laboratorio(orden_id);

-- receta_medicamento → receta
CREATE INDEX IF NOT EXISTS idx_receta_medicamento_receta_id ON receta_medicamento(receta_id);

-- turno_medico → medico
CREATE INDEX IF NOT EXISTS idx_turno_medico_medico_id ON turno_medico(medico_id);

-- horario_medico → medico
CREATE INDEX IF NOT EXISTS idx_horario_medico_medico_id ON horario_medico(medico_id);

-- bloqueo_agenda → medico
CREATE INDEX IF NOT EXISTS idx_bloqueo_agenda_medico_id ON bloqueo_agenda(medico_id);

-- cita → estado_cita (para JOINs con estado)
CREATE INDEX IF NOT EXISTS idx_cita_estado_cita_id ON cita(estado_cita_id);

-- consulta → fecha (para búsquedas por rango de fechas)
CREATE INDEX IF NOT EXISTS idx_consulta_fecha ON consulta(fecha);

-- paciente → sucursal
CREATE INDEX IF NOT EXISTS idx_paciente_sucursal_id ON paciente(sucursal_id);

-- usuario → rol
CREATE INDEX IF NOT EXISTS idx_usuario_rol_id ON usuario(rol_id);

-- usuario → sucursal
CREATE INDEX IF NOT EXISTS idx_usuario_sucursal_id ON usuario(sucursal_id);

-- factura → paciente
CREATE INDEX IF NOT EXISTS idx_factura_paciente_id ON factura(paciente_id);

-- arqueo_caja → usuario
CREATE INDEX IF NOT EXISTS idx_arqueo_caja_usuario_id ON arqueo_caja(usuario_id);

-- farmacia_stock → medicamento
CREATE INDEX IF NOT EXISTS idx_farmacia_stock_medicamento_id ON farmacia_stock(medicamento_id);
