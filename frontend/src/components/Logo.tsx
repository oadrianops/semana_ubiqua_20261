import { cn } from '../lib/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'mark';
  className?: string;
  color?: 'default' | 'white';
}

const sizes = {
  sm: { mark: 'w-7 h-7', text: 'text-lg' },
  md: { mark: 'w-10 h-10', text: 'text-2xl' },
  lg: { mark: 'w-14 h-14', text: 'text-3xl' },
};

export function Logo({
  size = 'md',
  variant = 'full',
  className,
  color = 'default',
}: LogoProps) {
  const { mark, text } = sizes[size];
  const textColor = color === 'white' ? 'text-white' : 'text-nan-dark';
  const accentColor = color === 'white' ? 'text-nan-accent' : 'text-nan-accent';

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 48 48" className={mark} fill="none">
        <rect width="48" height="48" rx="12" fill="#0D9F75" />
        <path
          d="M12 34V14H18L30 28V14H36V34H30L18 20V34H12Z"
          fill="white"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="14" r="4" fill="#EF9F27" />
      </svg>
      {variant === 'full' && (
        <span className={cn('font-display font-extrabold tracking-tight', text, textColor)}>
          Nan<span className={accentColor}>Desk</span>
        </span>
      )}
    </div>
  );
}
