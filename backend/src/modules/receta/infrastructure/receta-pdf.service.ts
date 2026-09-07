import { Injectable, NotFoundException } from '@nestjs/common';
import { RecetaService } from '../application/receta.service';
import PDFDocument from 'pdfkit';
import { CLINIC_CONFIG } from '../../../common/branding/clinic.config';

@Injectable()
export class RecetaPdfService {
  constructor(private readonly recetaService: RecetaService) {}

  async generateRecetaPdf(id: number): Promise<Buffer> {
    const receta = await this.recetaService.findOne(id);
    if (!receta) throw new NotFoundException(`Receta ${id} no encontrada`);

    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    const promise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    this.drawHeader(doc);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000');
    doc.text('R/p.', 36, 165);
    doc.moveDown(1);

    if (receta.items && receta.items.length > 0) {
      for (const item of receta.items) {
        const parts = [
          item.medicamentoNombre || `ID: ${item.medicamentoId}`,
          item.dosis || '',
          item.frecuencia ? `c/${item.frecuencia}` : '',
          item.duracion ? `por ${item.duracion}` : '',
          item.cantidad && item.cantidad > 1 ? `(${item.cantidad})` : '',
        ].filter(Boolean);
        let linea = parts.join(', ');
        if (item.observaciones) linea += ` — ${item.observaciones}`;

        doc.fontSize(10).font('Helvetica').fillColor('#000');
        doc.text(linea, { indent: 0 });
        doc.moveDown(0.3);
      }
    } else {
      doc.fontSize(10).font('Helvetica').fillColor('#999');
      doc.text('Sin medicamentos prescritos');
    }

    if (receta.instrucciones) {
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('#333');
      doc.text(receta.instrucciones);
    }

    this.drawFooter(doc);
    doc.end();
    return promise;
  }

  private drawHeader(doc: typeof PDFDocument.prototype): void {
    const margin = 36;

    // Logo placeholder (small square)
    doc
      .rect(margin + 8, 36, 28, 28)
      .lineWidth(1)
      .strokeColor('#ccc')
      .stroke();

    doc.fontSize(15).font('Helvetica-Bold').fillColor('#000');
    doc.text('CENTRO MEDICO "SANTA ISABEL"', margin + 42, 38);

    doc.fontSize(9).font('Helvetica').fillColor('#000');
    const rightX = 522 - margin;
    doc.text('Atención en las siguientes especialidades:', rightX, 72, {
      align: 'right',
    });
    doc.text(
      'Ginecología obstetricia- Medicina Interna - Cirugía',
      rightX,
      86,
      { align: 'right' },
    );
    doc.text('Pediatría- Medicina General', rightX, 100, { align: 'right' });
    doc.text('Ecografía Abdominal transversal y obstétrica', rightX, 114, {
      align: 'right',
    });
    doc.text('Sueros y curaciones', rightX, 128, { align: 'right' });

    doc.moveDown(7);
  }

  private drawFooter(doc: typeof PDFDocument.prototype): void {
    const margin = 36;
    const bottomY = 745;

    doc.fontSize(9).font('Helvetica').fillColor('#000');
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Oruro, ${fecha}`, margin, bottomY);

    doc.text('Dirección: Bolivar esq. Tarapacá', margin + 6, bottomY + 18);
    doc.fontSize(9).font('Helvetica').fillColor('#000');
    doc.text('68283500', margin + 12, bottomY + 34);
    doc.text('61813407', margin + 44, bottomY + 34);
  }
}
