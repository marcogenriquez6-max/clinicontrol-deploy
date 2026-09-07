import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReportsRepositoryPort } from '../domain/ports/reports-repository.port';
import PDFDocument from 'pdfkit';
import {
  TriajeESIReport,
  TriajeESIData,
} from '../domain/ports/reports-repository.port';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly reportsRepo: ReportsRepositoryPort) {}

  async generateHistoriaClinicaPdf(pacienteId: number): Promise<Buffer> {
    const paciente =
      await this.reportsRepo.findPacienteConHistorial(pacienteId);
    if (!paciente)
      throw new NotFoundException(`Paciente ${pacienteId} no encontrado`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', (b: Buffer) => buffers.push(b));
    const promise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('HISTORIA CLINICA', { align: 'center' });
    doc
      .fontSize(9)
      .font('Helvetica')
      .text('CliniControl - Sistema de Gestion Hospitalaria', {
        align: 'center',
      });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#aaaaaa');
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica-Bold');
    doc
      .text(`Paciente: `, { continued: true })
      .font('Helvetica')
      .text(`${paciente.nombre} ${paciente.apellido}`);
    doc
      .text(`CI: `, { continued: true })
      .font('Helvetica')
      .text(paciente.ci || '-');
    if (paciente.fechaNacimiento) {
      doc
        .text(`Fecha Nac.: `, { continued: true })
        .font('Helvetica')
        .text(new Date(paciente.fechaNacimiento).toLocaleDateString('es-BO'));
    }
    doc
      .text(`Genero: `, { continued: true })
      .font('Helvetica')
      .text(paciente.genero?.nombre || '-');
    if (paciente.grupoSanguineo) {
      doc
        .text(`Grupo Sanguineo: `, { continued: true })
        .font('Helvetica')
        .text(paciente.grupoSanguineo.nombre);
    }
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#aaaaaa');
    doc.moveDown(1);

    const consultas = paciente.consultas || [];
    if (consultas.length === 0) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .text('No se encontraron consultas registradas.', { align: 'center' });
    } else {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Consultas (${consultas.length})`, { underline: true });
      doc.moveDown(1);
      for (const consulta of consultas) {
        if (doc.y > 650) doc.addPage();
        const fecha = consulta.fecha
          ? new Date(consulta.fecha).toLocaleDateString('es-BO')
          : '-';
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a56db');
        doc.text(`Consulta: ${fecha} - Dr. ${consulta.medicoNombre || ''}`);
        doc.fillColor('#000000').font('Helvetica');
        if (consulta.motivo)
          doc
            .font('Helvetica-Bold')
            .text('Motivo: ', { continued: true })
            .font('Helvetica')
            .text(consulta.motivo);
        if (consulta.sintomas)
          doc
            .font('Helvetica-Bold')
            .text('Sintomas: ', { continued: true })
            .font('Helvetica')
            .text(consulta.sintomas);
        if (consulta.observaciones)
          doc
            .font('Helvetica-Bold')
            .text('Observaciones: ', { continued: true })
            .font('Helvetica')
            .text(consulta.observaciones);

        const diagnosticos = consulta.diagnosticos || [];
        if (diagnosticos.length > 0) {
          doc.font('Helvetica-Bold').text('Diagnosticos CIE-10:');
          for (const dx of diagnosticos) {
            doc
              .font('Helvetica')
              .text(
                `  \u2022 ${dx.cie10?.codigo || ''} - ${dx.cie10?.descripcion || ''}`,
                { indent: 10 },
              );
          }
        }
        const recetas = consulta.recetas || [];
        if (recetas.length > 0) {
          doc.font('Helvetica-Bold').text('Recetas:');
          for (const receta of recetas) {
            for (const item of receta.items || []) {
              doc
                .font('Helvetica')
                .text(
                  `  \u2022 ${item.medicamento?.nombre || ''} | ${item.dosis || ''} | ${item.frecuencia || ''}`,
                  { indent: 10 },
                );
            }
          }
        }
        doc.moveDown(0.5);
        doc.moveTo(60, doc.y).lineTo(540, doc.y).stroke('#e5e7eb');
        doc.moveDown(0.5);
      }
    }

    doc.end();
    return promise;
  }

  async generateReporteCitas(
    fechaInicio?: string,
    fechaFin?: string,
    medicoId?: number,
    estadoId?: number,
  ): Promise<Buffer> {
    const citas = await this.reportsRepo.findCitas(
      fechaInicio,
      fechaFin,
      medicoId,
      estadoId,
    );

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', (b: Buffer) => buffers.push(b));
    const promise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('REPORTE DE CITAS', { align: 'center' });
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`Generado: ${new Date().toLocaleString('es-BO')}`, {
        align: 'center',
      });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#aaaaaa');
    doc.moveDown(1);

    const headers = [
      '#',
      'Paciente',
      'Medico',
      'Especialidad',
      'Fecha',
      'Estado',
    ];
    const colWidths = [25, 120, 100, 90, 100, 60];
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 50;
    headers.forEach((h, i) => {
      doc.text(h, xPos, doc.y, { width: colWidths[i] });
      xPos += colWidths[i];
    });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(8);
    for (let i = 0; i < citas.length; i++) {
      const c = citas[i];
      if (doc.y > 720) doc.addPage();
      xPos = 50;
      const row = [
        String(i + 1),
        `${c.paciente?.nombre || ''} ${c.paciente?.apellido || ''}`,
        `${c.medico?.nombre || ''} ${c.medico?.apellido || ''}`,
        c.medico?.especialidad?.nombre || '',
        c.fecha ? new Date(c.fecha).toLocaleDateString('es-BO') : '',
        c.estado?.nombre || '',
      ];
      row.forEach((val, j) => {
        doc.text(val, xPos, doc.y, { width: colWidths[j] });
        xPos += colWidths[j];
      });
      doc.moveDown(0.6);
    }

    doc.end();
    return promise;
  }

  async generateEstadisticas(): Promise<Record<string, unknown>> {
    const stats = await this.reportsRepo.getEstadisticas();
    return { ...stats, timestamp: new Date().toISOString() };
  }

  async getDashboard(): Promise<Record<string, unknown>> {
    const data = await this.reportsRepo.getDashboard();
    return { ...data, timestamp: new Date().toISOString() };
  }

  async getTriajeESI(
    fechaInicio?: string,
    fechaFin?: string,
    realizadoPorId?: number,
  ): Promise<TriajeESIReport> {
    return this.reportsRepo.getTriajeESI(fechaInicio, fechaFin, realizadoPorId);
  }

  async generateExcelPacientes(): Promise<Buffer> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pacientes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'CI', key: 'ci', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Genero', key: 'genero', width: 12 },
      { header: 'Telefono', key: 'telefono', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Grupo Sang.', key: 'grupo', width: 12 },
      { header: 'Activo', key: 'activo', width: 8 },
      { header: 'Creado', key: 'createdAt', width: 20 },
    ];

    const pacientes = await this.reportsRepo.findAllPacientes();
    pacientes.forEach((p) => {
      sheet.addRow({
        id: p.id,
        ci: p.ci,
        nombre: p.nombre,
        apellido: p.apellido,
        genero: p.genero?.nombre || '',
        telefono: p.telefono || '',
        email: p.email || '',
        grupo: p.grupoSanguineo?.nombre || '',
        activo: p.activo ? 'Si' : 'No',
        createdAt: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString('es-BO')
          : '',
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1a56db' },
    };

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
