import { useState } from 'react';
import { Key, Shield } from 'lucide-react';
import { PageHeader, Card, Input, Button, toast } from '../components/ui';
import api from '../api/axios';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('warning', 'Campos requeridos', 'Complete todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('warning', 'No coinciden', 'La nueva contraseña y la confirmación no son iguales');
      return;
    }
    if (newPassword.length < 8) {
      toast('warning', 'Contraseña muy corta', 'Mínimo 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast('success', 'Contraseña actualizada', 'Su contraseña de acceso fue actualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast('error', 'Error', err?.response?.data?.message || 'No se pudo cambiar la contraseña');
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
            placeholder="Ingrese su contraseña actual"
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repita la nueva contraseña"
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
