import type { CSSProperties } from 'react';
import { cn } from '@/utils/cn';

interface AppLogoProps {
  className?: string;
  alt?: string;
  style?: CSSProperties;
  forceTheme?: 'dark' | 'light';
}

export function AppLogo({ className, alt = 'AppEventos', style }: AppLogoProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        'inline-flex items-center rounded-lg bg-[#111827] px-3 py-1.5 font-bold tracking-tight shadow-sm',
        className,
      )}
      style={style}
    >
      <span className="text-white">App</span>
      <span className="text-[#8B5CF6]">Eventos</span>
    </span>
  );
}
