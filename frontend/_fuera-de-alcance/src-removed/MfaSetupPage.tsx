import { useEffect, useState } from 'react';
import { Shield, Smartphone, Check, X } from 'lucide-react';
import { PageHeader, Card, Button, Input } from '../components/ui';
import api from '../api/axios';
import Swal from 'sweetalert2';

export default function MfaSetupPage() {
  const [status, setStatus] = useState<{ enabled: boolean; method: string | null; setupComplete: boolean } | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [method] = useState('app');
  const [code, setCode] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'status' | 'setup' | 'verify'>('status');
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await api.post('/auth/mfa/status');
      setStatus(res.data);
    } catch { /* el endpoint responde 403 si MFA no esta configurado aun */ }
  };

  useEffect(() => {
    const t = setTimeout(loadStatus, 0);
    return () => clearTimeout(t);
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/mfa/setup', { method });
      setQrCode(res.data.qrCode);
      setStep('verify');
      setFormErrors({});
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Error al configurar MFA' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const errors: Record<string, string> = {};
    if (!code) {
      errors.code = 'El código es requerido';
    } else if (!/^\d{6}$/.test(code)) {
      errors.code = 'El código debe tener 6 dígitos';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/mfa/verify', { code });
      Swal.fire({ icon: 'success', title: 'MFA activado', timer: 2000, showConfirmButton: false });
      setStep('status');
      setCode('');
      setFormErrors({});
      loadStatus();
    } catch {
      Swal.fire({ icon: 'error', title: 'Código inválido', text: 'Verifica el código e intenta de nuevo' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    const result = await Swal.fire({
      icon: 'question', title: '¿Desactivar MFA?',
      input: 'text', inputLabel: 'Ingresa el código de verificación', inputPlaceholder: 'Código de 6 dígitos',
      showCancelButton: true, confirmButtonText: 'Desactivar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed || !result.value) return;
    setLoading(true);
    try {
      await api.post('/auth/mfa/disable', { code: result.value });
      Swal.fire({ icon: 'success', title: 'MFA desactivado', timer: 2000, showConfirmButton: false });
      setFormErrors({});
      loadStatus();
    } catch {
      Swal.fire({ icon: 'error', title: 'Código inválido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in-up max-w-2xl mx-auto">
      <PageHeader
        icon={Shield}
        gradient="from-success-500 to-teal-600"
        title="Autenticación de Dos Factores (MFA)"
        subtitle="Protege tu cuenta con verificación adicional"
      />

      <Card>
        {step === 'status' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              <div className={`p-3 rounded-lg ${status?.enabled ? 'bg-[var(--success-100)]' : 'bg-[var(--bg-tertiary)]'}`}>
                <Smartphone className={`w-6 h-6 ${status?.enabled ? 'text-[var(--success-600)]' : 'text-[var(--text-tertiary)]'}`} />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {status?.enabled ? 'MFA Activado' : 'MFA Desactivado'}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {status?.enabled
                    ? `Método: ${status?.method === 'app' ? 'App de autenticación' : status?.method}`
                    : 'Aún no has configurado la autenticación de dos factores'}
                </p>
              </div>
            </div>

            {status?.enabled ? (
              <Button variant="danger" onClick={handleDisable} loading={loading}>
                <X className="w-4 h-4" /> Desactivar MFA
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">Configura la autenticación de dos factores usando una app como Google Authenticator o Authy.</p>
                <Button onClick={handleSetup} loading={loading}>
                  <Shield className="w-4 h-4" /> Configurar MFA
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">Escanea el código QR con tu app de autenticación y luego ingresa el código generado.</p>
            <Button onClick={handleSetup} loading={loading}>Generar QR</Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            <p className="text-sm text-center text-[var(--text-tertiary)]">Escanea el código QR con tu app de autenticación</p>
            <Input
              label="Código de verificación"
              value={code}
              onChange={e => { setCode(e.target.value); setFormErrors(prev => ({ ...prev, code: '' })); }}
              placeholder="Ingresa el código de 6 dígitos"
              maxLength={6}
              error={formErrors.code}
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setStep('status'); setQrCode(''); setFormErrors({}); }}>Cancelar</Button>
              <Button onClick={handleVerify} loading={loading}>
                <Check className="w-4 h-4" /> Verificar y Activar
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
