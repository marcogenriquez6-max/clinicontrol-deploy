import { config } from 'dotenv';
config();

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard, PermissionsGuard } from './common/guards/roles.guard';
import { OwnershipGuard } from './common/guards/ownership.guard';
import { CommonModule } from './common/common.module';
import { SeedModule } from './common/seed.module';

import { RolModule } from './modules/rol/infrastructure/rol.module';
import { UsuarioModule } from './modules/usuario/infrastructure/usuario.module';
import { GeneroModule } from './modules/genero/infrastructure/genero.module';
import { GrupoSanguineoModule } from './modules/grupo-sanguineo/infrastructure/grupo-sanguineo.module';
import { PacienteModule } from './modules/paciente/paciente.module';
import { EspecialidadModule } from './modules/especialidad/infrastructure/especialidad.module';
import { MedicoModule } from './modules/medico/infrastructure/medico.module';
import { DisponibilidadModule } from './modules/disponibilidad/infrastructure/disponibilidad.module';
import { EstadoCitaModule } from './modules/estado-cita/infrastructure/estado-cita.module';
import { CitaModule } from './modules/cita/infrastructure/cita.module';
import { ConsultaModule } from './modules/consulta/consulta.module';
import { DiagnosticoModule } from './modules/diagnostico/infrastructure/diagnostico.module';
import { RecetaModule } from './modules/receta/infrastructure/receta.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/infrastructure/health.module';
import { ReportsModule } from './modules/reports/infrastructure/reports.module';
import { TriageModule } from './modules/triage/infrastructure/triage.module';
import { HospitalizacionModule } from './modules/hospitalizacion/infrastructure/hospitalizacion.module';
import { QueueModule } from './modules/queue/infrastructure/queue.module';
import { ImpresionModule } from './modules/impresion/infrastructure/impresion.module';
import { CirugiaPreviaModule } from './modules/cirugia-previa/infrastructure/cirugia-previa.module';
import { AuditModule } from './modules/audit/infrastructure/audit.module';
import { HistoricoTratamientoModule } from './modules/historico-tratamiento/infrastructure/historico-tratamiento.module';
import { VacunaModule } from './modules/vacuna/infrastructure/vacuna.module';
import { AlergiaModule } from './modules/alergia/infrastructure/alergia.module';
import { SucursalModule } from './modules/sucursal/infrastructure/sucursal.module';
import { AgendaModule } from './modules/agenda/infrastructure/agenda.module';
import { TipoAtencionModule } from './modules/tipo-atencion/infrastructure/tipo-atencion.module';
import { TurnoModule } from './modules/turno/infrastructure/turno.module';
import { PagoModule } from './modules/pago/pago.module';
import { RespaldoModule } from './modules/respaldo/respaldo.module';
import { InteraccionMedicamentoModule } from './modules/interaccion-medicamento/infrastructure/interaccion-medicamento.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appCfg = configService.get('app');
        const isPostgres = appCfg.database.type === 'postgres';
        const dbConfig = appCfg.database;
        return {
          type: isPostgres ? 'postgres' : 'sqlite',
          ...(isPostgres
            ? {
                host: dbConfig.host,
                port: dbConfig.port,
                username: dbConfig.username,
                password: dbConfig.password,
                database: dbConfig.database,
                poolSize: dbConfig.poolSize,
                extra: {
                  max: dbConfig.poolSize,
                  idleTimeoutMillis: 30000,
                  connectionTimeoutMillis: 5000,
                },
              }
            : { database: process.env.DB_PATH || 'data/hospital.db' }),
          entities: [__dirname + '/entities/*.entity{.ts,.js}'],
          synchronize: dbConfig.synchronize,
          migrationsRun: false,
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          logging: dbConfig.logging,
          dropSchema: false,
        };
      },
    }),
    CommonModule,
    SeedModule,
    DisponibilidadModule,
    RolModule,
    UsuarioModule,
    GeneroModule,
    GrupoSanguineoModule,
    PacienteModule,
    EspecialidadModule,
    MedicoModule,
    CitaModule,
    ConsultaModule,
    DiagnosticoModule,
    EstadoCitaModule,
    TipoAtencionModule,
    RecetaModule,
    AuthModule,
    HealthModule,
    ReportsModule,
    TriageModule,
    HospitalizacionModule,
    InteraccionMedicamentoModule,
    ImpresionModule,
    CirugiaPreviaModule,
    VacunaModule,
    AlergiaModule,
    SucursalModule,
    AgendaModule,
    HistoricoTratamientoModule,
    TurnoModule,
    // Caja/Arqueo (POS) quedan fuera del alcance del documento de grado:
    // el sistema registra un pago simple en efectivo por atención (PagoModule).
    PagoModule,
    RespaldoModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    OwnershipGuard,
  ],
})
export class AppModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}
