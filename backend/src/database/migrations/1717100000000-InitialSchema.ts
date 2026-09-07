import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1717100000000 implements MigrationInterface {
  name = 'InitialSchema1717100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "rol" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_rol_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_rol" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "genero" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_genero_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_genero" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "grupo_sanguineo" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_gs_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_gs" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "especialidad" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "descripcion" text,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_esp_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_esp" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "usuario" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "apellido" character varying NOT NULL,
      "ci" character varying NOT NULL,
      "email" character varying NOT NULL,
      "password" character varying NOT NULL,
      "rol_id" integer NOT NULL,
      "bloqueado" boolean NOT NULL DEFAULT false,
      "bloqueado_motivo" character varying,
      "intentos_fallidos" integer NOT NULL DEFAULT 0,
      "ultimo_login" TIMESTAMP,
      "mfa_secret" character varying,
      "mfa_enabled" boolean NOT NULL DEFAULT false,
      "mfa_method" character varying(10),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_usuario_ci" UNIQUE ("ci"),
      CONSTRAINT "UQ_usuario_email" UNIQUE ("email"),
      CONSTRAINT "PK_usuario" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_usuario_ci" ON "usuario" ("ci")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usuario_email" ON "usuario" ("email")`,
    );

    await queryRunner.query(`CREATE TABLE "medico" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "apellido" character varying NOT NULL,
      "especialidad_id" integer NOT NULL,
      "telefono" character varying,
      "email" character varying,
      "codigo_medico" character varying,
      CONSTRAINT "PK_medico" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "estado_cita" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_ec_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_ec" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "paciente" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "apellido" character varying NOT NULL,
      "ci" character varying NOT NULL,
      "fecha_nacimiento" date NOT NULL,
      "genero_id" integer NOT NULL,
      "telefono" character varying,
      "direccion" character varying,
      "email" character varying,
      "grupo_sanguineo_id" integer,
      "usuario_registro_id" integer NOT NULL,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_paciente_ci" UNIQUE ("ci"),
      CONSTRAINT "PK_paciente" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "cita" (
      "id" SERIAL NOT NULL,
      "paciente_id" integer NOT NULL,
      "medico_id" integer NOT NULL,
      "fecha" TIMESTAMP NOT NULL,
      "hora_inicio" TIME NOT NULL,
      "hora_fin" TIME NOT NULL,
      "estado_id" integer NOT NULL,
      "creado_por" integer NOT NULL,
      "cancelacion_motivo" character varying,
      "cancelado_por" integer,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_cita" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "consulta" (
      "id" SERIAL NOT NULL,
      "paciente_id" integer NOT NULL,
      "medico_id" integer NOT NULL,
      "cita_id" integer,
      "fecha" date NOT NULL,
      "motivo" text,
      "sintomas" text,
      "examen_fisico" text,
      "observaciones" text,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_consulta" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "cie10" (
      "id" SERIAL NOT NULL,
      "codigo" character varying NOT NULL,
      "descripcion" text NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_cie10" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "diagnostico" (
      "id" SERIAL NOT NULL,
      "consulta_id" integer NOT NULL,
      "cie10_id" integer,
      "codigo" character varying,
      "descripcion" text NOT NULL,
      "tipo" character varying NOT NULL DEFAULT 'principal',
      "recomendaciones" text,
      "es_cronico" boolean NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_diagnostico" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "medicamento" (
      "id" SERIAL NOT NULL,
      "nombre" character varying NOT NULL,
      "presentacion" character varying,
      "concentracion" character varying,
      CONSTRAINT "PK_medicamento" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "receta" (
      "id" SERIAL NOT NULL,
      "consulta_id" integer NOT NULL,
      "instrucciones" text,
      "estado" character varying NOT NULL DEFAULT 'activa',
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_receta" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "receta_medicamento" (
      "id" SERIAL NOT NULL,
      "receta_id" integer NOT NULL,
      "medicamento_id" integer NOT NULL,
      "dosis" character varying NOT NULL,
      "frecuencia" character varying NOT NULL,
      "duracion" character varying,
      "observaciones" text,
      CONSTRAINT "PK_receta_medicamento" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "cama" (
      "id" SERIAL NOT NULL,
      "codigo_cama" character varying NOT NULL,
      "servicio" character varying NOT NULL,
      "piso" character varying,
      "habitacion" character varying,
      "estado" character varying(20) NOT NULL DEFAULT 'disponible',
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_cama" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_cama_estado" ON "cama" ("estado")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cama_servicio" ON "cama" ("servicio")`,
    );

    await queryRunner.query(`CREATE TABLE "hospitalizacion" (
      "id" SERIAL NOT NULL,
      "paciente_id" integer NOT NULL,
      "medico_tratante_id" integer NOT NULL,
      "cama_id" integer NOT NULL,
      "fecha_ingreso" TIMESTAMP NOT NULL,
      "fecha_alta" TIMESTAMP,
      "motivo_ingreso" text,
      "diagnostico_ingreso" text,
      "observaciones" text,
      "estado" character varying(20) NOT NULL DEFAULT 'admitido',
      "usuario_registro_id" integer NOT NULL,
      "notas_alta" text,
      "diagnostico_alta" text,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_hospitalizacion" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_hosp_paciente" ON "hospitalizacion" ("paciente_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hosp_estado" ON "hospitalizacion" ("estado")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hosp_fechas" ON "hospitalizacion" ("fecha_ingreso", "fecha_alta")`,
    );

    await queryRunner.query(`CREATE TABLE "nota_evolucion" (
      "id" SERIAL NOT NULL,
      "hospitalizacion_id" integer NOT NULL,
      "fecha" date NOT NULL,
      "nota" text NOT NULL,
      "plan" text,
      "indicaciones" text,
      "realizado_por" integer NOT NULL,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_nota_evolucion" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_nota_hosp" ON "nota_evolucion" ("hospitalizacion_id")`,
    );

    await queryRunner.query(`CREATE TABLE "orden_laboratorio" (
      "id" SERIAL NOT NULL,
      "paciente_id" integer NOT NULL,
      "medico_id" integer NOT NULL,
      "fecha_orden" date NOT NULL,
      "indicaciones" text,
      "observaciones" text,
      "estado" character varying(20) NOT NULL DEFAULT 'pendiente',
      "usuario_registro_id" integer NOT NULL,
      "resultado_validado_por" integer,
      "fecha_validacion" TIMESTAMP,
      "resultados" json,
      "alertas" json,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_orden_lab" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ol_paciente" ON "orden_laboratorio" ("paciente_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ol_estado" ON "orden_laboratorio" ("estado")`,
    );

    await queryRunner.query(`CREATE TABLE "examen_laboratorio" (
      "id" SERIAL NOT NULL,
      "orden_laboratorio_id" integer NOT NULL,
      "nombre" character varying NOT NULL,
      "categoria" character varying,
      "resultado" text,
      "valor_referencia" text,
      "unidad" character varying,
      "es_critico" boolean,
      "observaciones" text,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_examen_lab" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ex_lab_orden" ON "examen_laboratorio" ("orden_laboratorio_id")`,
    );

    await queryRunner.query(`CREATE TABLE "medicamento_inventario" (
      "id" SERIAL NOT NULL,
      "codigo" character varying NOT NULL,
      "nombre" character varying NOT NULL,
      "presentacion" character varying,
      "concentracion" character varying,
      "laboratorio" character varying,
      "stock_actual" integer NOT NULL DEFAULT 0,
      "stock_minimo" integer NOT NULL DEFAULT 0,
      "stock_maximo" integer NOT NULL DEFAULT 0,
      "precio_unitario" numeric(10,2) NOT NULL DEFAULT 0,
      "lote" character varying,
      "fecha_expiracion" date,
      "fecha_recepcion" date,
      "ubicacion" text,
      "activo" boolean NOT NULL DEFAULT true,
      "usuario_registro_id" integer NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_inv_codigo" UNIQUE ("codigo"),
      CONSTRAINT "PK_inventario" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_codigo" ON "medicamento_inventario" ("codigo")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inv_expiracion" ON "medicamento_inventario" ("fecha_expiracion")`,
    );

    await queryRunner.query(`CREATE TABLE "movimiento_inventario" (
      "id" SERIAL NOT NULL,
      "medicamento_id" integer NOT NULL,
      "tipo_movimiento" character varying(20) NOT NULL,
      "cantidad" integer NOT NULL,
      "stock_anterior" integer NOT NULL DEFAULT 0,
      "stock_nuevo" integer NOT NULL DEFAULT 0,
      "motivo" text,
      "lote" character varying,
      "fecha_expiracion" date,
      "fecha_movimiento" TIMESTAMP NOT NULL,
      "referencia_id" integer,
      "referencia_tipo" character varying,
      "usuario_registro_id" integer NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_mov_inv" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_mov_med" ON "movimiento_inventario" ("medicamento_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mov_fecha" ON "movimiento_inventario" ("fecha_movimiento")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mov_tipo" ON "movimiento_inventario" ("tipo_movimiento")`,
    );

    await queryRunner.query(`CREATE TABLE "factura" (
      "id" SERIAL NOT NULL,
      "numero_factura" character varying NOT NULL,
      "paciente_id" integer NOT NULL,
      "fecha_emision" TIMESTAMP NOT NULL,
      "fecha_vencimiento" TIMESTAMP,
      "subtotal" numeric(12,2) NOT NULL DEFAULT 0,
      "impuesto" numeric(12,2) NOT NULL DEFAULT 0,
      "descuento" numeric(12,2) NOT NULL DEFAULT 0,
      "total" numeric(12,2) NOT NULL DEFAULT 0,
      "saldo_pendiente" numeric(12,2) NOT NULL DEFAULT 0,
      "moneda" character varying(3) NOT NULL DEFAULT 'USD',
      "tasa_cambio" numeric(10,4),
      "concepto" text,
      "observaciones" text,
      "estado" character varying(20) NOT NULL DEFAULT 'emitida',
      "usuario_registro_id" integer NOT NULL,
      "asignado_seguro_id" integer,
      "datos_seguro" text,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_fact_numero" UNIQUE ("numero_factura"),
      CONSTRAINT "PK_factura" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fact_paciente" ON "factura" ("paciente_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fact_estado" ON "factura" ("estado")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fact_fecha" ON "factura" ("fecha_emision")`,
    );

    await queryRunner.query(`CREATE TABLE "factura_item" (
      "id" SERIAL NOT NULL,
      "factura_id" integer NOT NULL,
      "descripcion" character varying NOT NULL,
      "codigo" character varying,
      "cantidad" integer NOT NULL DEFAULT 1,
      "precio_unitario" numeric(12,2) NOT NULL,
      "descuento" numeric(12,2) NOT NULL DEFAULT 0,
      "impuesto" numeric(12,2) NOT NULL DEFAULT 0,
      "total" numeric(12,2) NOT NULL,
      "referencia_tipo" character varying,
      "referencia_id" integer,
      CONSTRAINT "PK_factura_item" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fi_factura" ON "factura_item" ("factura_id")`,
    );

    await queryRunner.query(`CREATE TABLE "pago" (
      "id" SERIAL NOT NULL,
      "factura_id" integer NOT NULL,
      "monto" numeric(12,2) NOT NULL,
      "metodo_pago" character varying(20) NOT NULL,
      "fecha_pago" TIMESTAMP NOT NULL,
      "referencia" character varying,
      "observaciones" text,
      "usuario_registro_id" integer NOT NULL,
      CONSTRAINT "PK_pago" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_pago_factura" ON "pago" ("factura_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pago_fecha" ON "pago" ("fecha_pago")`,
    );

    await queryRunner.query(`CREATE TABLE "notificacion" (
      "id" SERIAL NOT NULL,
      "usuario_id" integer NOT NULL,
      "titulo" character varying NOT NULL,
      "mensaje" text NOT NULL,
      "tipo" character varying(20) NOT NULL DEFAULT 'in_app',
      "referencia_tipo" character varying,
      "referencia_id" integer,
      "leida" boolean NOT NULL DEFAULT false,
      "fecha_lectura" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_notificacion" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_notif_usuario" ON "notificacion" ("usuario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notif_leida" ON "notificacion" ("leida")`,
    );

    await queryRunner.query(`CREATE TABLE "preferencia_notificacion" (
      "id" SERIAL NOT NULL,
      "usuario_id" integer NOT NULL,
      "notificacion_in_app" boolean NOT NULL DEFAULT true,
      "notificacion_email" boolean NOT NULL DEFAULT false,
      "notificacion_sms" boolean NOT NULL DEFAULT false,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_pref_notif_usuario" UNIQUE ("usuario_id"),
      CONSTRAINT "PK_pref_notif" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "triage" (
      "id" SERIAL NOT NULL,
      "paciente_id" integer NOT NULL,
      "nivel_esi" integer NOT NULL,
      "presion_sistolica" integer,
      "presion_diastolica" integer,
      "frecuencia_cardiaca" integer,
      "frecuencia_respiratoria" integer,
      "temperatura" numeric(4,1),
      "saturacion_oxigeno" integer,
      "sintomas" text,
      "alergias" text,
      "medicamentos_actuales" text,
      "nota_triage" text,
      "realizado_por" integer NOT NULL,
      "activo" boolean NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_triage" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_triage_paciente" ON "triage" ("paciente_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_triage_nivel" ON "triage" ("nivel_esi")`,
    );

    await queryRunner.query(`CREATE TABLE "attachment" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "nombre" character varying NOT NULL,
      "mime_type" character varying NOT NULL,
      "tamano" integer NOT NULL,
      "bucket" character varying NOT NULL,
      "key" character varying NOT NULL,
      "url" character varying,
      "entity_type" character varying NOT NULL,
      "entity_id" integer NOT NULL,
      "usuario_subio_id" integer NOT NULL,
      "etiquetas" json,
      "eliminado" boolean NOT NULL DEFAULT false,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_attachment" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "audit_log" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "entity_type" character varying NOT NULL,
      "entity_id" integer NOT NULL,
      "accion" character varying NOT NULL,
      "old_value" json,
      "new_value" json,
      "changes" json,
      "usuario_id" integer,
      "ip_address" character varying,
      "user_agent" character varying,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_entity" ON "audit_log" ("entity_type", "entity_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_usuario" ON "audit_log" ("usuario_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_accion" ON "audit_log" ("accion")`,
    );

    await queryRunner.query(`CREATE TABLE "account_status" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "nombre" character varying NOT NULL,
      "descripcion" text,
      "color" character varying,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_as_nombre" UNIQUE ("nombre"),
      CONSTRAINT "PK_as" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "customer" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "nombre" character varying NOT NULL,
      "apellido" character varying NOT NULL,
      "email" character varying,
      "telefono" character varying,
      "tipo" character varying(20) NOT NULL DEFAULT 'individual',
      "status_id" uuid,
      "notas" text,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_customer" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "contact_info" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "customer_id" uuid NOT NULL,
      "tipo" character varying(20) NOT NULL,
      "valor" character varying NOT NULL,
      "etiqueta" character varying,
      "es_principal" boolean NOT NULL DEFAULT false,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_contact_info" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "address" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "customer_id" uuid NOT NULL,
      "tipo" character varying(20) NOT NULL DEFAULT 'fisica',
      "linea1" character varying NOT NULL,
      "linea2" character varying,
      "ciudad" character varying,
      "provincia" character varying,
      "codigo_postal" character varying,
      "pais" character varying DEFAULT 'República Dominicana',
      "es_principal" boolean NOT NULL DEFAULT false,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_address" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(`CREATE TABLE "interaction" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "customer_id" uuid NOT NULL,
      "tipo" character varying(30) NOT NULL,
      "descripcion" text NOT NULL,
      "resultado" text,
      "fecha_proximo_contacto" TIMESTAMP,
      "realizado_por" integer,
      "deleted_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_interaction" PRIMARY KEY ("id")
    )`);

    await queryRunner.query(
      `ALTER TABLE "usuario" ADD CONSTRAINT "FK_usuario_rol" FOREIGN KEY ("rol_id") REFERENCES "rol"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "medico" ADD CONSTRAINT "FK_medico_especialidad" FOREIGN KEY ("especialidad_id") REFERENCES "especialidad"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD CONSTRAINT "FK_paciente_genero" FOREIGN KEY ("genero_id") REFERENCES "genero"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD CONSTRAINT "FK_paciente_gs" FOREIGN KEY ("grupo_sanguineo_id") REFERENCES "grupo_sanguineo"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD CONSTRAINT "FK_paciente_usuario_registro" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_medico" FOREIGN KEY ("medico_id") REFERENCES "medico"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_estado" FOREIGN KEY ("estado_id") REFERENCES "estado_cita"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_creado_por" FOREIGN KEY ("creado_por") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "cita" ADD CONSTRAINT "FK_cita_cancelado_por" FOREIGN KEY ("cancelado_por") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "consulta" ADD CONSTRAINT "FK_consulta_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "consulta" ADD CONSTRAINT "FK_consulta_medico" FOREIGN KEY ("medico_id") REFERENCES "medico"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "consulta" ADD CONSTRAINT "FK_consulta_cita" FOREIGN KEY ("cita_id") REFERENCES "cita"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "diagnostico" ADD CONSTRAINT "FK_diag_consulta" FOREIGN KEY ("consulta_id") REFERENCES "consulta"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "diagnostico" ADD CONSTRAINT "FK_diag_cie10" FOREIGN KEY ("cie10_id") REFERENCES "cie10"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "receta" ADD CONSTRAINT "FK_receta_consulta" FOREIGN KEY ("consulta_id") REFERENCES "consulta"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "receta_medicamento" ADD CONSTRAINT "FK_rm_receta" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "receta_medicamento" ADD CONSTRAINT "FK_rm_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "hospitalizacion" ADD CONSTRAINT "FK_hosp_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "hospitalizacion" ADD CONSTRAINT "FK_hosp_medico" FOREIGN KEY ("medico_tratante_id") REFERENCES "medico"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "hospitalizacion" ADD CONSTRAINT "FK_hosp_cama" FOREIGN KEY ("cama_id") REFERENCES "cama"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "hospitalizacion" ADD CONSTRAINT "FK_hosp_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "nota_evolucion" ADD CONSTRAINT "FK_nota_hosp" FOREIGN KEY ("hospitalizacion_id") REFERENCES "hospitalizacion"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "nota_evolucion" ADD CONSTRAINT "FK_nota_usuario" FOREIGN KEY ("realizado_por") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "orden_laboratorio" ADD CONSTRAINT "FK_ol_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "orden_laboratorio" ADD CONSTRAINT "FK_ol_medico" FOREIGN KEY ("medico_id") REFERENCES "medico"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "orden_laboratorio" ADD CONSTRAINT "FK_ol_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "examen_laboratorio" ADD CONSTRAINT "FK_ex_orden" FOREIGN KEY ("orden_laboratorio_id") REFERENCES "orden_laboratorio"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicamento_inventario" ADD CONSTRAINT "FK_inv_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "FK_mov_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento_inventario"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimiento_inventario" ADD CONSTRAINT "FK_mov_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "factura" ADD CONSTRAINT "FK_fact_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "factura" ADD CONSTRAINT "FK_fact_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "factura_item" ADD CONSTRAINT "FK_fi_factura" FOREIGN KEY ("factura_id") REFERENCES "factura"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "pago" ADD CONSTRAINT "FK_pago_factura" FOREIGN KEY ("factura_id") REFERENCES "factura"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "pago" ADD CONSTRAINT "FK_pago_usuario" FOREIGN KEY ("usuario_registro_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notificacion" ADD CONSTRAINT "FK_notif_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preferencia_notificacion" ADD CONSTRAINT "FK_pref_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "triage" ADD CONSTRAINT "FK_triage_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "triage" ADD CONSTRAINT "FK_triage_usuario" FOREIGN KEY ("realizado_por") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_attach_usuario" FOREIGN KEY ("usuario_subio_id") REFERENCES "usuario"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contact_info" ADD CONSTRAINT "FK_ci_customer" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "address" ADD CONSTRAINT "FK_addr_customer" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "interaction" ADD CONSTRAINT "FK_int_customer" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "FK_customer_status" FOREIGN KEY ("status_id") REFERENCES "account_status"("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "interaction" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "address" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_info" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customer" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "account_status" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attachment" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "preferencia_notificacion" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "notificacion" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pago" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "factura_item" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "factura" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "movimiento_inventario" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "medicamento_inventario" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "examen_laboratorio" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "orden_laboratorio" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nota_evolucion" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hospitalizacion" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cama" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "triage" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "receta_medicamento" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "receta" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medicamento" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diagnostico" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cie10" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "consulta" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cita" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "estado_cita" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medico" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "paciente" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "especialidad" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grupo_sanguineo" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "genero" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuario" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rol" CASCADE`);
  }
}
