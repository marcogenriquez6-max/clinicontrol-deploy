import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTurnoAgenda1724342400000 implements MigrationInterface {
  name = 'AddTurnoAgenda1724342400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE turno ADD COLUMN IF NOT EXISTS fecha_programada date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE turno ADD COLUMN IF NOT EXISTS hora_programada varchar(5) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE tipo_atencion ADD COLUMN IF NOT EXISTS duracion_minutos integer NOT NULL DEFAULT 30`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tipo_atencion DROP COLUMN IF EXISTS duracion_minutos`,
    );
    await queryRunner.query(
      `ALTER TABLE turno DROP COLUMN IF EXISTS hora_programada`,
    );
    await queryRunner.query(
      `ALTER TABLE turno DROP COLUMN IF EXISTS fecha_programada`,
    );
  }
}
