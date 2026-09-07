import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, toast } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ShieldCheck, HeartPulse } from 'lucide-react';

export default function LoginPage() {
  const { login, loginMfa } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      toast('success', 'Inicio de sesión exitoso', 'Bienvenido al sistema de gestión hospitalaria');
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.mfaRequired) {
        setMfaToken(err.mfaToken);
        setLoading(false);
        return;
      }
      setLoading(false);
      const msg = 'Credenciales inválidas. Verifique su email y contraseña.';
      setError(msg);
      toast('error', 'Error de autenticación', msg);
    }
  };

  const onSubmitMfa = async () => {
    if (!mfaToken) return;
    setLoading(true);
    setError('');
    try {
      await loginMfa(mfaToken, mfaCode);
      toast('success', 'Verificación exitosa', 'Bienvenido al sistema de gestión hospitalaria');
      navigate('/dashboard');
    } catch {
      setLoading(false);
      const msg = 'Código MFA inválido. Intente nuevamente.';
      setError(msg);
      toast('error', 'Error de verificación', msg);
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

          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {mfaToken ? 'Verificación en dos pasos' : 'Iniciar Sesión'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {mfaToken
                  ? 'Ingrese el código de 6 dígitos de su aplicación autenticadora'
                  : 'Ingrese sus credenciales para acceder al sistema'
                }
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[var(--danger-50)] dark:bg-[var(--danger-500)]/10 border border-[var(--danger-200)] dark:border-red-800/40 rounded-lg flex items-start gap-2 text-sm text-[var(--danger-700)] dark:text-[var(--danger-200)]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mfaToken ? (
              <div className="space-y-5">
                <div className="p-4 bg-indigo-50 dark:bg-[var(--primary-500)]/10 border border-indigo-200 dark:border-indigo-800/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[var(--primary-600)] dark:text-indigo-400" />
                    <p className="text-sm font-medium text-[var(--primary-700)] dark:text-indigo-300">Verificación MFA</p>
                  </div>
                  <p className="text-xs text-[var(--primary-600)]/70 dark:text-indigo-400/70">
                    Abra su aplicación autenticadora e ingrese el código de 6 dígitos.
                  </p>
                </div>
                <Input
                  label="Código de verificación"
                  type="text"
                  placeholder="000 000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <Button type="button" className="w-full" variant="primary" size="lg" loading={loading} onClick={onSubmitMfa}>
                  <ShieldCheck className="w-4 h-4" />
                  Verificar e Ingresar
                </Button>
                <button
                  type="button"
                  onClick={() => { setMfaToken(null); setMfaCode(''); setError(''); }}
                  className="w-full text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-center"
                >
                  ← Volver al inicio de sesión
                </button>
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

                <Input
                  label="Contraseña"
                  type="password"
                  placeholder=""
                  required
                  error={errors.password?.message as string}
                  {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--primary-600)] focus:ring-indigo-300"
                    />
                    <span className="text-[var(--text-secondary)]">
                      Recordar sesión
                    </span>
                  </label>
                  <Link to="/forgot-password" className="text-[var(--primary-600)] dark:text-indigo-400 hover:underline">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>

                <Button type="submit" className="w-full" variant="primary" size="lg" loading={loading}>
                  <HeartPulse className="w-4 h-4" />
                  Ingresar al Sistema
                </Button>
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
