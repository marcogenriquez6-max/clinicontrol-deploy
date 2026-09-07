import { User, Plus, Trash2, Syringe, Calendar } from 'lucide-react';
import { Button, Card } from '../ui';
import DataTable from '../ui/DataTable';
import { estadoBadge, estadoIcon } from './constants';
import type { Paciente, PacienteVacuna, CalendarioVacuna, Vacuna } from '../../types';

interface PacienteSectionProps {
  pacientes: Paciente[];
  patientVacunas: PacienteVacuna[];
  calendario: CalendarioVacuna[];
  vacunas: Vacuna[];
  selectedPatient: Paciente | null;
  searchPatient: string;
  viewType: 'record' | 'calendar';
  onSelectPatient: (p: Paciente) => void;
  onSearchChange: (s: string) => void;
  onViewTypeChange: (t: 'record' | 'calendar') => void;
  onAplicar: (vacuna?: Vacuna) => void;
  onDeleteAplicacion: (id: number) => void;
}

export default function PacienteSection({
  pacientes,
  patientVacunas,
  calendario,
  selectedPatient,
  searchPatient,
  viewType,
  onSelectPatient,
  onSearchChange,
  onViewTypeChange,
  onAplicar,
  onDeleteAplicacion,
}: PacienteSectionProps) {
  const filteredPacientes = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.ci}`.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <Card title="Vacunas del Paciente" subtitle="Gestionar vacunación por paciente" accent="accent">
      <div className="mb-4 relative">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre o CI..."
            value={searchPatient}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] transition-all duration-200 w-full max-w-md pl-10"
          />
        </div>
        {searchPatient && (
          <div className="absolute z-10 mt-1 w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg shadow-[var(--shadow-lg)] max-h-60 overflow-y-auto">
            {filteredPacientes.map((p) => (
              <button
                key={p.id}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 transition-colors"
                onClick={() => onSelectPatient(p)}
              >
                <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="font-medium text-[var(--text-primary)]">{p.nombre} {p.apellido}</span>
                <span className="text-[var(--text-tertiary)]">- {p.ci}</span>
              </button>
            ))}
            {filteredPacientes.length === 0 && (
              <p className="px-4 py-2 text-sm text-[var(--text-tertiary)]">No se encontraron pacientes</p>
            )}
          </div>
        )}
      </div>

      {selectedPatient && (
        <>
          <div className="flex items-center justify-between mb-4 p-4 bg-[var(--primary-50)] rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[var(--primary-600)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{selectedPatient.nombre} {selectedPatient.apellido}</p>
                <p className="text-sm text-[var(--text-tertiary)]">{selectedPatient.ci}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewType === 'record' ? 'primary' : 'outline'}
                onClick={() => onViewTypeChange('record')}
              >
                Historial
              </Button>
              <Button
                size="sm"
                variant={viewType === 'calendar' ? 'primary' : 'outline'}
                onClick={() => onViewTypeChange('calendar')}
              >
                <Calendar className="w-4 h-4 mr-1" />Calendario
              </Button>
            </div>
          </div>

          {viewType === 'record' && (
            <>
              <div className="flex justify-end mb-4">
                <Button variant="premium" size="sm" onClick={() => onAplicar()}><Plus className="w-4 h-4 mr-1" />Aplicar Vacuna</Button>
              </div>
              <DataTable
                columns={[
                  { key: 'vacuna', header: 'Vacuna', render: (pv) => (
                    <span className="font-medium text-[var(--text-primary)]">{pv.vacuna?.nombre || `ID: ${pv.vacunaId}`}</span>
                  ) },
                  { key: 'dosisNumero', header: 'Dosis', width: '80px' },
                  { key: 'fechaAplicacion', header: 'Fecha' },
                  { key: 'lote', header: 'Lote', render: (pv) => pv.lote || '-' },
                  { key: 'proximaDosis', header: 'Próxima Dosis', render: (pv) => pv.proximaDosis || '-' },
                  { key: 'acciones', header: 'Acciones', align: 'right', width: '90px', sortable: false, render: (pv) => (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" icon onClick={() => onDeleteAplicacion(pv.id)} aria-label="Eliminar aplicación">
                        <Trash2 className="w-4 h-4 text-[var(--danger-500)]" />
                      </Button>
                    </div>
                  ) },
                ]}
                data={patientVacunas}
                keyExtractor={(pv) => pv.id}
                searchPlaceholder="Buscar en el historial..."
                searchKeys={['vacuna']}
                emptyMessage="Este paciente no tiene vacunas registradas."
                pageSize={8}
                toolbar={
                  <Button variant="primary" size="sm" onClick={() => onAplicar()}>
                    <Plus className="w-4 h-4" />Aplicar Vacuna
                  </Button>
                }
              />
            </>
          )}

          {viewType === 'calendar' && (
            <DataTable
              columns={[
                { key: 'nombre', header: 'Vacuna', render: (item) => (
                  <span className="font-medium text-[var(--text-primary)]">{item.vacuna.nombre}</span>
                ) },
                { key: 'recomendadas', header: 'Dosis Recomendadas', sortable: false, render: (item) => item.vacuna.dosisRecomendadas },
                { key: 'aplicadas', header: 'Dosis Aplicadas', align: 'center', width: '140px', render: (item) => item.dosisAplicadas },
                { key: 'estado', header: 'Estado', width: '150px', render: (item) => {
                  const Icon = estadoIcon(item.estado);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoBadge(item.estado)}`}>
                      <Icon className="w-3 h-3" />
                      {item.estado === 'completa' ? 'Completa' :
                       item.estado === 'incompleta' ? 'Incompleta' :
                       item.estado === 'pendiente' ? 'Pendiente' :
                       item.estado === 'atrasada' ? 'Atrasada' : 'No corresponde'}
                    </span>
                  );
                } },
                { key: 'accion', header: 'Acción', align: 'center', width: '120px', sortable: false, render: (item) => (
                  item.estado !== 'completa' && item.estado !== 'no_corresponde' ? (
                    <Button variant="primary" size="sm" onClick={() => onAplicar(item.vacuna)}>
                      <Syringe className="w-4 h-4" />Aplicar
                    </Button>
                  ) : null
                ) },
              ]}
              data={calendario}
              keyExtractor={(item) => item.vacuna.id!}
              searchable={false}
              emptyMessage="No hay vacunas recomendadas disponibles."
              filters={[{
                key: 'estado',
                label: 'Estado',
                options: [
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'atrasada', label: 'Atrasada' },
                  { value: 'incompleta', label: 'Incompleta' },
                  { value: 'completa', label: 'Completa' },
                ],
                predicate: (item, v) => item.estado === v,
              }]}
            />
          )}
        </>
      )}
    </Card>
  );
}
