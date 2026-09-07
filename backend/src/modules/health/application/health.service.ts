import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(private readonly connection: Connection) {}

  async checkDatabase(): Promise<{
    status: string;
    latency: number;
    message: string;
  }> {
    const start = Date.now();
    try {
      await this.connection.query('SELECT 1');
      return {
        status: 'ok',
        latency: Date.now() - start,
        message: 'Conexión exitosa',
      };
    } catch (err) {
      return {
        status: 'error',
        latency: Date.now() - start,
        message: `Error: ${(err as Error).message}`,
      };
    }
  }

  async fullCheck() {
    const dbStatus = await this.checkDatabase();
    const memUsage = process.memoryUsage();
    const cpus = os.cpus();

    return {
      status: dbStatus.status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      system: {
        memory: {
          heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
          external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
        },
        cpu: {
          cores: cpus.length,
          model: cpus[0]?.model || 'unknown',
          loadAvg: os.loadavg(),
        },
        platform: os.platform(),
        hostname: os.hostname(),
        freemem: Math.round((os.freemem() / 1024 / 1024 / 1024) * 100) / 100,
        totalmem: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 100) / 100,
      },
    };
  }

  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async ready() {
    const dbOk = await this.checkDatabase();
    return {
      status: dbOk.status === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: dbOk,
    };
  }
}
