import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
          <span className="text-4xl font-bold" style={{ color: 'var(--primary-500)' }}>404</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Página no encontrada</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          <Home className="w-4 h-4" /> Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
