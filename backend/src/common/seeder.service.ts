import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
import { Genero } from '../entities/genero.entity';
import { GrupoSanguineo } from '../entities/grupo-sanguineo.entity';
import { Cie10 } from '../entities/cie10.entity';
import { Especialidad } from '../entities/especialidad.entity';
import { Medicamento } from '../entities/receta-medicamento.entity';
import { Usuario } from '../entities/usuario.entity';
import { Paciente } from '../entities/paciente.entity';
import { Medico } from '../entities/medico.entity';
import { EstadoCita } from '../entities/estado-cita.entity';
import { Cita } from '../entities/cita.entity';
import { Consulta } from '../entities/consulta.entity';
import { Diagnostico } from '../entities/diagnostico.entity';
import {
  Receta,
  RecetaMedicamento,
} from '../entities/receta-medicamento.entity';
import { Sucursal } from '../entities/sucursal.entity';
import { Alergia } from '../entities/alergia.entity';
import { MedicamentoInteraccion } from '../entities/medicamento-interaccion.entity';
import { TipoAtencion } from '../entities/tipo-atencion.entity';
import { Turno } from '../entities/turno.entity';
import { Triage } from '../entities/triage.entity';
import {
  Cama,
  Hospitalizacion,
  BedStatus,
  AdmisionEstado,
} from '../entities/hospitalizacion.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Vacuna } from '../entities/vacuna.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  async onModuleInit() {
    await this.seed();
  }
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    @InjectRepository(Genero) private generoRepo: Repository<Genero>,
    @InjectRepository(GrupoSanguineo)
    private gsRepo: Repository<GrupoSanguineo>,
    @InjectRepository(Cie10) private cie10Repo: Repository<Cie10>,
    @InjectRepository(Especialidad) private espRepo: Repository<Especialidad>,
    @InjectRepository(Medicamento) private medRepo: Repository<Medicamento>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Paciente) private pacienteRepo: Repository<Paciente>,
    @InjectRepository(Medico) private medicoRepo: Repository<Medico>,
    @InjectRepository(EstadoCita)
    private estadoCitaRepo: Repository<EstadoCita>,
    @InjectRepository(Cita) private citaRepo: Repository<Cita>,
    @InjectRepository(Consulta) private consultaRepo: Repository<Consulta>,
    @InjectRepository(Diagnostico)
    private diagnosticoRepo: Repository<Diagnostico>,
    @InjectRepository(Receta) private recetaRepo: Repository<Receta>,
    @InjectRepository(RecetaMedicamento)
    private recetaMedRepo: Repository<RecetaMedicamento>,
    @InjectRepository(Sucursal) private sucursalRepo: Repository<Sucursal>,
    @InjectRepository(Alergia) private alergiaRepo: Repository<Alergia>,
    @InjectRepository(TipoAtencion)
    private tipoAtencionRepo: Repository<TipoAtencion>,
    @InjectRepository(Turno) private turnoRepo: Repository<Turno>,
    @InjectRepository(Triage) private triageRepo: Repository<Triage>,
    @InjectRepository(Cama) private camaRepo: Repository<Cama>,
    @InjectRepository(Hospitalizacion)
    private hospitalizacionRepo: Repository<Hospitalizacion>,
    @InjectRepository(Vacuna)
    private vacunaRepo: Repository<Vacuna>,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    if (process.env.RUN_SEED !== 'true') {
      this.logger.log('Seeder desactivado (RUN_SEED != true)');
      return;
    }

    await this.limpiarDatos();

    const roles = await this.rolRepo.save([
      { nombre: 'admin' },
      { nombre: 'gerente' },
      { nombre: 'secretaria' },
      { nombre: 'medico' },
      { nombre: 'recepcionista' },
      { nombre: 'enfermeria' },
    ]);
    const rolIdByName: Record<string, number> = Object.fromEntries(
      roles.map((r) => [r.nombre, r.id]),
    );

    const generos = await this.generoRepo.save([
      { nombre: 'Masculino' },
      { nombre: 'Femenino' },
    ]);

    const gruposSanguineos = await this.gsRepo.save([
      { nombre: 'A+' },
      { nombre: 'A-' },
      { nombre: 'B+' },
      { nombre: 'B-' },
      { nombre: 'AB+' },
      { nombre: 'AB-' },
      { nombre: 'O+' },
      { nombre: 'O-' },
    ]);

    // 5 especialidades según la tesis de la Clínica "Santa Isabel"
    const especialidades = await this.espRepo.save([
      { nombre: 'Medicina General', codigo: 'MG' },
      { nombre: 'Medicina Interna', codigo: 'MI' },
      { nombre: 'Ginecología', codigo: 'GIN' },
      { nombre: 'Pediatría', codigo: 'PED' },
      { nombre: 'Cirugía', codigo: 'CIR' },
    ]);

    const medicamentos = await this.medRepo.save([
      {
        nombre: 'Paracetamol 500mg',
        presentacion: 'Tableta',
        concentracion: '500mg',
      },
      {
        nombre: 'Ibuprofeno 400mg',
        presentacion: 'Tableta',
        concentracion: '400mg',
      },
      {
        nombre: 'Amoxicilina 500mg',
        presentacion: 'Cápsula',
        concentracion: '500mg',
      },
      {
        nombre: 'Omeprazol 20mg',
        presentacion: 'Cápsula',
        concentracion: '20mg',
      },
      {
        nombre: 'Metformina 850mg',
        presentacion: 'Tableta',
        concentracion: '850mg',
      },
      {
        nombre: 'Losartán 50mg',
        presentacion: 'Tableta',
        concentracion: '50mg',
      },
      {
        nombre: 'Salbutamol 100mcg',
        presentacion: 'Inhalador',
        concentracion: '100mcg',
      },
      {
        nombre: 'Diclofenaco 75mg',
        presentacion: 'Ampolla',
        concentracion: '75mg',
      },
    ]);

    await this.tipoAtencionRepo.save([
      {
        nombre: 'Consulta Médica',
        monto: 200,
        activo: true,
        duracionMinutos: 30,
      },
      {
        nombre: 'Examen / Laboratorio',
        monto: 350,
        activo: true,
        duracionMinutos: 20,
      },
      { nombre: 'Vacuna', monto: 150, activo: true, duracionMinutos: 15 },
      { nombre: 'Emergencia', monto: 0, activo: true, duracionMinutos: 30 },
      {
        nombre: 'Terapia Física',
        monto: 180,
        activo: true,
        duracionMinutos: 45,
      },
      // Servicios base documentados
      {
        nombre: 'Control Prenatal',
        monto: 200,
        activo: true,
        duracionMinutos: 20,
      },
      { nombre: 'Papanicolaou', monto: 250, activo: true, duracionMinutos: 20 },
      {
        nombre: 'Colposcopia / Biopsia',
        monto: 400,
        activo: true,
        duracionMinutos: 40,
      },
      {
        nombre: 'Ecografía Obstétrica / Transvaginal',
        monto: 300,
        activo: true,
        duracionMinutos: 30,
      },
      {
        nombre: 'Control de Niño Sano',
        monto: 150,
        activo: true,
        duracionMinutos: 20,
      },
      { nombre: 'Inyectables', monto: 80, activo: true, duracionMinutos: 15 },
      { nombre: 'Sueros', monto: 120, activo: true, duracionMinutos: 45 },
    ]);

    const cie10s = await this.cie10Repo.save([
      {
        codigo: 'J06.9',
        descripcion: 'Infección aguda de las vías respiratorias superiores',
      },
      { codigo: 'K29.7', descripcion: 'Gastritis, no especificada' },
      { codigo: 'M54.5', descripcion: 'Lumbalgia' },
      { codigo: 'I10', descripcion: 'Hipertensión esencial' },
      { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' },
      { codigo: 'J45.9', descripcion: 'Asma, no especificada' },
      { codigo: 'F32.9', descripcion: 'Episodio depresivo mayor' },
      { codigo: 'L30.9', descripcion: 'Dermatitis, no especificada' },
      { codigo: 'N39.0', descripcion: 'Infección de las vías urinarias' },
      { codigo: 'R50.9', descripcion: 'Fiebre, no especificada' },
    ]);

    const estadosCita = await this.estadoCitaRepo.save([
      { nombre: 'pendiente' },
      { nombre: 'confirmada' },
      { nombre: 'en_curso' },
      { nombre: 'completada' },
      { nombre: 'cancelada' },
      { nombre: 'no_asistio' },
    ]);

    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      crypto.randomBytes(4).toString('hex').toUpperCase() +
        crypto.randomBytes(4).toString('hex').toLowerCase() +
        Math.floor(1000 + Math.random() * 9000) +
        '!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn(
        `Admin user created. Check ADMIN_PASSWORD env var or use the configured password.`,
      );
    }
    await this.usuarioRepo.save({
      nombre: 'Administrador',
      apellido: 'Sistema',
      ci: '0000000000',
      email: 'admin@clinica.com',
      password: hashedPassword,
      rolId: rolIdByName['admin'],
    });

    let demoMedicoUserId: number | null = null;
    let demoEnfermeriaUserId: number | null = null;
    const demoPass = await bcrypt.hash('Demo2026!', 12);
    const demoUsers = await this.usuarioRepo.save([
      {
        nombre: 'Gerente',
        apellido: 'Demo',
        ci: '1000000001',
        email: 'gerente@clinica.com',
        password: demoPass,
        rolId: rolIdByName['gerente'],
      },
      {
        nombre: 'Secretaria',
        apellido: 'Demo',
        ci: '1000000002',
        email: 'secretaria@clinica.com',
        password: demoPass,
        rolId: rolIdByName['secretaria'],
      },
      {
        nombre: 'Recepcionista',
        apellido: 'Demo',
        ci: '1111111111',
        email: 'recepcion@clinica.com',
        password: demoPass,
        rolId: rolIdByName['recepcionista'],
      },
      {
        nombre: 'Medico',
        apellido: 'Demo',
        ci: '2222222222',
        email: 'medico@clinica.com',
        password: demoPass,
        rolId: rolIdByName['medico'],
      },
      {
        nombre: 'Enfermeria',
        apellido: 'Demo',
        ci: '3333333333',
        email: 'enfermeria@clinica.com',
        password: demoPass,
        rolId: rolIdByName['enfermeria'],
      },
    ]);
    demoMedicoUserId = demoUsers[3].id ?? null; // usuario 'medico@clinica.com'
    demoEnfermeriaUserId = demoUsers[4].id ?? null; // usuario 'enfermeria@clinica.com'
    this.logger.warn(`========================================`);
    this.logger.warn(`DEMO USERS — contraseña: Demo2026!`);
    this.logger.warn(`  admin@clinica.com / ${adminPassword}`);
    this.logger.warn(`  gerente@clinica.com / Demo2026!`);
    this.logger.warn(`  secretaria@clinica.com / Demo2026!`);
    this.logger.warn(`  recepcion@clinica.com / Demo2026!`);
    this.logger.warn(`  medico@clinica.com / Demo2026!`);
    this.logger.warn(`  enfermeria@clinica.com / Demo2026!`);
    this.logger.warn(`========================================`);

    const doctores = await this.medicoRepo.save([
      {
        nombre: 'Carlos',
        apellido: 'García',
        especialidadId: especialidades[0].id,
        telefono: '71234567',
        email: 'carlos.garcia@hospital.com',
        codigoMedico: 'DOC-001',
      },
      {
        nombre: 'María',
        apellido: 'Martínez',
        especialidadId: especialidades[1].id,
        telefono: '71234568',
        email: 'maria.martinez@hospital.com',
        codigoMedico: 'DOC-002',
      },
      {
        nombre: 'José',
        apellido: 'Rodríguez',
        especialidadId: especialidades[2].id,
        telefono: '71234569',
        email: 'jose.rodriguez@hospital.com',
        codigoMedico: 'DOC-003',
      },
      {
        nombre: 'María',
        apellido: 'López',
        especialidadId: especialidades[3].id,
        telefono: '71234570',
        email: 'ana.lopez@hospital.com',
        codigoMedico: 'DOC-004',
      },
      {
        nombre: 'Pedro',
        apellido: 'Fernández',
        especialidadId: especialidades[4].id,
        telefono: '71234571',
        email: 'pedro.fernandez@hospital.com',
        codigoMedico: 'DOC-005',
      },
    ]);

    // Vincular el usuario demo 'medico@clinica.com' a un médico real,
    // para que el OwnershipGuard (confidencialidad) reconozca al médico.
    if (demoMedicoUserId) {
      await this.medicoRepo.update(doctores[0].id, {
        usuarioId: demoMedicoUserId,
      });
    }

    const pacientes = await this.pacienteRepo.save([
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        ci: '12345678',
        fechaNacimiento: new Date('1985-03-15'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '77123456',
        email: 'juan.perez@email.com',
        direccion: 'Calle Bolívar #123, La Paz',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'María',
        apellido: 'Flores',
        ci: '23456789',
        fechaNacimiento: new Date('1990-07-22'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[2].id,
        telefono: '77234567',
        email: 'maria.flores@email.com',
        direccion: 'Av. 6 de Agosto #456, La Paz',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Roberto',
        apellido: 'Quispe',
        ci: '34567890',
        fechaNacimiento: new Date('1978-11-08'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[4].id,
        telefono: '77345678',
        email: 'roberto.quispe@email.com',
        direccion: 'Calle Potosí #789, El Alto',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Elena',
        apellido: 'Mamani',
        ci: '45678901',
        fechaNacimiento: new Date('2000-01-30'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[1].id,
        telefono: '77456789',
        email: 'elena.mamani@email.com',
        direccion: 'Av. Busch #321, Cochabamba',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Luis',
        apellido: 'Gutierrez',
        ci: '56789012',
        fechaNacimiento: new Date('1965-05-12'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[6].id,
        telefono: '77567890',
        email: 'luis.gutierrez@email.com',
        direccion: 'Calle Comercio #654, Santa Cruz',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Carmen',
        apellido: 'Vargas',
        ci: '67890123',
        fechaNacimiento: new Date('1995-09-18'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[3].id,
        telefono: '77678901',
        email: 'carmen.vargas@email.com',
        direccion: 'Av. Arce #987, La Paz',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Miguel',
        apellido: 'Torres',
        ci: '78901234',
        fechaNacimiento: new Date('1982-12-25'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '77789012',
        email: 'miguel.torres@email.com',
        direccion: 'Calle Linares #147, La Paz',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Sofía',
        apellido: 'Ríos',
        ci: '89012345',
        fechaNacimiento: new Date('1998-06-14'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[5].id,
        telefono: '77890123',
        email: 'sofia.rios@email.com',
        direccion: 'Av. Montes #258, La Paz',
        usuarioRegistroId: 1,
      },
    ]);

    const today = new Date();
    const citas = await this.citaRepo.save([
      {
        pacienteId: pacientes[0].id,
        medicoId: doctores[0].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          9,
          0,
        ),
        horaInicio: '09:00',
        horaFin: '09:30',
        estadoId: estadosCita[2].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[1].id,
        medicoId: doctores[1].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          10,
          30,
        ),
        horaInicio: '10:30',
        horaFin: '11:00',
        estadoId: estadosCita[0].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[2].id,
        medicoId: doctores[2].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          11,
          0,
        ),
        horaInicio: '11:00',
        horaFin: '11:30',
        estadoId: estadosCita[2].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[3].id,
        medicoId: doctores[0].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
          8,
          30,
        ),
        horaInicio: '08:30',
        horaFin: '09:00',
        estadoId: estadosCita[1].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[4].id,
        medicoId: doctores[3].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
          15,
          0,
        ),
        horaInicio: '15:00',
        horaFin: '15:30',
        estadoId: estadosCita[0].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[5].id,
        medicoId: doctores[4].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1,
          14,
          0,
        ),
        horaInicio: '14:00',
        horaFin: '14:30',
        estadoId: estadosCita[2].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[6].id,
        medicoId: doctores[0].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
          10,
          0,
        ),
        horaInicio: '10:00',
        horaFin: '10:30',
        estadoId: estadosCita[1].id,
        creadoPorId: 1,
      },
      {
        pacienteId: pacientes[7].id,
        medicoId: doctores[1].id,
        fecha: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 2,
          16,
          0,
        ),
        horaInicio: '16:00',
        horaFin: '16:30',
        estadoId: estadosCita[3].id,
        creadoPorId: 1,
      },
    ]);

    const consultas = await this.consultaRepo.save([
      {
        pacienteId: pacientes[0].id,
        medicoId: doctores[0].id,
        citaId: citas[0].id,
        fecha: citas[0].fecha,
        motivo: 'Control general',
        sintomas: 'Paciente asintomático, control de rutina',
        examenFisico: 'PA: 120/80, FC: 72, T: 36.5°C',
        peso: 75,
        altura: 1.75,
        temperatura: 36.5,
        presionArterialSistolica: 120,
        presionArterialDiastolica: 80,
        frecuenciaCardiaca: 72,
        frecuenciaRespiratoria: 16,
        observaciones:
          'Paciente en buen estado general. Se recomienda continuar con hábitos saludables.',
      },
      {
        pacienteId: pacientes[2].id,
        medicoId: doctores[2].id,
        citaId: citas[2].id,
        fecha: citas[2].fecha,
        motivo: 'Chequeo cardíaco',
        sintomas: 'Dolor torácico leve ocasional',
        examenFisico: 'PA: 140/90, FC: 85, T: 36.8°C',
        peso: 82,
        altura: 1.7,
        temperatura: 36.8,
        presionArterialSistolica: 140,
        presionArterialDiastolica: 90,
        frecuenciaCardiaca: 85,
        frecuenciaRespiratoria: 18,
        observaciones: 'Se solicita ecocardiograma y análisis de sangre.',
      },
      {
        pacienteId: pacientes[5].id,
        medicoId: doctores[4].id,
        citaId: citas[5].id,
        fecha: citas[5].fecha,
        motivo: 'Evaluación neurológica',
        sintomas: 'Mareos frecuentes, visión borrosa ocasional',
        examenFisico: 'Reflejos normales, marcha estable',
        peso: 68,
        altura: 1.65,
        temperatura: 36.6,
        presionArterialSistolica: 130,
        presionArterialDiastolica: 85,
        frecuenciaCardiaca: 78,
        frecuenciaRespiratoria: 17,
        observaciones: 'Se solicita TAC cerebral para descartar alteraciones.',
      },
    ]);

    for (const consulta of consultas) {
      const cie10 = cie10s[Math.floor(Math.random() * cie10s.length)];
      await this.diagnosticoRepo.save({
        consultaId: consulta.id,
        codigo: cie10.codigo,
        descripcion: cie10.descripcion,
        esCronico: Math.random() > 0.7,
        recomendaciones:
          'Seguimiento en 15 días. Reposo relativo. Hidratación abundante.',
      });
    }

    for (const consulta of consultas) {
      const receta = await this.recetaRepo.save({
        consultaId: consulta.id,
        instrucciones:
          'Tomar según indicación médica. No suspender sin consultar.',
        estado: 'activa',
      });
      const meds = [
        medicamentos[Math.floor(Math.random() * medicamentos.length)],
      ];
      if (Math.random() > 0.5)
        meds.push(
          medicamentos[Math.floor(Math.random() * medicamentos.length)],
        );
      for (const med of meds) {
        await this.recetaMedRepo.save({
          recetaId: receta.id,
          medicamentoId: med.id,
          dosis: '1 tableta',
          frecuencia: 'Cada 8 horas',
          duracion: '7 días',
          observaciones: 'Después de las comidas',
        });
      }
    }

    const sucursalCount = await this.sucursalRepo.count();
    if (sucursalCount === 0) {
      // Clínica "Santa Isabel": institución única en Oruro, Bolivia (rnc se usa como NIT)
      await this.sucursalRepo.save([
        {
          nombre: 'Clínica Santa Isabel',
          direccion: 'Calle Ayacucho, Zona Central, Oruro - Bolivia',
          telefono: '(2) 525-1234',
          email: 'contacto@clinicasantaisabel.bo',
          rnc: '1023456789', // NIT
        },
      ]);
      this.logger.log('✅ Sucursales creadas');
    }

    const alergiaCount = await this.alergiaRepo.count();
    if (alergiaCount === 0) {
      await this.alergiaRepo.save([
        {
          nombre: 'Penicilina',
          descripcion: 'Reacción alérgica a antibióticos betalactámicos',
          severidad: 'severa',
        },
        {
          nombre: 'Sulfa',
          descripcion: 'Alergia a sulfonamidas',
          severidad: 'moderada',
        },
        {
          nombre: 'Aspirina',
          descripcion: 'Alergia a AINEs',
          severidad: 'moderada',
        },
        {
          nombre: 'Ibuprofeno',
          descripcion: 'Alergia a antiinflamatorios no esteroideos',
          severidad: 'leve',
        },
        {
          nombre: 'Látex',
          descripcion: 'Alergia al látex',
          severidad: 'moderada',
        },
        {
          nombre: 'Contraste yodado',
          descripcion: 'Alergia a medios de contraste radiológicos',
          severidad: 'severa',
        },
        {
          nombre: 'Polen',
          descripcion: 'Rinitis alérgica estacional',
          severidad: 'leve',
        },
        {
          nombre: 'Penicilina',
          descripcion:
            'Alergia a antibióticos betalactámicos - evitar toda la familia',
          severidad: 'anafilactica',
        },
      ]);
      this.logger.log('✅ Alergias creadas');
    }

    const turnoCount = await this.turnoRepo.count();
    if (turnoCount === 0 && pacientes.length > 0 && doctores.length > 0) {
      const ahora = new Date();
      const hoy = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
      );
      await this.turnoRepo.save([
        {
          numero: 1,
          pacienteId: pacientes[0].id,
          medicoId: doctores[0].id,
          estado: 'completado',
          tipo: 'consulta',
          monto: 200,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 8 * 3600000),
        },
        {
          numero: 2,
          pacienteId: pacientes[1].id,
          medicoId: doctores[1].id,
          estado: 'atencion',
          tipo: 'consulta',
          monto: 200,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 9 * 3600000),
        },
        {
          numero: 3,
          pacienteId: pacientes[2].id,
          medicoId: doctores[2].id,
          estado: 'llamado',
          tipo: 'consulta',
          monto: 350,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 9.5 * 3600000),
        },
        {
          numero: 4,
          pacienteId: pacientes[3].id,
          medicoId: doctores[0].id,
          estado: 'espera',
          tipo: 'consulta',
          monto: 200,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 10 * 3600000),
        },
        {
          numero: 5,
          pacienteId: pacientes[4].id,
          medicoId: doctores[3].id,
          estado: 'espera',
          tipo: 'examen',
          monto: 350,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 10.5 * 3600000),
        },
        {
          numero: 6,
          pacienteId: pacientes[5].id,
          medicoId: doctores[4].id,
          estado: 'espera',
          tipo: 'consulta',
          monto: 200,
          pagado: false,
          createdAt: new Date(hoy.getTime() + 11 * 3600000),
        },
        {
          numero: 7,
          pacienteId: pacientes[6].id,
          medicoId: doctores[1].id,
          estado: 'cancelado',
          tipo: 'vacuna',
          monto: 150,
          pagado: true,
          pagadoEn: hoy,
          createdAt: new Date(hoy.getTime() + 7 * 3600000),
        },
      ]);
      this.logger.log('✅ Turnos de ejemplo creados');
    }

    // ==================================================================
    // SUPER SEMILLA — datos ampliados y realistas (Oruro, Bolivia)
    // ==================================================================
    const now = new Date();
    const dias = (n: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + n, 9, 0);

    // A) Más pacientes bolivianos
    const masPacientes = await this.pacienteRepo.save([
      {
        nombre: 'Wilson',
        apellido: 'Choque Mamani',
        ci: '6010001',
        fechaNacimiento: new Date('1972-04-11'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[6].id,
        telefono: '68811001',
        direccion: 'Calle Bolívar #145, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Rosa',
        apellido: 'Condori Apaza',
        ci: '6010002',
        fechaNacimiento: new Date('1988-09-02'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '68811002',
        direccion: 'Av. 6 de Octubre #980, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Freddy',
        apellido: 'Ticona Huanca',
        ci: '6010003',
        fechaNacimiento: new Date('1995-12-19'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[2].id,
        telefono: '68811003',
        direccion: 'Calle Junín #322, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Gladys',
        apellido: 'Colque Nina',
        ci: '6010004',
        fechaNacimiento: new Date('1965-02-27'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[7].id,
        telefono: '68811004',
        direccion: 'Zona Sud, Av. del Minero, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Marco',
        apellido: 'Quisbert Flores',
        ci: '6010005',
        fechaNacimiento: new Date('2018-06-08'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '68811005',
        direccion: 'Calle La Paz #410, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Daniela',
        apellido: 'Vargas Rocha',
        ci: '6010006',
        fechaNacimiento: new Date('1991-03-15'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[4].id,
        telefono: '68811006',
        direccion: 'Av. España #77, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Hernán',
        apellido: 'Poma Callisaya',
        ci: '6010007',
        fechaNacimiento: new Date('1958-11-30'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[6].id,
        telefono: '68811007',
        direccion: 'Calle Washington #59, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Verónica',
        apellido: 'Aliaga Sánchez',
        ci: '6010008',
        fechaNacimiento: new Date('1983-07-21'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[2].id,
        telefono: '68811008',
        direccion: 'Av. Circunvalación #1200, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Iván',
        apellido: 'Mendoza Cruz',
        ci: '6010009',
        fechaNacimiento: new Date('2001-01-05'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[1].id,
        telefono: '68811009',
        direccion: 'Calle Pagador #834, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Silvia',
        apellido: 'Fernández Loza',
        ci: '6010010',
        fechaNacimiento: new Date('1979-10-10'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '68811010',
        direccion: 'Av. Villarroel #45, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Ramiro',
        apellido: 'Gutiérrez Soto',
        ci: '6010011',
        fechaNacimiento: new Date('1969-05-23'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[5].id,
        telefono: '68811011',
        direccion: 'Calle Ayacucho #210, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Patricia',
        apellido: 'Torrez Villca',
        ci: '6010012',
        fechaNacimiento: new Date('1993-08-14'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[6].id,
        telefono: '68811012',
        direccion: 'Zona Norte, Calle Cochabamba, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Sofía',
        apellido: 'Ramos Quispe',
        ci: '6010013',
        fechaNacimiento: new Date('2020-02-29'),
        generoId: generos[1].id,
        grupoSanguineoId: gruposSanguineos[0].id,
        telefono: '68811013',
        direccion: 'Av. del Ejército #660, Oruro',
        usuarioRegistroId: 1,
      },
      {
        nombre: 'Julio',
        apellido: 'Salinas Mamani',
        ci: '6010014',
        fechaNacimiento: new Date('1950-12-01'),
        generoId: generos[0].id,
        grupoSanguineoId: gruposSanguineos[7].id,
        telefono: '68811014',
        direccion: 'Calle Sucre #128, Oruro',
        usuarioRegistroId: 1,
      },
    ]);
    this.logger.log(`✅ ${masPacientes.length} pacientes adicionales (Oruro)`);

    // B) PACIENTE RECURRENTE — historial longitudinal de Juan Pérez a lo largo de meses
    //    (demuestra la solución al problema central: seguimiento sin duplicar la historia)
    const recurrente = pacientes[0];
    const medicoInterna = doctores[1];
    const consultasRecurrente = await this.consultaRepo.save([
      {
        pacienteId: recurrente.id,
        medicoId: medicoInterna.id,
        fecha: dias(-180),
        motivo: 'Control de hipertensión arterial',
        sintomas: 'Cefalea ocasional, sin otros síntomas',
        examenFisico: 'PA: 150/95, FC: 84, T: 36.6°C',
        peso: 78,
        altura: 1.75,
        temperatura: 36.6,
        presionArterialSistolica: 150,
        presionArterialDiastolica: 95,
        frecuenciaCardiaca: 84,
        frecuenciaRespiratoria: 18,
        observaciones:
          'Inicia tratamiento antihipertensivo. Control en 3 meses.',
      },
      {
        pacienteId: recurrente.id,
        medicoId: medicoInterna.id,
        fecha: dias(-90),
        motivo: 'Reevaluación de hipertensión (consulta repetida)',
        sintomas: 'Refiere mejoría, sin cefalea',
        examenFisico: 'PA: 138/88, FC: 78, T: 36.5°C',
        peso: 77,
        altura: 1.75,
        temperatura: 36.5,
        presionArterialSistolica: 138,
        presionArterialDiastolica: 88,
        frecuenciaCardiaca: 78,
        frecuenciaRespiratoria: 16,
        observaciones:
          'Buena respuesta al tratamiento. Continuar. Control en 3 meses.',
      },
      {
        pacienteId: recurrente.id,
        medicoId: medicoInterna.id,
        fecha: dias(-7),
        motivo: 'Control trimestral de hipertensión (consulta repetida)',
        sintomas: 'Asintomático',
        examenFisico: 'PA: 128/82, FC: 74, T: 36.5°C',
        peso: 76,
        altura: 1.75,
        temperatura: 36.5,
        presionArterialSistolica: 128,
        presionArterialDiastolica: 82,
        frecuenciaCardiaca: 74,
        frecuenciaRespiratoria: 16,
        observaciones:
          'PA controlada. Mantener tratamiento y hábitos saludables.',
      },
    ]);
    for (const c of consultasRecurrente) {
      await this.diagnosticoRepo.save({
        consultaId: c.id,
        codigo: 'I10',
        descripcion: 'Hipertensión esencial',
        esCronico: true,
        recomendaciones:
          'Dieta hiposódica, actividad física, adherencia al tratamiento.',
      });
      const receta = await this.recetaRepo.save({
        consultaId: c.id,
        instrucciones: 'Tomar en ayunas. No suspender.',
        estado: 'activa',
      });
      await this.recetaMedRepo.save({
        recetaId: receta.id,
        medicamentoId: medicamentos[5].id,
        dosis: '1 tableta',
        frecuencia: 'Cada 24 horas',
        duracion: '90 días',
        observaciones: 'Losartán — control de presión',
      });
    }
    this.logger.log(
      '✅ Historial longitudinal del paciente recurrente (Juan Pérez)',
    );

    // C) Camas por servicio
    const B = BedStatus;
    const camas = await this.camaRepo.save([
      {
        codigoCama: 'MI-101',
        servicio: 'Medicina Interna',
        piso: '1',
        habitacion: '101',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'MI-102',
        servicio: 'Medicina Interna',
        piso: '1',
        habitacion: '101',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'MI-103',
        servicio: 'Medicina Interna',
        piso: '1',
        habitacion: '102',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'PED-201',
        servicio: 'Pediatría',
        piso: '2',
        habitacion: '201',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'PED-202',
        servicio: 'Pediatría',
        piso: '2',
        habitacion: '201',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'GIN-301',
        servicio: 'Ginecología',
        piso: '3',
        habitacion: '301',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'GIN-302',
        servicio: 'Ginecología',
        piso: '3',
        habitacion: '302',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'CIR-401',
        servicio: 'Cirugía',
        piso: '1',
        habitacion: '105',
        estado: B.DISPONIBLE,
      },
      {
        codigoCama: 'CIR-402',
        servicio: 'Cirugía',
        piso: '1',
        habitacion: '105',
        estado: B.MANTENIMIENTO,
      },
      {
        codigoCama: 'OBS-01',
        servicio: 'Observación',
        piso: '1',
        habitacion: 'Emergencias',
        estado: B.DISPONIBLE,
      },
    ]);
    this.logger.log(`✅ ${camas.length} camas creadas`);

    // D) Hospitalizaciones (ocupan camas)
    const hosp = await this.hospitalizacionRepo.save([
      {
        pacienteId: masPacientes[0].id,
        medicoTratanteId: doctores[1].id,
        camaId: camas[0].id!,
        fechaIngreso: dias(-2),
        motivoIngreso: 'Descompensación hipertensiva',
        diagnosticoIngreso: 'Crisis hipertensiva (I10)',
        estado: AdmisionEstado.INTERNADO,
        usuarioRegistroId: 1,
      },
      {
        pacienteId: masPacientes[4].id,
        medicoTratanteId: doctores[3].id,
        camaId: camas[3].id!,
        fechaIngreso: dias(-1),
        motivoIngreso: 'Neumonía adquirida en la comunidad',
        diagnosticoIngreso: 'Infección respiratoria (J06.9)',
        estado: AdmisionEstado.INTERNADO,
        usuarioRegistroId: 1,
      },
      {
        pacienteId: masPacientes[7].id,
        medicoTratanteId: doctores[2].id,
        camaId: camas[5].id!,
        fechaIngreso: dias(-3),
        motivoIngreso: 'Control post-operatorio',
        diagnosticoIngreso: 'Postquirúrgico ginecológico',
        estado: AdmisionEstado.EN_OBSERVACION,
        usuarioRegistroId: 1,
      },
    ]);
    // marcar esas camas como ocupadas
    await this.camaRepo.update(camas[0].id!, { estado: B.OCUPADO });
    await this.camaRepo.update(camas[3].id!, { estado: B.OCUPADO });
    await this.camaRepo.update(camas[5].id!, { estado: B.OCUPADO });
    this.logger.log(`✅ ${hosp.length} hospitalizaciones activas`);

    // E) Triajes ESI (varios niveles de severidad) — realizados por enfermería (usuario id 6)
    await this.triageRepo.save([
      {
        pacienteId: masPacientes[6].id,
        realizadoPorId: demoEnfermeriaUserId ?? 1,
        fechaHora: dias(0),
        estado: 'en_espera',
        esiNivel: 2,
        temperatura: 38.9,
        frecuenciaCardiaca: 118,
        presionArterial: '90/60',
        frecuenciaRespiratoria: 24,
        saturacionOxigeno: 91,
        peso: 70,
        talla: 168,
        glucosa: 110,
        motivoConsulta: 'Dolor torácico y dificultad respiratoria',
      },
      {
        pacienteId: masPacientes[2].id,
        realizadoPorId: demoEnfermeriaUserId ?? 1,
        fechaHora: dias(0),
        estado: 'en_espera',
        esiNivel: 3,
        temperatura: 37.8,
        frecuenciaCardiaca: 92,
        presionArterial: '120/80',
        frecuenciaRespiratoria: 18,
        saturacionOxigeno: 97,
        peso: 68,
        talla: 172,
        glucosa: 95,
        motivoConsulta: 'Fiebre y dolor de garganta',
      },
      {
        pacienteId: masPacientes[12].id,
        realizadoPorId: demoEnfermeriaUserId ?? 1,
        fechaHora: dias(0),
        estado: 'en_espera',
        esiNivel: 4,
        temperatura: 37.2,
        frecuenciaCardiaca: 110,
        presionArterial: '100/65',
        frecuenciaRespiratoria: 22,
        saturacionOxigeno: 98,
        peso: 14,
        talla: 90,
        glucosa: 88,
        motivoConsulta: 'Tos y congestión nasal (pediátrico)',
      },
      {
        pacienteId: masPacientes[9].id,
        realizadoPorId: demoEnfermeriaUserId ?? 1,
        fechaHora: dias(0),
        estado: 'en_atencion',
        esiNivel: 3,
        temperatura: 36.8,
        frecuenciaCardiaca: 88,
        presionArterial: '130/85',
        frecuenciaRespiratoria: 17,
        saturacionOxigeno: 98,
        peso: 62,
        talla: 160,
        glucosa: 145,
        motivoConsulta: 'Mareos, antecedente de diabetes',
      },
      {
        pacienteId: masPacientes[3].id,
        realizadoPorId: demoEnfermeriaUserId ?? 1,
        fechaHora: dias(0),
        estado: 'completado',
        esiNivel: 5,
        temperatura: 36.5,
        frecuenciaCardiaca: 76,
        presionArterial: '118/76',
        frecuenciaRespiratoria: 15,
        saturacionOxigeno: 99,
        peso: 65,
        talla: 158,
        glucosa: 92,
        motivoConsulta: 'Curación de herida menor',
      },
    ]);
    this.logger.log('✅ Triajes ESI creados (niveles E2-E5)');

    // F) Alergias asignadas a pacientes → demuestra la Seguridad Farmacológica (RF-11)
    const catalogoAlergias = await this.alergiaRepo.find();
    const findAle = (n: string) =>
      catalogoAlergias.find((a) => a.nombre.toLowerCase() === n.toLowerCase());
    const asignarAlergias = async (pacienteId: number, nombres: string[]) => {
      const p = await this.pacienteRepo.findOne({
        where: { id: pacienteId },
        relations: ['alergias'],
      });
      if (!p) return;
      p.alergias = nombres
        .map((n) => findAle(n))
        .filter((a): a is Alergia => !!a);
      await this.pacienteRepo.save(p);
    };
    await asignarAlergias(pacientes[4].id, ['Ibuprofeno']); // Luis Gutierrez
    await asignarAlergias(pacientes[0].id, ['Penicilina']); // Juan Pérez
    await asignarAlergias(masPacientes[1].id, ['Sulfa', 'Aspirina']); // Rosa Condori
    this.logger.log(
      '✅ Alergias asignadas a pacientes (seguridad farmacológica)',
    );

    // G) Catálogo de Vacunas
    const vacunas = await this.vacunaRepo.save([
      {
        nombre: 'BCG',
        descripcion: 'Vacuna contra tuberculosis',
        dosisRecomendadas: 1,
        edadMinimaMeses: 0,
        esObligatoria: true,
      },
      {
        nombre: 'Hepatitis B',
        descripcion: 'Vacuna contra hepatitis B',
        dosisRecomendadas: 3,
        edadMinimaMeses: 0,
        intervalodias: 30,
        esObligatoria: true,
      },
      {
        nombre: 'Pentavalente',
        descripcion:
          'Difteria, tétanos, tos ferina, Haemophilus influenzae tipo b, Hepatitis B',
        dosisRecomendadas: 3,
        edadMinimaMeses: 2,
        intervalodias: 30,
        esObligatoria: true,
      },
      {
        nombre: 'Sabin (OPV)',
        descripcion: 'Vacuna oral contra polio',
        dosisRecomendadas: 4,
        edadMinimaMeses: 2,
        intervalodias: 30,
        esObligatoria: true,
      },
      {
        nombre: 'SPR',
        descripcion: 'Sarampión, paperas, rubéola',
        dosisRecomendadas: 2,
        edadMinimaMeses: 12,
        esObligatoria: true,
      },
      {
        nombre: 'VPH',
        descripcion: 'Virus del papiloma humano',
        dosisRecomendadas: 2,
        edadMinimaMeses: 120,
        esObligatoria: false,
      },
      {
        nombre: 'Influenza estacional',
        descripcion: 'Vacuna contra influenza',
        dosisRecomendadas: 1,
        edadMinimaMeses: 6,
        esObligatoria: false,
      },
      {
        nombre: 'COVID-19',
        descripcion: 'Vacuna contra COVID-19',
        dosisRecomendadas: 2,
        edadMinimaMeses: 60,
        esObligatoria: false,
      },
    ]);
    this.logger.log(`✅ ${vacunas.length} vacunas en catálogo`);

    this.logger.log('✅ Datos iniciales cargados correctamente');
  }

  private async limpiarDatos() {
    this.logger.log('🧹 Limpiando datos previos...');
    const runner = this.dataSource.createQueryRunner();
    try {
      await runner.connect();
      const tablas = await runner.query(
        'SELECT tablename FROM pg_tables WHERE schemaname = current_schema()',
      );
      const nombres = (tablas as { tablename: string }[]).map(
        (t) => t.tablename,
      );
      if (nombres.length > 0) {
        await runner.query(
          `TRUNCATE TABLE ${nombres
            .map((n) => `"${n}"`)
            .join(', ')} CASCADE`,
        );
      }
    } catch {
      // Primer arranque u otra base: TypeORM synchronize creará las tablas.
      this.logger.warn('No se pudo truncar (primer arranque?)');
    } finally {
      await runner.release();
    }
  }
}
