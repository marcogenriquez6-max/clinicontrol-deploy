-- ============================================================
-- SEED COMPLETO: 20 tablas vacías de CliniControl
-- ============================================================

-- 1. VACUNAS (catálogo)
INSERT INTO vacuna (nombre, descripcion, dosis_recomendadas, edad_minima_meses, edad_maxima_meses, intervalo_dias, es_obligatoria, activo) VALUES
('BCG', 'Bacilo de Calmette-Guérin contra tuberculosis', 1, 0, 1, 0, true, true),
('Hepatitis B', 'Vacuna contra hepatitis B', 3, 0, 1, 30, true, true),
('DPT', 'Difteria, Tos ferina y Tétanos', 5, 2, 72, 30, true, true),
('Sarampión', 'Vacuna contra sarampión, rubéola y paperas', 2, 12, 12, 28, true, true),
('Influenza', 'Vacuna contra influenza estacional', 1, 6, 999, 365, false, true),
('Neumococo', 'Vacuna conjugada antineumocócica', 4, 2, 60, 60, true, true);

-- 2. TIPOS DE EXAMEN (catálogo)
INSERT INTO tipo_examen (nombre, categoria, descripcion, requiere_ayuno, tiempo_resultado_horas, activo) VALUES
('Hemograma Completo', 'Laboratorio', 'Análisis completo de células sanguíneas', true, 24, true),
('Glucosa en Ayunas', 'Laboratorio', 'Determinación de glucosa plasmática', true, 4, true),
('Colesterol Total', 'Laboratorio', 'Determinación de colesterol total en sangre', true, 24, true),
('Examen General de Orina', 'Laboratorio', 'Análisis físico, químico y microscópico de orina', false, 6, true),
('Radiografía de Tórax', 'Imagenología', 'Radiografía posteroanterior de tórax', false, 2, true),
('Electrocardiograma', 'Cardiología', 'Registro gráfico de la actividad eléctrica del corazón', false, 1, true),
('Ecografía Abdominal', 'Imagenología', 'Estudio ecográfico del abdomen general', true, 4, true),
('Tomografía Axial', 'Imagenología', 'Tomografía computarizada axial', false, 24, true);

-- 3. MEDICAMENTOS - INTERACCIONES
INSERT INTO medicamentos_interacciones (medicamento_id_1, medicamento_id_2, severidad, descripcion, recomendacion) VALUES
(1, 2, 'moderada', 'El paracetamol y el ibuprofeno pueden combinarse pero con precaución en pacientes con problemas gástricos.', 'Administrar con alimentos. Evitar uso prolongado simultáneo.'),
(2, 4, 'leve', 'El ibuprofeno puede reducir el efecto del omeprazol ligeramente.', 'Tomar omeprazol al menos 30 minutos antes del ibuprofeno.'),
(3, 1, 'leve', 'Interacción mínima entre amoxicilina y paracetamol.', 'Compatible para uso simultáneo.'),
(3, 2, 'moderada', 'Ibuprofeno puede enmascarar síntomas de alergia a amoxicilina.', 'Vigilar signos de reacción alérgica.'),
(5, 7, 'moderada', 'La metformina puede afectar el control glucémico con uso de salbutamol sistémico.', 'Monitorear glucosa capilar frecuentemente.'),
(6, 2, 'grave', 'Losartán y ibuprofeno: AINEs reducen el efecto antihipertensivo y aumentan riesgo renal.', 'Evitar combinación. Si es necesario, monitorear función renal y presión arterial.'),
(6, 1, 'leve', 'Paracetamol es seguro con losartán para dolor leve.', 'Dosis estándar sin ajuste.'),
(8, 4, 'moderada', 'Diclofenaco con omeprazol: el omeprazol protege gástrico pero ambos son gastroirritantes.', 'Mantener omeprazol como gastroprotector. Vigilar síntomas gástricos.');

-- 4. HORARIOS MÉDICOS (lunes a viernes para cada médico)
-- medico 1: Medicina General
INSERT INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, duracion_slot_minutos, activo) VALUES
(1, 1, '08:00', '12:00', '14:00', '18:00', 30, true),
(1, 2, '08:00', '12:00', '14:00', '18:00', 30, true),
(1, 3, '08:00', '12:00', '14:00', '18:00', 30, true),
(1, 4, '08:00', '12:00', '14:00', '18:00', 30, true),
(1, 5, '08:00', '12:00', '14:00', '18:00', 30, true);
-- medico 2: Medicina Interna
INSERT INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, duracion_slot_minutos, activo) VALUES
(2, 1, '09:00', '13:00', '15:00', '19:00', 45, true),
(2, 2, '09:00', '13:00', '15:00', '19:00', 45, true),
(2, 3, '09:00', '13:00', '15:00', '19:00', 45, true),
(2, 4, '09:00', '13:00', '15:00', '19:00', 45, true),
(2, 5, '09:00', '13:00', '15:00', '19:00', 45, true);
-- medico 3: Ginecología
INSERT INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, duracion_slot_minutos, activo) VALUES
(3, 1, '08:00', '12:00', NULL, NULL, 30, true),
(3, 3, '08:00', '12:00', NULL, NULL, 30, true),
(3, 5, '08:00', '12:00', NULL, NULL, 30, true);
-- medico 4: Pediatría
INSERT INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, duracion_slot_minutos, activo) VALUES
(4, 1, '08:00', '12:00', '14:00', '17:00', 20, true),
(4, 2, '08:00', '12:00', '14:00', '17:00', 20, true),
(4, 3, '08:00', '12:00', '14:00', '17:00', 20, true),
(4, 4, '08:00', '12:00', '14:00', '17:00', 20, true),
(4, 5, '08:00', '12:00', '14:00', '17:00', 20, true);
-- medico 5: Cirugía General
INSERT INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin, hora_inicio_tarde, hora_fin_tarde, duracion_slot_minutos, activo) VALUES
(5, 1, '07:00', '12:00', '14:00', '17:00', 60, true),
(5, 2, '07:00', '12:00', '14:00', '17:00', 60, true),
(5, 3, '07:00', '12:00', '14:00', '17:00', 60, true),
(5, 4, '07:00', '12:00', '14:00', '17:00', 60, true),
(5, 5, '07:00', '12:00', '14:00', '17:00', 60, true);

-- 5. PROVEEDORES
INSERT INTO proveedor (nombre, nit, contacto, telefono, email, direccion, observaciones, activo, usuario_registro_id) VALUES
('Distrifarma S.A.', '1020304050', 'Carlos Mendez', '70123456', 'ventas@distrifarma.com', 'Zona Industrial, La Paz', 'Proveedor principal de medicamentos', true, 1),
('MedTech Bolivia', '2030405060', 'Ana Rodriguez', '70234567', 'ventas@medtechbol.com', 'Av. 6 de Agosto #1200, La Paz', 'Equipos y material médico', true, 1),
('BioLab Distribuciones', '3040506070', 'Roberto Salazar', '70345678', 'pedidos@biolab.com', 'Calle Colombia #500, El Alto', 'Reactivos y material de laboratorio', true, 1),
('Insumos Hospitalarios del Sur', '4050607080', 'Maria Fernanda Lopez', '70456789', 'ventas@insumossur.com', 'Av. Santuario #800, Cochabamba', 'Insumos descartables y material quirúrgico', true, 1),
('FarmaCorp Internacional', '5060708090', 'Pedro Aguilar', '70567890', 'exportaciones@farmaCorp.com', 'Av. Arce #2500, La Paz', 'Medicamentos de especialidad e importados', true, 1);

-- 6. ALMACÉN
INSERT INTO almacen (nombre, codigo, tipo, sucursal_id, ubicacion, activo, usuario_registro_id) VALUES
('Almacén Central Farmacia', 'ALM-001', 'farmacia', 1, 'Planta baja, Ala Este, Sala 101', true, 1);

-- 7. PACIENTE VACUNA
INSERT INTO paciente_vacuna (paciente_id, vacuna_id, dosis_numero, fecha_aplicacion, lote, laboratorio, lugar_aplicacion, aplicado_por_id, proxima_dosis, observaciones) VALUES
(1, 2, 1, '2025-01-10', 'HB-2025-001', 'Sinopharm', 'Consultorio', 1, '2025-02-10', 'Primera dosis hepatitis B'),
(1, 2, 2, '2025-02-12', 'HB-2025-001', 'Sinopharm', 'Consultorio', 1, '2025-07-10', 'Segunda dosis hepatitis B'),
(1, 2, 3, '2025-07-15', 'HB-2025-003', 'Sinopharm', 'Consultorio', 1, NULL, 'Dosis de refuerzo'),
(4, 4, 1, '2025-03-05', 'SR-2025-010', 'MSD', 'Centro de salud', 2, '2025-04-03', 'Dosis única sarampión'),
(6, 5, 1, '2025-06-01', 'INF-2025-200', 'Sanofi', 'Consultorio', 1, '2026-06-01', 'Influenza temporada 2025'),
(7, 3, 3, '2025-04-20', 'DPT-2025-050', 'GSK', 'Centro de salud', 2, '2026-04-20', 'Refuerzo DPT'),
(9, 1, 1, '2025-02-01', 'BCG-2025-005', 'Instituto Butantan', 'Hospital', 3, NULL, 'BCG al ingreso hospitalario'),
(10, 6, 1, '2025-05-10', 'PCV-2025-300', 'Pfizer', 'Consultorio', 1, '2025-07-10', 'Primera dosis neumococo'),
(10, 6, 2, '2025-07-15', 'PCV-2025-301', 'Pfizer', 'Consultorio', 1, '2025-09-10', 'Segunda dosis neumococo'),
(13, 3, 1, '2025-01-20', 'DPT-2025-040', 'GSK', 'Centro de salud', 4, '2025-02-20', 'Primera dosis DPT - paciente pediátrico'),
(14, 4, 1, '2025-03-15', 'SR-2025-011', 'MSD', 'Consultorio', 1, '2026-03-15', 'Vacuna sarampión'),
(21, 3, 1, '2025-06-01', 'DPT-2025-060', 'GSK', 'Centro de salud', 4, '2025-07-01', 'Primera dosis DPT - lactante');

-- 8. NOTAS DE EVOLUCIÓN (notas_evolucion)
INSERT INTO notas_evolucion (consulta_id, tipo, contenido, creado_por) VALUES
(1, 'subjetivo', 'Paciente refiere sentirse bien en general. Sin molestias digestivas ni respiratorias. Niega dolor de cabeza.', 5),
(1, 'objetivo', 'PA: 120/80 mmHg, FC: 72 lpm, T: 36.5°C. Abando blando depresible, ruidos hidroaéreos presentes. Campos pulmonares limpios.', 5),
(1, 'evaluacion', 'Control general sin hallazgos patológicos. Signos vitales dentro de rangos normales para la edad.', 5),
(2, 'subjetivo', 'Paciente refiere opresión retroesternal intermitente en las últimas 2 semanas, de intensidad moderada.', 5),
(2, 'objetivo', 'PA: 140/90 mmHg, FC: 88 lpm, T: 36.8°C. Ruidos cardíacos rítmicos, soplo sistólico grado II/VI en foco aórtico.', 5),
(2, 'plan', 'Solicitar ECG, perfil lipídico, glucosa en ayunas. Indicar dieta baja en sodio y restricción de actividad física intensa.', 5);

-- 9. HISTÓRICO DE TRATAMIENTO
INSERT INTO historico_tratamiento (paciente_id, medicamento_id, consulta_id, receta_id, fecha_inicio, fecha_fin, dosis, frecuencia, via_administracion_id, estado, motivo_cambio, medico_id, observaciones) VALUES
(1, 6, 4, NULL, '2026-01-25', '2026-07-24', '50 mg', 'Cada 24 horas', NULL, 'activo', NULL, 2, 'Tratamiento continuo para hipertensión arterial'),
(1, 4, 4, NULL, '2026-01-25', '2026-04-25', '20 mg', 'Cada 24 horas', NULL, 'completado', 'Controlade hipertensión estable', 2, 'Omeprazol como gastroprotector junto con losartán'),
(3, 1, 2, NULL, '2026-07-24', NULL, '500 mg', 'Cada 8 horas', NULL, 'activo', NULL, 3, 'Tratamiento sintomático post evaluación cardíaca'),
(5, 8, 3, NULL, '2026-07-23', '2026-08-06', '75 mg', 'Cada 12 horas', NULL, 'activo', NULL, 5, 'Diclofenaco para manejo del dolor postquirúrgico');

-- 10. CIRUGÍAS PREVIAS
INSERT INTO cirugia_previa (paciente_id, nombre_procedimiento, fecha_cirugia, hospital, medico_cirujano, tipo_anestesia, complicaciones, observaciones) VALUES
(5, 'Apendicectomía laparoscópica', '2020-03-15', 'Hospital San Juan de Dios', 'Dr. Pedro Fernández', 'General', 'Sin complicaciones', 'Recuperación satisfactoria. Sin antecedentes familiares relevantes.'),
(9, 'Colecistectomía por coledocolitiasis', '2018-09-20', 'Hospitalopolis Oruro', 'Dr. Jorge Mamani', 'General', 'Leve sangrado intraoperatorio controlado', 'Paciente con antecedente de colelitiasis crónica.'),
(15, 'Hernioplastia inguinal derecha', '2022-06-10', 'Clínica Del Sur, Oruro', 'Dr. Fernando Quispe', 'Local con sedación', 'Sin complicaciones', 'Reparación con malla polipropileno. Evolución postoperatoria normal.');

-- 11. NOTAS DE EVOLUCIÓN HOSPITALIZACIÓN (nota_evolucion)
INSERT INTO nota_evolucion (hospitalizacion_id, fecha, nota, plan, indicaciones, realizado_por, activo) VALUES
(1, '2025-09-12', 'Paciente ingresa por dolor abdominal agudo localizado en fosa ilíaca derecha. Signos de irritación peritoneal. Se decide intervención quirúrgica.', 'Apendicectomía de urgencia. Monitoreo postoperatorio.', 'NPO prequirúrgico. Venoclisis con SSN. Analgesia. Preparación quirúrgica.', 5, true),
(1, '2025-09-13', 'Post appendicectomía laparoscópica. Paciente hemodinámicamente estable. Dolor controlado con analgesia IV.', 'Iniciar tolerancia oral. Movilización progresiva.', 'Dieta blanda. Diclofenaco IM cada 12h. Control de signos vitales cada 4h.', 5, true),
(2, '2025-11-05', 'Paciente de 10 años ingresa con cuadro de desnutrición moderada e infección respiratoria baja. T: 38.2°C, FR: 28 rpm.', 'Tratamiento de neumonía y plan de nutrición recuperativa.', 'Amoxicilina suspensión oral 80mg cada 8h. Suplementación con vitamina A. Plan nutricional 1800 kcal/día.', 4, true),
(3, '2026-01-20', 'Paciente ingresa con crisis de asma severa. SpO2: 88%, FR: 32 rpm, uso de musculatura accesoria.', 'Oxigenoterapia, broncodilatadores IV y corticoides. Observación en sala de urgencias.', 'Salbutamol nebulización cada 4h. Hidrocortisona 200mg IV. Suplemento de oxígeno 4L/min. Control de espirometría.', 1, true);

-- 12. EXÁMENES SOLICITADOS
INSERT INTO examen_solicitado (consulta_id, paciente_id, medico_id, tipo_examen_id, indicaciones, fecha_solicitud, fecha_realizacion, fecha_resultado, resultado, es_critico, estado, observaciones, activo) VALUES
(1, 1, 1, 1, 'Control general hemograma completo', '2026-07-24', '2026-07-24', '2026-07-25', 'Hemograma dentro de parámetros normales. Leucocitos: 7500/µL, Hemoglobina: 14.2 g/dL, Plaquetas: 250000/µL', false, 'validado', 'Valores normales. Sin hallazgos relevantes.', true),
(1, 1, 1, 2, 'Glucosa en ayunas para control metabólico', '2026-07-24', '2026-07-24', '2026-07-24', '95 mg/dL', false, 'validado', 'Glucosa dentro de rango normal (70-100 mg/dL).', true),
(2, 3, 3, 6, 'ECG para evaluación de opresión retroesternal', '2026-07-24', '2026-07-24', '2026-07-24', 'Ritmo sinusal. FC: 88 lpm. Eje normal. Sin cambios isquémicos agudos. QRS normal.', false, 'validado', 'ECG normal para la edad.', true),
(3, 6, 5, 5, 'Radiografía de tórax prequirúrgica', '2026-07-23', '2026-07-23', '2026-07-23', 'Campos pulmonares limpios. Silueta cardíaca normal. Sin derrame pleural.', false, 'validado', 'Sin hallazgos patológicos. Apto para intervención.', true),
(4, 1, 2, 3, 'Perfil lipídico para evaluación cardiovascular', '2026-07-17', '2026-07-17', '2026-07-18', 'Colesterol total: 210 mg/dL, LDL: 130 mg/dL, HDL: 45 mg/dL, Triglicéridos: 180 mg/dL', true, 'validado', 'Colesterol LDL elevado. Triglicéridos elevados. Se recomienda modificación de dieta.', true),
(5, 1, 2, 1, 'Hemograma de control para seguimiento de hipertensión', '2026-04-25', '2026-04-25', '2026-04-26', 'Hemograma completo normal. Sin evidencia de policitemia.', false, 'validado', 'Control de rutina. Sin alteraciones.', true);

-- 13. ÓRDENES DE LABORATORIO
INSERT INTO orden_laboratorio (paciente_id, medico_id, "fechaOrden", indicaciones, observaciones, estado, usuario_registro_id, activo) VALUES
(1, 2, '2026-01-25', 'Perfil lipídico completo. Glucosa en ayunas. Creatinina. BUN.', 'Paciente con hipertensión arterial en seguimiento.', 'validada', 1, true),
(3, 3, '2026-07-24', 'Troponina I. CK-MB. Electrocardiograma seriado.', 'Evaluar síndrome coronario agudo vs dolor atípico.', 'pendiente', 1, true),
(6, 5, '2026-07-23', 'Hemograma completo. Tiempos de coagulación. Grupo sanguíneo y factor Rh.', 'Prequirúrgico para procedimiento ambulatorio.', 'validada', 1, true);

-- 14. EXÁMENES DE LABORATORIO
INSERT INTO examen_laboratorio (orden_laboratorio_id, nombre, categoria, resultado, valorReferencia, unidad, esCritico, observaciones, activo) VALUES
(1, 'Colesterol Total', 'Lípidos', '210', '<200', 'mg/dL', false, 'Ligeramente elevado. Se recomienda dieta baja en grasas saturadas.', true),
(1, 'Glucosa en Ayunas', 'Metabolismo', '105', '70-100', 'mg/dL', false, 'Límite alto. No se descarta prediabetes.', true),
(1, 'Creatinina', 'Renal', '0.9', '0.7-1.3', 'mg/dL', false, 'Función renal normal.', true),
(2, 'Troponina I', 'Cardíacos', '0.01', '<0.04', 'ng/mL', false, 'Negativa. Descarta daño miocárdico agudo.', true),
(2, 'CK-MB', 'Cardíacos', '3.5', '0-25', 'U/L', false, 'Dentro de valores normales.', true),
(3, 'Hemograma Completo - Hemoglobina', 'Hematología', '13.8', '12-16', 'g/dL', false, 'Normal.', true),
(3, 'Hemograma Completo - Plaquetas', 'Hematología', '245', '150-400', 'x10³/µL', false, 'Normal.', true);

-- 15. MEDICAMENTOS EN INVENTARIO
INSERT INTO medicamento_inventario (codigo, nombre, presentacion, concentracion, laboratorio, "stockActual", "stockMinimo", "stockMaximo", "precioUnitario", lote, "fechaExpiracion", "fechaRecepcion", ubicacion, activo, usuario_registro_id) VALUES
('MED-001', 'Paracetamol 500mg', 'Tabletas', '500 mg', 'Genfar', 500, 100, 1000, 0.15, 'PAR-2025-100', '2027-06-01', '2025-06-01', 'Estante A-1', true, 1),
('MED-002', 'Ibuprofeno 400mg', 'Tabletas', '400 mg', 'Bayer', 300, 80, 800, 0.25, 'IBU-2025-200', '2027-03-15', '2025-03-15', 'Estante A-2', true, 1),
('MED-003', 'Amoxicilina 500mg', 'Cápsulas', '500 mg', 'Pfizer', 200, 50, 500, 0.80, 'AMX-2025-300', '2026-12-01', '2025-12-01', 'Estante B-1', true, 1),
('MED-004', 'Omeprazol 20mg', 'Cápsulas', '20 mg', 'AstraZeneca', 400, 100, 800, 0.35, 'OME-2025-400', '2027-09-01', '2025-09-01', 'Estante B-2', true, 1),
('MED-005', 'Metformina 850mg', 'Tabletas', '850 mg', 'Merck', 350, 80, 700, 0.40, 'MET-2025-500', '2027-01-15', '2025-01-15', 'Estante C-1', true, 1),
('MED-006', 'Losartán 50mg', 'Tabletas', '50 mg', 'MSD', 250, 60, 500, 0.55, 'LOS-2025-600', '2027-08-01', '2025-08-01', 'Estante C-2', true, 1),
('MED-007', 'Salbutamol 100mcg', 'Inhalador', '100 mcg/dosis', 'GSK', 150, 30, 300, 3.50, 'SAL-2025-700', '2026-11-01', '2025-11-01', 'Estante D-1', true, 1),
('MED-008', 'Diclofenaco 75mg', 'Inyectable', '75 mg/3mL', 'Novartis', 100, 25, 200, 1.20, 'DIC-2025-800', '2027-02-01', '2025-02-01', 'Estante D-2', true, 1);

-- 16. MOVIMIENTOS DE INVENTARIO
INSERT INTO movimiento_inventario (medicamento_id, "tipoMovimiento", cantidad, "stockAnterior", "stockNuevo", motivo, lote, "fechaExpiracion", "fechaMovimiento", usuario_registro_id) VALUES
(1, 'entrada', 200, 300, 500, 'Compra a proveedor Distrifarma S.A.', 'PAR-2025-100', '2027-06-01', '2025-06-01 09:00:00', 1),
(1, 'salida', 30, 500, 470, 'Dispensación a pacientes - Consultas del día', 'PAR-2025-100', '2027-06-01', '2025-06-15 16:00:00', 1),
(2, 'entrada', 150, 150, 300, 'Compra a proveedor Distrifarma S.A.', 'IBU-2025-200', '2027-03-15', '2025-03-15 09:00:00', 1),
(2, 'salida', 50, 300, 250, 'Dispensación a pacientes', 'IBU-2025-200', '2027-03-15', '2025-04-01 16:00:00', 1),
(3, 'entrada', 100, 100, 200, 'Compra a proveedor BioLab Distribuciones', 'AMX-2025-300', '2026-12-01', '2025-12-01 10:00:00', 1),
(4, 'entrada', 200, 200, 400, 'Compra a proveedor Distrifarma S.A.', 'OME-2025-400', '2027-09-01', '2025-09-01 11:00:00', 1),
(6, 'entrada', 150, 100, 250, 'Compra a proveedor FarmaCorp Internacional', 'LOS-2025-600', '2027-08-01', '2025-08-01 09:30:00', 1),
(6, 'salida', 40, 250, 210, 'Dispensación a pacientes con hipertensión', 'LOS-2025-600', '2027-08-01', '2025-08-30 17:00:00', 1);

-- 17. BLOQUEOS DE AGENDA
INSERT INTO bloqueo_agenda (medico_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo) VALUES
(1, '2026-08-01', '2026-08-05', '08:00', '18:00', 'Vacaciones programadas - Dr. García'),
(3, '2026-08-15', '2026-08-15', '08:00', '12:00', 'Capacitación en ginecología laparoscópica');

-- 18. ÓRDENES DE COMPRA + DETALLE
INSERT INTO orden_compra (numero_oc, proveedor_id, "fechaOrden", "fechaEntregaEsperada", estado, subtotal, impuesto, descuento, total, observaciones, usuario_registro_id, activo) VALUES
('OC-2025-001', 1, '2025-06-01', '2025-06-15', 'completada', 250.00, 32.50, 10.00, 272.50, 'Compra trimestral de medicamentos básicos', 1, true),
('OC-2025-002', 3, '2025-12-01', '2025-12-10', 'completada', 180.00, 23.40, 0.00, 203.40, 'Reactivos de laboratorio fin de año', 1, true);

INSERT INTO oc_detalle (orden_compra_id, descripcion, codigo, "cantidadSolicitada", "cantidadRecibida", precio_unitario, subtotal, observaciones) VALUES
(1, 'Paracetamol 500mg x 500 tabletas', 'MED-001', 500, 500, 0.15, 75.00, 'Lote: PAR-2025-100. Recepción verificada.'),
(1, 'Ibuprofeno 400mg x 300 tabletas', 'MED-002', 300, 300, 0.25, 75.00, 'Lote: IBU-2025-200. Recepción verificada.'),
(1, 'Omeprazol 20mg x 400 cápsulas', 'MED-004', 400, 400, 0.25, 100.00, 'Lote: OME-2025-400. Recepción verificada.'),
(2, 'Hemograma reactivos x 100 tests', 'REA-001', 100, 100, 1.20, 120.00, 'Reactivos para analizador automatizado.'),
(2, 'Glucosa reactivos x 80 tests', 'REA-002', 80, 80, 0.75, 60.00, 'Reactivo enzimático GOD-PAP.');

-- Reset sequences
SELECT setval('vacuna_id_seq', (SELECT COALESCE(MAX(id), 0) FROM vacuna));
SELECT setval('tipo_examen_id_seq', (SELECT COALESCE(MAX(id), 0) FROM tipo_examen));
SELECT setval('medicamentos_interacciones_id_seq', (SELECT COALESCE(MAX(id), 0) FROM medicamentos_interacciones));
SELECT setval('horario_medico_id_seq', (SELECT COALESCE(MAX(id), 0) FROM horario_medico));
SELECT setval('proveedor_id_seq', (SELECT COALESCE(MAX(id), 0) FROM proveedor));
SELECT setval('almacen_id_seq', (SELECT COALESCE(MAX(id), 0) FROM almacen));
SELECT setval('paciente_vacuna_id_seq', (SELECT COALESCE(MAX(id), 0) FROM paciente_vacuna));
SELECT setval('notas_evolucion_id_seq', (SELECT COALESCE(MAX(id), 0) FROM notas_evolucion));
SELECT setval('historico_tratamiento_id_seq', (SELECT COALESCE(MAX(id), 0) FROM historico_tratamiento));
SELECT setval('cirugia_previa_id_seq', (SELECT COALESCE(MAX(id), 0) FROM cirugia_previa));
SELECT setval('nota_evolucion_id_seq', (SELECT COALESCE(MAX(id), 0) FROM nota_evolucion));
SELECT setval('examen_solicitado_id_seq', (SELECT COALESCE(MAX(id), 0) FROM examen_solicitado));
SELECT setval('orden_laboratorio_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orden_laboratorio));
SELECT setval('examen_laboratorio_id_seq', (SELECT COALESCE(MAX(id), 0) FROM examen_laboratorio));
SELECT setval('medicamento_inventario_id_seq', (SELECT COALESCE(MAX(id), 0) FROM medicamento_inventario));
SELECT setval('movimiento_inventario_id_seq', (SELECT COALESCE(MAX(id), 0) FROM movimiento_inventario));
SELECT setval('bloqueo_agenda_id_seq', (SELECT COALESCE(MAX(id), 0) FROM bloqueo_agenda));
SELECT setval('orden_compra_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orden_compra));
SELECT setval('oc_detalle_id_seq', (SELECT COALESCE(MAX(id), 0) FROM oc_detalle));
