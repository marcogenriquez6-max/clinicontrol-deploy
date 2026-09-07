import { useState } from 'react';
import { Key, Shield } from 'lucide-react';
import { PageHeader, Card, Input, Button } from '../components/ui';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'No coinciden', text: 'La nueva contraseña y la confirmación no son iguales' });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Muy corta', text: 'Mínimo 6 caracteres' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      Swal.fire({ icon: 'success', title: 'Contraseña actualizada', timer: 2000, showConfirmButton: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'No se pudo cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in-up max-w-2xl mx-auto">
      <PageHeader
        icon={Key}
        gradient="from-amber-500 to-orange-600"
        title="Cambiar Contraseña"
        subtitle="Actualiza tu contraseña de acceso al sistema"
      />

      <Card>
        <div className="space-y-5">
          <Input
            label="Contraseña actual"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Ingresa tu contraseña actual"
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contraseña"
          />
          <div className="flex justify-end pt-4 border-t border-[var(--border-primary)]">
            <Button onClick={handleSubmit} loading={loading}>
              <Shield className="w-4 h-4" /> Cambiar Contraseña
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
