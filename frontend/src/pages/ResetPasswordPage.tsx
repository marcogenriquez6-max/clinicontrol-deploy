import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, toast } from '../components/ui';
import { authService } from '../api/auth.service';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, Lock, HeartPulse } from 'lucide-react';

export default function ResetPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    if (!token) {
      setError('Token de recuperación no encontrado.');
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, data.newPassword);
      setSuccess(true);
      toast('success', 'Contraseña restablecida', 'Su contraseña ha sido actualizada exitosamente.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Token inválido o expirado. Solicite un nuevo restablecimiento.';
      setError(msg);
      toast('error', 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex bg-[var(--bg-secondary)]">
        <div className="w-full flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-[420px]">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-8 shadow-md">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-[var(--danger-500)] mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Enlace inválido</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  El enlace de recuperación no es válido o ha expirado.
                </p>
                <Link to="/forgot-password">
                  <Button type="button" variant="primary" size="lg">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-secondary)]">
      <div className="w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Clínica Santa Isabel
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Sistema de Gestión Hospitalaria
            </p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Nueva Contraseña
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {success
                  ? 'Su contraseña ha sido restablecida exitosamente.'
                  : 'Ingrese su nueva contraseña.'
                }
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[var(--danger-50)] dark:bg-[var(--danger-500/10)]/10 border border-[var(--danger-200)] dark:border-red-800/40 rounded-lg flex items-start gap-2 text-sm text-[var(--danger-700)] dark:text-[var(--danger-200)]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="space-y-5">
                <div className="p-4 bg-[var(--success-50)] dark:bg-[var(--success-500/10)]/10 border border-[var(--success-200)] dark:border-green-800/30 rounded-lg">
                  <p className="text-sm text-[var(--success-700)] dark:text-[var(--success-200)]">
                    Ya puede iniciar sesión con su nueva contraseña.
                  </p>
                </div>
                <Link to="/login">
                  <Button type="button" className="w-full" variant="primary" size="lg">
                    <HeartPulse className="w-4 h-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  placeholder=""
                  required
                  error={errors.newPassword?.message as string}
                  {...register('newPassword', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                />

                <Input
                  label="Confirmar contraseña"
                  type="password"
                  placeholder=""
                  required
                  error={errors.confirmPassword?.message as string}
                  {...register('confirmPassword', { required: 'Debe confirmar la contraseña' })}
                />

                <Button type="submit" className="w-full" variant="primary" size="lg" loading={loading}>
                  <Lock className="w-4 h-4" />
                  Restablecer Contraseña
                </Button>

                <Link to="/login">
                  <button type="button" className="w-full text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-center mt-2">
                    ← Volver al inicio de sesión
                  </button>
                </Link>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
            &copy; 2026 Clínica Santa Isabel &mdash; Versión 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
