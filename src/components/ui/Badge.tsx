import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const VARIANTS: Record<BadgeVariant, { box: string; dot: string; color: string }> = {
  success: { box: '#ECFDF5', dot: '#10B981', color: '#047857' },
  warning: { box: '#FFFBEB', dot: '#F59E0B', color: '#B45309' },
  danger: { box: '#FEF2F2', dot: '#EF4444', color: '#B91C1C' },
  info: { box: '#EFF6FF', dot: '#2563EB', color: '#1D4ED8' },
  neutral: { box: '#F8FAFC', dot: '#64748B', color: '#475569' },
};

export function Badge({ variant = 'neutral', dot = false, className, children, style, ...rest }: BadgeProps) {
  const styles = VARIANTS[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: 999,
        padding: '4px 10px',
        background: styles.box,
        color: styles.color,
        border: `1px solid ${styles.color}22`,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        ...style,
      }}
      className={className}
      {...rest}
    >
      {dot && <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: styles.dot, display: 'inline-block' }} />}
      {children}
    </span>
  );
}