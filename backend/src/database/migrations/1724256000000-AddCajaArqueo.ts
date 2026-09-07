import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCajaArqueo1724256000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS caja_sessions (
        id SERIAL PRIMARY KEY,
        fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT now(),
        fecha_cierre TIMESTAMPTZ,
        monto_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
        monto_final DECIMAL(10,2),
        estado VARCHAR(20) NOT NULL DEFAULT 'abierta',
        usuario_id INTEGER NOT NULL,
        observaciones TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS arqueos_caja (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        monto_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
        monto_real DECIMAL(10,2) NOT NULL DEFAULT 0,
        diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
        observaciones TEXT,
        usuario_id INTEGER,
        caja_session_id INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_caja_sessions_estado ON caja_sessions (estado);
      CREATE INDEX IF NOT EXISTS idx_arqueos_caja_fecha ON arqueos_caja (fecha DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS arqueos_caja;`);
    await queryRunner.query(`DROP TABLE IF EXISTS caja_sessions;`);
  }
}
