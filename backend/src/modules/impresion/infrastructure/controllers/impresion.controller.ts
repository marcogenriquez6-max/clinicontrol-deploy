import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ImpresionService } from '../../application/impresion.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  PrintRecetaDto,
  PrintCertificadoDto,
  PrintEpicrisisDto,
  PrintHistoriaClinicaDto,
} from '../dto/print.dto';

@ApiTags('Impresion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('impresion')
export class ImpresionController {
  constructor(private readonly impresionService: ImpresionService) {}

  @Post('receta')
  @Roles('medico')
  @ApiOperation({ summary: 'Generar PDF de receta medica' })
  async printReceta(@Body(ValidationPipe) dto: PrintRecetaDto) {
    const pdf = await this.impresionService.generateReceta(dto);
    return { data: pdf.toString('base64'), mimeType: 'application/pdf' };
  }

  @Post('certificado')
  @Roles('medico')
  @ApiOperation({ summary: 'Generar PDF de certificado medico' })
  async printCertificado(@Body(ValidationPipe) dto: PrintCertificadoDto) {
    const pdf = await this.impresionService.generateCertificado(dto);
    return { data: pdf.toString('base64'), mimeType: 'application/pdf' };
  }

  @Post('epicrisis')
  @Roles('medico')
  @ApiOperation({ summary: 'Generar PDF de epicrisis/resumen de alta' })
  async printEpicrisis(@Body(ValidationPipe) dto: PrintEpicrisisDto) {
    const pdf = await this.impresionService.generateEpicrisis(dto);
    return { data: pdf.toString('base64'), mimeType: 'application/pdf' };
  }

  @Post('historia-clinica')
  @Roles('medico')
  @ApiOperation({ summary: 'Generar PDF de historia clinica' })
  async printHistoriaClinica(
    @Body(ValidationPipe) dto: PrintHistoriaClinicaDto,
  ) {
    const pdf = await this.impresionService.generateHistoriaClinica(dto);
    return { data: pdf.toString('base64'), mimeType: 'application/pdf' };
  }
}
