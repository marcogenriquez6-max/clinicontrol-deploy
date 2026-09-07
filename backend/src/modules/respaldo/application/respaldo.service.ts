import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { promises as fs, createReadStream } from 'fs';
import { join, resolve } from 'path';
import { AuditService } from '../../../common/services/audit.service';
import { AuditAction } from '../../../entities/audit-log.entity';

export interface RespaldoInfo {
  nombre: string;
  tamanoBytes: number;
  creadoEn: Date;
}

const NOMBRE_VALIDO = /^[A-Za-z0-9._-]+\.(dump|sql)$/;

/**
 * Respaldos de la base de datos con pg_dump (formato custom, restaurable con pg_restore).
 * Los archivos se guardan en BACKUP_DIR (por defecto ./backups del backend).
 */
@Injectable()
export class RespaldoService {
  private readonly logger = new Logger(RespaldoService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  private get dir(): string {
    return resolve(process.env.BACKUP_DIR || join(process.cwd(), 'backups'));
  }

  private async asegurarDir(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
  }

  async listar(): Promise<RespaldoInfo[]> {
    await this.asegurarDir();
    const nombres = await fs.readdir(this.dir);
    const infos: RespaldoInfo[] = [];
    for (const nombre of nombres) {
      if (!NOMBRE_VALIDO.test(nombre)) continue;
      const st = await fs.stat(join(this.dir, nombre));
      infos.push({ nombre, tamanoBytes: st.size, creadoEn: st.mtime });
    }
    return infos.sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime());
  }

  async crear(usuario: { id: number; email?: string }): Promise<RespaldoInfo> {
    await this.asegurarDir();
    const db = this.config.get('app.database') as {
      type: string;
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };
    if (db.type !== 'postgres') {
      throw new BadRequestException(
        'Los respaldos automáticos solo están disponibles con PostgreSQL',
      );
    }
    const stamp = new Date()
      .toISOString()
      .replace(/[:T]/g, '-')
      .slice(0, 19);
    const nombre = `clinicontrol_${stamp}.dump`;
    const destino = join(this.dir, nombre);
    const pgDump = process.env.PG_DUMP_PATH || 'pg_dump';

    await new Promise<void>((resolvePromise, reject) => {
      const proc = spawn(
        pgDump,
        [
          '-h', db.host,
          '-p', String(db.port),
          '-U', db.username,
          '-F', 'c',
          '-f', destino,
          db.database,
        ],
        { env: { ...process.env, PGPASSWORD: db.password } },
      );
      let stderr = '';
      proc.stderr.on('data', (d) => (stderr += d.toString()));
      proc.on('error', (err) => {
        reject(
          new InternalServerErrorException(
            `No se pudo ejecutar pg_dump (${err.message}). Verifique que PostgreSQL esté instalado o defina PG_DUMP_PATH.`,
          ),
        );
      });
      proc.on('close', (code) => {
        if (code === 0) resolvePromise();
        else
          reject(
            new InternalServerErrorException(
              `pg_dump terminó con código ${code}: ${stderr.trim() || 'sin detalle'}`,
            ),
          );
      });
    });

    const st = await fs.stat(destino);
    this.logger.log(`Respaldo creado: ${nombre} (${st.size} bytes)`);
    this.auditService
      .log({
        userId: String(usuario.id),
        userEmail: usuario.email,
        action: AuditAction.CREATE,
        entityType: 'respaldo',
        entityId: nombre,
        newValue: { nombre, tamanoBytes: st.size },
      })
      .catch(() => {});
    return { nombre, tamanoBytes: st.size, creadoEn: st.mtime };
  }

  async rutaDe(nombre: string): Promise<string> {
    if (!NOMBRE_VALIDO.test(nombre)) {
      throw new BadRequestException('Nombre de respaldo inválido');
    }
    const ruta = join(this.dir, nombre);
    try {
      await fs.access(ruta);
    } catch {
      throw new NotFoundException(`Respaldo ${nombre} no encontrado`);
    }
    return ruta;
  }

  async stream(nombre: string) {
    const ruta = await this.rutaDe(nombre);
    return createReadStream(ruta);
  }

  async eliminar(
    nombre: string,
    usuario: { id: number; email?: string },
  ): Promise<{ message: string }> {
    const ruta = await this.rutaDe(nombre);
    await fs.unlink(ruta);
    this.auditService
      .log({
        userId: String(usuario.id),
        userEmail: usuario.email,
        action: AuditAction.DELETE,
        entityType: 'respaldo',
        entityId: nombre,
      })
      .catch(() => {});
    return { message: `Respaldo ${nombre} eliminado` };
  }
}
