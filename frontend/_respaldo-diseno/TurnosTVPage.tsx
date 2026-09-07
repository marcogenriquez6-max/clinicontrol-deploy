import { useState, useEffect } from 'react';
import { Monitor, Users, Bell, Maximize2, Minimize2, Tv, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button, Modal, Input, Badge } from '../components/ui';
import { turnoService } from '../api/services';
import { toast } from '../components/ui/Toast';

interface TVConfig {
  nombreClinica: string;
  sonidoHabilitado: boolean;
  intervaloRefresco: number;
  maxTurnosEspera: number;
  maxTurnosLlamados: number;
  mostrarEspera: boolean;
  mostrarAtencion: boolean;
  mostrarLlamados: boolean;
  mostrarLeyenda: boolean;
}

export default function TurnosTVPage() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [connected, setConnected] = useState(true);
  const [config, setConfig] = useState<TVConfig>(() => {
    try {
      const saved = localStorage.getItem('tv-config');
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
    } catch { /* config corrupta: se usan valores por defecto */ }
    return defaultConfig;
  });
  const [configForm, setConfigForm] = useState<TVConfig>({ ...config });

  useEffect(() => {
    const fetchTV = async () => {
      try {
        const res = await turnoService.getTV();
        const data = Array.isArray(res) ? res : (res as any)?.data ?? [];
        setTurnos(data);
        setConnected(true);
      } catch {
        setConnected(false);
      }
    };
    fetchTV();
    const interval = setInterval(fetchTV, config.intervaloRefresco * 1000);
    return () => clearInterval(interval);
  }, [config.intervaloRefresco]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const turnosEnEspera = turnos.filter(t => t.estado === 'espera' && t.pagado);
  const turnosAtencion = turnos.filter(t => t.estado === 'atencion');
  const turnosLlamados = turnos.filter(t => t.estado === 'llamado');

  // Configuration modal content
  const configPanel = (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-secondary)]">Configure la apariencia y comportamiento de la pantalla de TV.</p>

      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Conexión</p>
        <div className="flex items-center gap-2 mb-3">
          {connected ? (
            <Badge variant="success"><Wifi className="w-3 h-3" /> Conectado</Badge>
          ) : (
            <Badge variant="danger"><WifiOff className="w-3 h-3" /> Desconectado</Badge>
          )}
          <button
            onClick={() => { setConnected(true); toast('info', 'Reconectando...'); }}
            className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <Input
          label="Nombre de la Clínica"
          value={configForm.nombreClinica}
          onChange={e => setConfigForm(f => ({ ...f, nombreClinica: e.target.value }))}
          placeholder="Clínica Santa Isabel"
        />
        <div className="mt-3">
          <Input
            label="Intervalo de Refresco (segundos)"
            type="number"
            min={2}
            max={60}
            value={configForm.intervaloRefresco}
            onChange={e => setConfigForm(f => ({ ...f, intervaloRefresco: Math.max(2, Number(e.target.value) || 5) }))}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Sonido</p>
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={configForm.sonidoHabilitado}
            onChange={e => setConfigForm(f => ({ ...f, sonidoHabilitado: e.target.checked }))}
            className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--primary-600)] focus:ring-[var(--primary-500)]"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Habilitar sonido al llamar paciente</p>
            <p className="text-xs text-[var(--text-tertiary)]">Reproduce un aviso de voz cuando se llama un turno</p>
          </div>
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Visibilidad de Secciones</p>
        <div className="space-y-2">
          {[
            { key: 'mostrarEspera' as const, label: 'Próximos Turnos', desc: 'Muestra la lista de pacientes en espera' },
            { key: 'mostrarAtencion' as const, label: 'Atendiendo Ahora', desc: 'Muestra el paciente siendo atendido' },
            { key: 'mostrarLlamados' as const, label: 'Últimos Llamados', desc: 'Muestra los turnos recientemente llamados' },
            { key: 'mostrarLeyenda' as const, label: 'Leyenda de Colores', desc: 'Muestra la leyenda al pie de la pantalla' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-3 py-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={configForm[item.key]}
                onChange={e => setConfigForm(f => ({ ...f, [item.key]: e.target.checked }))}
                className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--primary-600)] focus:ring-[var(--primary-500)]"
              />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Límites de Visualización</p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Máx. turnos en espera"
            type="number"
            min={1}
            max={20}
            value={configForm.maxTurnosEspera}
            onChange={e => setConfigForm(f => ({ ...f, maxTurnosEspera: Math.max(1, Number(e.target.value) || 8) }))}
          />
          <Input
            label="Máx. últimos llamados"
            type="number"
            min={1}
            max={10}
            value={configForm.maxTurnosLlamados}
            onChange={e => setConfigForm(f => ({ ...f, maxTurnosLlamados: Math.max(1, Number(e.target.value) || 4) }))}
          />
        </div>
      </div>
    </div>
  );

  const tvContent = (
    <div className={`rounded-lg overflow-hidden border border-[var(--border-primary)] shadow-xl ${
      fullscreen ? 'rounded-none border-0 h-screen flex flex-col' : ''
    }`}>
      {/* Header */}
      <div className="bg-[var(--primary-900)] px-6 lg:px-10 py-6 lg:py-8 text-center flex-shrink-0">
        <Monitor className={`${fullscreen ? 'w-16 h-16' : 'w-10 h-10'} text-white/40 mx-auto mb-2`} />
        <h2 className={`font-bold text-white mb-1 ${fullscreen ? 'text-4xl' : 'text-2xl'}`}>
          {config.nombreClinica || 'Clínica Santa Isabel'}
        </h2>
        <p className={`text-indigo-200 ${fullscreen ? 'text-xl' : 'text-base'}`}>
          Sistema de Turnos en Tiempo Real
        </p>
        <p className={`text-indigo-300 mt-2 ${fullscreen ? 'text-lg' : 'text-sm'}`}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Body */}
      <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 p-6 lg:p-10 ${fullscreen ? 'overflow-y-auto' : ''}`}>
        {/* Left column: Próximos Turnos */}
        {config.mostrarEspera && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--warning-100)]">
                <Users className={`${fullscreen ? 'w-6 h-6' : 'w-5 h-5'} text-[var(--warning-600)]`} />
              </div>
              <h3 className={`font-semibold text-[var(--text-secondary)] ${fullscreen ? 'text-2xl' : 'text-lg'}`}>
                PRÓXIMOS TURNOS
              </h3>
              <span className={`ml-auto ${fullscreen ? 'text-2xl' : 'text-lg'} font-bold text-[var(--warning-600)]`}>
                {turnosEnEspera.length}
              </span>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {turnosEnEspera.slice(0, config.maxTurnosEspera).map((t, idx) => (
                <div key={t.id || t.numero || idx}
                  className={`flex items-center gap-4 p-4 lg:p-5 rounded-lg border transition-all duration-300 ${
                    idx === 0
                      ? 'bg-[var(--warning-50)] border border-[var(--warning-300)]'
                      : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-[var(--warning-200)]'
                  }`}
                >
                  <div className={`flex items-center justify-center font-bold text-white shadow-sm ${
                    idx === 0
                      ? 'w-16 h-16 lg:w-20 lg:h-20 rounded-lg bg-[var(--warning-500)] text-white text-2xl lg:text-3xl'
                      : 'w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-[var(--primary-700)] text-white text-xl lg:text-2xl'
                  }`}>
                    #{t.numero}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-[var(--text-primary)] truncate ${fullscreen ? 'text-xl' : 'text-base'}`}>
                      {t.pacienteNombre}
                    </p>
                    <p className={`text-[var(--text-tertiary)] truncate ${fullscreen ? 'text-base' : 'text-sm'}`}>
                      {t.medicoNombre}
                    </p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 bg-[var(--primary-50)] text-[var(--primary-600)] rounded-lg font-medium ${fullscreen ? 'text-sm' : 'text-xs'}`}>
                      {t.especialidad}
                    </span>
                  </div>
                  <div className={`ml-auto text-right ${fullscreen ? 'text-base' : 'text-xs'} text-[var(--text-tertiary)] flex-shrink-0`}>
                    <span className="font-medium text-[var(--warning-600)]">En espera</span>
                  </div>
                </div>
              ))}
              {turnosEnEspera.length > config.maxTurnosEspera && (
                <p className={`text-center text-[var(--text-tertiary)] ${fullscreen ? 'text-lg' : 'text-sm'}`}>
                  +{turnosEnEspera.length - config.maxTurnosEspera} turnos más...
                </p>
              )}
              {turnosEnEspera.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-12 text-[var(--text-tertiary)]">
                  <Users className={`${fullscreen ? 'w-16 h-16' : 'w-10 h-10'} text-[var(--text-tertiary)]`} />
                  <p className={`${fullscreen ? 'text-xl' : 'text-sm'}`}>No hay turnos en espera</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right column */}
        <div className="space-y-6 lg:space-y-8">
          {/* Atendiendo Ahora */}
          {config.mostrarAtencion && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 rounded-full bg-[var(--success-500)] animate-pulse shadow-sm shadow-[var(--success-200)]" />
                <h3 className={`font-semibold text-[var(--text-secondary)] ${fullscreen ? 'text-2xl' : 'text-lg'}`}>
                  ATENDIENDO AHORA
                </h3>
              </div>
              {turnosAtencion.length > 0 ? (
                <div className="space-y-4">
                  {turnosAtencion.map(t => (
                    <div key={t.id || t.numero}
                      className="p-6 lg:p-8 bg-[var(--success-50)] rounded-lg border border-[var(--success-200)] text-center"
                    >
                      <p className={`text-[var(--text-tertiary)] mb-1 ${fullscreen ? 'text-lg' : 'text-sm'}`}>
                        {t.medicoNombre}
                      </p>
                      <p className={`font-bold text-[var(--success-600)] mb-2 ${fullscreen ? 'text-7xl' : 'text-5xl'}`}>
                        #{t.numero}
                      </p>
                      <p className={`font-semibold text-[var(--text-primary)] ${fullscreen ? 'text-2xl' : 'text-xl'}`}>
                        {t.pacienteNombre}
                      </p>
                      <p className={`text-[var(--text-tertiary)] ${fullscreen ? 'text-lg' : 'text-sm'}`}>
                        {t.medicoNombre} · {t.especialidad}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 lg:p-8 bg-[var(--bg-secondary)] rounded-lg border-2 border-dashed border-[var(--border-primary)] text-center">
                  <p className={`text-[var(--text-tertiary)] mb-2 ${fullscreen ? 'text-5xl' : 'text-3xl'}`}>—</p>
                  <p className={`text-[var(--text-tertiary)] ${fullscreen ? 'text-xl' : 'text-base'}`}>Esperando próximo paciente</p>
                </div>
              )}
            </div>
          )}

          {/* Últimos Llamados */}
          {config.mostrarLlamados && turnosLlamados.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Bell className={`${fullscreen ? 'w-6 h-6' : 'w-5 h-5'} text-[var(--info-500)]`} />
                <h3 className={`font-semibold text-[var(--text-secondary)] ${fullscreen ? 'text-xl' : 'text-base'}`}>
                  ÚLTIMOS LLAMADOS
                </h3>
              </div>
              <div className="space-y-2 lg:space-y-3">
                {turnosLlamados.slice(0, config.maxTurnosLlamados).map(t => (
                  <div key={t.id || t.numero}
                    className="flex items-center gap-4 p-4 lg:p-5 bg-[var(--info-50)] rounded-lg border border-[var(--info-200)]"
                  >
                    <div className={`font-bold text-[var(--info-500)] ${fullscreen ? 'text-2xl' : 'text-lg'}`}>
                      #{t.numero}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-[var(--text-primary)] ${fullscreen ? 'text-lg' : 'text-sm'}`}>
                        {t.pacienteNombre}
                      </p>
                      <p className={`text-[var(--text-tertiary)] ${fullscreen ? 'text-sm' : 'text-xs'}`}>
                        {t.medicoNombre} · {t.especialidad}
                      </p>
                    </div>
                    <span className={`ml-auto text-[var(--info-500)] font-medium ${fullscreen ? 'text-base' : 'text-xs'}`}>
                      Llamado
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leyenda */}
          {config.mostrarLeyenda && (
            <div className={`flex items-center justify-center gap-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] ${fullscreen ? 'text-base' : 'text-xs'} text-[var(--text-tertiary)]`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--warning-500)]" />
                En Espera
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--info-500)]" />
                Llamado
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--success-500)] animate-pulse" />
                En Atención
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`animate-in-up ${fullscreen ? 'fixed inset-0 z-[9999] bg-[var(--bg-primary)]' : ''}`}>
      {/* Toolbar (not shown in fullscreen) */}
      {!fullscreen && (
        <div className="mb-6">
          <div className="flex items-center justify-between bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: 'var(--primary-700)' }}>
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--text-primary)]">TV Turnos</h1>
                <p className="text-sm text-[var(--text-secondary)]">Pantalla de turnos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)]">
                {connected ? <Wifi className="w-4 h-4 text-[var(--success-500)]" /> : <WifiOff className="w-4 h-4 text-[var(--danger-500)]" />}
                {connected ? 'Conectado' : 'Sin conexión'}
              </div>
              <button
                onClick={() => { setConfigForm({ ...config }); setShowConfig(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Configurar
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--neutral-800)] transition-colors text-sm font-medium"
              >
                <Maximize2 className="w-4 h-4" />
                Pantalla Completa
              </button>
            </div>
          </div>
        </div>
      )}
      {tvContent}

      {/* Exit fullscreen button */}
      {fullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-[10000] p-3 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-colors"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      )}

      {/* Config modal */}
      <Modal isOpen={showConfig} onClose={() => setShowConfig(false)} title="Configuración de TV" size="lg">
        {configPanel}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-primary)] mt-6">
          <Button variant="secondary" onClick={() => setShowConfig(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => {
            setConfig({ ...configForm });
            localStorage.setItem('tv-config', JSON.stringify(configForm));
            setShowConfig(false);
            toast('success', 'Configuración guardada');
          }}>
            Guardar Configuración
          </Button>
        </div>
      </Modal>
    </div>
  );
}

const defaultConfig: TVConfig = {
  nombreClinica: 'Clínica Santa Isabel',
  sonidoHabilitado: true,
  intervaloRefresco: 5,
  maxTurnosEspera: 8,
  maxTurnosLlamados: 4,
  mostrarEspera: true,
  mostrarAtencion: true,
  mostrarLlamados: true,
  mostrarLeyenda: true,
};
