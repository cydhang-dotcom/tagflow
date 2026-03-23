import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: string;
  variant?: 'solid' | 'outline' | 'subtle';
}

export function Badge({ children, className, color = '#6366f1', variant = 'subtle', ...props }: BadgeProps) {
  const style = variant === 'subtle' 
    ? { backgroundColor: `${color}20`, color: color }
    : variant === 'solid'
    ? { backgroundColor: color, color: '#fff' }
    : { borderColor: color, color: color, borderWidth: 1 };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
