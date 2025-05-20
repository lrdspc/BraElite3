import React from 'react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';

interface InstallPwaButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({
  variant = 'default',
  size = 'md',
  className
}) => {
  const { isAvailable, isInstalling, install } = usePwaInstall();

  if (!isAvailable) {
    return null;
  }

  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-11 px-8"
  };

  return (
    <button
      onClick={install}
      disabled={isInstalling}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        "gap-2",
        className
      )}
    >
      <Download size={size === 'sm' ? 16 : 20} />
      <span>
        {isInstalling ? 'Instalando...' : 'Instalar App'}
      </span>
    </button>
  );
};

export default InstallPwaButton;
