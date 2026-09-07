import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, toast } from '../components/ui';
import { authService } from '../api/auth.service';
import { Link } from 'react-router-dom';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast('success', 'Solicitud enviada', 'Si el email existe, recibirás un enlace para restablecer tu contraseña.');
    } catch {
      setError('Error al procesar la solicitud. Intente nuevamente.');
      toast('error', 'Error', 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

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
                Restablecer Contraseña
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {sent
                  ? 'Revise su bandeja de entrada para continuar con el proceso.'
                  : 'Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.'
                }
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[var(--danger-50)] dark:bg-[var(--danger-500/10)]/10 border border-[var(--danger-200)] dark:border-red-800/40 rounded-lg flex items-start gap-2 text-sm text-[var(--danger-700)] dark:text-[var(--danger-200)]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {sent ? (
              <div className="space-y-5">
                <div className="p-4 bg-[var(--success-50)] dark:bg-[var(--success-500/10)]/10 border border-[var(--success-200)] dark:border-green-800/30 rounded-lg">
                  <p className="text-sm text-[var(--success-700)] dark:text-[var(--success-200)]">
                    Hemos enviado un enlace de recuperación a su correo electrónico si está registrado en el sistema.
                  </p>
                </div>
                <Link to="/login">
                  <Button type="button" className="w-full" variant="primary" size="lg">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder=""
                  required
                  error={errors.email?.message as string}
                  {...register('email', { required: 'El email es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingrese un email válido' } })}
                />

                <Button type="submit" className="w-full" variant="primary" size="lg" loading={loading}>
                  <Mail className="w-4 h-4" />
                  Enviar enlace de recuperación
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
