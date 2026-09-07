interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export default function Logo({ showText = true, size = 'md', variant = 'dark', className = '' }: LogoProps) {
  const sizes = {
    sm: { img: 32, text: 'text-sm', subtext: 'text-[9px]', gap: 'gap-2' },
    md: { img: 40, text: 'text-lg', subtext: 'text-[10px]', gap: 'gap-3' },
    lg: { img: 52, text: 'text-2xl', subtext: 'text-xs', gap: 'gap-3.5' },
  };

  const s = sizes[size];
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <div className="relative flex-shrink-0 rounded-lg overflow-hidden shadow-md ring-1 ring-white/20">
        <img
          src="/logo.jpg"
          alt="Clínica Santa Isabel"
          width={s.img}
          height={s.img}
          className="object-cover w-full h-full"
          style={{ width: s.img, height: s.img }}
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <h1 className={`font-extrabold tracking-tight ${s.text} ${isLight ? 'text-white' : 'text-[var(--text-primary)]'}`}>
            Clínica{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-purple-500 to-teal-500">
              Santa Isabel
            </span>
          </h1>
          <p className={`${s.subtext} font-semibold tracking-[0.15em] ${isLight ? 'text-white/50' : 'text-[var(--text-tertiary)]'}`}>
            SISTEMA DE GESTIÓN HOSPITALARIA
          </p>
        </div>
      )}
    </div>
  );
}
