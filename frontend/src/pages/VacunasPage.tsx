import { useEffect, useState } from 'react';
import { Syringe } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { vacunaService, pacienteService } from '../api/services';
import type { Vacuna, Paciente, PacienteVacuna, CalendarioVacuna } from '../types';
import api from '../api/axios';
import CatalogoVacunas from '../components/vacunas/CatalogoVacunas';
import PacienteSection from '../components/vacunas/PacienteSection';
import CatalogoVacunaModal from '../components/vacunas/CatalogoVacunaModal';
import AplicarVacunaModal from '../components/vacunas/AplicarVacunaModal';

export default function VacunasPage() {
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [patientVacunas, setPatientVacunas] = useState<PacienteVacuna[]>([]);
  const [calendario, setCalendario] = useState<CalendarioVacuna[]>([]);
  const [isCatalogModal, setIsCatalogModal] = useState(false);
  const [editingVacuna, setEditingVacuna] = useState<Vacuna | null>(null);
  const [isApplyModal, setIsApplyModal] = useState(false);
  const [selectedVacuna, setSelectedVacuna] = useState<Vacuna | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewType, setViewType] = useState<'record' | 'calendar'>('record');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'vacuna' | 'aplicacion'; id: number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVacunas = async () => {
    try { const res = await vacunaService.getAll(); setVacunas(res.data ?? []); }
    catch { console.error('Error al cargar vacunas'); }
  };

  const fetchPacientes = async () => {
    try { const res = await pacienteService.getAll(); setPacientes(res.data ?? []); }
    catch { console.error('Error al cargar pacientes'); }
  };

  const fetchPatientVacunas = async (pacienteId: number) => {
    try { const res = await vacunaService.getByPaciente(pacienteId); setPatientVacunas(res.data ?? []); }
    catch { console.error('Error al cargar vacunas del paciente'); }
  };

  const fetchCalendario = async (pacienteId: number) => {
    try { const res = await vacunaService.getCalendario(pacienteId); setCalendario(res.data ?? []); }
    catch { console.error('Error al cargar calendario'); }
  };

  useEffect(() => {
    let cancelado = false;
    const init = async () => {
      if (cancelado) return;
      await fetchVacunas();
      if (!cancelado) await fetchPacientes();
    };
    init();
    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCatalogModal = (vacuna?: Vacuna) => {
    setEditingVacuna(vacuna || null);
    setIsCatalogModal(true);
  };

  const onSubmitCatalog = async (data: Record<string, string>) => {
    setFormLoading(true);
    try {
      if (editingVacuna?.id) {
        await api.put(`/vacunas/${editingVacuna.id}`, data);
        toast('success', 'Vacuna actualizada', 'Los cambios se guardaron correctamente');
      } else {
        await vacunaService.create(data);
        toast('success', 'Vacuna creada', 'La vacuna fue registrada exitosamente');
      }
      setIsCatalogModal(false);
      fetchVacunas();
    } catch {
      toast('error', 'Error', 'No se pudo guardar la vacuna.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      if (confirmDelete.type === 'vacuna') {
        await vacunaService.delete(confirmDelete.id);
        toast('success', 'Vacuna eliminada');
        fetchVacunas();
      } else {
        await vacunaService.removeAplicacion(confirmDelete.id);
        toast('success', 'Aplicación eliminada');
        if (selectedPatient?.id) {
          fetchPatientVacunas(selectedPatient.id);
          fetchCalendario(selectedPatient.id);
        }
      }
      setConfirmDelete(null);
    } catch {
      toast('error', 'Error', 'No se pudo completar la operación.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectPatient = (paciente: Paciente) => {
    setSelectedPatient(paciente);
    setSearchPatient('');
    if (paciente.id) {
      fetchPatientVacunas(paciente.id);
      fetchCalendario(paciente.id);
    }
  };

  const handleOpenApplyModal = (vacuna?: Vacuna) => {
    setSelectedVacuna(vacuna || null);
    setIsApplyModal(true);
  };

  const onSubmitApply = async (data: Record<string, string>) => {
    if (!selectedPatient?.id) return;
    setFormLoading(true);
    try {
      await vacunaService.aplicar({
        pacienteId: selectedPatient.id,
        vacunaId: Number(data.vacunaId),
        dosisNumero: Number(data.dosisNumero) || 1,
        fechaAplicacion: data.fechaAplicacion,
        lote: data.lote || undefined,
        laboratorio: data.laboratorio || undefined,
        lugarAplicacion: data.lugarAplicacion || undefined,
        proximaDosis: data.proximaDosis || undefined,
        observaciones: data.observaciones || undefined,
      });
      toast('success', 'Vacuna aplicada', 'La vacuna fue registrada correctamente');
      setIsApplyModal(false);
      fetchPatientVacunas(selectedPatient.id);
      fetchCalendario(selectedPatient.id);
    } catch {
      toast('error', 'Error', 'No se pudo aplicar la vacuna.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-in-up">
        <PageHeader
          icon={Syringe}
          gradient="from-success-500 to-teal-600"
          title="Vacunas"
          subtitle="Gestión de vacunas y calendarios"
        />
      </div>

      <div className="animate-in-up" style={{ animationDelay: '0.15s' }}>
        <CatalogoVacunas
          vacunas={vacunas}
          loading={formLoading}
          onEdit={handleOpenCatalogModal}
          onDelete={(id, name) => setConfirmDelete({ type: 'vacuna', id, name })}
          onNueva={() => handleOpenCatalogModal()}
        />
      </div>

      <div className="animate-in-up" style={{ animationDelay: '0.3s' }}>
        <PacienteSection
          pacientes={pacientes}
          patientVacunas={patientVacunas}
          calendario={calendario}
          vacunas={vacunas}
          selectedPatient={selectedPatient}
          searchPatient={searchPatient}
          viewType={viewType}
          onSelectPatient={handleSelectPatient}
          onSearchChange={setSearchPatient}
          onViewTypeChange={setViewType}
          onAplicar={handleOpenApplyModal}
          onDeleteAplicacion={(id) => setConfirmDelete({ type: 'aplicacion', id, name: '' })}
        />
      </div>

      <CatalogoVacunaModal
        isOpen={isCatalogModal}
        onClose={() => setIsCatalogModal(false)}
        editingVacuna={editingVacuna}
        loading={formLoading}
        onSubmit={onSubmitCatalog}
      />

      <AplicarVacunaModal
        isOpen={isApplyModal}
        onClose={() => setIsApplyModal(false)}
        vacunas={vacunas}
        selectedVacuna={selectedVacuna}
        loading={formLoading}
        onSubmit={onSubmitApply}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={confirmDelete?.type === 'vacuna' ? 'Eliminar Vacuna' : 'Eliminar Aplicación'}
        message={confirmDelete?.type === 'vacuna'
          ? `¿Está seguro de eliminar ${confirmDelete?.name}?`
          : '¿Está seguro de eliminar esta aplicación?'}
        detail={confirmDelete?.type === 'vacuna'
          ? 'Esta acción eliminará permanentemente la vacuna del catálogo.'
          : 'Esta acción eliminará permanentemente el registro de aplicación.'}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
