import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CLINIC_CONFIG } from '../../../common/branding/clinic.config';

@Injectable()
export class ImpresionService {
  private readonly logger = new Logger(ImpresionService.name);
  private readonly hospitalName = CLINIC_CONFIG.name;
  private readonly hospitalSlogan = CLINIC_CONFIG.slogan;
  private readonly hospitalAddress = CLINIC_CONFIG.address;
  private readonly hospitalPhone = CLINIC_CONFIG.phone;
  private readonly hospitalEmail = CLINIC_CONFIG.email;
  private readonly primaryColor = CLINIC_CONFIG.primaryColor;
  private readonly borderColor = CLINIC_CONFIG.borderColor;
  private readonly accentColor = CLINIC_CONFIG.accentColor;

  generateReceta(data: any): Promise<Buffer> {
    return this.generatePdf(
      'RECETA MEDICA',
      (doc, addField, addTable, addSignature) => {
        addField(
          'Paciente:',
          `${data.paciente?.nombre || ''} ${data.paciente?.apellido || ''}`,
        );
        if (data.paciente?.identificacion)
          addField('Cedula:', data.paciente.identificacion);
        addField(
          'Medico:',
          `Dr./Dra. ${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
        );
        addField('Codigo:', data.codigoMedico || '-');
        doc.moveDown(0.5);

        if (data.observaciones) {
          doc.font('Helvetica-Bold').fontSize(10).text('Indicaciones:');
          doc.font('Helvetica').fontSize(9).text(data.observaciones);
          doc.moveDown(0.5);
        }

        const rows = (data.medicamentos || []).map((m: any) => [
          m.medicamento || m.nombre || '-',
          m.dosis || '-',
          m.frecuencia || '-',
          m.duracion || '-',
          m.observaciones || '',
        ]);
        addTable(
          ['Medicamento', 'Dosis', 'Frecuencia', 'Duracion', 'Obs.'],
          rows,
        );
        addSignature(
          'Medico Tratante',
          `${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
          data.codigoMedico || '',
        );
      },
    );
  }

  generateCertificado(data: any): Promise<Buffer> {
    return this.generatePdf(
      'CERTIFICADO MEDICO',
      (doc, addField, addTable, addSignature) => {
        addField(
          'Paciente:',
          `${data.paciente?.nombre || ''} ${data.paciente?.apellido || ''}`,
        );
        addField('Cedula:', data.identificacion || 'N/A');
        addField(
          'Medico:',
          `Dr./Dra. ${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
        );
        addField('Codigo:', data.codigoMedico || '-');
        doc.moveDown(1);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(data.contenido || '');
        doc.moveDown(0.5);
        addSignature(
          'Medico Tratante',
          `${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
          data.codigoMedico || '',
        );
      },
    );
  }

  generateEpicrisis(data: any): Promise<Buffer> {
    return this.generatePdf(
      'EPICRISIS / RESUMEN DE ALTA',
      (doc, addField, addTable, addSignature) => {
        addField(
          'Paciente:',
          `${data.paciente?.nombre || ''} ${data.paciente?.apellido || ''}`,
        );
        addField('Cedula:', data.identificacion || 'N/A');
        addField(
          'Medico:',
          `Dr./Dra. ${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
        );
        addField('Codigo:', data.codigoMedico || '-');
        addField('Ingreso:', data.fechaIngreso || '-');
        addField('Alta:', data.fechaAlta || '-');
        doc.moveDown(0.5);
        addField('Diagnostico Ingreso:', data.diagnosticoIngreso || '-');
        addField('Diagnostico Egreso:', data.diagnosticoEgreso || '-');
        doc.moveDown(0.5);
        if (data.resumen) {
          doc.font('Helvetica-Bold').fontSize(10).text('Resumen:');
          doc.font('Helvetica').fontSize(9).text(data.resumen);
          doc.moveDown(0.5);
        }
        if (data.recomendaciones) {
          doc.font('Helvetica-Bold').fontSize(10).text('Recomendaciones:');
          doc.font('Helvetica').fontSize(9).text(data.recomendaciones);
        }
        addSignature(
          'Medico Tratante',
          `${data.medico?.nombre || ''} ${data.medico?.apellido || ''}`,
          data.codigoMedico || '',
        );
      },
    );
  }

  generateHistoriaClinica(data: any): Promise<Buffer> {
    return this.generatePdf(
      'HISTORIA CLINICA',
      async (doc, addField, addTable, addSignature) => {
        addField(
          'Paciente:',
          `${data.paciente?.nombre || ''} ${data.paciente?.apellido || ''}`,
        );
        addField('Cedula:', data.identificacion || 'N/A');
        if (data.fechaNacimiento) addField('Fecha Nac.:', data.fechaNacimiento);
        if (data.genero) addField('Genero:', data.genero);
        if (data.grupoSanguineo) addField('Grupo Sang.:', data.grupoSanguineo);
        doc.moveDown(0.5);

        if (data.antecedentes?.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).text('Antecedentes:');
          for (const a of data.antecedentes) {
            doc
              .font('Helvetica')
              .fontSize(9)
              .text(`  - ${a.descripcion || a}`);
          }
          doc.moveDown(0.5);
        }

        if (data.consultas?.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).text('Consultas:');
          doc.moveDown(0.3);
          const rows = data.consultas.map((c: any) => [
            c.fecha ? new Date(c.fecha).toLocaleDateString() : '-',
            c.motivo || '-',
            c.diagnostico || '',
            c.medico || '',
          ]);
          addTable(['Fecha', 'Motivo', 'Diagnostico', 'Medico'], rows);
        }
      },
    );
  }

  private generatePdf(
    title: string,
    contentFn: (
      doc: typeof PDFDocument.prototype,
      addField: (label: string, value: string) => void,
      addTable: (headers: string[], rows: string[][]) => void,
      addSignature: (role: string, name: string, code: string) => void,
    ) => void | Promise<void>,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    const promise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    this.drawHeader(doc, title);

    const addField = (label: string, value: string) => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#4a5568');
      doc.text(label, 50, doc.y, { continued: true, width: 120 });
      doc.font('Helvetica').fillColor('#1a202c');
      doc.text(`  ${value || 'N/A'}`, { width: 350 });
    };

    const pageWidth = 495;
    const marginLeft = 50;
    const addTable = (headers: string[], rows: string[][]) => {
      const colWidths = headers.map(() =>
        Math.floor(pageWidth / headers.length),
      );
      const rowHeight = 20;
      let currentY = doc.y + 10;

      function drawRow(cells: string[], y: number, isHeader: boolean) {
        if (isHeader) {
          doc
            .rect(marginLeft, y, pageWidth, rowHeight)
            .fillColor('#2b6cb0')
            .fill();
        } else if (y % (rowHeight * 2) === 0) {
          doc
            .rect(marginLeft, y, pageWidth, rowHeight)
            .fillColor('#f7fafc')
            .fill();
        }
        let x = marginLeft;
        cells.forEach((cell, i) => {
          const w = colWidths[i] || 100;
          doc
            .fontSize(8)
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(isHeader ? '#ffffff' : '#1a202c');
          doc.text(cell, x + 4, y + 4, {
            width: w - 8,
            align: i === 0 ? 'left' : 'center',
          });
          doc
            .rect(x, y, w, rowHeight)
            .lineWidth(0.5)
            .strokeColor(this.borderColor)
            .stroke();
          x += w;
        });
      }

      drawRow(headers, currentY, true);
      currentY += rowHeight;
      for (const row of rows) {
        if (currentY + rowHeight > 750) {
          doc.addPage();
          this.drawHeader(doc, '(continuacion)');
          currentY = 160;
          drawRow(headers, currentY, true);
          currentY += rowHeight;
        }
        drawRow(row, currentY, false);
        currentY += rowHeight;
      }
      doc.y = currentY + 10;
    };

    const addSignature = (role: string, name: string, code: string) => {
      const y = Math.min(doc.y + 30, 720);
      doc.rect(marginLeft, y, pageWidth, 1).fillColor(this.borderColor).fill();
      doc.moveDown(2);
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text('Observaciones:', marginLeft, doc.y);
      doc
        .rect(marginLeft, doc.y + 2, pageWidth, 40)
        .lineWidth(0.5)
        .strokeColor(this.borderColor)
        .stroke();
      const signY = Math.min(doc.y + 60, 700);
      doc
        .rect(marginLeft + 120, signY, 200, 1)
        .fillColor('#4a5568')
        .fill();
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#1a202c')
        .text(`Dr./Dra. ${name}`, marginLeft + 120, signY + 5, {
          align: 'center',
        });
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text(role, marginLeft + 120, signY + 18, { align: 'center' });
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#4a5568')
        .text(`Codigo: ${code}`, marginLeft + 120, signY + 30, {
          align: 'center',
        });
    };

    const result = contentFn(doc, addField, addTable, addSignature);
    if (result instanceof Promise) {
      result
        .then(() => {
          this.drawFooter(doc);
          doc.end();
        })
        .catch((err) => {
          this.logger.error(`PDF generation error: ${err.message}`);
          doc.end();
        });
    } else {
      this.drawFooter(doc);
      doc.end();
    }

    return promise;
  }

  private drawHeader(doc: typeof PDFDocument.prototype, title: string): void {
    const pageWidth = 495;
    const margin = 50;
    doc.rect(margin, 20, pageWidth, 90).fillColor('#f7fafc').fill();
    doc
      .rect(margin, 20, pageWidth, 90)
      .lineWidth(2)
      .strokeColor(this.primaryColor)
      .stroke();
    doc.rect(margin, 20, 6, 90).fillColor(this.accentColor).fill();
    doc.fontSize(22).font('Helvetica-Bold').fillColor(this.primaryColor);
    doc.text(this.hospitalName, margin + 20, 32);
    doc.fontSize(9).font('Helvetica').fillColor('#4a5568');
    doc.text(this.hospitalSlogan, margin + 20, 58);
    doc.text(
      `${this.hospitalAddress} | ${this.hospitalPhone}`,
      margin + 20,
      72,
    );
    doc.text(this.hospitalEmail, margin + 20, 86);
    doc.moveDown(6);
    doc.rect(margin, 115, pageWidth, 1).fillColor('#2b6cb0').fill();
    doc.moveDown(1.5);
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.primaryColor)
      .text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.rect(margin, doc.y, pageWidth, 0.5).fillColor(this.borderColor).fill();
    doc.moveDown(1);
  }

  private drawFooter(doc: typeof PDFDocument.prototype): void {
    const pageWidth = 495;
    const margin = 50;
    const bottomY = 770;
    doc
      .rect(margin, bottomY - 5, pageWidth, 1)
      .fillColor(this.borderColor)
      .fill();
    doc.fontSize(7.5).font('Helvetica').fillColor('#a0aec0');
    doc.text(
      `${this.hospitalName} - Documento generado electronicamente - ${new Date().toLocaleString('es-DO')}`,
      margin,
      bottomY + 2,
      { align: 'center' },
    );

    if (doc.bufferedPageRange) {
      const range = doc.bufferedPageRange();
      if (range.count > 1) {
        for (let i = 0; i < range.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).font('Helvetica').fillColor('#718096');
          doc.text(`Pagina ${i + 1} de ${range.count}`, margin, bottomY + 12, {
            align: 'right',
          });
        }
        doc.switchToPage(range.count - 1);
      }
    }
  }
}
