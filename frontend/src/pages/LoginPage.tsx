import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, toast } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, HeartPulse, Eye, EyeOff, Building2, Shield, Stethoscope } from 'lucide-react';
import { isAxiosError } from 'axios';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const CREDENCIALES_INVALIDAS =
  'Credenciales invalidas. Verifique su email y contrasena.';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { remember: false } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password, data.remember);
      toast('success', 'Bienvenido', 'Accediendo al sistema...');
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      const msg =
        isAxiosError(err) && err.response?.status === 401
          ? CREDENCIALES_INVALIDAS
          : 'No se pudo conectar con el servidor. Verifique su conexion.';
      setError(msg);
      toast('error', 'Error al iniciar sesion', msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-gradient-to-br from-[var(--primary-600)] via-[var(--primary-700)] to-[var(--primary-900)] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto text-center">
          <div className="mb-10">
            <Logo showText size="lg" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Clinica Santa Isabel
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Sistema de Gestion Hospitalaria Integral
            <br />
            <span className="font-medium">Atencion - Eficiencia - Seguridad</span>
          </p>

          <div className="grid grid-cols-3 gap-6 text-white/70">
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-sm">Consultas<br />Completas</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Shield className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-sm">Seguridad<br />Farmacologica</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-sm">Gestion<br />Integral</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          Version 2.0 &copy; 2026 Clinica Santa Isabel
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-[var(--bg-secondary)]">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8 text-center">
            <Logo showText size="lg" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-3">Clinica Santa Isabel</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Sistema de Gestion Hospitalaria</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Iniciar sesion</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5">Ingrese sus credenciales para acceder al sistema</p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 p-4 bg-[var(--danger-50)] border border-[var(--danger-200)] rounded-xl flex items-start gap-3 text-sm text-[var(--danger-700)] animate-slide-down"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-[var(--danger-500)]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Input
                label="Correo electronico"
                type="email"
                autoComplete="email"
                required
                error={errors.email?.message}
                {...register('email', {
                  required: 'Ingrese un email valido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingrese un email valido',
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Contrasena"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Minimo 6 caracteres',
                    minLength: { value: 6, message: 'Minimo 6 caracteres' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-100)]"
                    {...register('remember')}
                  />
                  <span className="text-[var(--text-secondary)]">Recordar sesion</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[var(--primary-600)] hover:underline"
                >
                  ¿Olvido su contrasena?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="primary"
                size="lg"
                loading={loading}
              >
                <HeartPulse className="w-5 h-5" />
                Ingresar al sistema
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
            &copy; 2026 Clinica Santa Isabel &mdash; Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
}